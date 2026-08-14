---
title: Client API (frappe.ui.form & JS SDK) for Frappe v15
description: Comprehensive client-side JavaScript API reference - form handlers, frm methods, custom buttons, hiding/disabling standard buttons, set_df_property, set_query, frappe.call, dialogs, and alerts.
version: v15
category: Client-Side JavaScript APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge client">Client Only</span> <span class="badge stable">Stable</span> Client API & Form Scripts

Client-side scripting in Frappe Framework v15 is driven by JavaScript executed within the Desk browser interface.

---

## 1. Form Event Handlers (`frappe.ui.form.on`)

`frappe.ui.form.on(doctype, handlers)` binds client JavaScript functions to form view lifecycle triggers and docfield change events.

```javascript
frappe.ui.form.on("Task", {
    setup(frm) {
        // Triggered once when form view is initialized
    },
    onload(frm) {
        // Triggered when form data finishes loading from server
    },
    refresh(frm) {
        // Triggered on form load and after every save action
        if (!frm.is_new()) {
            frm.add_custom_button(__("Re-Open"), () => {
                frm.set_value("status", "Open");
                frm.save();
            });
        }
    },
    validate(frm) {
        // Triggered prior to saving document
        if (frm.doc.expected_time <= 0) {
            frappe.msgprint(__("Expected Time must be greater than zero."));
            frappe.validated = false; // Block save action!
        }
    },
    before_save(frm) {},
    after_save(frm) {},
    
    // DocField Change Trigger (Triggered when 'status' field changes)
    status(frm) {
        if (frm.doc.status === "Closed") {
            frm.set_df_property("closing_notes", "reqd", 1);
        } else {
            frm.set_df_property("closing_notes", "reqd", 0);
        }
    }
});
```

---

## 2. Custom Buttons API (`frm.add_custom_button`)

Frappe Desk allows adding custom buttons to the top action toolbar, organizing them into dropdown groups, and styling them.

### Adding Single Custom Buttons & Dropdown Button Groups

```javascript
frappe.ui.form.on("Task", {
    refresh(frm) {
        if (!frm.is_new()) {
            // 1. Add Single Top-Level Custom Button
            let btn = frm.add_custom_button(__("Quick Close"), () => {
                frm.set_value("status", "Completed");
                frm.save();
            });
            
            # Style custom button with CSS class ('btn-primary', 'btn-danger', 'btn-warning', 'btn-info')
            frm.change_custom_button_type(__("Quick Close"), null, "primary");

            // 2. Add Nested Buttons Under Dropdown Group ("Actions")
            frm.add_custom_button(__("Sync with Jira"), () => {
                frappe.call({
                    method: "my_app.api.sync_jira",
                    args: { task_id: frm.doc.name },
                    callback() { frm.reload_doc(); }
                });
            }, __("Actions"));

            frm.add_custom_button(__("Send Notification"), () => {
                frappe.msgprint(__("Notification sent!"));
            }, __("Actions"));
            
            // Highlight specific group button
            frm.change_custom_button_type(__("Sync with Jira"), __("Actions"), "danger");
        }
    }
});
```

### Clearing Custom Buttons

```javascript
// Clear all custom buttons from form toolbar
frm.clear_custom_buttons();
```

---

## 3. Hiding & Disabling Standard Form Buttons & Menu Options

To enforce custom workflows or lock down specific form views, Frappe provides APIs to disable or hide standard Desk elements:

### 1. Disabling / Hiding the Standard Save Button (`disable_save`)

```javascript
frappe.ui.form.on("Task", {
    refresh(frm) {
        if (frm.doc.status === "Closed") {
            // Disable and hide standard Save button
            frm.disable_save();
        } else {
            // Re-enable Save button
            frm.enable_save();
        }
    }
});
```

---

### 2. Disabling the Entire Form Input (`disable_form`)

```javascript
frappe.ui.form.on("Task", {
    refresh(frm) {
        if (frm.doc.status === "Cancelled") {
            // Makes all form fields read-only and hides save button
            frm.disable_form();
        }
    }
});
```

---

### 3. Hiding & Clearing Action Menus (`frm.page`)

```javascript
frappe.ui.form.on("Task", {
    refresh(frm) {
        // Hides standard 'Menu' dropdown (Print, Duplicate, Delete, Reload, etc.)
        frm.page.hide_menu();
        
        // Hides standard 'Actions' dropdown (Submit, Cancel, Amend)
        frm.page.hide_actions_menu();
        
        // Clears all custom user action buttons
        frm.page.clear_user_actions();
        frm.page.clear_inner_toolbar();
    }
});
```

---

### 4. Hiding Specific Menu Items (e.g. Delete, Duplicate, Print)

```javascript
frappe.ui.form.on("Task", {
    refresh(frm) {
        // Remove specific item from standard Menu dropdown
        frm.page.remove_menu_item(__("Duplicate"));
        frm.page.remove_menu_item(__("Delete"));

        // Alternative DOM selector to hide specific dropdown menu option
        if (frm.page.menu) {
            frm.page.menu.find('[data-label="Delete"]').parent().hide();
            frm.page.menu.find('[data-label="Duplicate"]').parent().hide();
        }
    }
});
```

---

## 4. Form Instance (`frm`) Core Methods Matrix

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `frm.set_value(field, val)` | `fieldname`, `value` | Sets docfield value and triggers dependent UI updates |
| `frm.get_value(field)` | `fieldname` | Returns current value of field |
| `frm.set_df_property(f, p, v)`| `fieldname`, `property`, `val` | Dynamically updates docfield property (`reqd`, `read_only`, `hidden`, `options`) |
| `frm.toggle_reqd(field, bool)`| `fieldname`, `is_required` | Shorthand to toggle mandatory field requirement |
| `frm.toggle_display(f, bool)` | `fieldname`, `is_visible` | Shorthand to toggle field visibility |
| `frm.toggle_enable(f, bool)`  | `fieldname`, `is_enabled` | Shorthand to toggle field read-only state |
| `frm.add_custom_button(l, f)`| `label`, `action_fn`, `group` | Adds action button to top action bar |
| `frm.change_custom_button_type()`| `label`, `group`, `type` | Sets button style (`'primary'`, `'danger'`, `'warning'`) |
| `frm.disable_save()` | None | Disables and hides standard Save button |
| `frm.enable_save()` | None | Re-enables standard Save button |
| `frm.disable_form()` | None | Makes all form fields read-only and hides save button |
| `frm.page.hide_menu()` | None | Hides standard Menu dropdown button |
| `frm.page.hide_actions_menu()`| None | Hides standard Actions dropdown button |
| `frm.page.remove_menu_item()`| `label` | Removes specific option from Menu dropdown |
| `frm.refresh_field(field)` | `fieldname` | Forces DOM re-render for specified docfield |
| `frm.set_query(field, fn)`   | `fieldname`, `query_fn` | Applies custom REST filter to Link fields |
| `frm.save(action, callback)` | `action`, `callback` | Saves current form (`'Save'`, `'Submit'`, `'Cancel'`) |
| `frm.is_new()` | None | Returns `true` if document has not yet been saved to DB |

---

## 5. Dynamic Field Filters (`frm.set_query`)

Filters selectable records in Link fields based on other form field values.

```javascript
frappe.ui.form.on("Task", {
    refresh(frm) {
        // Restrict 'project' link field to Active Projects only
        frm.set_query("project", function() {
            return {
                filters: {
                    status: "Active",
                    company: frm.doc.company
                }
            };
        });
    }
});
```

---

## 6. Asynchronous Server RPC (`frappe.call`)

Executes an asynchronous AJAX HTTP POST request to a whitelisted Python server method.

```javascript
frappe.call({
    method: "my_custom_app.api.get_project_metrics",
    args: {
        project_id: frm.doc.project
    },
    freeze: true,
    freeze_message: __("Calculating Metrics..."),
    callback(r) {
        if (!r.exc && r.message) {
            frm.set_value("completion_percent", r.message.completion);
            frm.refresh_field("completion_percent");
        }
    },
    error(r) {
        frappe.show_alert({ message: __("RPC Error occurred"), indicator: "red" });
    }
});
```

---

## 7. UI Dialogs & User Prompting APIs

### `frappe.confirm` & `frappe.prompt`

```javascript
// 1. Confirmation Modal
frappe.confirm(
    __("Are you sure you want to cancel this task?"),
    () => {
        // User clicked Yes
        frm.set_value("status", "Cancelled");
        frm.save();
    },
    () => {
        // User clicked No
    }
);

// 2. Interactive Input Prompt
frappe.prompt(
    [
        { label: "Cancellation Reason", fieldname: "reason", fieldtype: "Small Text", reqd: 1 }
    ],
    (values) => {
        console.log(values.reason);
    },
    __("Enter Reason"),
    __("Submit")
);
```

---

### Custom Modal Dialogs (`frappe.ui.Dialog`)

```javascript
let d = new frappe.ui.Dialog({
    title: __("Assign Quick Task"),
    fields: [
        { label: "Assignee", fieldname: "user", fieldtype: "Link", options: "User", reqd: 1 },
        { label: "Due Date", fieldname: "due_date", fieldtype: "Date", default: frappe.datetime.nowdate() }
    ],
    primary_action_label: __("Assign"),
    primary_action(values) {
        d.hide();
        frappe.call({
            method: "my_custom_app.api.assign_task",
            args: { task: frm.doc.name, user: values.user },
            callback() { frm.reload_doc(); }
        });
    }
});
d.show();
```

---

## Related Topics

- [09. Server API](/09-server-api/)
- [12. Child Tables](/12-child-tables/)
- [14. Authentication, Session & Roles](/14-authentication-permissions/)
- [23. Client vs Server API Matrix](/23-client-vs-server/)
