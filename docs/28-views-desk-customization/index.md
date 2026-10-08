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

## 4. DocType Dashboard Connections (`<doctype>_dashboard.py`)

Every DocType can have a native dashboard section rendered directly at the top of its Form View. This dashboard serves as an interactive hub linking the document to related transactions, child-table connections, and internal references with live badge counters.

### File Structure & Discovery

In your custom app, create a file named `<doctype>_dashboard.py` in the DocType directory alongside your controller:

```
your_app/
└── your_module/
    └── doctype/
        └── project/
            ├── project.json
            ├── project.py
            ├── project.js
            └── project_dashboard.py   <-- DocType Dashboard definition
```

### Complete Specification: `get_data()`

The file must implement a `get_data()` function returning a dictionary configuration:

```python
from frappe import _

def get_data():
    return {
        # 1. Primary link fieldname on related DocTypes pointing back to this DocType
        "fieldname": "project",
        
        # 2. Non-standard link fieldnames where the field is NOT named 'project'
        "non_standard_fieldnames": {
            "Delivery Note": "against_project",
            "Purchase Invoice": "cost_center_project",
            "Journal Entry": "project_name"
        },
        
        # 3. Internal child-table links: Connections where the link exists inside a child table
        "internal_links": {
            "Sales Order": ["items", "project"],       # Sales Order Item table -> 'project' field
            "Purchase Order": ["items", "project"]
        },
        
        # 4. Transactions group matrix: Organizes linked DocTypes into labeled columns
        "transactions": [
            {
                "label": _("Planning & Tasks"),
                "items": ["Task", "Timesheet", "Project Template"]
            },
            {
                "label": _("Procurement & Costs"),
                "items": ["Purchase Order", "Purchase Invoice", "Expense Claim"]
            },
            {
                "label": _("Billing & Sales"),
                "items": ["Sales Order", "Delivery Note", "Sales Invoice"]
            }
        ]
    }
```

### Dynamic Dashboard Hook via `hooks.py`

If you are customizing a **standard DocType** (like `Customer`, `Item`, or `Employee`) without modifying Frappe/ERPNext source code, use the `override_doctype_dashboards` hook in your app's `hooks.py`:

```python
# your_app/hooks.py
override_doctype_dashboards = {
    "Task": "your_app.overrides.dashboard.get_task_dashboard_data"
}
```

And in `your_app/overrides/dashboard.py`:

```python
from frappe import _

def get_task_dashboard_data(data):
    # 'data' contains the existing dashboard config dict
    data["transactions"].append({
        "label": _("Custom Operations"),
        "items": ["Site Inspection", "Quality Check"]
    })
    return data
```

---

## 5. DocType List Sidebar Dashboard View (`Dashboard Chart` & `Number Card`)

In addition to form connections, every DocType in Frappe Desk has a built-in **Dashboard View** accessible from the List View sidebar (List View → Switch View → **Dashboard**).

### 1. Linking `Dashboard Chart` to a DocType

You can build interactive bar, line, pie, or percentage charts linked directly to any DocType:

1. Search for **Dashboard Chart** in awesomebar → Click **Add Dashboard Chart**.
2. Set **Chart Name** (e.g. `Tasks by Priority`).
3. Set **Chart Type**:
   - `Group By`: Aggregates records by field (e.g., DocType: `Task`, Group By: `priority`, Aggregate: `Count`).
   - `Time Series`: Aggregates values over time (e.g., Monthly Sales).
   - `Custom`: Links to a custom Python method returning chart data.
4. Set **Document Type**: `Task`.
5. Under **Filters**, define standard criteria (e.g. `{"status": ["!=", "Cancelled"]}`).

### 2. Linking `Number Card` to a DocType

Number Cards display large standalone KPI metric cards:

1. Search for **Number Card** in awesomebar → Click **Add Number Card**.
2. Set **Document Type**: `Task`.
3. Choose **Function**: `Count`, `Sum`, `Average`, `Minimum`, or `Maximum`.
4. Choose **Aggregate Field**: (e.g. `expected_time`).
5. Set **Filters**: `{"status": "Open"}`.
6. Check **Is Public** to make it available to all authorized users.

---

## 6. In-App Dynamic Customizations

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
