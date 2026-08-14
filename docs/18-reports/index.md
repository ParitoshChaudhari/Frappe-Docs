---
title: Complete Reports Guide in Frappe v15 - Standard, Query, Script, Tree & Charts
description: Exhaustive guide to all Frappe v15 report types - Standard Report Builder, Query Reports, Script Reports, Tree Reports, Grouped Collapsible Reports, Frappe Charts, MultiSelect JS filters, Cell Formatters, Indicators, and Prepared Reports.
version: v15
category: Web, Analytics & Integrations
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Complete Guide to Reports in Frappe v15

Frappe Framework v15 features a comprehensive reporting framework supporting everything from simple Desk list filters to complex SQL queries, multi-dataset analytical charts, KPI summary cards, and **hierarchical Tree reports**.

---

## 1. Frappe v15 Report Classifications

```
                               FRAPPE REPORT ENGINE
                                         │
     ┌───────────────────┬───────────────┼───────────────┬───────────────────┐
     ▼                   ▼               ▼               ▼                   ▼
1. Standard Report   2. Query Report  3. Script Report 4. Tree Report   5. Prepared Report
(No Code Builder)    (SQL Query)      (Python + JS)    (Hierarchical)   (Background RQ Queue)
```

| Report Type | Tech Stack | Best Used For | Custom Code Needed? |
| :--- | :--- | :--- | :--- |
| **Standard Report (Report Builder)** | Desk UI Filter Builder | Simple list views, column selection, quick exports | ❌ No Code |
| **Query Report** | SQL (`.sql` file) | Medium complexity relational aggregations & JOINs | ⚠️ SQL Only |
| **Script Report** | Python (`.py`) & JS (`.js`) | Complex business logic, dynamic columns, charts, KPI cards | ✅ Python + JS |
| **Tree Report** | Python + JS (`is_tree: true`) | Financial statements, chart of accounts, nested category trees | ✅ Python + JS |
| **Prepared Report** | Background RQ Worker | Heavy analytics queries exceeding HTTP request timeouts | ✅ Python + Desk |

---

## 2. Standard Reports (Report Builder)

Standard Reports (Report Builder) enable users and administrators to build custom tabular views directly from Desk without writing code.

### Core Features
- **Dynamic Column Selection**: Add, remove, or re-order columns from DocType fields.
- **Multi-Field Filter Builder**: Apply filter operators (`equals`, `not equals`, `like`, `between`, `in`, `is set`).
- **Group By Aggregations**: Group data by columns and apply `Count`, `Sum`, `Average`, `Min`, `Max` aggregations.
- **Custom Report Saving**: Save preset views with custom permissions for specific user roles.

---

## 3. Query Reports (SQL-Based)

Query Reports execute SQL queries directly against MariaDB or PostgreSQL.

### File Structure
```text
my_custom_app/
└── my_module/
    └── report/
        └── monthly_sales_summary/
            ├── monthly_sales_summary.json
            └── monthly_sales_summary.sql
```

### SQL Implementation (`monthly_sales_summary.sql`)

Use SQL column alias formatting `Field Name:Field Type/Options:Width` to define column headers dynamically:

```sql
SELECT
    si.customer AS "Customer:Link/Customer:180",
    si.territory AS "Territory:Link/Territory:120",
    COUNT(si.name) AS "Invoice Count:Int:100",
    SUM(si.net_total) AS "Net Amount:Currency:140",
    SUM(si.grand_total) AS "Grand Total:Currency:140"
FROM
    `tabSales Invoice` si
WHERE
    si.docstatus = 1
    AND si.posting_date BETWEEN %(from_date)s AND %(to_date)s
GROUP BY
    si.customer, si.territory
ORDER BY
    SUM(si.grand_total) DESC
```

> [!IMPORTANT]
> User filter inputs are passed as dictionary parameters using `%(filter_fieldname)s` placeholders to guarantee SQL parameter binding.

---

## 4. Script Reports (Python + JS)

Script Reports provide maximum flexibility, enabling custom Python data transformations, dynamic column definitions, chart payloads, summary cards, and client-side formatters.

### File Structure
```text
my_custom_app/
└── my_module/
    └── report/
        └── task_analytics/
            ├── task_analytics.json
            ├── task_analytics.py
            └── task_analytics.js
```

---

### Python Server Script (`task_analytics.py`)

The Python file must implement an `execute(filters=None)` function returning a 5-element tuple: `(columns, data, message, chart, summary)`.

```python
import frappe
from frappe import _

def execute(filters=None):
    if not filters:
        filters = {}

    columns = get_columns()
    data = get_data(filters)
    chart = get_chart_data(data)
    summary = get_report_summary(data)

    return columns, data, None, chart, summary


def get_columns():
    """Defines report table column metadata."""
    return [
        {
            "label": _("Project"),
            "fieldname": "project",
            "fieldtype": "Link",
            "options": "Project",
            "width": 180
        },
        {
            "label": _("Total Tasks"),
            "fieldname": "total_tasks",
            "fieldtype": "Int",
            "width": 110
        },
        {
            "label": _("Open Tasks"),
            "fieldname": "open_tasks",
            "fieldtype": "Int",
            "width": 110
        },
        {
            "label": _("Completed Tasks"),
            "fieldname": "completed_tasks",
            "fieldtype": "Int",
            "width": 130
        },
        {
            "label": _("Completion %"),
            "fieldname": "completion_rate",
            "fieldtype": "Percent",
            "width": 120
        }
    ]


def get_data(filters):
    """Queries and formats report rows."""
    conditions = []
    
    # Handle MultiSelect filter array/string parameter
    if filters.get("projects"):
        projects = filters.get("projects")
        if isinstance(projects, str):
            projects = [p.strip() for p in projects.split(",") if p.strip()]
        conditions.append("t.project IN %(projects)s")
        filters["projects"] = tuple(projects)

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    raw_data = frappe.db.sql(f"""
        SELECT
            t.project,
            COUNT(t.name) as total_tasks,
            SUM(CASE WHEN t.status = 'Open' THEN 1 ELSE 0 END) as open_tasks,
            SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks
        FROM `tabTask` t
        {where_clause}
        GROUP BY t.project
    """, filters, as_dict=True)

    for row in raw_data:
        total = row.get("total_tasks") or 0
        completed = row.get("completed_tasks") or 0
        row["completion_rate"] = (completed / total * 100.0) if total > 0 else 0.0

    return raw_data


def get_chart_data(data):
    """Generates Frappe Charts JSON payload."""
    labels = [row["project"] for row in data if row.get("project")]
    open_counts = [row["open_tasks"] for row in data if row.get("project")]
    completed_counts = [row["completed_tasks"] for row in data if row.get("project")]

    return {
        "data": {
            "labels": labels,
            "datasets": [
                {"name": _("Open Tasks"), "values": open_counts},
                {"name": _("Completed Tasks"), "values": completed_counts}
            ]
        },
        "type": "bar",  # bar, line, pie, donut, percentage
        "colors": ["#ffa300", "#28a745"]
    }


def get_report_summary(data):
    """Generates KPI Summary Card widgets displayed at top of report."""
    total_projects = len(data)
    total_open = sum(row.get("open_tasks", 0) for row in data)
    total_completed = sum(row.get("completed_tasks", 0) for row in data)

    return [
        {
            "value": total_projects,
            "label": _("Active Projects"),
            "datatype": "Int",
            "indicator": "Blue"
        },
        {
            "value": total_open,
            "label": _("Pending Tasks"),
            "datatype": "Int",
            "indicator": "Orange"
        },
        {
            "value": total_completed,
            "label": _("Finished Tasks"),
            "datatype": "Int",
            "indicator": "Green"
        }
    ]
```

---

## 5. Tree Reports (Hierarchical Parent-Child Reports)

Tree Reports render parent-child hierarchical data structures (e.g. Chart of Accounts, Financial Balance Sheet, Nested Item Categories) with expandable/collapsible tree rows.

### Python Server Script (`financial_tree_report.py`)

```python
import frappe
from frappe import _

def execute(filters=None):
    columns = [
        {"label": _("Account Name"), "fieldname": "account", "fieldtype": "Link", "options": "Account", "width": 250},
        {"label": _("Account Number"), "fieldname": "account_number", "fieldtype": "Data", "width": 120},
        {"label": _("Balance"), "fieldname": "balance", "fieldtype": "Currency", "width": 150}
    ]

    data = get_tree_data()
    return columns, data


def get_tree_data():
    """Builds nested parent-child tree data dictionary."""
    accounts = frappe.get_all(
        "Account",
        fields=["name as account", "account_number", "parent_account", "is_group"],
        order_by="name asc"
    )

    for row in accounts:
        # Assign tree indicators
        row["indent"] = 0 if not row.get("parent_account") else 1
        row["balance"] = 5000.00 if not row.get("is_group") else 0.00
        
        # Mark parent field for Frappe Tree Grid rendering
        row["parent_account"] = row.get("parent_account")

    return accounts
```

### JavaScript Client Controller (`financial_tree_report.js`)

To enable tree grid collapsing in Desk, specify `tree: true`, `parent_field`, and `initial_depth`:

```javascript
frappe.query_reports["Financial Tree Report"] = {
    tree: true,
    parent_field: "parent_account",
    initial_depth: 2,
    
    filters: [
        {
            fieldname: "company",
            label: __("Company"),
            fieldtype: "Link",
            options: "Company",
            default: frappe.defaults.get_user_default("Company"),
            reqd: 1
        }
    ]
};
```

---

## 6. Advanced JS Report Scripting: MultiSelect, Formatters & Indicators

### MultiSelect Filters & Dynamic Filter Triggers

```javascript
frappe.query_reports["Task Analytics"] = {
    filters: [
        {
            fieldname: "company",
            label: __("Company"),
            fieldtype: "Link",
            options: "Company",
            default: frappe.defaults.get_user_default("Company"),
            reqd: 1,
            // Dynamic trigger: Changing Company resets Project MultiSelect options!
            on_change() {
                let company = frappe.query_report.get_filter_value("company");
                frappe.query_report.set_filter_value("projects", []);
            }
        },
        {
            fieldname: "projects",
            label: __("Select Projects"),
            fieldtype: "MultiSelect",
            get_data(txt) {
                let company = frappe.query_report.get_filter_value("company");
                return frappe.db.get_link_options("Project", txt, { company: company });
            }
        }
    ],

    // Custom Cell Formatter with Status Indicators
    formatter(value, row, column, data, default_formatter) {
        value = default_formatter(value, row, column, data);

        if (column.fieldname === "completion_rate") {
            if (data.completion_rate < 50.0) {
                value = `<span class="indicator-pill red">${value}</span>`;
            } else if (data.completion_rate < 80.0) {
                value = `<span class="indicator-pill orange">${value}</span>`;
            } else {
                value = `<span class="indicator-pill green">${value}</span>`;
            }
        }
        return value;
    }
};
```

---

## 7. Prepared Reports (Background Execution)

For heavy analytical reports processing millions of rows, enable **Prepared Report** in `report.json`:

```json
{
  "prepared_report": 1
}
```

- When enabled, executing the report enqueues a background job in Redis RQ (`long` queue).
- A notification alerts the user when execution completes, allowing instant download of CSV/Excel files without timing out HTTP web requests.

---

## Related Topics

- [09. Server API](/09-server-api/)
- [10. Database & Query Builder](/10-database/)
- [17. Web Pages, Jinja & Print Formats](/17-web-jinja-print-reports/)
- [22. Cookbook & Recipes](/22-cookbook/)
