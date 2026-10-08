---
title: Client API (frappe.ui.form & JS SDK) for Frappe v15
description: Comprehensive client-side JavaScript API reference - form handlers, frm methods, custom buttons, hiding/disabling standard buttons, set_df_property, set_query, frappe.call, built-in data fetching and updating with frappe.client.* and frappe.db.*, dialogs, and alerts.
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

The `frm.dashboard` object manages the dynamic KPI widgets, summary headlines, status indicators, progress bars, charts, and heatmaps rendered directly between the form header and the document fields.

#### Complete `frm.dashboard` Methods Reference Matrix

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `frm.dashboard.set_headline(html, color)` | `html`, `color` (`'green'`, `'red'`, `'orange'`, `'blue'`, `'yellow'`) | Displays colored announcement ribbon at the top of the form dashboard. |
| `frm.dashboard.clear_headline()` | None | Clears the active headline banner (call on `refresh` to avoid duplicate headlines). |
| `frm.dashboard.add_indicator(label, color, [action])` | `label`, `color`, `action_fn` | Adds a pill-shaped status badge to dashboard with optional click callback. |
| `frm.dashboard.add_progress(title, percent, [message])` | `title`, `percent`, `message` | Renders a progress percentage bar within the form dashboard. |
| `frm.dashboard.show_progress(title, percent, [message])` | `title`, `percent`, `message` | Updates or shows a progress indicator dynamically in real-time. |
| `frm.dashboard.render_graph(args)` | `args` (data, type, colors) | Injects an embedded Frappe Charts graph directly into the dashboard. |
| `frm.dashboard.render_heatmap(args)` | `args` (dataPoints, start, end) | Injects a GitHub-style contribution activity heatmap into the dashboard. |
| `frm.dashboard.add_transactions(opts)` | `opts` (transactions list) | Dynamically appends transaction connection links to related DocTypes. |
| `frm.dashboard.clear_comment()` | None | Clears any comment banner displayed in the dashboard header. |

---

#### Comprehensive Code Examples: All `frm.dashboard` Methods

```javascript
frappe.ui.form.on("Customer", {
    refresh(frm) {
        // -----------------------------------------------------------------
        // 1. Headlines: Announcements and Status Alerts
        // -----------------------------------------------------------------
        frm.dashboard.clear_headline(); // Always clear on refresh to prevent duplicate ribbons

        if (frm.doc.loyalty_points > 1000) {
            frm.dashboard.set_headline(
                `🎉 <b>${__("VIP Gold Tier Customer")}</b> — ${__("Eligible for 15% automatic discount on all orders.")}`,
                "green"
            );
        } else if (frm.doc.outstanding_amount > 100000) {
            frm.dashboard.set_headline(
                `⚠️ <b>${__("Overdue Account")}</b> — ${__("Outstanding balance exceeds credit threshold.")}`,
                "red"
            );
        }

        // -----------------------------------------------------------------
        // 2. Status Indicator Badges (With Click Actions)
        // -----------------------------------------------------------------
        if (frm.doc.outstanding_amount > 50000) {
            frm.dashboard.add_indicator(
                __("High Credit Exposure: {0}", [format_currency(frm.doc.outstanding_amount)]),
                "red",
                () => {
                    // Click handler opens related Accounts Receivable report
                    frappe.set_route("query-report", "Accounts Receivable", { customer: frm.doc.name });
                }
            );
        }

        if (frm.doc.customer_group === "Commercial") {
            frm.dashboard.add_indicator(__("Commercial Account"), "blue");
        }

        // -----------------------------------------------------------------
        // 3. Progress Indicators (Tasks, Milestones, Onboarding)
        // -----------------------------------------------------------------
        if (!frm.is_new()) {
            let kyc_score = frm.doc.kyc_completed ? 100 : 60;
            frm.dashboard.add_progress(
                __("KYC Verification Status"),
                kyc_score,
                kyc_score === 100 ? __("Completed") : __("Pending Documents")
            );
        }

        // -----------------------------------------------------------------
        // 4. Embedded Frappe Charts (render_graph)
        // -----------------------------------------------------------------
        if (!frm.is_new()) {
            frm.dashboard.render_graph({
                title: __("Quarterly Sales Activity"),
                data: {
                    labels: ["Q1", "Q2", "Q3", "Q4"],
                    datasets: [
                        { name: "Invoiced", values: [45000, 52000, 61000, 58000] }
                    ]
                },
                type: "line",     // 'line', 'bar', 'axis-mixed'
                height: 180,
                colors: ["#2490ef"]
            });
        }

        // -----------------------------------------------------------------
        // 5. Activity Heatmap (render_heatmap)
        // -----------------------------------------------------------------
        if (!frm.is_new()) {
            // Timestamp epoch in seconds mapped to activity count
            let now_epoch = Math.floor(Date.now() / 1000);
            let day_epoch = 86400;
            let sample_data = {};
            sample_data[now_epoch - day_epoch * 3] = 4;
            sample_data[now_epoch - day_epoch * 2] = 7;
            sample_data[now_epoch - day_epoch] = 2;
            sample_data[now_epoch] = 9;

            let start_date = new Date();
            start_date.setMonth(start_date.getMonth() - 3);

            frm.dashboard.render_heatmap({
                title: __("Order Frequency Heatmap"),
                data: {
                    dataPoints: sample_data,
                    start: start_date,
                    end: new Date()
                },
                countLabel: __("Orders")
            });
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

<span id="built-in-client-data-operations"></span>
<span id="frappe-client-crud"></span>
## 8. Built-in Client Data Operations (`frappe.client.*` & `frappe.db.*`)

Frappe provides a comprehensive suite of built-in methods to perform document CRUD (Create, Read, Update, Delete), list queries, record counts, and field updates directly from client-side JavaScript.

### Architecture: How Client Data Operations Work

Under the hood, Frappe provides client-side data operations through two interconnected layers:

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
├──────────────────────────────┬──────────────────────────────┤
│    frappe.db.* (JS SDK)      │    frappe.call / xcall       │
│  (Promise-based Desk sugar)  │   (Direct RPC dispatcher)    │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼ HTTP POST (/api/method/...)   ▼
┌─────────────────────────────────────────────────────────────┐
│                 Frappe Backend (Python)                     │
├─────────────────────────────────────────────────────────────┤
│                    frappe/client.py                         │
│  @frappe.whitelist() endpoints:                             │
│  • get               • set_value       • insert             │
│  • get_value         • get_list        • save               │
│  • get_single_value  • get_count       • delete             │
│  • rename_doc        • submit          • cancel             │
├─────────────────────────────────────────────────────────────┤
│         ORM & Database Layer (MariaDB / PostgreSQL)         │
└─────────────────────────────────────────────────────────────┘
```

1. **`frappe.client.*` (Backend RPC Endpoints)**: Whitelisted Python controller functions defined in `frappe/client.py`. You invoke them from JavaScript using `frappe.call({ method: "frappe.client.<action>", args: { ... } })` or modern `await frappe.xcall("frappe.client.<action>", { ... })`.
2. **`frappe.db.*` (Client JS SDK)**: Built-in JavaScript convenience methods available in Desk that wrap `frappe.client.*` inside native JavaScript Promises.
3. **Active Form State vs. Database Direct Writes**:
   - `frm.set_value()` updates the **in-memory form model** (`locals`). It marks the form dirty (displays the orange unsaved indicator) and does **not** write to MariaDB until the user or script calls `frm.save()`.
   - `frappe.client.set_value()` and `frappe.db.set_value()` write **directly to the database** on the server. If you update the document currently open in the active form view using database methods, you **must call `frm.reload_doc()`** to refresh local memory and prevent concurrency errors.

---

### 1. Fetching Full Documents (`frappe.client.get` & `frappe.db.get_doc`)

`frappe.client.get` retrieves an entire document record from the server, including all standard fields, custom fields, and nested child table rows (e.g., `doc.items`).

#### Parameter Reference (`frappe.client.get`)

| Parameter | Type | Required | Default | Description & Choices |
| :--- | :--- | :---: | :--- | :--- |
| **`doctype`** | `string` | **Yes** | — | Name of the DocType to fetch (e.g., `"Customer"`, `"Sales Order"`, `"Task"`). |
| **`name`** | `string` | **Conditional** | `null` | Document primary key / ID (e.g., `"CUST-2026-00001"`). Required if `filters` is not provided. |
| **`filters`** | `object \| array` | **Conditional** | `null` | Filter dictionary (e.g., `{ email_id: "user@example.com" }`) or array used to locate the document when `name` is unknown. |
| **`parent`** | `string` | No | `null` | Name of the parent document if querying a row from a child table DocType. |

#### Return Value
Returns the complete document object. Child tables are returned as arrays of child row objects under their respective child table fieldnames.

#### JavaScript Examples

```javascript
// Pattern 1: frappe.call with callback (by Name)
frappe.call({
    method: "frappe.client.get",
    args: {
        doctype: "Customer",
        name: "CUST-2026-00001"
    },
    callback(r) {
        if (r.message) {
            let customer = r.message;
            console.log("Customer Name:", customer.customer_name);
            console.log("Credit Limit:", customer.credit_limit);
        }
    }
});

// Pattern 2: Modern async/await with frappe.xcall (by Filters)
async function fetchUserByEmail(email) {
    try {
        const userDoc = await frappe.xcall("frappe.client.get", {
            doctype: "User",
            filters: { email: email }
        });
        console.log("User Full Name:", userDoc.full_name);
        return userDoc;
    } catch (err) {
        frappe.msgprint(__("User not found for email {0}", [email]));
    }
}

// Pattern 3: Using client Desk helper frappe.db.get_doc
async function loadOrderWithItems(orderName) {
    const order = await frappe.db.get_doc("Sales Order", orderName);
    console.log("Order Grand Total:", order.grand_total);
    
    // Access nested child table rows directly
    (order.items || []).forEach(row => {
        console.log(`Item: ${row.item_code} | Qty: ${row.qty} | Rate: ${row.rate}`);
    });
}
```

---

### 2. Fetching Specific Fields (`frappe.client.get_value` & `frappe.db.get_value`)

When you only need one or two field values instead of the entire document payload, `get_value` is significantly faster and uses less network bandwidth and server memory.

#### Parameter Reference (`frappe.client.get_value`)

| Parameter | Type | Required | Default | Description & Choices |
| :--- | :--- | :---: | :--- | :--- |
| **`doctype`** | `string` | **Yes** | — | Target DocType name (e.g., `"Task"`, `"Employee"`). |
| **`fieldname`** | `string \| array` | **Yes** | — | Single field name string (`"status"`) or array of field names (`["status", "priority", "exp_end_date"]`). |
| **`filters`** | `string \| object \| array` | **Yes** | — | Document name string (`"TASK-00001"`), or filter key-value object (`{ employee_name: "John Doe" }`), or filter array (`[["status", "=", "Open"]]`). |
| **`as_dict`** | `boolean` | No | `true` (`1`) | When fetching multiple fields, returns an object `{ fieldname: value }` instead of an indexed array. |
| **`debug`** | `boolean` | No | `false` | When `true`, prints generated SQL query execution plan to the browser console. |
| **`parent`** | `string` | No | `null` | Parent document name when querying child table rows. |

#### Return Value
- **Single field requested**: Returns `{ [fieldname]: value }` in `r.message` (or directly resolved as `{ [fieldname]: value }` with `frappe.db.get_value`).
- **Multiple fields requested**: Returns an object containing requested field names as keys: `{ status: "Open", priority: "High" }`.

#### JavaScript Examples

```javascript
// Pattern 1: Fetching multiple fields via frappe.call
frappe.call({
    method: "frappe.client.get_value",
    args: {
        doctype: "Customer",
        filters: "CUST-00001",
        fieldname: ["customer_group", "territory", "credit_limit"],
        as_dict: 1
    },
    callback(r) {
        if (r.message) {
            console.log("Customer Group:", r.message.customer_group);
            console.log("Territory:", r.message.territory);
            console.log("Credit Limit:", r.message.credit_limit);
        }
    }
});

// Pattern 2: Modern async/await with frappe.xcall
async function checkItemPrice(itemCode) {
    const itemData = await frappe.xcall("frappe.client.get_value", {
        doctype: "Item",
        filters: { item_code: itemCode },
        fieldname: ["item_name", "standard_rate", "stock_uom"]
    });
    
    if (itemData) {
        console.log(`${itemData.item_name} costs ${itemData.standard_rate} per ${itemData.stock_uom}`);
    }
}

// Pattern 3: Using client Desk helper frappe.db.get_value
frappe.ui.form.on("Sales Invoice", {
    customer(frm) {
        if (!frm.doc.customer) return;
        
        frappe.db.get_value("Customer", frm.doc.customer, ["territory", "tax_id"])
            .then(r => {
                if (r.message) {
                    frm.set_value("territory", r.message.territory);
                    frm.set_value("tax_id", r.message.tax_id);
                }
            });
    }
});
```

---

### 3. Fetching Single DocType Values (`frappe.client.get_single_value` & `frappe.db.get_single_value`)

Single DocTypes (such as **System Settings**, **Global Defaults**, **Stock Settings**, **Accounts Settings**) store global configuration as a single set of key-value pairs without separate document rows.

#### Parameter Reference (`frappe.client.get_single_value`)

| Parameter | Type | Required | Default | Description & Choices |
| :--- | :--- | :---: | :--- | :--- |
| **`doctype`** | `string` | **Yes** | — | Name of the Single DocType (e.g., `"System Settings"`, `"Global Defaults"`). |
| **`field`** | `string` | **Yes** | — | Name of the setting field to fetch (e.g., `"default_currency"`, `"country"`). |

#### JavaScript Examples

```javascript
// Pattern 1: frappe.call
frappe.call({
    method: "frappe.client.get_single_value",
    args: {
        doctype: "System Settings",
        field: "default_currency"
    },
    callback(r) {
        console.log("System Default Currency:", r.message); // e.g. "USD"
    }
});

// Pattern 2: Modern async/await with frappe.xcall
const timeZone = await frappe.xcall("frappe.client.get_single_value", {
    doctype: "System Settings",
    field: "time_zone"
});
console.log("Configured System Timezone:", timeZone);

// Pattern 3: Using frappe.db.get_single_value helper
const defaultCompany = await frappe.db.get_single_value("Global Defaults", "default_company");
console.log("Default Company:", defaultCompany);
```

---

### 4. Querying Filtered Record Lists (`frappe.client.get_list` & `frappe.db.get_list`)

`get_list` executes an optimized SQL query against the database with field selection, compound filtering operators, ordering, and pagination.

#### Parameter Reference (`frappe.client.get_list`)

| Parameter | Type | Required | Default | Description & Choices |
| :--- | :--- | :---: | :--- | :--- |
| **`doctype`** | `string` | **Yes** | — | DocType name to query (e.g., `"Sales Order"`, `"Task"`). |
| **`fields`** | `array of strings` | No | `["name"]` | List of field columns to return (e.g., `["name", "customer", "grand_total"]`). |
| **`filters`** | `object \| array` | No | `{}` | Filter criteria. Supports key-value dictionary `{ status: "Open" }` or array of conditions: `[["status", "=", "Open"], ["grand_total", ">", 1000]]`. |
| **`or_filters`** | `array` | No | `null` | Alternative conditions evaluated with SQL `OR` logic. |
| **`order_by`** | `string` | No | `"modified desc"` | SQL `ORDER BY` clause (e.g., `"creation desc"`, `"grand_total asc"`). |
| **`limit_start`** | `integer` | No | `0` | Offset index for server pagination. |
| **`limit_page_length`** | `integer` | No | `20` | Maximum number of rows to return per request. |
| **`group_by`** | `string` | No | `null` | SQL `GROUP BY` column expression. |
| **`parent`** | `string` | No | `null` | Parent document name for child doctype queries. |
| **`as_list`** | `boolean` | No | `false` | When `true`, returns rows as arrays of cell values rather than objects. |

#### Supported Filter Operators
When passing an array to `filters`: `[fieldname, operator, value]`
- Comparison: `=`, `!=`, `>`, `<`, `>=`, `<=`
- Substring & Pattern: `like`, `not like` (e.g., `["customer_name", "like", "%Corp%"]`)
- Membership: `in`, `not in` (e.g., `["status", "in", ["Open", "Pending"]]`)
- Range: `between` (e.g., `["posting_date", "between", ["2026-01-01", "2026-12-31"]]`)
- Nullity: `is` (e.g., `["assigned_to", "is", "set"]`, `["closing_notes", "is", "not set"]`)

#### JavaScript Examples

```javascript
// Pattern 1: Complex filtered list query with frappe.call
frappe.call({
    method: "frappe.client.get_list",
    args: {
        doctype: "Sales Order",
        fields: ["name", "customer", "grand_total", "delivery_date", "status"],
        filters: [
            ["status", "in", ["To Deliver and Bill", "To Bill"]],
            ["grand_total", ">", 5000],
            ["delivery_date", "<=", frappe.datetime.add_days(frappe.datetime.get_today(), 7)]
        ],
        order_by: "delivery_date asc",
        limit_start: 0,
        limit_page_length: 10
    },
    callback(r) {
        if (r.message) {
            console.log("High-priority upcoming deliveries:", r.message);
        }
    }
});

// Pattern 2: Using frappe.db.get_list with async/await
async function getOverdueTasks(project) {
    const today = frappe.datetime.get_today();
    
    const tasks = await frappe.db.get_list("Task", {
        fields: ["name", "subject", "exp_end_date", "allocated_to"],
        filters: [
            ["project", "=", project],
            ["status", "!=", "Completed"],
            ["exp_end_date", "<", today]
        ],
        order_by: "exp_end_date asc",
        limit: 25
    });
    
    return tasks;
}
```

---

### 5. Counting Records (`frappe.client.get_count` & `frappe.db.count`)

Returns the integer count of records matching filter criteria without fetching record rows over the network.

#### Parameter Reference (`frappe.client.get_count`)

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **`doctype`** | `string` | **Yes** | — | DocType name to count. |
| **`filters`** | `object \| array` | No | `{}` | Filter criteria dictionary or array of conditions. |
| **`cache`** | `boolean` | No | `false` | When `true`, caches the count in Redis for subsequent lookups. |

#### JavaScript Examples

```javascript
// Pattern 1: frappe.call
frappe.call({
    method: "frappe.client.get_count",
    args: {
        doctype: "Issue",
        filters: { status: "Open", priority: "Urgent" }
    },
    callback(r) {
        console.log("Urgent Open Issues:", r.message);
    }
});

// Pattern 2: Modern async/await with frappe.db.count
async function showBadgeNotification() {
    const unreadCount = await frappe.db.count("Communication", {
        filters: {
            communication_type: "Communication",
            read_by_recipient: 0
        }
    });
    
    if (unreadCount > 0) {
        frappe.show_alert({
            message: __("You have {0} unread communications.", [unreadCount]),
            indicator: "orange"
        }, 5);
    }
}
```

---

### 6. Updating Records in Database (`frappe.client.set_value` & `frappe.db.set_value`)

`frappe.client.set_value` directly updates one or more fields of an existing document in the database on the server, triggers controller validation hooks, and records the `modified` timestamp.

> [!IMPORTANT] **Single Field vs. Multi-Field Object Update**
> `fieldname` accepts **either a string** (for single field updates paired with `value`) **or a dictionary object** mapping multiple `{ fieldname: value }` pairs. Using an object updates multiple columns in a single atomic server call!

#### Parameter Reference (`frappe.client.set_value`)

| Parameter | Type | Required | Default | Description & Choices |
| :--- | :--- | :---: | :--- | :--- |
| **`doctype`** | `string` | **Yes** | — | Target DocType name (e.g., `"Task"`). |
| **`name`** | `string` | **Yes** | — | Document primary key (e.g., `"TASK-2026-00001"`). |
| **`fieldname`** | `string \| object` | **Yes** | — | Single field name string (`"status"`), **OR** an object of multiple fields `{ status: "Closed", closing_notes: "Done" }`. |
| **`value`** | `any` | **Conditional** | `null` | Value to set when `fieldname` is a string. Not required if `fieldname` is passed as an object. |

#### Return Value
Returns the updated document representation dictionary in `r.message`.

#### JavaScript Examples

```javascript
// Example 1: Updating a Single Field via frappe.call
frappe.call({
    method: "frappe.client.set_value",
    args: {
        doctype: "Task",
        name: "TASK-2026-00001",
        fieldname: "status",
        value: "Completed"
    },
    callback(r) {
        if (r.message) {
            frappe.show_alert({
                message: __("Task #{0} marked as Completed", [r.message.name]),
                indicator: "green"
            });
        }
    }
});

// Example 2: Updating MULTIPLE Fields at Once via Dictionary Object
async function resolveIssue(issueName, notes) {
    const updatedDoc = await frappe.xcall("frappe.client.set_value", {
        doctype: "Issue",
        name: issueName,
        fieldname: {
            status: "Closed",
            resolution_details: notes,
            resolved_by: frappe.session.user,
            resolution_date: frappe.datetime.now_datetime()
        }
    });

    console.log("Updated Issue Doc:", updatedDoc);
    
    // Concurrency Safety: If the updated document is currently open on user's desk, reload it!
    if (cur_frm && cur_frm.docname === issueName) {
        cur_frm.reload_doc();
    }
}

// Example 3: Using frappe.db.set_value
frappe.ui.form.on("Project", {
    refresh(frm) {
        frm.add_custom_button(__("Hold Project"), async () => {
            await frappe.db.set_value("Project", frm.doc.name, "status", "On Hold");
            frm.reload_doc();
            frappe.show_alert({ message: __("Project placed on hold"), indicator: "orange" });
        });
    }
});
```

#### Real-World Case Study: Updating Linked Balances (e.g., Loan Repayment -> Loan)

A frequent source of bugs occurs when developers fetch data using `get_value` and update the resulting dictionary/object in memory without calling a persistence method.

> [!WARNING] **The "In-Memory Mutation" Anti-Pattern**
> ```python
> # ❌ ANTI-PATTERN: This modifies ONLY the local in-memory dict in RAM!
> # MariaDB / Postgres receives NO update, and changes are silently discarded upon exit.
> loan = frappe.get_value("Loan", self.against_loan, ["total_amount_paid", "total_principal_paid"], as_dict=1)
> loan.update({
>     "total_amount_paid": loan.total_amount_paid + self.amount_paid,
>     "total_principal_paid": loan.total_principal_paid + self.principal_amount_paid,
> })
> # Nothing was saved to the database!
> ```

##### Proper Solution in JavaScript (Client-Side)

When processing a payment or repayment from a Desk Client Script and updating the linked document:

```javascript
// ✅ Method A: Direct Multi-Field Database Update (Fast & Atomic)
async function updateLinkedLoanBalance(againstLoan, amountPaid, principalPaid) {
    // 1. Fetch current balances from server
    const loan = await frappe.xcall("frappe.client.get_value", {
        doctype: "Loan",
        filters: againstLoan,
        fieldname: ["total_amount_paid", "total_principal_paid"]
    });

    if (!loan) return;

    // 2. Compute new totals
    const newTotalPaid = flt(loan.total_amount_paid) + flt(amountPaid);
    const newPrincipalPaid = flt(loan.total_principal_paid) + flt(principalPaid);

    // 3. PERSIST to database using frappe.client.set_value with an object payload
    await frappe.xcall("frappe.client.set_value", {
        doctype: "Loan",
        name: againstLoan,
        fieldname: {
            total_amount_paid: newTotalPaid,
            total_principal_paid: newPrincipalPaid
        }
    });

    frappe.show_alert({
        message: __("Loan #{0} balances updated successfully!", [againstLoan]),
        indicator: "green"
    });
}

// ✅ Method B: Full Doc Mutation & Save (Best when Loan triggers lifecycle hooks/recalculations)
async function updateAndRecalculateLoan(againstLoan, amountPaid, principalPaid) {
    // 1. Fetch complete Loan document
    const loanDoc = await frappe.xcall("frappe.client.get", {
        doctype: "Loan",
        name: againstLoan
    });

    // 2. Mutate document properties
    loanDoc.total_amount_paid = flt(loanDoc.total_amount_paid) + flt(amountPaid);
    loanDoc.total_principal_paid = flt(loanDoc.total_principal_paid) + flt(principalPaid);

    // 3. PERSIST back to database using frappe.client.save
    const savedLoan = await frappe.xcall("frappe.client.save", {
        doc: loanDoc
    });

    console.log("Recalculated Loan:", savedLoan);
}
```

##### Proper Solution in Python (Server-Side Controller)

If executing within a Python controller method (`def update_paid_amount(self):`):

```python
# ✅ Option 1: Direct SQL-level update via frappe.db.set_value (Recommended for fast updates)
def update_paid_amount(self):
    loan = frappe.get_value(
        "Loan",
        self.against_loan,
        ["total_amount_paid", "total_principal_paid"],
        as_dict=1,
    )
    if loan:
        frappe.db.set_value(
            "Loan",
            self.against_loan,
            {
                "total_amount_paid": flt(loan.total_amount_paid) + flt(self.amount_paid),
                "total_principal_paid": flt(loan.total_principal_paid) + flt(self.principal_amount_paid),
            }
        )

# ✅ Option 2: Full Document Lifecycle (Recommended if Loan has validation / status updates)
def update_paid_amount(self):
    loan = frappe.get_doc("Loan", self.against_loan)
    loan.total_amount_paid = flt(loan.total_amount_paid) + flt(self.amount_paid)
    loan.total_principal_paid = flt(loan.total_principal_paid) + flt(self.principal_amount_paid)
    
    # Auto-update loan status if fully paid
    if loan.total_amount_paid >= loan.total_payment:
        loan.status = "Loan Closed"
        
    loan.save(ignore_permissions=True)

# ✅ Option 3: Concurrency-Safe Atomic SQL Increment (Zero race conditions)
def update_paid_amount(self):
    frappe.db.sql("""
        UPDATE `tabLoan`
        SET total_amount_paid = total_amount_paid + %(paid)s,
            total_principal_paid = total_principal_paid + %(principal)s
        WHERE name = %(loan)s
    """, {
        "paid": flt(self.amount_paid),
        "principal": flt(self.principal_amount_paid),
        "loan": self.against_loan,
    })
```

---

### 7. Inserting New Records (`frappe.client.insert` & `frappe.db.insert`)

`insert` creates and validates a brand-new document directly in the database. It triggers document naming (`autoname`), controller validation hooks (`before_insert`, `validate`, `after_insert`), and child table insertions.

#### Parameter Reference (`frappe.client.insert`)

| Parameter | Type | Required | Default | Description & Structure |
| :--- | :--- | :---: | :--- | :--- |
| **`doc`** | `object` | **Yes** | — | Document object containing:<br>• `doctype` (`string`, required)<br>• Field values (`subject`, `customer`, `status`, etc.)<br>• Child table arrays (e.g. `items: [{ item_code: "...", qty: 2 }]`). |

#### Return Value
Returns the complete newly inserted document object with its generated `name` (primary key), `owner`, and `creation` timestamps.

#### JavaScript Examples

```javascript
// Example 1: Inserting Document with Child Table Rows via frappe.call
frappe.call({
    method: "frappe.client.insert",
    args: {
        doc: {
            doctype: "Quotation",
            party_name: "CUST-00001",
            order_type: "Sales",
            transaction_date: frappe.datetime.get_today(),
            items: [
                {
                    item_code: "LAPTOP-PRO-16",
                    qty: 2,
                    rate: 1800
                },
                {
                    item_code: "WIRELESS-MOUSE",
                    qty: 2,
                    rate: 45
                }
            ]
        }
    },
    callback(r) {
        if (!r.exc && r.message) {
            let quotation = r.message;
            frappe.show_alert({
                message: __("Quotation {0} generated successfully!", [quotation.name]),
                indicator: "green"
            }, 5);
            
            // Navigate Desk viewport to the new document
            frappe.set_route("Form", "Quotation", quotation.name);
        }
    }
});

// Example 2: Using frappe.db.insert with modern async/await
async function createQuickTask(taskSubject, projectId) {
    try {
        const newTask = await frappe.db.insert({
            doctype: "Task",
            subject: taskSubject,
            project: projectId,
            priority: "Medium",
            status: "Open",
            exp_end_date: frappe.datetime.add_days(frappe.datetime.get_today(), 3)
        });
        
        console.log("Created Task ID:", newTask.name);
        return newTask;
    } catch (error) {
        frappe.msgprint(__("Failed to create task: {0}", [error.message]));
    }
}
```

---

### 8. Saving Modified Document Objects (`frappe.client.save`)

`frappe.client.save` takes an existing document dictionary (which was previously fetched, modified in JavaScript, or contains mutated child rows) and writes it back to the database, executing `validate`, `before_save`, and `on_update` hooks.

#### Parameter Reference (`frappe.client.save`)

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **`doc`** | `object` | **Yes** | — | Document object with modified fields. Must include valid `doctype` and `name`. |

#### JavaScript Example

```javascript
async function appendItemAndSaveOrder(orderName) {
    // 1. Fetch full existing document
    const orderDoc = await frappe.xcall("frappe.client.get", {
        doctype: "Sales Order",
        name: orderName
    });

    // 2. Modify parent properties
    orderDoc.remarks = "Updated via automated replenishment script";

    // 3. Append a new child table row
    if (!orderDoc.items) orderDoc.items = [];
    orderDoc.items.push({
        doctype: "Sales Order Item",
        item_code: "WARRANTY-1YR",
        qty: 1,
        rate: 150
    });

    // 4. Save modified document object back to database
    const savedOrder = await frappe.xcall("frappe.client.save", {
        doc: orderDoc
    });

    frappe.show_alert({
        message: __("Sales Order {0} updated and recalculated.", [savedOrder.name]),
        indicator: "green"
    });
}
```

---

### 9. Deleting Records (`frappe.client.delete` & `frappe.db.delete_doc`)

Deletes a record from the database. Frappe automatically checks user delete permissions, verifies foreign key link dependencies (preventing deletion if referenced by submitted records), and executes `before_trash` and `on_trash` controller hooks.

#### Parameter Reference (`frappe.client.delete`)

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **`doctype`** | `string` | **Yes** | — | Target DocType name (e.g., `"Note"`, `"ToDo"`). |
| **`name`** | `string` | **Yes** | — | Primary key / document name to delete. |

#### Return Value
Returns `"ok"` on successful deletion.

#### JavaScript Examples

```javascript
// Example 1: frappe.call with confirmation prompt
frappe.confirm(__("Are you sure you want to permanently delete this note?"), () => {
    frappe.call({
        method: "frappe.client.delete",
        args: {
            doctype: "Note",
            name: "NOTE-2026-00014"
        },
        callback(r) {
            frappe.show_alert({ message: __("Note deleted successfully"), indicator: "green" });
        }
    });
});

// Example 2: Using frappe.db.delete_doc with async/await
async function removeDraftToDo(todoName) {
    await frappe.db.delete_doc("ToDo", todoName);
    frappe.show_alert({ message: __("ToDo removed"), indicator: "blue" });
}
```

---

### 10. Renaming Documents (`frappe.client.rename_doc`)

Renames the primary key (`name`) of a document. Frappe cascades the rename across all foreign key Link fields throughout the entire database.

#### Parameter Reference (`frappe.client.rename_doc`)

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| **`doctype`** | `string` | **Yes** | — | Target DocType name. |
| **`old_name`** | `string` | **Yes** | — | Current primary key name (e.g., `"CUST-OLD-001"`). |
| **`new_name`** | `string` | **Yes** | — | Desired new primary key name (e.g., `"CUST-2026-001"`). |
| **`merge`** | `boolean` | No | `false` | If `true` and `new_name` already exists, merges `old_name` into `new_name` and deletes `old_name`. |

#### JavaScript Example

```javascript
async function renameCustomerCode(oldCode, newCode) {
    try {
        const renamedName = await frappe.xcall("frappe.client.rename_doc", {
            doctype: "Customer",
            old_name: oldCode,
            new_name: newCode,
            merge: false
        });
        frappe.msgprint(__("Customer renamed successfully to {0}", [renamedName]));
    } catch (err) {
        frappe.msgprint(__("Could not rename customer: {0}", [err.message]));
    }
}
```

---

### 11. Submitting & Cancelling Documents (`submit` & `cancel`)

For submittable DocTypes (`is_submittable = 1`), state transitions between Draft (`docstatus: 0`), Submitted (`docstatus: 1`), and Cancelled (`docstatus: 2`) are performed via dedicated client endpoints:

```javascript
// 1. Submit a Draft Document (sets docstatus = 1)
const submittedDoc = await frappe.xcall("frappe.client.submit", {
    doc: frm.doc
});

// 2. Cancel a Submitted Document (sets docstatus = 2)
await frappe.xcall("frappe.client.cancel", {
    doctype: "Sales Invoice",
    name: "ACC-SINV-2026-00045"
});
```

---

### 12. Decision Matrix: When to Use Which Method

Choosing the right client-side API depends on whether you are interacting with the **currently active form on screen** or performing **direct database operations**:

| Capability / Behavior | `frm.set_value()` | `frappe.client.set_value()` / `frappe.db.set_value()` | `frappe.model.set_value()` |
| :--- | :--- | :--- | :--- |
| **Target Document** | Current open form document | Any record in the database | Document or Child row in local memory (`locals`) |
| **Persistence Layer** | In-Memory form buffer (`locals`) | Direct MariaDB/Postgres write | In-Memory client cache (`locals`) |
| **Marks Form Dirty?** | ✅ Yes (displays asterisk/orange dot) | ❌ No (bypasses active form buffer) | ✅ Yes |
| **Triggers Client Event Scripts?** | ✅ Yes (triggers field change handlers) | ❌ No (bypasses browser form scripts) | ✅ Yes |
| **Runs Server Controllers?** | ❌ No (runs only when Saved) | ✅ Yes (`validate`, `before_save`, `on_update`) | ❌ No (runs only when Saved) |
| **Ideal Scenario** | User editing fields on the active form view | Background record updates, updating OTHER doctypes, toolbar actions | Child table row calculations within client scripts |

> [!CAUTION] **Avoiding Concurrency Conflicts**
> If you execute `frappe.client.set_value` or `frappe.db.set_value` on the **document currently being edited** by a user in the form view, the database `modified` timestamp will advance. When the user later clicks the standard **Save** button, Frappe will reject the save with a **TimestampMismatchError** (*"Document has been modified after you opened it"*).
> **Rule of thumb**: To modify the active form, use `frm.set_value()`. If you must update via server RPC, immediately call `frm.reload_doc()`.

---

### 13. Master Parameters Quick Reference (`frappe.client.*`)

| Method Name | Key Parameters & Signature | Return Type | Description & Purpose |
| :--- | :--- | :--- | :--- |
| **`frappe.client.get`** | `(doctype, name, filters, parent)` | `object` | Fetches complete document with all parent fields and child table arrays. |
| **`frappe.client.get_value`** | `(doctype, fieldname, filters, as_dict, debug, parent)` | `object \| any` | Fetches one or multiple specific field values without entire document overhead. |
| **`frappe.client.get_single_value`** | `(doctype, field)` | `any` | Reads a single configuration setting from a Single DocType. |
| **`frappe.client.get_list`** | `(doctype, fields, filters, or_filters, order_by, limit_start, limit_page_length, group_by)` | `array of objects` | Performs filtered, sorted, paginated database queries. |
| **`frappe.client.get_count`** | `(doctype, filters, cache, debug)` | `integer` | Returns total number of matching records in database. |
| **`frappe.client.set_value`** | `(doctype, name, fieldname, value)` | `object` | Updates a single field or multiple fields (via object dictionary) directly in DB. |
| **`frappe.client.insert`** | `(doc)` | `object` | Instantiates, validates, and persists a brand-new document with child rows. |
| **`frappe.client.save`** | `(doc)` | `object` | Validates and persists an existing mutated document object. |
| **`frappe.client.delete`** | `(doctype, name)` | `"ok"` | Deletes record after checking user permissions and foreign key links. |
| **`frappe.client.rename_doc`** | `(doctype, old_name, new_name, merge)` | `string` | Renames primary key and cascades references throughout all Link fields. |
| **`frappe.client.submit`** | `(doc)` | `object` | Transitions submittable document from Draft (`0`) to Submitted (`1`). |
| **`frappe.client.cancel`** | `(doctype, name)` | `object` | Cancels submitted document (`docstatus: 2`). |

---

<span id="8-ui-dialogs-user-prompting-apis"></span>
## 9. UI Dialogs & User Prompting APIs

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

## 10. Creating & Mapping Documents from Client Script (Doc Fields & Child Tables)

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

## 11. Complete Client JavaScript API & Utility Reference Matrix

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



