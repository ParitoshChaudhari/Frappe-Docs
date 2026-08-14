---
title: Security, Performance & Anti-Patterns in Frappe v15
description: Security guidelines, SQL injection prevention, N+1 query elimination, caching performance, and "Things You Should NOT Do" anti-patterns guide.
version: v15
category: Quality, Operations & Best Practices
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Security, Performance & Anti-Patterns

Writing robust Frappe Framework v15 applications requires following strict security protocols and performance optimization patterns.

---

## 1. Security Best Practices

### Prevent SQL Injection (SQLi)

Always use parameter binding in `frappe.db.sql` or use `frappe.qb` (Query Builder).

```python
# ❌ INSECURE (Vulnerable to SQL Injection)
task_name = frappe.form_dict.get("task_name")
frappe.db.sql(f"SELECT * FROM `tabTask` WHERE name = '{task_name}'")

# ✅ SECURE (Parameter binding)
frappe.db.sql("SELECT * FROM `tabTask` WHERE name = %s", (task_name,), as_dict=True)

# ✅ SECURE (Query Builder)
Task = frappe.qb.DocType("Task")
frappe.qb.from_(Task).select("*").where(Task.name == task_name).run(as_dict=True)
```

---

### Prevent Cross-Site Scripting (XSS) in Jinja Templates

Always escape user inputs rendered in custom Jinja HTML templates:

```jinja
<!-- ❌ INSECURE -->
<div>{{ user_input_bio }}</div>

<!-- ✅ SECURE (Auto-escaped or explicitly sanitized) -->
<div>{{ user_input_bio | e }}</div>
```

---

## 2. Performance Optimization & N+1 Query Elimination

### ❌ Anti-Pattern: N+1 Database Queries Inside Loops

```python
# ❌ POOR PERFORMANCE (N+1 Queries: 1 query for list + N queries inside loop)
tasks = frappe.get_all("Task", filters={"status": "Open"})
for task in tasks:
    # Executes database query on EVERY iteration!
    customer_name = frappe.db.get_value("Customer", task.customer, "customer_name")
```

```python
# ✅ HIGH PERFORMANCE (Single Batch Query)
tasks = frappe.get_all("Task", filters={"status": "Open"}, fields=["name", "customer"])
customer_ids = list(set([t.customer for t in tasks if t.customer]))

# Single query retrieves all linked customers
customers = frappe.get_all(
    "Customer",
    filters={"name": ["in", customer_ids]},
    fields=["name", "customer_name"]
)
customer_map = {c.name: c.customer_name for c in customers}
```

---

## 3. "Things You Should NOT Do" (Anti-Patterns Guide)

### 1. ❌ Don't Call `self.save()` Inside `on_update()`

- **Why**: Triggers infinite recursion and crashes worker threads.
- **Fix**: Perform field assignments inside `validate()`.

### 2. ❌ Don't Trust Client-Side Calculations for Financial Data

- **Why**: Users can tamper with HTTP payloads in browser devtools.
- **Fix**: Re-calculate totals, taxes, and discounts server-side inside Python `validate()`.

### 3. ❌ Don't Use `frappe.db.sql` When `frappe.db.get_value` or `frappe.qb` Suffices

- **Why**: Raw SQL bypasses framework ORM safety checks and database vendor abstraction.
- **Fix**: Utilize `frappe.db.get_value`, `frappe.get_all`, or `frappe.qb`.

### 4. ❌ Don't Execute Heavy External Webhooks Synchronously in HTTP Requests

- **Why**: Blocks WSGI worker processes, making Desk feel laggy.
- **Fix**: Enqueue tasks using `frappe.enqueue(..., enqueue_after_commit=True)`.

---

## Related Topics

- [10. Database API](/10-database/)
- [14. Authentication & Permissions](/14-authentication-permissions/)
- [15. Background Jobs](/15-background-jobs-scheduler/)
