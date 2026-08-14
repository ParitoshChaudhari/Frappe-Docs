---
title: Desk Views, Customization & Dynamic Scripting in Frappe v15
description: Master Frappe Desk view overrides (doctype_list.js, doctype_tree.js, doctype_calendar.js, Kanban, Gantt) and upgrade-safe in-app customizations (Custom Field, Property Setter, Server Script, Client Script).
version: v15
category: Client-Side JavaScript APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge client">Client Only</span> <span class="badge stable">Stable</span> Desk Views & In-App Customization

Frappe Framework v15 provides rich view customizers (`doctype_list.js`, `doctype_tree.js`, `doctype_calendar.js`) and no-code/low-code customization tools (`Custom Field`, `Property Setter`, `Server Script`, `Client Script`) to tailor the Desk experience without modifying core source code.

---

## 1. List View Customization (`doctype_list.js`)

List views can be customized by adding a `doctype_list.js` file in your DocType directory or pointing to it in `hooks.py` via `doctype_list_js`.

```javascript
frappe.listview_settings['Task'] = {
    // 1. Column indicators based on record status
    get_indicator(doc) {
        if (doc.status === "Open") {
            return [__("Open"), "orange", "status,=,Open"];
        } else if (doc.status === "Completed") {
            return [__("Completed"), "green", "status,=,Completed"];
        } else if (doc.status === "Overdue") {
            return [__("Overdue"), "red", "status,=,Overdue"];
        }
    },

    // 2. Custom primary action button override
    primary_action(listview) {
        frappe.msgprint(__("Custom New Task Wizard Launched"));
    },

    // 3. Custom field column formatter
    formatters: {
        priority(val) {
            if (val === "High") {
                return `<span class="badge badge-danger">${val}</span>`;
            }
            return val;
        }
    },

    // 4. Onload listview event trigger
    onload(listview) {
        // Add custom menu action in List View toolbar
        listview.page.add_inner_button(__("Bulk Close Tasks"), () => {
            let checked_items = listview.get_checked_items();
            frappe.show_alert({
                message: __("Selected {0} items for bulk close", [checked_items.length]),
                indicator: "blue"
            });
        });
    }
};
```

---

## 2. Tree View Customization (`doctype_tree.js`)

Tree Views render hierarchical DocTypes (such as Chart of Accounts or Territory).

```javascript
frappe.treeview_settings['Territory'] = {
    title: __("Territory Tree"),
    get_tree_nodes: "my_custom_app.api.get_territory_children",
    add_tree_node: "my_custom_app.api.add_territory_node",
    filters: [
        {
            fieldname: "company",
            fieldtype: "Link",
            options: "Company",
            label: __("Company")
        }
    ],
    breadcrumb: "Accounts",
    get_tree_root: false
};
```

---

## 3. Calendar View Customization (`doctype_calendar.js`)

Calendar Views render event-driven DocTypes on a FullCalendar view.

```javascript
frappe.views.calendar["Task"] = {
    field_map: {
        "start": "exp_start_date",
        "end": "exp_end_date",
        "id": "name",
        "title": "subject",
        "allDay": "all_day",
        "status": "status"
    },
    gantt: True,
    get_events_method: "frappe.desk.doctype.event.event.get_events"
};
```

---

## 4. In-App Dynamic Customizations

Frappe supports non-destructive customization directly via Desk forms without modifying source repository files.

### 1. Custom Field DocType
Adds custom database fields to standard or custom DocTypes. Custom Fields persist across framework upgrades.

### 2. Property Setter DocType
Overrides DocField properties (`reqd`, `read_only`, `hidden`, `label`, `options`, `default`) on standard DocTypes safely across version upgrades.

### 3. Client Script DocType
Injects client-side JavaScript handlers into Desk forms dynamically through the UI.

#### Example Client Script (`Task`)

```javascript
frappe.ui.form.on('Task', {
    refresh(frm) {
        if (frm.doc.priority === 'High') {
            frm.set_df_property('allocated_to', 'reqd', 1);
        }
    }
});
```

---

### 4. Server Script DocType

Allows writing server-side Python code inside Desk for:
- **Document Events**: `Before Insert`, `Before Save`, `After Save`, `Before Submit`, `Before Trash`.
- **API Endpoints**: Creating custom whitelisted REST endpoints under `/api/method/`.
- **Permission Queries**: Injecting dynamic SQL list view restrictions.

#### Example Server Script (Document Event: `Task` `Before Save`)

```python
# Executed dynamically on Task save
if doc.priority == "High" and not doc.allocated_to:
    frappe.throw("High priority tasks must be allocated to a team member.")
```

---

## Related Topics

- [05. DocTypes & Fields](/05-doctypes/)
- [11. Client API](/11-client-api/)
- [14. Authentication, Session & Roles](/14-authentication-permissions/)
