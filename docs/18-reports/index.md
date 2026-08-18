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

### Example: Non-Tree Script Report with Conditional Date Filters & Multi-Table SQL Queries

This complete example demonstrates a flat (non-tree) script report querying data across multiple DocTypes (`Sales Order`, `Sales Invoice`, `Maintenance Schedule Item`, `Maintenance Visit`) with dynamic filter conditions, **conditional date validation (where dates are not set automatically by default, but dynamically required when `To Date` is chosen)**, and secure parameterized SQL queries.

> [!TIP]
> **Conditional Date Filtering Pattern**:
> 1. **Client-Side (`.js`)**: By leaving `default` unset or commented out, the report loads without pre-filling dates. When the user sets `to_date`, the `on_change` trigger dynamically marks `from_date` as required (`from_date_filter.df.reqd = 1`) and calls `from_date_filter.refresh()`, preventing submission without a starting date boundary.
> 2. **Server-Side (`.py`)**: `get_data()` enforces strict validation with `if filters.get("to_date") and not filters.get("from_date"): frappe.throw(...)` before running the SQL query.

#### JavaScript Filter Controller (`maintenance_schedule_report.js`)

```javascript
// Copyright (c) 2026, Bizmap and contributors
// For license information, please see license.txt

frappe.query_reports["Maintenance Schedule Report"] = {
	"filters": [
		{
			"fieldname": "sales_order_id",
			"label": __("Sales Order"),
			"fieldtype": "Link",
			"options": "Sales Order",
		},
		{
			"fieldname": "sales_invoice_id",
			"label": __("Sales Invoice"),
			"fieldtype": "Link",
			"options": "Sales Invoice",
		},
		{
			"fieldname": "customer",
			"label": __("Customer"),
			"fieldtype": "Link",
			"options": "Customer",
		},
		{
			"fieldname": "order_type",
			"label": __("Order Type"),
			"fieldtype": "Select",
			"options": "\nProduct MFG\n Product Traded NM\nProduct Traded NA\nSolutions\nTechnical Services\nSpares\nRental\nAMC\nStock\nFOC\nOSS\nMAS\n",
		},
		{
			"fieldname": "from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			// "default": frappe.datetime.add_months(frappe.datetime.get_today(), -1),
		},
		{
			"fieldname": "to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			// "default": frappe.datetime.get_today(),
			"on_change": function(query_report) {
				let to_date = frappe.query_report.get_filter_value("to_date");
				let from_date_filter = frappe.query_reports.get_filter("from_date");

				if (to_date) {
					from_date_filter.df.reqd = 1;
				} else {
					from_date_filter.df.reqd = 0;
				}
				from_date_filter.refresh();

				// optional: stop auto-refresh of report until from_date is filled
				if (to_date && !frappe.query_report.get_filter_value("from_date")) {
					frappe.throw(__("Please set From Date as well since To Date is set"));
				}
			}
		},
		{
			"fieldname": "maintenance_schedule_id",
			"label": __("Maintenance Schedule"),
			"fieldtype": "Link",
			"options": "Maintenance Schedule",
		},
		{
			"fieldname": "maintenance_visit_id",
			"label": __("Maintenance Visit"),
			"fieldtype": "Link",
			"options": "Maintenance Visit",
		},
	]
};
```

#### Python Server Script (`maintenance_schedule_report.py`)

```python
# Copyright (c) 2026, Bizmap and contributors
# For license information, please see license.txt

import frappe


def execute(filters=None):
	columns = get_columns()
	data = get_data(filters)
	return columns, data


def get_data(filters=None):
	filters = filters or {}

	if filters.get("to_date") and not filters.get("from_date"):
		frappe.throw("Please set 'From Date' when 'To Date' is provided")

	conditions, values = get_conditions(filters)

	data = frappe.db.sql(
		f"""
		SELECT
			so.name                    AS sales_order_id,
			si.name 				   AS sales_invoice_id,
			so.customer                AS customer,
			so.customer_name           AS customer_name,
			so.order_type              AS order_type,
			so.transaction_date        AS transaction_date,
			so.custom_customer_category       AS customer_category,   
			so.status                  AS so_status,

			msi.parent                 AS ms_id,                
			msi.item_code              AS item_code,
			msi.item_name              AS item_name,
			msi.end_date               AS schedule_end_date,
			msi.no_of_visits           AS no_of_visits,

			mv.name                    AS visit_id,
			mv.mntc_date               AS mntc_date,
			mv.custom_primary_engineer AS custom_primary_engineer,  
			mv.completion_status       AS visit_completion_status,
			mv.maintenance_type        AS maintenance_type

		FROM `tabSales Order` so

		LEFT JOIN `tabSales Invoice Item` sii
			ON sii.sales_order = so.name

		LEFT JOIN `tabSales Invoice` si
			ON si.name = sii.parent

		LEFT JOIN `tabMaintenance Schedule Item` msi
			ON msi.sales_order = so.name
			AND msi.parenttype = 'Maintenance Schedule'

		LEFT JOIN `tabMaintenance Visit` mv
			ON mv.maintenance_schedule = msi.parent

		WHERE so.docstatus = 1
		{conditions}
		ORDER BY
			so.transaction_date DESC,
			so.name,
			msi.idx,
			mv.mntc_date
		""",
		values,
		as_dict=True,
	)

	return data


def get_conditions(filters):
	conditions = []
	values = {}

	if filters.get("sales_order_id"):
		conditions.append("so.name = %(sales_order_id)s")
		values["sales_order_id"] = filters["sales_order_id"]

	if filters.get("sales_invoice_id"):
		conditions.append("si.name = %(sales_invoice_id)s")
		values["sales_invoice_id"] = filters["sales_invoice_id"]

	if filters.get("customer"):
		conditions.append("so.customer = %(customer)s")
		values["customer"] = filters["customer"]

	if filters.get("order_type"):
		conditions.append("so.order_type = %(order_type)s")
		values["order_type"] = filters["order_type"]

	if filters.get("from_date"):
		conditions.append("so.transaction_date >= %(from_date)s")
		values["from_date"] = filters["from_date"]

	if filters.get("to_date"):
		conditions.append("so.transaction_date <= %(to_date)s")
		values["to_date"] = filters["to_date"]

	if filters.get("maintenance_schedule_id"):
		conditions.append("msi.parent = %(maintenance_schedule_id)s")
		values["maintenance_schedule_id"] = filters["maintenance_schedule_id"]

	if filters.get("maintenance_visit_id"):
		conditions.append("mv.name = %(maintenance_visit_id)s")
		values["maintenance_visit_id"] = filters["maintenance_visit_id"]

	condition_str = ""
	if conditions:
		condition_str = "AND " + " AND ".join(conditions)

	return condition_str, values


def get_columns():
	return [
		# ---------------- Sales Order ----------------
		{
			"label": "SO ID",
			"fieldname": "sales_order_id",
			"fieldtype": "Link",
			"options": "Sales Order",
			"width": 200,
		},

		# sales invoice ids
		{
			"label": "Sales Invoice ID",
			"fieldname": "sales_invoice_id",
			"fieldtype": "Link",
			"options": "Sales Invoice",
			"width": 200,
		},

		{
			"label": "Customer",
			"fieldname": "customer",
			"fieldtype": "Link",
			"options": "Customer",
			"width": 150,
		},
		{
			"label": "Customer Name",
			"fieldname": "customer_name",
			"fieldtype": "Data",
			"width": 150,
		},
		{
			"label": "Order Type",
			"fieldname": "order_type",
			"fieldtype": "Data",
			"width": 120,
		},
		{
			"label": "Date",
			"fieldname": "transaction_date",
			"fieldtype": "Date",
			"width": 150,
		},
		{
			"label": "Customer Category",
			"fieldname": "customer_category",
			"fieldtype": "Data",
			"width": 130,
		},
		{
			"label": "SO Status",
			"fieldname": "so_status",
			"fieldtype": "Data",
			"width": 120,
		},

		# ---------------- Maintenance Schedule / Item ----------------
		{
			"label": "Maintenance Schedule ID",
			"fieldname": "ms_id",
			"fieldtype": "Link",
			"options": "Maintenance Schedule",
			"width": 200,
		},
		{
			"label": "Item Code",
			"fieldname": "item_code",
			"fieldtype": "Link",
			"options": "Item",
			"width": 130,
		},
		{
			"label": "Item Name",
			"fieldname": "item_name",
			"fieldtype": "Data",
			"width": 150,
		},
		{
			"label": "Schedule End Date",
			"fieldname": "schedule_end_date",
			"fieldtype": "Date",
			"width": 150,
		},
		{
			"label": "No of Visits",
			"fieldname": "no_of_visits",
			"fieldtype": "Int",
			"width": 100,
		},

		# ---------------- Maintenance Visit ----------------
		{
			"label": "Visit ID",
			"fieldname": "visit_id",
			"fieldtype": "Link",
			"options": "Maintenance Visit",
			"width": 200,
		},
		{
			"label": "Visit Date",
			"fieldname": "mntc_date",
			"fieldtype": "Date",
			"width": 150,
		},
		{
			"label": "Primary Engineer",
			"fieldname": "custom_primary_engineer",
			"fieldtype": "Data",
			"width": 150,
		},
		{
			"label": "Visit Completion Status",
			"fieldname": "visit_completion_status",
			"fieldtype": "Data",
			"width": 160,
		},
		{
			"label": "Maintenance Type",
			"fieldname": "maintenance_type",
			"fieldtype": "Data",
			"width": 180,
		},
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

### Example: Multi-Level Collapsible Tree Report from Flat SQL Query

When querying one-to-many joined records (e.g., **Sales Order** $\rightarrow$ **Maintenance Schedule Item** $\rightarrow$ **Maintenance Visit**), you can transform the flat SQL result into an interactive collapsible hierarchy by generating synthetic parent-child tree nodes with explicit `indent` levels.

#### Hierarchy Structure:
- **Level 0 (`indent: 0`)**: Sales Order (`id: SO-<sales_order_id>`, `parent: None`)
- **Level 1 (`indent: 1`)**: Maintenance Schedule Item (`id: MSI-<ms_id>-<item_code>-<seq>`, `parent: SO-<sales_order_id>`)
- **Level 2 (`indent: 2`)**: Maintenance Visit (`id: MV-<visit_id>`, `parent: MSI-...`)

#### Python Server Script (`maintenance_schedule_tree_report.py`)

```python
# Copyright (c) 2026, Bizmap and contributors
# For license information, please see license.txt

import frappe


def execute(filters=None):
	columns = get_columns()
	data = get_data(filters)
	return columns, data


def get_data(filters=None):
	rows = frappe.db.sql(
		"""
		SELECT
			so.name                    AS sales_order_id,
			si.name                    AS sales_invoice_id,
			so.customer                AS customer,
			so.customer_name           AS customer_name,
			so.order_type              AS order_type,
			so.transaction_date        AS transaction_date,
			so.custom_customer_category AS customer_category,
			so.status                  AS so_status,

			msi.parent                 AS ms_id,
			msi.item_code              AS item_code,
			msi.item_name              AS item_name,
			msi.end_date               AS schedule_end_date,
			msi.no_of_visits           AS no_of_visits,

			mv.name                    AS visit_id,
			mv.mntc_date               AS mntc_date,
			mv.custom_primary_engineer AS custom_primary_engineer,
			mv.completion_status       AS visit_completion_status,
			mv.maintenance_type        AS maintenance_type

		FROM `tabSales Order` so

		LEFT JOIN `tabSales Invoice Item` sii ON sii.sales_order = so.name
		LEFT JOIN `tabSales Invoice` si ON si.name = sii.parent

		LEFT JOIN `tabMaintenance Schedule Item` msi
			ON msi.sales_order = so.name
			AND msi.parenttype = 'Maintenance Schedule'

		LEFT JOIN `tabMaintenance Visit` mv
			ON mv.maintenance_schedule = msi.parent

		WHERE so.docstatus = 1
		ORDER BY
			so.transaction_date DESC,
			so.name,
			msi.idx,
			mv.mntc_date
		""",
		as_dict=True,
	)

	return build_tree(rows)


def build_tree(rows):
	"""
	Turns the flat SQL result into a parent/child tree the Report
	Builder can collapse:
		Level 0 -> Sales Order
		Level 1 -> Maintenance Schedule Item
		Level 2 -> Maintenance Visit
	Uses synthetic unique ids since ms_id/visit_id can repeat or be null.
	"""
	tree = []
	so_seen = {}
	msi_seen = {}

	for r in rows:
		so_key = r.sales_order_id

		# ---- Level 0: Sales Order (parent row) ----
		if so_key not in so_seen:
			so_row = {
				"id": f"SO-{so_key}",
				"parent": None,
				"indent": 0,
				"sales_order_id": r.sales_order_id,
				"sales_invoice_id": r.sales_invoice_id,
				"customer": r.customer,
				"customer_name": r.customer_name,
				"order_type": r.order_type,
				"transaction_date": r.transaction_date,
				"customer_category": r.customer_category,
				"so_status": r.so_status,
			}
			tree.append(so_row)
			so_seen[so_key] = so_row["id"]

		so_id = so_seen[so_key]

		# skip creating child levels if there is no schedule item at all
		if not r.ms_id:
			continue

		msi_key = (so_key, r.ms_id, r.item_code)

		# ---- Level 1: Maintenance Schedule Item ----
		if msi_key not in msi_seen:
			msi_id = f"MSI-{r.ms_id}-{r.item_code}-{len(msi_seen)}"
			msi_row = {
				"id": msi_id,
				"parent": so_id,
				"indent": 1,
				"ms_id": r.ms_id,
				"item_code": r.item_code,
				"item_name": r.item_name,
				"schedule_end_date": r.schedule_end_date,
				"no_of_visits": r.no_of_visits,
			}
			tree.append(msi_row)
			msi_seen[msi_key] = msi_id

		msi_id = msi_seen[msi_key]

		# skip visit level if there's no visit
		if not r.visit_id:
			continue

		# ---- Level 2: Maintenance Visit ----
		visit_row = {
			"id": f"MV-{r.visit_id}",
			"parent": msi_id,
			"indent": 2,
			"visit_id": r.visit_id,
			"mntc_date": r.mntc_date,
			"custom_primary_engineer": r.custom_primary_engineer,
			"visit_completion_status": r.visit_completion_status,
			"maintenance_type": r.maintenance_type,
		}
		tree.append(visit_row)

	return tree


def get_columns():
	return [
		# ---------------- Sales Order ----------------
		{"label": "SO ID", "fieldname": "sales_order_id", "fieldtype": "Link", "options": "Sales Order", "width": 200},
		{"label": "Sales Invoice ID", "fieldname": "sales_invoice_id", "fieldtype": "Link", "options": "Sales Invoice", "width": 150},
		{"label": "Customer", "fieldname": "customer", "fieldtype": "Link", "options": "Customer", "width": 150},
		{"label": "Customer Name", "fieldname": "customer_name", "fieldtype": "Data", "width": 150},
		{"label": "Order Type", "fieldname": "order_type", "fieldtype": "Data", "width": 120},
		{"label": "Date", "fieldname": "transaction_date", "fieldtype": "Date", "width": 100},
		{"label": "Customer Category", "fieldname": "customer_category", "fieldtype": "Data", "width": 130},
		{"label": "SO Status", "fieldname": "so_status", "fieldtype": "Data", "width": 120},

		# ---------------- Maintenance Schedule / Item ----------------
		{"label": "Maintenance Schedule ID", "fieldname": "ms_id", "fieldtype": "Link", "options": "Maintenance Schedule", "width": 170},
		{"label": "Item Code", "fieldname": "item_code", "fieldtype": "Link", "options": "Item", "width": 130},
		{"label": "Item Name", "fieldname": "item_name", "fieldtype": "Data", "width": 150},
		{"label": "Schedule End Date", "fieldname": "schedule_end_date", "fieldtype": "Date", "width": 130},
		{"label": "No of Visits", "fieldname": "no_of_visits", "fieldtype": "Int", "width": 100},

		# ---------------- Maintenance Visit ----------------
		{"label": "Visit ID", "fieldname": "visit_id", "fieldtype": "Link", "options": "Maintenance Visit", "width": 150},
		{"label": "Visit Date", "fieldname": "mntc_date", "fieldtype": "Date", "width": 100},
		{"label": "Primary Engineer", "fieldname": "custom_primary_engineer", "fieldtype": "Data", "width": 150},
		{"label": "Visit Completion Status", "fieldname": "visit_completion_status", "fieldtype": "Data", "width": 160},
		{"label": "Maintenance Type", "fieldname": "maintenance_type", "fieldtype": "Data", "width": 130},
	]
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
