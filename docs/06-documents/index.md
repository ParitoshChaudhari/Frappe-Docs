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
| `doc.run_method(method, *args)` | `Any` | Programmatically executes a method on the document instance |
| `doc.get_db_value(fieldname)` | `Any` | Reads single field directly from DB disk bypassing memory cache |
| `doc.get_formatted(fieldname)` | `str` | Returns human-formatted string of field (e.g. currency `$500.00`) |
| `doc.add_comment(type, text)` | `Document` | Appends timeline comment (e.g., `'Comment'`, `'Info'`, `'Assigned'`) |
| `doc.add_tag("Urgent")` | `None` | Attaches a tag string to document |
| `doc.remove_tag("Urgent")` | `None` | Removes tag string from document |
| `doc.get_tags()` | `str` | Returns comma-separated string of assigned tags |
| `doc.queue_action(action)` | `None` | Enqueues action (e.g., `'submit'`, `'cancel'`) for background worker |

```python
# 1. Child table append example
doc.append("items", {
    "item_code": "CPU-INTEL-I9",
    "qty": 2,
    "rate": 450.00
})
doc.save()

# 2. Convert document instance to dictionary
doc_dict = doc.as_dict()
# Output:
# {
#     "name": "TASK-2026-00001",
#     "doctype": "Task",
#     "subject": "Deploy Production Server",
#     "status": "Open",
#     "items": [{"item_code": "CPU-INTEL-I9", "qty": 2, "rate": 450.0}]
# }

# 3. Add timeline comment and tag
doc.add_comment("Comment", "Reviewed architecture specs with team.")
doc.add_tag("High-Priority")
print("Tags:", doc.get_tags())
# Output:
# Tags: High-Priority
```

---

## 3. Document Flags (`doc.flags`)

Flags are temporary runtime properties set on a Document instance (`doc.flags.<flag_name> = True`) to control document behavior during `insert()`, `save()`, `submit()`, or `cancel()`. Flags are **not saved** to the database.

| Flag Name | Description / When to Use |
| :--- | :--- |
| `doc.flags.ignore_permissions` | Bypasses user permission checks. Allows background tasks/scripts to save/submit documents without permission errors. |
| `doc.flags.ignore_mandatory` | Suppresses errors for missing mandatory fields. Useful for saving partial drafts during data migration. |
| `doc.flags.ignore_links` | Skips validation checking if linked document primary keys exist in database. |
| `doc.flags.ignore_validate` | Bypasses execution of controller `validate()` and `before_save()` hooks. |
| `doc.flags.ignore_if_duplicate` | Silently ignores duplicate primary key insertion instead of throwing `DuplicateEntryError`. |
| `doc.flags.in_insert` | Read-only flag set automatically by engine while document is executing `insert()`. |
| `doc.flags.in_update` | Read-only flag set automatically by engine while document is updating. |

### Example: Bypassing Permissions and Mandatory Validation

```python
# Create task programmatically without user session permissions
task = frappe.new_doc("Task")
task.subject = "System Automated Maintenance"

# Set runtime flags
task.flags.ignore_permissions = True
task.flags.ignore_mandatory = True

task.insert()
print("Created Task:", task.name)
# Output:
# Created Task: TASK-2026-00042
```

---

## 4. Model Helper APIs (`frappe.model.*`)

Frappe provides utility functions under the `frappe.model` module for naming, mapping, deleting, and renaming documents across the database.

---

### `frappe.model.naming.make_autoname`

Generates auto-incremented or formatted primary keys based on naming rules.

#### Example

```python
from frappe.model.naming import make_autoname

# Format rule: PREFIX-YYYY-MM-.#####
new_name = make_autoname("INV-.2026.-.MM.-.#####")
print("Generated Name:", new_name)
# Output:
# Generated Name: INV-2026-08-00001
```

---

### `frappe.model.mapper.get_mapped_doc`

Maps values from a source document to create a target document based on a mapping rule dictionary (used for converting Sales Orders to Sales Invoices, etc.).

#### Syntax & Example

```python
from frappe.model.mapper import get_mapped_doc

doc = get_mapped_doc("Sales Order", "SO-2026-00001", {
    "Sales Order": {
        "doctype": "Sales Invoice",
        "field_map": {
            "name": "sales_order"
        }
    },
    "Sales Order Item": {
        "doctype": "Sales Invoice Item",
        "field_map": {
            "parent": "sales_order"
        }
    }
})

print("Mapped Target DocType:", doc.doctype)
print("Items Count:", len(doc.items))
# Output:
# Mapped Target DocType: Sales Invoice
# Items Count: 3
```

---

### `frappe.model.delete_doc`

Programmatically deletes a document, removes linked child tables, deletes file attachments, and handles trash logs.

```python
frappe.model.delete_doc(
    doctype="Task",
    name="TASK-2026-00042",
    force=True,                 # Ignore status checks
    ignore_permissions=True,    # Bypass permission check
    delete_permanently=False    # Move to Deleted Document log
)
# Output:
# Removes TASK-2026-00042 from DB and creates record in Deleted Document
```

---

### `frappe.model.rename_doc`

Renames the primary key (`name`) of a document and automatically updates foreign key references in all linked tables throughout MariaDB.

```python
new_name = frappe.model.rename_doc(
    doctype="Customer",
    old="Acme Inc",
    new="Acme International",
    merge=False,                # If True, merges record into existing target
    ignore_permissions=True
)
print("Updated Primary Key:", new_name)
# Output:
# Updated Primary Key: Acme International
```

---

## 5. Save, Submit & Cancel Execution Lifecycles

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

