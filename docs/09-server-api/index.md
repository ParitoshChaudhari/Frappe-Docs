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

# User roles list for current user or a specific user
roles = frappe.get_roles(frappe.session.user)

# Active Werkzeug HTTP Request object
request_method = frappe.request.method

# System Configuration (from site_config.json)
is_dev = frappe.conf.get("developer_mode", 0)
```

---

## 6. Permissions, Roles & User Context APIs

When writing backend methods, endpoints, or background workers, you frequently need to check user permissions, assert roles, or switch user identities.

### `frappe.has_permission`

Checks whether the current user (or a specified user) has a specific permission (`read`, `write`, `create`, `delete`, `submit`, `cancel`, `amend`) on a DocType or a specific document.

```python
# Check if current user can write to a specific document
if frappe.has_permission("Sales Invoice", ptype="write", doc="SINV-2026-0001"):
    print("User can edit this invoice.")

# Check if a specific user has 'create' permission on a DocType
can_create = frappe.has_permission("Task", ptype="create", user="john@example.com")

# Raise an exception automatically if permission check fails:
frappe.has_permission("Task", ptype="write", doc=task_doc, throw=True)
```

---

### `frappe.has_role`

Quickly checks whether the active session user or a designated user holds a specific role.

```python
# Check if current user has 'Accounts Manager' role
if frappe.has_role("Accounts Manager"):
    process_special_ledger_entry()

# Check role for a specific user
is_admin = frappe.has_role("System Manager", user="john@example.com")
```

---

### `frappe.only_for`

A security guard assertion. Immediately raises a `frappe.PermissionError` if the logged-in user does not belong to any of the specified roles.

```python
@frappe.whitelist()
def purge_old_audit_logs():
    # Only System Managers or HR Managers can execute this method
    frappe.only_for(["System Manager", "HR Manager"])
    
    # Execution proceeds only if the check passes
    frappe.db.delete("Activity Log", {"creation": ["<", "2025-01-01"]})
```

---

### `frappe.set_user`

Temporarily changes the active user context for the duration of the current execution. Essential for background jobs or webhooks where actions must be executed on behalf of a specific user or `Administrator`.

```python
# In a background worker or webhook handler
original_user = frappe.session.user

try:
    # Switch execution context to Administrator
    frappe.set_user("Administrator")
    
    # This document will now be created with owner = 'Administrator'
    # and bypass user-specific restrictions
    doc = frappe.get_doc({
        "doctype": "Audit Log",
        "details": "Automated reconciliation complete"
    }).insert()
finally:
    # Always restore original user context
    frappe.set_user(original_user)
```

---

## 7. Global Execution Flags (`frappe.flags`)

`frappe.flags` is an in-memory dictionary-like object used to control framework behavior during request processing.

| Flag | Type | Description |
| :--- | :--- | :--- |
| `frappe.flags.ignore_permissions` | `bool` | Set to `True` to bypass all Role & User Permission checks across document operations. |
| `frappe.flags.mute_messages` | `bool` | Set to `True` to suppress all `frappe.msgprint` popups (useful in bulk migration scripts). |
| `frappe.flags.in_test` | `bool` | `True` when code is running inside automated test suites (`bench run-tests`). |
| `frappe.flags.in_migrate` | `bool` | `True` when `bench migrate` is currently running schema alterations. |
| `frappe.flags.in_install` | `bool` | `True` during app or site installation. |

### Example: Bypassing Permissions in Trusted Backend Code

```python
# Example: Automated system script modifying a protected document
try:
    frappe.flags.ignore_permissions = True
    
    doc = frappe.get_doc("Salary Slip", "SAL-0001")
    doc.status = "Paid"
    doc.save()
finally:
    frappe.flags.ignore_permissions = False  # Reset flag!
```

---

## 8. Document Management Utility Functions (`frappe.*`)

In addition to calling methods directly on document instances (`doc.insert()`, `doc.save()`), the top-level `frappe.*` namespace provides several high-level helpers:

### `frappe.new_doc`

Instantiates a new document in memory, pre-populating standard default values from DocType schema definitions.

```python
# Create new unsaved document instance
task = frappe.new_doc("Task")
task.subject = "Draft Annual Report"
task.priority = "Medium"
task.insert()
```

---

### `frappe.copy_doc`

Duplicates an existing document object into a new unsaved record in memory. It strips primary keys (`name`), timestamps (`creation`, `modified`), submitted statuses (`docstatus: 0`), and any fields marked with `no_copy: 1`.

```python
original_order = frappe.get_doc("Sales Order", "SO-2026-00100")

# Clone document with all child tables preserved
new_order = frappe.copy_doc(original_order)
new_order.transaction_date = frappe.utils.nowdate()
new_order.insert()
```

---

### `frappe.delete_doc`

Deletes a document from the database directly, including its child tables, comments, attachments, and link validations without needing to instantiate the document first.

```python
# Standard delete (validates user delete permissions)
frappe.delete_doc("Task", "TASK-00050")

# Force delete (ignores permissions and link checks - use with caution!)
frappe.delete_doc("Task", "TASK-00050", force=True, ignore_permissions=True)
```

---

### `frappe.rename_doc`

Renames a document's primary key (`name`) and **automatically cascades** the new name across all foreign-key Link fields across the entire database.

```python
# Rename Customer ID and update all linked Sales Invoices, Orders, etc.
frappe.rename_doc(
    doctype="Customer",
    old="OLD-CUST-CODE",
    new="NEW-CUST-CODE",
    merge=False  # If True and NEW-CUST-CODE exists, records are merged into it!
)
```

---

## 9. Background Jobs & Asynchronous Queues (`frappe.enqueue`)

Offloads long-running or computationally heavy tasks from the web server thread to Redis background workers.

```python
# Signature:
# frappe.enqueue(method, queue='default', timeout=300, is_async=True, now=False, job_name=None, **kwargs)
```

### Example: Enqueuing a Standalone Function

```python
import frappe

def generate_monthly_report(company, year, recipient_email):
    # Heavy report generation logic...
    pdf_bytes = build_complex_pdf(company, year)
    frappe.sendmail(
        recipients=[recipient_email],
        subject=f"Monthly Financial Report - {year}",
        message="Please find attached the financial report.",
        attachments=[{"fname": "report.pdf", "fcontent": pdf_bytes}]
    )

@frappe.whitelist()
def trigger_report_generation(company, year):
    # Offload to background worker immediately; HTTP request responds in milliseconds
    frappe.enqueue(
        method="my_app.reports.generate_monthly_report",
        queue="long",          # Options: 'short' (2 mins), 'default' (5 mins), 'long' (25 mins)
        timeout=1500,          # Custom worker timeout in seconds
        company=company,
        year=year,
        recipient_email=frappe.session.user
    )
    return {"message": _("Report is being generated in background.")}
```

### Example: Enqueuing a Document Method (`frappe.enqueue_doc`)

Runs a specific method defined on a Document model in the background:

```python
# Enqueue doc.submit() or a custom document method
frappe.enqueue_doc(
    doctype="Sales Invoice",
    name="SINV-2026-0001",
    method="sync_with_payment_gateway",
    queue="default",
    timeout=300
)
```

---

## 10. Communication & Real-time Push APIs

### `frappe.sendmail`

Dispatches emails through the site's configured Email Account and logs communication audit records.

```python
frappe.sendmail(
    recipients=["client@example.com", "accounting@example.com"],
    subject=_("Payment Confirmation - Invoice {0}").format(invoice.name),
    message="<p>Thank you! Your payment has been received successfully.</p>",
    reference_doctype="Sales Invoice",
    reference_name=invoice.name,
    now=False  # If False (default), queued to Email Queue table; if True, sends synchronously
)
```

---

### `frappe.publish_realtime`

Publishes WebSocket events to connected Desk client browser windows via the Socket.io service. Useful for progress bars, live updates, and notification alerts.

```python
# 1. Broadcast event to a specific logged-in user
frappe.publish_realtime(
    event="task_progress",
    message={"progress": 75, "total": 100, "status": "Importing rows..."},
    user=frappe.session.user
)

# 2. Broadcast event to all users currently viewing a specific document
frappe.publish_realtime(
    event="doc_updated",
    message={"status": "Approved by Manager"},
    doctype="Purchase Order",
    docname="PO-2026-0045"
)
```

---

## 11. Caching & Memory Management (`frappe.cache` & `frappe.clear_cache`)

### `frappe.clear_cache`

Flushes cached schemas, doctype definitions, and user permissions across Redis and memory.

```python
# Flushes all cached data for a specific DocType (schema, default values, links)
frappe.clear_cache(doctype="Customer")

# Flushes user permissions and cached roles for a specific user
frappe.clear_cache(user="john@example.com")

# Flushes entire site cache (all DocTypes, sessions, and configurations)
frappe.clear_cache()
```

---

### `frappe.cache()` Redis Client Wrapper

Provides direct access to the site's Redis cache instance with key-value and hash operations:

```python
cache = frappe.cache()

# 1. Simple Key-Value
cache.set_value("exchange_rate_USD_EUR", 0.92, expires_in_sec=3600)
rate = cache.get_value("exchange_rate_USD_EUR")

# 2. Hash Set & Get (Organized namespaced caches)
cache.hset("customer_credit_limits", "CUST-001", 50000)
limit = cache.hget("customer_credit_limits", "CUST-001")

# Delete cached key
cache.delete_value("exchange_rate_USD_EUR")
```

---

## 12. Serialization & Utility Helpers

### `frappe.as_json` and `frappe.parse_json`

Safe JSON serialization and parsing that cleanly handles datetime objects, Decimal types, and Frappe data structures:

```python
data = {
    "date": frappe.utils.now_datetime(),
    "amount": frappe.utils.flt(1250.50),
    "status": "Active"
}

# Safely converts to formatted JSON string without datetime/Decimal errors
json_str = frappe.as_json(data, indent=2)

# Parses string back to dictionary/list
parsed_dict = frappe.parse_json(json_str)
```

---

### `frappe.format`

Formats raw database values into human-readable strings according to Frappe fieldtype formatting rules (Currencies, Dates, Datetimes, Percentages).

```python
# Format Currency using active company currency and decimal places
formatted_price = frappe.format(15420.75, {"fieldtype": "Currency", "options": "currency"})
# Output: "₹ 15,420.75" or "$ 15,420.75" depending on system configuration

# Format Date
formatted_date = frappe.format("2026-10-08", {"fieldtype": "Date"})
# Output: "08-10-2026" or "10/08/2026" depending on user date format
```

---

### `frappe._dict`

A lightweight subclass of Python's standard `dict` that provides attribute-style dot access to dictionary keys (`d.field` is identical to `d["field"]`).

```python
# Initialize a frappe._dict
item = frappe._dict({"item_code": "MACBOOK-PRO", "qty": 5})

# Access using dot notation
print(item.item_code)  # "MACBOOK-PRO"
print(item.qty)        # 5

# Set attributes using dot notation
item.rate = 1999.00
```

---

## Related Topics

- [06. Document API](/06-documents/)
- [10. Database API & Query Builder](/10-database/)
- [13. REST API & RPC](/13-rest-api/)
- [15. Background Jobs & Scheduler](/15-background-jobs-scheduler/)
- [16. Cache, Realtime, Email & Files](/16-cache-realtime-email-files/)
- [23. Client vs Server API Matrix](/23-client-vs-server/)
- [24. Comprehensive API Index](/24-api-index/)
