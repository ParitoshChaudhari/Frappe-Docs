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

### Programmatic Event Triggers & Custom Handlers (`frm.trigger`)

`frm.trigger(event_name, [doctype], [name])` programmatically invokes registered form lifecycle hooks, docfield change handlers, or custom reusable controller functions.

```javascript
// Method Signature
frm.trigger(event_name, [doctype], [name]);
```

#### How It Works Under the Hood
1. **ScriptManager Registry**: When you define functions inside `frappe.ui.form.on("DocType", { ... })`, Frappe registers each method in its internal `ScriptManager` instance (`cur_frm.script_manager`).
2. **Serial Execution (`frappe.run_serially`)**: When `frm.trigger(event_name)` executes, Frappe retrieves all handlers matching `event_name` for the specified `doctype` and executes them sequentially.
3. **Promise-Aware**: If a triggered function returns a JavaScript `Promise` (such as `frappe.call` or `frappe.db.get_value`), `frm.trigger` automatically awaits that promise. This allows callers to write `await frm.trigger("custom_party")` or `.then(...)` to guarantee asynchronous operations finish before executing downstream code.
4. **Scope Resolution**: If `doctype` and `name` are omitted, they default to `frm.doctype` and `frm.docname`. When triggering child table methods, passing `cdt` (child DocType) and `cdn` (child row name) scopes the execution to that specific child row.

---

#### Where You Can Define `custom_party`
You can define `custom_party` in any of the following locations:

1. **Inside the Primary DocType Client Script**:
   ```javascript
   frappe.ui.form.on("Sales Invoice", {
       custom_party(frm) {
           // Defined directly in the main form event map
       }
   });
   ```
2. **Inside a Standalone or Custom App Client Script**:
   Frappe dynamically merges multiple `frappe.ui.form.on` blocks for the same DocType. If a standard app defines handlers, your custom Client Script can register its own `custom_party` handler, and both will execute serially.
3. **In a Controller Class (Custom Apps)**:
   ```javascript
   frappe.ui.form.on("Sales Invoice", class extends frappe.ui.form.Controller {
       custom_party() {
           // Defined in Controller class
       }
   });
   ```
4. **Inside a Child Table Event Map**:
   ```javascript
   frappe.ui.form.on("Sales Invoice Item", {
       custom_party(frm, cdt, cdn) {
           let row = locals[cdt][cdn];
           // Scoped to individual child row
       }
   });
   ```

---

#### The Real-World "Party Unification" Pattern: Why Use `custom_party`?

In enterprise ERP systems, documents (e.g., **Sales Invoice**, **Payment Entry**, **Journal Entry**) frequently interact with multiple party entities (**Customer**, **Supplier**, **Employee**, or **Student**). When the party or party type changes, the form needs to:
* Fetch billing, shipping, and tax addresses.
* Retrieve customer-specific price lists and discount schemes.
* Check customer credit limits or supplier outstanding balances.
* Update payment terms, default currency, and cost center.

Without `frm.trigger("custom_party")`, you would have to duplicate this 30-line retrieval logic across:
1. `customer(frm)` field handler
2. `supplier(frm)` field handler
3. `party_type(frm)` field handler
4. `refresh(frm)` form handler

By defining a centralized `custom_party(frm)` method and calling `frm.trigger("custom_party")`, you maintain a clean, single source of truth without duplicated code.

---

#### Complete Production Example: `frm.trigger("custom_party")`

```javascript
frappe.ui.form.on("Sales Invoice", {
    // -------------------------------------------------------------
    // 1. Centralized Custom Method Definition
    // -------------------------------------------------------------
    custom_party(frm) {
        let party = frm.doc.customer;
        if (!party) {
            frm.set_value("customer_group", "");
            frm.set_value("territory", "");
            frm.set_value("credit_limit", 0);
            return;
        }

        // Return the Promise so callers can await this trigger!
        return frappe.db.get_value("Customer", party, ["customer_group", "territory", "credit_limit"])
            .then(r => {
                if (r.message) {
                    frm.set_value("customer_group", r.message.customer_group);
                    frm.set_value("territory", r.message.territory);
                    frm.set_value("credit_limit", r.message.credit_limit);

                    // Show visual feedback toast
                    frappe.show_alert({
                        message: __("Party details & credit limit synced for {0}", [party]),
                        indicator: "blue"
                    }, 4);
                }
            });
    },

    // -------------------------------------------------------------
    // 2. Triggering on Field Changes
    // -------------------------------------------------------------
    customer(frm) {
        // Triggered when user selects or changes Customer link field
        frm.trigger("custom_party");
    },

    party_type(frm) {
        // Clear and re-trigger if party type dropdown switches
        frm.set_value("customer", "");
        frm.trigger("custom_party");
    },

    // -------------------------------------------------------------
    // 3. Triggering on Form Refresh
    // -------------------------------------------------------------
    refresh(frm) {
        // If opening an existing draft that already has a customer, re-sync details
        if (!frm.is_new() && frm.doc.customer && !frm.doc.customer_group) {
            frm.trigger("custom_party");
        }

        // Add a manual toolbar refresh button that triggers the custom method
        if (!frm.is_new()) {
            frm.add_custom_button(__("Re-Sync Party Data"), () => {
                frm.trigger("custom_party");
            }, __("Actions"));
        }
    },

    // -------------------------------------------------------------
    // 4. Awaiting Async Custom Trigger in Form Lifecycle Events
    // -------------------------------------------------------------
    async before_save(frm) {
        // Ensure party details are fully loaded before saving to MariaDB
        if (frm.doc.customer && !frm.doc.credit_limit) {
            await frm.trigger("custom_party");
        }
    }
});
```

---

#### Child Table Trigger Pattern (`frm.trigger(event, cdt, cdn)`)

When working with child table rows (e.g. `items`), you can trigger row-level custom functions by passing the Child DocType (`cdt`) and Child DocName (`cdn`):

```javascript
frappe.ui.form.on("Sales Invoice Item", {
    // Custom row-level calculation function
    recalculate_row_margin(frm, cdt, cdn) {
        let row = locals[cdt][cdn]; // or frappe.get_doc(cdt, cdn)
        if (row.rate && row.cost_price) {
            let margin = ((row.rate - row.cost_price) / row.rate) * 100;
            frappe.model.set_value(cdt, cdn, "margin_percent", margin.toFixed(2));
        }
    },

    // Trigger row calculation when rate or cost_price changes
    rate(frm, cdt, cdn) {
        frm.trigger("recalculate_row_margin", cdt, cdn);
    },

    cost_price(frm, cdt, cdn) {
        frm.trigger("recalculate_row_margin", cdt, cdn);
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

### Removing Specific Custom Buttons & Clearing Toolbar

```javascript
// 1. Remove a specific top-level custom button
frm.remove_custom_button(__("Quick Close"));

// 2. Remove a nested button inside a specific dropdown group
frm.remove_custom_button(__("Sync with Jira"), __("Actions"));

// 3. Clear all custom buttons from the toolbar
frm.clear_custom_buttons();
```

---

## 3. Form Intro Banners & Dashboard Indicators (`frm.set_intro`, `frm.dashboard.*`)

Frappe Desk provides dedicated banner and indicator APIs to surface document state, compliance notices, or warnings directly at the top of the form layout.

### 1. Document Intro Callout Banners (`frm.set_intro`)

`frm.set_intro(message, [color])` renders a high-visibility alert banner directly below the form title header.

```javascript
// Signature: frm.set_intro(message, [color])
frappe.ui.form.on("Sales Invoice", {
    refresh(frm) {
        if (frm.doc.is_return) {
            // Renders red warning banner
            frm.set_intro(__("This document is a Credit Note / Sales Return against original invoice {0}", [frm.doc.return_against]), "red");
        } else if (frm.doc.status === "Overdue") {
            frm.set_intro(__("Payment for this invoice is overdue. Interest charges may apply."), "orange");
        } else if (frm.doc.docstatus === 0 && !frm.is_new()) {
            frm.set_intro(__("This is a Draft document. Click Submit to post entries to the General Ledger."), "blue");
        }
    }
});
```

#### Supported Banner Colors & Use Cases
| Color | Visual Appearance | Ideal Use Case |
| :--- | :--- | :--- |
| **`blue`** *(Default)* | Soft Blue background with info icon | Draft instructions, guidance notes, workflow steps |
| **`green`** | Light Green background with checkmark | Verification confirmations, reconciled status |
| **`orange`** / **`yellow`** | Amber background with warning icon | Approaching deadlines, grace period notices, pending approvals |
| **`red`** | Light Red background with alert icon | Returns, cancellations, audit blocks, credit hold notices |

---

### 2. Form Dashboard Headline & Indicators (`frm.dashboard.*`)

The `frm.dashboard` object manages the dynamic KPI widgets, summary headlines, and status dots rendered between the form header and the document fields.

```javascript
frappe.ui.form.on("Customer", {
    refresh(frm) {
        // 1. Clear previous dynamic headlines to prevent duplicates
        frm.dashboard.clear_headline();

        // 2. Set an HTML Headline Alert Banner
        if (frm.doc.loyalty_points > 1000) {
            frm.dashboard.set_headline(
                `🎉 <b>${__("VIP Gold Tier Customer")}</b> — ${__("Eligible for 15% automatic discount on all orders.")}`,
                "green"
            );
        }

        // 3. Add Colored Status Indicator Badges to Dashboard
        if (frm.doc.outstanding_amount > 50000) {
            frm.dashboard.add_indicator(__("High Credit Exposure: {0}", [format_currency(frm.doc.outstanding_amount)]), "red");
        }
        
        if (frm.doc.customer_group === "Commercial") {
            frm.dashboard.add_indicator(__("Commercial Account"), "blue");
        }
    }
});
```

---

## 4. Hiding & Disabling Standard Form Buttons & Menu Options

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

`frappe.show_alert` displays non-intrusive, temporary floating toast notifications in the Desk interface. Unlike modal dialogs, toast alerts do not freeze the screen or block user input, and they automatically dismiss after a configurable timeout.

#### API Signatures & Overloads

```javascript
// Signature 1: Simple message string with optional duration
frappe.show_alert(message, [seconds]);

// Signature 2: Options configuration object with optional duration
frappe.show_alert({
    message: __("Text or HTML markup"),
    indicator: "green"
}, [seconds]);
```

---

#### Complete Options & Parameters Reference

| Parameter / Key | Type | Default | Choices / Format | What It Does & Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **`message`** | `string` | *(Required)* | Plain text or HTML string | The content displayed inside the toast. Always wrap user-facing text in `__("...")` for internationalization. Supports rich HTML tags (`<b>`, `<span>`, `<a>`, `<i class="fa ...">`) for custom styles, links, and inline interactive actions. |
| **`indicator`** | `string` | `'blue'` | `'green'`, `'blue'`, `'orange'`, `'yellow'`, `'red'`, `'purple'`, `'gray'`, `'cyan'` | The colored status indicator dot positioned next to the message. Sets the visual tone and urgency of the alert. |
| **`seconds`** | `number` | `7` | Any positive integer or float (e.g., `3`, `5`, `10`) | Display duration in seconds before the alert auto-dismisses. Can be passed as the 2nd argument to `frappe.show_alert(msg, seconds)` or specified inside options. |

> [!TIP] **Hover to Pause Timer**
> If a user hovers their mouse cursor over a toast alert, Frappe automatically pauses the dismissal countdown timer. This guarantees users have sufficient time to read longer messages or click embedded action links.

---

#### Indicator Color Palette & Usage Guidelines

| Indicator Color | Visual Role | Ideal Use Case & Scenario |
| :--- | :--- | :--- |
| **`green`** | **Success** | Successful document save, submission, record creation, or background job completion. |
| **`blue`** | **Information** | Neutral system updates, informational tips, navigation notes, or in-progress states. |
| **`orange`** / **`yellow`** | **Warning** | Non-fatal warnings, approaching thresholds, draft state reminders, or pending syncs. |
| **`red`** | **Danger / Error** | Validation rejection, network timeout, failed API call, or permission warning. |
| **`purple`** | **Accent / Workflow** | Major workflow milestone transitions, approval notices, or special event triggers. |
| **`gray`** / **`grey`** | **Muted / Neutral** | Low-priority telemetry, cached data notices, or background polling heartbeats. |
| **`cyan`** | **Sync / Telemetry** | Real-time WebSocket synchronization events and telemetry diagnostics. |

---

#### Practical Code Patterns & Real-World Examples

##### 1. Basic Quick Message
```javascript
// Displays standard 7-second neutral informational alert
frappe.show_alert(__("Quick note: Document draft refreshed"));
```

##### 2. Success Alert with Custom 5-Second Duration
```javascript
// Green success indicator with 5-second auto-dismiss
frappe.show_alert({
    message: __("Task #{0} updated and saved successfully!", [frm.doc.name]),
    indicator: "green"
}, 5);
```

##### 3. Warning Alert for Approaching Credit Limits
```javascript
// Warning indicator highlighting approaching limit threshold
let used_pct = ((frm.doc.outstanding_amount / frm.doc.credit_limit) * 100).toFixed(0);

frappe.show_alert({
    message: __("Credit alert: Customer has utilized {0}% of credit limit.", [used_pct]),
    indicator: "orange"
}, 8);
```

##### 4. Error Alert for Failed Client-Side Actions
```javascript
// Red danger indicator for client-side API error
frappe.show_alert({
    message: __("Failed to connect to shipping carrier API. Please retry."),
    indicator: "red"
}, 10);
```

##### 5. Rich HTML Alert with Clickable Inline Action ("Undo" / "View")
Because the `message` parameter accepts valid HTML, you can render clickable interactive action triggers directly inside the toast:

```javascript
// Interactive toast with an inline "Undo" action link
frappe.show_alert({
    message: `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <span>${__("Task marked as Closed.")}</span>
            <a href="javascript:void(0)" 
               onclick="cur_frm.set_value('status', 'Open'); cur_frm.save();" 
               style="color: var(--primary-color, #171717); font-weight: 700; text-decoration: underline;">
               ${__("Undo")}
            </a>
        </div>
    `,
    indicator: "purple"
}, 10);
```

##### 6. Triggering Client Toast Alerts from Python (Server-Side)
You can trigger non-blocking client toast notifications directly from server-side Python controllers using the `alert=True` flag:

```python
import frappe
from frappe import _

# 1. Trigger toast alert during document validation or server RPC
def on_submit(doc, method):
    # Renders green non-blocking toast in the client browser
    frappe.msgprint(
        msg=_("Inventory balance updated and sync queued."),
        alert=True,
        indicator="green"
    )

# 2. Trigger real-time toast alert asynchronously from background worker
def process_background_export(user, file_url):
    # Pushes toast alert over WebSocket to the specific user session
    frappe.publish_realtime(
        event="msgprint",
        message={
            "message": _("Your Excel export is ready: <a href='{0}'>Download</a>").format(file_url),
            "alert": True,
            "indicator": "blue"
        },
        user=user
    )
```

---

#### Comparison: When to Use `show_alert` vs Other UI Messaging APIs

| Method | UI Type | Blocks Screen? | Auto-Dismisses? | Best Used For |
| :--- | :--- | :---: | :---: | :--- |
| **`frappe.show_alert`** | Floating Toast | ❌ No | ✅ Yes (default 7s) | Passive confirmations, status changes, non-fatal errors |
| **`frappe.msgprint`** | Modal Dialog | ✅ Yes | ❌ No (requires click) | Detailed warnings, exception stack, lists (`as_list`), tables (`as_table`) |
| **`frappe.confirm`** | Confirmation Modal | ✅ Yes | ❌ No | "Are you sure?" binary choices (Yes/No callbacks) |
| **`frappe.warn`** | Warning Modal | ✅ Yes | ❌ No | Dangerous/destructive actions (Red primary button) |
| **`frappe.prompt`** | Input Dialog Modal | ✅ Yes | ❌ No | Capturing fast user inputs (reason text, date selection) |

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

## 7. Asynchronous Server RPC (`frappe.call` & `frappe.xcall`)

Executes an asynchronous AJAX HTTP POST request to a `@frappe.whitelist()` Python server method.

### 1. Modern Promise-Based Calls (`frappe.xcall`)

`frappe.xcall(method, [params])` is the modern, Promise-first alternative to `frappe.call`. It directly returns a Promise that resolves to `r.message` and automatically rejects on error, enabling clean `async/await` syntax without callback nesting.

```javascript
// Modern async/await with frappe.xcall
frappe.ui.form.on("Task", {
    async refresh(frm) {
        if (!frm.is_new() && frm.doc.project) {
            try {
                // Directly returns unwrapped r.message!
                let metrics = await frappe.xcall("my_custom_app.api.get_project_metrics", {
                    project_id: frm.doc.project
                });

                frm.set_value("completion_percent", metrics.completion);
                frm.refresh_field("completion_percent");
            } catch (err) {
                frappe.show_alert({
                    message: __("Could not fetch project metrics"),
                    indicator: "red"
                });
            }
        }
    }
});
```

---

### 2. Configuration Object Invocation (`frappe.call`)

For complex requests requiring UI freezing, button spinners, or custom headers, use `frappe.call`:

```javascript
frappe.call({
    method: "my_custom_app.api.get_project_metrics",
    args: {
        project_id: frm.doc.project
    },
    freeze: true,
    freeze_message: __("Calculating Metrics..."),
    btn: $(".btn-primary"), // Automatically attaches spinner to button and disables it during execution
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

#### `frappe.call` Options & Parameters Reference

| Option | Type | Default | Description & Behavior |
| :--- | :--- | :--- | :--- |
| **`method`** | `string` | *(Required)* | Dotted path to the whitelisted Python function (e.g., `"my_app.api.sync"`). |
| **`args`** | `object` | `{}` | Parameter dictionary passed as JSON payload to the Python function kwargs. |
| **`freeze`** | `boolean` | `false` | When `true`, displays a semi-transparent modal overlay freezing the screen until completion. |
| **`freeze_message`** | `string` | `""` | Informative label rendered inside the loading spinner overlay when `freeze: true`. |
| **`btn`** | `jQuery | HTMLElement` | `null` | Attaches a loading spinner inside the button and disables it until the network call finishes. |
| **`async`** | `boolean` | `true` | When `false`, executes as a blocking synchronous AJAX call (rarely recommended). |
| **`callback`** | `function(r)` | `null` | Invoked on HTTP 200 response. Response data is accessible via `r.message`. |
| **`error`** | `function(r)` | `null` | Invoked if the server raises an exception or returns a non-200 HTTP status code. |

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

// 7. Get Checked / Selected Child Table Rows in Grids
let selected = frm.get_selected();
// Returns object mapping child tables to array of checked row names (cdn)
// Example: { items: ["8b3f12a9c0", "e76d9014f1"] }
if (selected.items && selected.items.length) {
    console.log("Selected child row names:", selected.items);
}

// 8. Form Editing Controls
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



