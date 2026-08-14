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
            
            // Style custom button with CSS class ('btn-primary', 'btn-danger', 'btn-warning', 'btn-info')
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
| `frm.clear_table(field)` | `fieldname` | Wipes all child table rows cleanly |
| `frm.copy_doc()` | None | Duplicates active document into new unsaved draft form |
| `frm.reload_doc()` | None | Fetches fresh copy of document from server and re-renders UI |
| `frm.dirty()` / `frm.is_dirty()`| None | Returns `true` if form contains unsaved changes |
| `frm.set_intro(msg, color)` | `message`, `color` | Displays alert banner (`'blue'`, `'red'`, `'yellow'`, `'green'`) on top of form |
| `frm.scroll_to_field(field)`| `fieldname` | Smooth-scrolls form view container to target field |
| `frm.page.set_title(title)` | `title` | Sets view title heading dynamically |
| `frm.page.set_indicator()` | `label`, `color` | Sets status indicator badge (`'green'`, `'red'`, `'orange'`, `'blue'`) |
| `frm.page.add_inner_button()`| `label`, `action`, `group` | Adds secondary action button into inner toolbar group |
| `frm.page.clear_inner_actions()`| None | Clears secondary inner action buttons |
| `frm.refresh_field(field)` | `fieldname` | Forces DOM re-render for specified docfield |
| `frm.set_query(field, fn)`   | `fieldname`, `query_fn` | Applies custom REST filter to Link fields |
| `frm.save(action, callback)` | `action`, `callback` | Saves current form (`'Save'`, `'Submit'`, `'Cancel'`) |
| `frm.is_new()` | None | Returns `true` if document has not yet been saved to DB |

### Form Banner & Navigation Example

```javascript
frappe.ui.form.on("Task", {
    refresh(frm) {
        if (frm.doc.status === "Overdue") {
            // Display colored top banner
            frm.set_intro(__("This task is past its due date! Please resolve immediately."), "red");
        }
        
        // Update header badge color
        frm.page.set_indicator(__("Overdue Task"), "red");
        
        // Add secondary group action button
        frm.page.add_inner_button(__("Reassign Task"), () => {
            frm.scroll_to_field("allocated_to");
        }, __("Actions"));
    }
});
```

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

## 6. Client Utility APIs (`frappe.show_alert`, Routing & `frappe.datetime`)

### Toast Alerts (`frappe.show_alert`)

Displays non-blocking temporary popup notifications.

```javascript
// Display 5-second green toast message
frappe.show_alert({
    message: __("Task status updated successfully!"),
    indicator: "green"
}, 5);
```

---

### Navigation & Route State (`frappe.set_route`)

```javascript
// 1. Navigate directly to a specific document form
frappe.set_route("Form", "Customer", "CUST-2026-00001");

// 2. Navigate to List View with predefined route options
frappe.route_options = { status: "Open", priority: "High" };
frappe.set_route("List", "Task");
```

---

### Date & Time Helpers (`frappe.datetime.*`)

```javascript
// Get today's date (YYYY-MM-DD)
let today = frappe.datetime.get_today();
console.log("Today:", today);

// Add 7 days to date
let next_week = frappe.datetime.add_days(today, 7);
console.log("Next Week:", next_week);

// Difference in days between two dates
let days_diff = frappe.datetime.get_diff("2026-08-20", today);
console.log("Days Remaining:", days_diff);
```

---

### Client-Side Database APIs (`frappe.db` in JavaScript)

Allows fetching, checking, and inserting documents directly from client-side JavaScript via Promises.

```javascript
// 1. Asynchronous fetch single field value
frappe.db.get_value("Customer", "CUST-001", "customer_name").then(r => {
    console.log("Customer Name:", r.message.customer_name);
});

// 2. Check record existence
frappe.db.exists("User", "test@company.com").then(exists => {
    if (exists) {
        console.log("User exists!");
    }
});

// 3. Client-side Document Insertion
frappe.db.insert({
    doctype: "ToDo",
    description: "Follow up with client"
}).then(doc => {
    console.log("Created ToDo:", doc.name);
});
```

---

## 7. Asynchronous Server RPC (`frappe.call`)

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

## 8. UI Dialogs & User Prompting APIs

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

---

## 9. Creating & Mapping Documents from Client Script (Doc Fields & Child Tables)

Client scripts frequently need to instantiate a new document from an existing form and pass data from the current document (`frm.doc`) into the new document — including both **Doc-Level Fields** (parent fields) and **Child Table Rows**.

Frappe provides two primary client-side patterns to achieve this:

---

### Pattern A: Unsaved Form Mapping & Navigation (`frappe.model.make_new_doc_and_get_name`)

Use this approach when you want to open a **new unsaved form view** in the Desk, allowing the user to review and edit mapped parent fields and child table items before saving.

```javascript
frappe.ui.form.on("Quotation", {
    refresh(frm) {
        if (!frm.is_new()) {
            // Add custom action button to trigger document creation
            frm.add_custom_button(__("Create Sales Invoice"), () => {
                
                // 1. Initialize a new unsaved 'Sales Invoice' document in local client memory
                frappe.model.make_new_doc_and_get_name("Sales Invoice", (new_doc) => {
                    
                    // 2. Map Parent / Document-Level Fields from current Quotation (frm.doc)
                    new_doc.customer = frm.doc.customer;
                    new_doc.company = frm.doc.company;
                    new_doc.posting_date = frappe.datetime.get_today();
                    new_doc.remarks = __("Created from Quotation: {0}", [frm.doc.name]);

                    // 3. Map Child Table Rows from current Quotation items (frm.doc.items)
                    if (frm.doc.items && frm.doc.items.length) {
                        frm.doc.items.forEach(row => {
                            // Append new child table row to target document's 'items' table
                            let child = frappe.model.add_child(new_doc, "items");
                            
                            // Transfer child cell values
                            child.item_code = row.item_code;
                            child.item_name = row.item_name;
                            child.qty = row.qty;
                            child.rate = row.rate;
                            child.amount = row.qty * row.rate;
                        });
                    }

                    // 4. Route viewport to the newly populated form
                    frappe.set_route("Form", "Sales Invoice", new_doc.name);
                });

            }, __("Create"));
        }
    }
});
```

#### Expected Behavior & Output
- Clicking **Create -> Create Sales Invoice** initializes a new unsaved `Sales Invoice` form.
- The `customer`, `company`, `posting_date`, and `remarks` fields are automatically filled.
- The `items` child table is populated with all rows from the Quotation.
- The user is navigated to `/app/sales-invoice/new-sales-invoice-1` ready for review.

---

### Pattern B: Direct Client Database Insertion (`frappe.db.insert`)

Use this approach when you want to **instantiate and save** the new document directly into the database in the background without opening an unsaved form first.

```javascript
frappe.ui.form.on("Project", {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button(__("Create Follow-up Task"), () => {
                
                // 1. Construct child table array from current form items
                let task_items = (frm.doc.tasks || []).map(row => ({
                    description: row.task_name,
                    status: "Open"
                }));

                // 2. Insert new document directly via client frappe.db API
                frappe.db.insert({
                    doctype: "Task",
                    subject: __("Follow-up for Project: {0}", [frm.doc.project_name]),
                    project: frm.doc.name,
                    company: frm.doc.company,
                    priority: "High",
                    status: "Open",
                    
                    // Pass child table rows array directly
                    items: task_items
                }).then(doc => {
                    // Show green toast notification
                    frappe.show_alert({
                        message: __("Created Task {0} successfully!", [doc.name]),
                        indicator: "green"
                    }, 5);

                    // Navigate user to newly created record
                    frappe.set_route("Form", "Task", doc.name);
                });

            });
        }
    }
});
```

#### Expected Behavior & Output
- Saves a new `Task` document directly to the MariaDB database.
- Displays a toast message: `Created Task TASK-2026-00050 successfully!`.
- Navigates directly to the saved document form `/app/task/TASK-2026-00050`.

---

## 10. Complete Client JavaScript API & Utility Reference Matrix

Below is the exhaustive, categorized reference of additional client-side JavaScript APIs provided by Frappe v15:

### 1. Form Instance (`frm`) Lifecycle & Page Utilities

| Method | Parameters | Description & Code Example |
| :--- | :--- | :--- |
| `frm.trigger(event)` | `event_name` | Programmatically triggers a form or docfield event handler.<br>`frm.trigger("status");` |
| `frm.refresh_fields()` | `fields_array` | Forces DOM re-render for multiple docfields at once.<br>`frm.refresh_fields(["status", "priority"]);` |
| `frm.save_or_update()` | `action`, `callback` | Intelligently saves draft or updates existing document.<br>`frm.save_or_update();` |
| `frm.get_field(field)` | `fieldname` | Returns DocField control instance (`df`, `$wrapper`, `$input`).<br>`let control = frm.get_field("status");` |
| `frm.set_read_only()` | None | Sets all docfields on form to read-only state.<br>`frm.set_read_only();` |
| `frm.page.add_action_item()`| `label`, `action_fn` | Adds custom item to standard **Actions** dropdown menu.<br>`frm.page.add_action_item(__("Export"), () => {});` |
| `frm.page.clear_action_items()`| None | Clears all custom action items from Actions dropdown menu.<br>`frm.page.clear_action_items();` |
| `frm.page.add_menu_item()` | `label`, `action_fn`, `standard` | Adds custom menu item to standard **Menu** dropdown.<br>`frm.page.add_menu_item(__("Print Spec"), () => {});` |

---

### 2. User Notifications, Warnings & Progress Bars (`frappe.*`)

```javascript
// 1. Standard Modal Alert Dialog
frappe.msgprint(__("Operation completed successfully."), __("Success"));

// 2. Exception Error Modal (Displays red alert and raises JS exception)
frappe.throw(__("Invalid account status. Transaction aborted."));

// 3. Confirmation Warning Dialog with Custom Action Button
frappe.warn(
    __("Unsaved Changes"),
    __("You have unsaved changes. Are you sure you want to discard them?"),
    () => { /* Proceed Callback */ },
    __("Discard Changes")
);

// 4. Global Header Progress Bar
frappe.show_progress(__("Processing Bulk Orders"), 45, 100, __("Processing order 45 of 100..."));

// 5. Hide Progress Bar
frappe.hide_progress();
```

---

### 3. Client Navigation, Route Inspection & Breadcrumbs

```javascript
// 1. Get current browser route array (e.g. ['Form', 'Customer', 'CUST-001'])
let current_route = frappe.get_route();
console.log("Current View:", current_route[0]); // 'Form'

// 2. Get current browser route string (e.g. 'Form/Customer/CUST-001')
let route_str = frappe.get_route_str();

// 3. Set pre-filtered options for next target route navigation
frappe.set_route_options({ "status": "Open", "priority": "High" });
frappe.set_route("List", "Task");

// 4. Inject dynamic breadcrumb link into Desk header toolbar
frappe.breadcrumbs.add("Projects", "Project");
```

---

### 4. Client-Side Database APIs (`frappe.db.*` in JS)

```javascript
// 1. Fetch value from Single DocType (e.g. System Settings)
frappe.db.get_single_value("System Settings", "default_currency").then(currency => {
    console.log("System Default Currency:", currency);
});

// 2. Query filtered list of records
frappe.db.get_list("Task", {
    fields: ["name", "subject", "status"],
    filters: { status: "Open" },
    limit: 10
}).then(tasks => {
    console.log("Open Tasks:", tasks);
});

// 3. Fetch full Document instance object
frappe.db.get_doc("Customer", "CUST-001").then(doc => {
    console.log("Customer Doc:", doc);
});

// 4. Delete document record programmatically
frappe.db.delete_doc("ToDo", "TODO-00001").then(() => {
    frappe.show_alert({ message: __("ToDo deleted"), indicator: "green" });
});

// 5. Direct field update in database
frappe.db.set_value("Task", "TASK-00001", "status", "Completed").then(r => {
    console.log("Updated record:", r.message);
});
```

---

### 5. Client Schema & Field Formatting (`frappe.meta` & `frappe.format`)

```javascript
// 1. Inspect DocField schema definition
let df = frappe.meta.get_docfield("Customer", "customer_name", frm.doc.name);
console.log("Is Mandatory:", df.reqd);

// 2. Check if field exists in DocType schema
if (frappe.meta.has_field("Customer", "credit_limit")) {
    console.log("Field exists!");
}

// 3. Universal Field Value Formatter (Formats values based on fieldtype metadata)
let formatted_val = frappe.format(15000.5, { fieldtype: "Currency" }, { doc: frm.doc });
console.log("Formatted Currency:", formatted_val); // "$ 15,000.50"
```

---

### 6. Client Model Memory Helpers (`frappe.model.*`)

```javascript
// 1. Get new unsaved document object in memory
let new_doc = frappe.model.get_new_doc("Task");

// 2. Update field in local client model memory and trigger UI updates
frappe.model.set_value("Task", frm.doc.name, "priority", "Urgent");

// 3. Clear local document memory cache
frappe.model.clear_doc("Task", frm.doc.name);

// 4. Ensure DocType metadata is loaded before executing logic
frappe.model.with_doctype("Task", () => {
    console.log("Task DocType schema ready!");
});

// 5. Client-Side Permission Verification
if (frappe.model.can_read("Task")) {
    console.log("User can read Tasks");
}
if (frappe.model.can_create("Task")) {
    console.log("User can create new Tasks");
}
if (frappe.model.can_write("Task")) {
    console.log("User can edit Tasks");
}
if (frappe.model.can_delete("Task")) {
    console.log("User can delete Tasks");
}
if (frappe.model.can_submit("Task")) {
    console.log("User can submit Tasks");
}
```

---

### 7. Form Header & Toolbar Controls (`frm.page.*`)

The `frm.page` object allows you to control page headers, titles, status indicators, and inner secondary toolbars.

```javascript
frappe.ui.form.on("Task", {
    refresh(frm) {
        // 1. Dynamic page title & status indicator badge
        frm.page.set_title(__("Custom Task View"));
        frm.page.set_indicator(__("Urgent Action"), "red");

        // 2. Add button to inner secondary toolbar
        frm.page.add_inner_button(__("Quick Action"), () => {
            frappe.msgprint("Inner action clicked!");
        }, __("Utilities")); // Optional group dropdown

        // 3. Add custom option to standard 'Actions' menu
        frm.page.add_action_item(__("Export Summary"), () => {
            console.log("Exporting summary...");
        });

        // 4. Add custom option to standard 'Menu' dropdown
        frm.page.add_menu_item(__("Print Special Ticket"), () => {
            window.print();
        });

        // 5. Override primary action button in header
        frm.page.set_primary_action(__("Approve Task"), () => {
            frm.set_value("status", "Completed");
            frm.save();
        }, "check");
    }
});
```

---

### 8. Additional Form & Child Table Helpers (`frm.*`)

```javascript
// 1. Scoped RPC Call (Automatically passes doctype and docname parameters)
frm.call("my_custom_app.tasks.process_task", { notify: 1 }).then(r => {
    console.log("Server response:", r.message);
});

// 2. Programmatically fire form or field event handlers
frm.trigger("status");

// 3. Child Table Operations
frm.clear_table("items"); // Remove all child rows
let new_row = frm.add_child("items", {
    item_code: "ITEM-001",
    qty: 2
});
frm.refresh_field("items");

// 4. Auto-Fetch related values from Link field
// When 'customer' link field is selected, fetch 'territory' from Customer doc into 'territory' field
frm.add_fetch("customer", "territory", "territory");

// 5. Scroll viewport smoothly to field
frm.scroll_to_field("closing_notes");

// 6. Form Banner Intro
frm.set_intro(__("Please review all mandatory fields before submitting."), "blue");

// 7. Form Editing Controls
frm.disable_save();   // Hide Save button
frm.enable_save();    // Show Save button
frm.disable_form();   // Make all fields read-only and disable save
frm.enable_form();    // Re-enable editing
```

---

### 7. MultiSelect Dialog Selector (`frappe.ui.form.MultiSelectDialog`)

Opens a popup modal displaying a searchable list table allowing users to select multiple records:

```javascript
new frappe.ui.form.MultiSelectDialog({
    doctype: "Item",
    target: frm,
    set_filters: { is_sales_item: 1 },
    action(selections) {
        // selections contains array of selected primary keys (e.g. ['ITEM-001', 'ITEM-002'])
        selections.forEach(item_code => {
            let row = frm.add_child("items");
            row.item_code = item_code;
        });
        frm.refresh_field("items");
    }
});
```

---

## Related Topics

- [09. Server API](/09-server-api/)
- [12. Child Tables](/12-child-tables/)
- [14. Authentication, Session & Roles](/14-authentication-permissions/)
- [23. Client vs Server API Matrix](/23-client-vs-server/)
- [24. Searchable API Index](/24-api-index/)



