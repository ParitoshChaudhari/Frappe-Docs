---
title: Server API (frappe.*) Reference & Data Fetching Comparison in Frappe v15
description: Definitive API reference for Python frappe namespace methods - get_all vs get_list vs get_doc vs db.get_value comparison table, why/when/how to use each, parameters, and code examples.
version: v15
category: Server-Side Python APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge server">Server Only</span> <span class="badge stable">Stable</span> Server API (`frappe.*`) & Data Fetching Strategy

The `frappe` module is the core entry point for Python backend development in Frappe Framework v15. Selecting the correct data-fetching method directly impacts **system security**, **memory consumption**, and **query execution speed**.

---

## 1. Comparative Analysis: `frappe.get_all` vs `frappe.get_list` vs `frappe.get_doc` vs `frappe.db.get_value`

### "Which Method to Use When, Why & How" Decision Matrix

| Method | Enforces User Permissions? | Instantiates Full Document Object? | Speed & Performance | Memory Footprint | Primary Use Case ("When & Why") |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`frappe.get_all`** | ❌ No | ❌ No (Returns dicts) | 🚀 Ultra Fast | 🟢 Minimal | Fetching multiple rows in background jobs or system code where permissions are already validated. |
| **`frappe.get_list`** | ✅ Yes (Applies Role & User Perms) | ❌ No (Returns dicts) | ⚡ Fast | 🟢 Minimal | Fetching records for Desk UI views or REST endpoints exposed to restricted users. |
| **`frappe.get_doc`** | ⚠️ Manual (`doc.check_permission`) | ✅ Yes (Full ORM Object + Child Tables) | 🐢 Moderate (Heavy DB read) | 🔴 High | Modifying business entities, invoking `doc.save()`, or triggering controller lifecycle hooks (`validate`, `on_update`). |
| **`frappe.get_cached_doc`**| ⚠️ Manual | ✅ Yes (Cached ORM Object) | ⚡ Fast (Redis Read) | 🟡 Moderate | Reading static configuration DocTypes or Settings repeatedly without hitting DB. |
| **`frappe.db.get_value`** | ❌ No | ❌ No (Returns primitive / dict) | 🚀 Ultra Fast (Single Query) | 🟢 Minimal | Reading 1 to 5 scalar field values for a specific record. |
| **`frappe.db.get_single_value`** | ❌ No | ❌ No (Returns primitive) | 🚀 Ultra Fast | 🟢 Minimal | Fetching single configuration attribute from Single DocTypes (e.g., `System Settings`). |
| **`frappe.qb` (Query Builder)** | ❌ Manual | ❌ No (Returns dicts or tuples) | 🚀 Ultra Fast (Compiled SQL) | 🟢 Minimal | Complex relational JOINs, subqueries, group aggregations, or type-safe dynamic SQL construction. |

---

## 2. Deep Dive: Document & Query Read APIs

### `frappe.get_all` vs `frappe.get_list`

Both methods query MariaDB/PostgreSQL records as lightweight dictionaries, but **`frappe.get_list` applies User Permissions and Role Permissions**, whereas **`frappe.get_all` bypasses permission checks**.

#### Syntax

```python
records = frappe.get_all(  # OR frappe.get_list
    doctype,
    filters=None,
    fields=None,
    order_by=None,
    limit_start=None,
    limit_page_length=None,
    as_list=False,
    debug=False
)
```

#### Detailed Comparison Example

```python
import frappe

# Scenario: User 'john@company.com' belongs to 'Region North'

# 1. Using frappe.get_list (SECURITY ENFORCED)
# Returns ONLY invoices belonging to 'Region North' based on User Permissions
user_invoices = frappe.get_list(
    "Sales Invoice",
    filters={"docstatus": 1},
    fields=["name", "customer", "grand_total"]
)

# 2. Using frappe.get_all (SYSTEM LEVEL / BYPASSES PERMISSIONS)
# Returns ALL invoices system-wide, regardless of active user permissions
all_invoices = frappe.get_all(
    "Sales Invoice",
    filters={"docstatus": 1},
    fields=["name", "customer", "grand_total"]
)
```

> [!CAUTION]
> Never use `frappe.get_all` inside `@frappe.whitelist()` endpoints exposed to general end-users without performing manual permission validation! Use `frappe.get_list` instead.

---

### Advanced Filter Operator Matrix

`filters` accept dictionaries or list of condition arrays supporting rich SQL operators:

```python
tasks = frappe.get_all(
    "Task",
    filters={
        "status": ["in", ["Open", "Working"]],             # IN operator
        "priority": ["not in", ["Low"]],                    # NOT IN operator
        "expected_time": [">", 10],                        # Greater than
        "creation": ["between", ["2026-01-01", "2026-12-31"]], # BETWEEN operator
        "subject": ["like", "%Bug%"],                       # SQL LIKE operator
        "project": ["is", "set"],                           # IS SET (NOT NULL)
        "allocated_to": ["is", "not set"]                   # IS NOT SET (NULL)
    },
    fields=["name", "subject", "priority", "status"],
    order_by="priority desc, creation asc",
    limit_page_length=100
)
```

---

### `frappe.db.get_value` vs `frappe.get_doc` + `doc.get("fieldname")`

Frappe offers multiple complementary ways to read field values in Python, depending on whether you need a fast scalar database lookup or the full Document ORM entity with controller methods and child tables.

```python
# =========================================================================
# WAY 1: Fast SQL Fetch without Document Overhead (frappe.db.get_value)
# =========================================================================
# Best when you only need 1 to 5 scalar fields without running validations
user_email = frappe.db.get_value("User", "Administrator", "email")

customer_details = frappe.db.get_value(
    "Customer",
    {"tax_id": "TAX-998822"},
    ["name", "customer_name", "credit_limit", "territory"],
    as_dict=True
)

open_task_subjects = frappe.db.get_values(
    "Task",
    {"status": "Open", "priority": "High"},
    ["name", "subject"],
    as_dict=True
)

# =========================================================================
# WAY 2: Full Document Fetch + Safe Getter (frappe.get_doc + doc.get)
# =========================================================================
# Best when modifying records, checking child tables, or calling methods
doc = frappe.get_doc("Customer", "CUST-001")

# Safe getter: Returns None or default if field is missing/empty - No AttributeError!
credit_limit = doc.get("credit_limit", 0.0)
tax_id = doc.get("tax_id")

# Built-in child table filtering directly in Python memory:
# Filters items child table without issuing a second SQL database query
active_contacts = doc.get("portal_users", {"is_active": 1})

# Direct attribute access (ORM standard)
territory = doc.territory

# =========================================================================
# WAY 3: Redis Cached Document Fetch (frappe.get_cached_doc + doc.get)
# =========================================================================
# Best for frequently-read master records and single configuration doctypes
cached_settings = frappe.get_cached_doc("System Settings")
timezone = cached_settings.get("time_zone", "UTC")

# Or fetch single cached scalar field directly:
currency = frappe.get_cached_value("Company", "My Corp", "default_currency")
```

> [!TIP]
> **Best Practices, Reason, Why It's Used & How It Works: `doc.get("fieldname")` vs `frappe.db.get_value`**
>
> - **Why & When to Use `doc = frappe.get_doc(...)` + `doc.get("fieldname")`**:
>   1. **Defensive Null-Safety**: Accessing attributes directly like `doc.custom_tax_code` raises an `AttributeError` if a field does not exist in the schema or custom field definition. `doc.get("custom_tax_code")` safely returns `None` or your fallback: `doc.get("custom_tax_code", "DEFAULT")`.
>   2. **Child Table Extraction & Filtering**: `doc.get()` has built-in support for child tables: `doc.get("items", {"item_code": "ITEM-001"})` returns only child rows matching that filter dictionary in memory.
>   3. **Modifications & Validation Lifecycle**: Use `frappe.get_doc` whenever you need to call `doc.validate()`, `doc.save()`, `doc.submit()`, or access controller hooks.
> - **Why & When to Use `frappe.db.get_value`**:
>   1. **High Throughput & Speed**: Bypasses document instantiation, child table loading, permissions compilation, and controller imports. Executes a single lightweight SQL `SELECT` statement.
>   2. **Background Jobs & Batch Processing**: When checking flags or reading reference IDs across thousands of records in loops where loading full documents would exhaust server RAM.
> - **How It Works Internally**:
>   - `doc.get()` is implemented in `BaseDocument.get()` (`frappe/model/base_document.py`). It accesses the document's `__dict__` directly, and for child tables executes in-memory dictionary filtering using `frappe.compare()`.
>   - `frappe.db.get_value()` constructs an optimized SQL `SELECT` via the database engine (`frappe/database/database.py`), directly parsing the result into a primitive value or a lightweight `frappe._dict`.
> - **Official Documentation References**:
>   - [Frappe Official Docs: Document API (`doc.get`)](https://frappeframework.com/docs/v15/user/en/api/document#docget)
>   - [Frappe Official Docs: Database API (`frappe.db.get_value`)](https://frappeframework.com/docs/v15/user/en/api/database#frappedbget_value)
>   - [Frappe Official Docs: Cached Document & Values](https://frappeframework.com/docs/v15/user/en/api/database#frappedbget_cached_value)

---

## 3. Response & Error Handling APIs

### `frappe.throw`

Raises a `frappe.ValidationError` exception, rolls back database transactions, and displays a red toast banner on client Desk UI.

```python
frappe.throw(
    msg=_("Invalid operation: Task is already closed."),
    exc=frappe.ValidationError,
    title=_("Operation Blocked")
)
```

---

### `frappe.msgprint`

Sends a non-blocking informational popup message to the client Desk UI.

```python
frappe.msgprint(
    msg=_("Document saved successfully."),
    title=_("Notification"),
    indicator="green",  # blue, green, orange, red
    alert=True          # If True, renders as non-intrusive toast alert
)
```

---

### `frappe.log_error`

Writes an error traceback record to the system **Error Log** DocType for background diagnostics.

```python
try:
    process_payment()
except Exception as e:
    frappe.log_error(
        title="Payment Gateway Integration Error",
        message=frappe.get_traceback()
    )
```

---

## 4. Whitelisting & API Access (`@frappe.whitelist`)

Decorates Python functions to expose them as callable HTTP REST/RPC endpoints (`/api/method/...`).

```python
import frappe

@frappe.whitelist(allow_guest=False, methods=["POST"])
def update_task_priority(task_name, priority):
    """
    allow_guest: If True, accessible to unauthenticated users.
    methods: Constrains allowed HTTP verbs.
    """
    doc = frappe.get_doc("Task", task_name)
    doc.check_permission("write")  # Validate active user write permission
    doc.priority = priority
    doc.save()
    return {"status": "success", "new_priority": doc.priority}
```

---

## 5. Session & Request Context Variables

```python
# Current user ID (e.g. 'administrator@example.com' or 'Guest')
user = frappe.session.user

# User roles list
roles = frappe.get_roles(frappe.session.user)

# Active Werkzeug HTTP Request object
request_method = frappe.request.method

# System Configuration (from site_config.json)
is_dev = frappe.conf.get("developer_mode", 0)
```

---

## Related Topics

- [06. Document API](/06-documents/)
- [10. Database API & Query Builder](/10-database/)
- [13. REST API & RPC](/13-rest-api/)
- [23. Client vs Server API Matrix](/23-client-vs-server/)
