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

# Signature:
# frappe.db.get_value(doctype, filters, fieldname, as_dict=False, debug=False)

# WAY 1: Direct SQL fetch via frappe.db.get_value (Minimal RAM, bypasses Document ORM)
email = frappe.db.get_value("User", "Administrator", "email")

data = frappe.db.get_value(
    "Task",
    {"status": "Open", "priority": "High"},
    ["name", "subject", "allocated_to"],
    as_dict=True
)

# WAY 2: Full Document fetch + safe field access via doc.get()
# Use when you need validation hooks, child tables, or modifying document state
task_doc = frappe.get_doc("Task", "TASK-00001")

# Safe access with fallback default (prevents AttributeError crashes)
subject = task_doc.get("subject", "Untitled Task")
priority = task_doc.get("priority") # Returns None safely if empty

# In-memory child table filtering via doc.get():
assigned_users = task_doc.get("assignments", {"role": "Reviewer"})
```

> [!TIP]
> **Best Practices, Reason, Why It's Used & How It Works: `doc.get("fieldname")` vs `frappe.db.get_value`**
>
> - **Why & When to Use `doc.get("fieldname")`**:
>   1. **Defensive Coding Against `AttributeError`**: Standard dot access `task_doc.custom_score` crashes with `AttributeError` if the field is missing or dynamic. `task_doc.get("custom_score", 0)` returns the default cleanly.
>   2. **Lifecycle & Child Tables**: If your code needs to access child tables (e.g., `task_doc.get("items")`), check permissions (`task_doc.check_permission()`), or update and save records (`task_doc.save()`), fetch the document with `frappe.get_doc()` and access fields with `.get()`.
>   3. **Built-in Child Table Filtering**: `doc.get("child_table_name", {"status": "Pending"})` filters nested child rows in memory without additional SQL queries.
> - **When to Use `frappe.db.get_value`**:
>   Use `frappe.db.get_value` whenever you only need 1 to 5 scalar values (e.g., checking a user's role or an order's status) and do NOT need to execute controller logic or save changes. It generates an ultra-fast `SELECT` query and skips document instantiation.
> - **How It Works Internally**:
>   `doc.get()` delegates to `BaseDocument.get()` in `frappe/model/base_document.py`, checking the in-memory `__dict__` and performing Python-level list comprehension for child table filters. Conversely, `frappe.db.get_value()` queries the database engine directly via `frappe.db.sql()`.
> - **Official Documentation References**:
>   - [Frappe Framework Official Docs: Database API (`frappe.db.get_value`)](https://frappeframework.com/docs/v15/user/en/api/database#frappedbget_value)
>   - [Frappe Framework Official Docs: Document API Reference (`doc.get`)](https://frappeframework.com/docs/v15/user/en/api/document#docget)

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
# 1. Check record existence (Returns document name string or None)
name = frappe.db.exists("User", {"email": "john@example.com"})
print("Result:", name)
# Output:
# Result: john@example.com

# 2. Count total matching records
open_task_count = frappe.db.count("Task", filters={"status": "Open"})
print("Open Tasks:", open_task_count)
# Output:
# Open Tasks: 42
```

---

### `frappe.db.get_single_value`

Retrieves a field value from a **Single DocType** (such as `System Settings` or `Global Defaults`).

```python
# Fetch system default currency from System Settings
currency = frappe.db.get_single_value("System Settings", "default_currency")
print("System Currency:", currency)
# Output:
# System Currency: USD
```

---

### `frappe.db.delete`

Performs direct SQL row deletion based on filter conditions without instantiating document objects.

```python
# Direct deletion of temporary log records
frappe.db.delete("Activity Log", {
    "creation": ["<", "2026-01-01"],
    "status": "Success"
})
```

---

### Schema Inspection & Maintenance (`table_exists`, `has_column`, `touch`)

```python
# 1. Check if database table exists
if frappe.db.table_exists("tabTask"):
    print("Table exists!")

# 2. Check if table column exists
if frappe.db.has_column("tabTask", "custom_priority"):
    print("Column exists!")

# 3. Touch document modified timestamp
frappe.db.touch("Task", "TASK-2026-00001")
```

---

### `frappe.db.sql` (Raw SQL Execution)

Executes raw SQL queries directly against the database. **Always use parameterized binding** to prevent SQL injection vulnerabilities.

Frappe supports two binding styles:

#### Style 1: Positional Parameters (`%s`)

```python
# Pass a tuple/list of values matching each %s placeholder in order
result = frappe.db.sql("""
    SELECT name, subject, status
    FROM `tabTask`
    WHERE status = %s AND priority = %s
    ORDER BY creation DESC
""", ("Open", "High"), as_dict=True)

print(result)
# Output: [{'name': 'TASK-2026-00001', 'subject': 'Fix Bug', 'status': 'Open'}]
```

#### Style 2: Named Parameters (`%(key)s`) — Recommended

Named parameters improve readability and are safer for complex queries with many values because you cannot accidentally mix up the order.

```python
# Pass a dict where keys match the %(key)s placeholders in the SQL
result = frappe.db.sql("""
    SELECT name, subject, status
    FROM `tabTask`
    WHERE status = %(status)s
      AND priority = %(priority)s
      AND creation BETWEEN %(date_from)s AND %(date_to)s
    ORDER BY creation DESC
""", {
    "status": "Open",
    "priority": "High",
    "date_from": "2026-01-01",
    "date_to": "2026-12-31"
}, as_dict=True)
```

> [!CAUTION]
> **NEVER** use Python string interpolation or f-strings to inject values into SQL. Both patterns below create critical **SQL injection vulnerabilities**:
> ```python
> # DANGEROUS — never do this:
> frappe.db.sql(f"SELECT ... WHERE name = '{name}'")
> frappe.db.sql("SELECT ... WHERE name = '%s'" % name)
> ```
> Always pass values through the `values` argument using `%s` or `%(key)s` placeholders.

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

## 2. DocType Metadata & Request Context APIs

### `frappe.get_meta`

Returns the `Meta` structure object for a given DocType.

```python
meta = frappe.get_meta("Customer")

# Inspect field definitions
has_field = meta.has_field("tax_id")
field = meta.get_field("customer_name")
link_fields = meta.get_link_fields()

print("Has Tax ID:", has_field)
print("Field Type:", field.fieldtype)
# Output:
# Has Tax ID: True
# Field Type: Data
```

---

### `frappe.local` Request Context

`frappe.local` holds thread-local contextual variables for the active Werkzeug HTTP request.

| Attribute | Description | Output Example |
| :--- | :--- | :--- |
| `frappe.local.site` | Active site name | `'site1.localhost'` |
| `frappe.local.session.user` | Logged in user email | `'john@company.com'` |
| `frappe.local.form_dict` | Parsed HTTP request query parameters & body | `{'doctype': 'Task', 'status': 'Open'}` |
| `frappe.local.request` | Werkzeug HTTP request object | `<Request 'http://localhost/api/method/...' [POST]>` |

---

## 3. Query Builder (`frappe.qb`)

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
print("Query Results:", results)
# Output:
# Query Results: [{'name': 'TASK-001', 'subject': 'Setup Redis', 'priority': 'High'}]
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

## 4. Database Strategy Comparison Matrix

| Criteria | Document API (`frappe.get_doc`) | DB API (`frappe.db.get_all`) | Query Builder (`frappe.qb`) | Raw SQL (`frappe.db.sql`) |
| :--- | :--- | :--- | :--- | :--- |
| **Execution Speed** | Moderate (Full object instantiation) | Fast | Very Fast | Maximum Speed |
| **Triggers Lifecycle Hooks** | Yes (`validate`, `on_update`) | No | No | No |
| **Applies Permissions** | Optional (`check_permission`) | Yes (`get_list`) / No (`get_all`) | Manual | Manual |
| **Complex Joins / Subqueries**| No | Limited | Full Support | Full Support |
| **Type Safety & Security** | Maximum | High | High (Injection-proof) | Requires Manual Binding |

---

### `frappe.db.get_values` & `frappe.db.get_single_value`

Fetch values across multiple records or from Single DocTypes.

```python
# Fetch multiple fields across records
tasks = frappe.db.get_values(
    "Task",
    {"status": "Open"},
    ["name", "subject", "priority"],
    as_dict=True
)

# Fetch field value from a Single DocType (e.g. System Settings)
timezone = frappe.db.get_single_value("System Settings", "time_zone")
frappe.db.set_single_value("System Settings", "time_zone", "UTC")
```

---

### `frappe.db.get_default` & `frappe.db.set_default`

Manage user or system defaults stored in Frappe.

```python
# Set a default fiscal year for the current session/user
frappe.db.set_default("fiscal_year", "2026-2027")

# Retrieve a default value
fiscal_year = frappe.db.get_default("fiscal_year")
```

---

### Transaction Controls: `frappe.db.savepoint` & `frappe.db.rollback`

Manage nested transaction savepoints to safely execute risky operations with targeted rollback.

```python
try:
    frappe.db.savepoint("before_bulk_update")
    frappe.db.set_value("Task", "TASK-00001", "status", "Completed")
    # Simulate partial failure
    raise Exception("Something went wrong")
except Exception:
    # Revert database transaction back to the savepoint without cancelling the whole HTTP request
    frappe.db.rollback(save_point="before_bulk_update")
```

---

### Schema Inspection: `table_exists` & `has_column`

Inspect the underlying database schema programmatically.

```python
# Check if table exists
if frappe.db.table_exists("Task"):
    print("Table tabTask exists")

# Check if column exists on table
if frappe.db.has_column("Task", "priority"):
    columns = frappe.db.get_table_columns("Task")
    print("Columns:", columns)
```

---

## 5. Client-Side Database Proxy (`frappe.db` in JavaScript)

In browser-side Client Scripts, `frappe.db` provides asynchronous, Promise-based helper functions that proxy database queries to the backend while enforcing user permissions.

```javascript
// 1. Fetch document by primary key
frappe.db.get_doc("Task", "TASK-00001").then(doc => {
    console.log("Fetched Task:", doc.subject);
});

// 2. Fetch specific field value
frappe.db.get_value("Customer", "CUST-001", "customer_name").then(r => {
    if (r && r.customer_name) {
        console.log("Customer Name:", r.customer_name);
    }
});

// 3. Fetch list of records
frappe.db.get_list("Task", {
    filters: { status: "Open" },
    fields: ["name", "subject", "priority"],
    limit: 10
}).then(tasks => {
    console.log("Open Tasks:", tasks);
});

// 4. Update field value directly from client
frappe.db.set_value("Task", "TASK-00001", "status", "Completed").then(r => {
    frappe.show_alert({ message: __("Task completed"), indicator: "green" });
});

// 5. Insert new document from client
frappe.db.insert({
    doctype: "Task",
    subject: "Task created from client JS",
    status: "Open"
}).then(doc => {
    console.log("Created doc name:", doc.name);
});

// 6. Check record existence and count records
frappe.db.exists("Task", "TASK-00001").then(exists => {
    console.log("Does task exist?:", exists);
});

frappe.db.count("Task", { status: "Open" }).then(count => {
    console.log("Open Task Count:", count);
});

// 7. Delete document from client
frappe.db.delete_doc("Task", "TASK-00001").then(() => {
    frappe.show_alert("Task deleted");
});
```

---

## Related Topics

- [06. Document API & Lifecycle](/06-documents/)
- [09. Server API](/09-server-api/)
- [21. Security & Performance](/21-security-performance/)

