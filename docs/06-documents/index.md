---
title: Document API & Document Lifecycle in Frappe v15
description: Complete reference for Frappe Document ORM methods - get_doc, insert, save, submit, cancel, delete, db_set, as_dict, and execution lifecycles.
version: v15
category: DocTypes & Data Modeling
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge server">Server Only</span> <span class="badge stable">Stable</span> Document API & Lifecycle

The Document API (`frappe.model.document.Document`) is Frappe Framework’s Object-Relational Mapping (ORM) interface.

---

## 1. Document Instantiation APIs

### `frappe.get_doc`

<span class="badge server">Server Only</span> <span class="badge stable">Stable</span>

Fetches an existing document from database or instantiates a new document dictionary.

#### Syntax

```python
doc = frappe.get_doc(doctype, name=None, for_update=False)
# OR via single dictionary:
doc = frappe.get_doc(dict_manifest)
```

#### Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `doctype` | `str` \| `dict` | Yes | — | DocType name or full dictionary payload |
| `name` | `str` | Optional | `None` | Document name primary key |
| `for_update` | `bool` | Optional | `False` | Executes `SELECT ... FOR UPDATE` row lock in MariaDB |

#### Examples

```python
# 1. Fetch single document by name
task = frappe.get_doc("Task", "TASK-2026-00001")

# 2. Instantiate new un-saved document
new_task = frappe.get_doc({
    "doctype": "Task",
    "subject": "Deploy Production Server",
    "priority": "High",
    "status": "Open"
})
```

---

### `frappe.new_doc`

<span class="badge server">Server Only</span> <span class="badge stable">Stable</span>

Initializes a new Document instance with default values configured in DocType schema.

```python
task = frappe.new_doc("Task")
task.subject = "Setup Monitoring Alerts"
task.insert()
```

---

### `frappe.get_cached_doc`

<span class="badge server">Server Only</span> <span class="badge stable">Stable</span>

Retrieves a document from Redis memory cache. If not found in cache, queries database and caches the result.

```python
# High performance document retrieval (ideal for Settings & Master Data)
company = frappe.get_cached_doc("Company", "My Acme Corp")
```

---

## 2. Document Instance Methods

Given an instantiated `doc = frappe.get_doc(...)`:

### `doc.insert()`

Inserts a new document record into MariaDB/PostgreSQL database.

```python
doc.insert(
    ignore_permissions=False,
    ignore_links=False,
    ignore_if_duplicate=False,
    ignore_mandatory=False
)
```

- Triggers `before_insert`, `autoname`, `before_validate`, `validate`, `before_save`, DB INSERT, `after_insert`, `on_update` hooks.

---

### `doc.save()`

Saves changes on an existing document to the database.

```python
doc.subject = "Updated Task Subject"
doc.save(ignore_permissions=True)
```

- Triggers `before_validate`, `validate`, `before_save`, DB UPDATE, `on_update` hooks.

---

### `doc.submit()` & `doc.cancel()`

Applies workflow state transitions on Submittable DocTypes.

```python
# Submit draft document (docstatus: 0 -> 1)
doc.submit()

# Cancel submitted document (docstatus: 1 -> 2)
doc.cancel()
```

---

### `doc.db_set()`

Updates a specific field directly in database without triggering full document validation lifecycles.

```python
# Fast atomic database field update
doc.db_set("status", "Closed", update_modified=True)
```

> [!WARNING]
> `doc.db_set()` bypasses `validate()` and `on_update()` controller hooks! Use only when document validations are not required.

---

### Key Inspection & Helper Methods

| Method | Return Type | Description |
| :--- | :--- | :--- |
| `doc.is_new()` | `bool` | Returns `True` if document is not yet saved to database |
| `doc.is_dirty()` | `bool` | Returns `True` if document fields have unsaved memory edits |
| `doc.has_value_changed(fieldname)` | `bool` | Checks if field value changed compared to DB value |
| `doc.get_doc_before_save()` | `Document` | Returns immutable snapshot of document state prior to `save()` |
| `doc.as_dict()` | `dict` | Serializes document and child tables to plain Python dictionary |
| `doc.append(fieldname, dict_values)` | `Document` | Appends a new child table row to `fieldname` |

```python
# Child table append example
doc.append("items", {
    "item_code": "CPU-INTEL-I9",
    "qty": 2,
    "rate": 450.00
})
doc.save()
```

---

## 3. Save, Submit & Cancel Execution Lifecycles

```
               ┌──────────────────────────────┐
               │         doc.insert()         │
               └──────────────┬───────────────┘
                              │
                              ▼
                   1. doc.before_insert()
                              │
                              ▼
                   2. doc.autoname()
                              │
                              ▼
               ┌──────────────┴───────────────┐
               │          doc.save()          │
               └──────────────┬───────────────┘
                              │
                              ▼
                   3. doc.before_validate()
                              │
                              ▼
                   4. doc.validate()
                              │
                              ▼
                   5. doc.before_save()
                              │
                              ▼
                   6. --- DB INSERT / UPDATE ---
                              │
                              ▼
                   7. doc.after_insert() (Only on insert)
                              │
                              ▼
                   8. doc.on_update()
```

---

## Related Topics

- [05. DocTypes & Fields](/05-doctypes/)
- [07. Controllers & Events](/07-controllers/)
- [10. Database API](/10-database/)
