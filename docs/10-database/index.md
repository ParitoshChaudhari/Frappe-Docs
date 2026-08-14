---
title: Database, ORM & Query Builder in Frappe v15
description: Definitive guide to frappe.db APIs, PyPika Query Builder (frappe.qb), raw SQL parameter binding, savepoints, and database transactions.
version: v15
category: Server-Side Python APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge server">Server Only</span> <span class="badge stable">Stable</span> Database, ORM & Query Builder

Frappe Framework v15 provides 3 database access interfaces under `frappe.db` and `frappe.qb` for interacting with MariaDB and PostgreSQL.

---

## 1. `frappe.db` API Reference

### `frappe.db.get_value`

Fetches values from a single database row efficiently without instantiating document objects.

```python
# Signature
frappe.db.get_value(doctype, filters, fieldname, as_dict=False, debug=False)

# Fetch single field
email = frappe.db.get_value("User", "Administrator", "email")

# Fetch multiple fields as dictionary
data = frappe.db.get_value(
    "Task",
    {"status": "Open", "priority": "High"},
    ["name", "subject", "allocated_to"],
    as_dict=True
)
```

---

### `frappe.db.set_value`

Executes a direct `UPDATE` query on specific document fields in the database.

```python
frappe.db.set_value(
    doctype,
    name,
    fieldname,
    value=None,
    modified=None,
    modified_by=None,
    update_modified=True
)
```

```python
# Example: Bulk field update
frappe.db.set_value("Task", "TASK-00001", "status", "Completed")

# Dict-based multi-field update
frappe.db.set_value(
    "Task",
    {"status": "Open", "priority": "Low"},
    {"priority": "Medium", "status": "Working"}
)
```

---

### `frappe.db.exists` & `frappe.db.count`

```python
# Check record existence (Returns document name string or None)
if frappe.db.exists("User", {"email": "user@example.com"}):
    pass

# Count total matching records
open_task_count = frappe.db.count("Task", filters={"status": "Open"})
```

---

### `frappe.db.sql` (Raw SQL Execution)

Executes raw SQL queries with mandatory parameterized variable binding to prevent SQL injection vulnerabilities.

```python
# ALWAYS use SQL parameter binding (%s for MariaDB/PostgreSQL)!
result = frappe.db.sql("""
    SELECT name, subject, status
    FROM `tabTask`
    WHERE status = %s AND priority = %s
    ORDER BY creation DESC
""", ("Open", "High"), as_dict=True)
```

> [!CAUTION]
> Never use Python string interpolation (`f"SELECT ... WHERE name = '{name}'"`) inside `frappe.db.sql()`! This creates critical SQL injection security vulnerabilities.

---

### Database Transactions: `commit`, `rollback`, `savepoint`

```python
# Savepoint and Transaction Control
try:
    frappe.db.savepoint("before_bulk_update")
    frappe.db.set_value("Task", task_id, "status", "Completed")
    # Commit explicit transaction if required
    frappe.db.commit()
except Exception:
    # Revert to savepoint without aborting entire request transaction
    frappe.db.rollback(save_point="before_bulk_update")
    raise
```

---

## 2. Query Builder (`frappe.qb`)

Frappe v15 integrates **PyPika** into `frappe.qb` to generate type-safe, programmatic, cross-database SQL queries.

### Basic SELECT & WHERE Query

```python
from frappe.query_builder import DocType, Field

Task = DocType("Task")

query = (
    frappe.qb.from_(Task)
    .select(Task.name, Task.subject, Task.priority)
    .where((Task.status == "Open") & (Task.priority.isin(["High", "Urgent"])))
    .orderby(Task.creation, order=frappe.qb.desc)
    .limit(20)
)

results = query.run(as_dict=True)
```

---

### JOIN & Aggregations Query

```python
from frappe.query_builder import DocType
from frappe.query_builder.functions import Count, Sum

Task = DocType("Task")
Project = DocType("Project")

query = (
    frappe.qb.from_(Project)
    .left_join(Task).on(Task.project == Project.name)
    .select(
        Project.name.as_("project_name"),
        Count(Task.name).as_("total_tasks")
    )
    .groupby(Project.name)
    .having(Count(Task.name) > 5)
)

data = query.run(as_dict=True)
```

---

## 3. Database Strategy Comparison Matrix

| Criteria | Document API (`frappe.get_doc`) | DB API (`frappe.db.get_all`) | Query Builder (`frappe.qb`) | Raw SQL (`frappe.db.sql`) |
| :--- | :--- | :--- | :--- | :--- |
| **Execution Speed** | Moderate (Full object instantiation) | Fast | Very Fast | Maximum Speed |
| **Triggers Lifecycle Hooks** | Yes (`validate`, `on_update`) | No | No | No |
| **Applies Permissions** | Optional (`check_permission`) | Yes (`get_list`) / No (`get_all`) | Manual | Manual |
| **Complex Joins / Subqueries**| No | Limited | Full Support | Full Support |
| **Type Safety & Security** | Maximum | High | High (Injection-proof) | Requires Manual Binding |

---

## Related Topics

- [06. Document API & Lifecycle](/06-documents/)
- [09. Server API](/09-server-api/)
- [21. Security & Performance](/21-security-performance/)
