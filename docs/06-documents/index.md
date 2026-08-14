---
title: Document API & Document Lifecycle in Frappe v15
description: Complete reference for Frappe Document ORM methods - get_doc, get_last_doc, get_docs, insert, save, submit, cancel, delete, rename_doc, db_set, as_dict, reload, notify_update, add_seen, add_viewed, and execution lifecycles.
version: v15
category: DocTypes & Data Modeling
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge server">Server Only</span> <span class="badge stable">Stable</span> Document API & Lifecycle

The Document API (`frappe.model.document.Document`) is Frappe Framework's Object-Relational Mapping (ORM) interface. It combines database persistence, controller lifecycle hooks, permissions, and audit logging into a single unified object.

---

## 1. Document Instantiation APIs

### `frappe.get_doc`

<span class="badge server">Server Only</span> <span class="badge stable">Stable</span>

Fetches an existing document from the database **or** instantiates a new document in memory. Raises `frappe.DoesNotExistError` if the specified record is not found.

There are **three** distinct call patterns:

#### Pattern 1: Fetch an existing document by name

```python
# Fetches the Task record with name 'TASK00002' from the database
doc = frappe.get_doc('Task', 'TASK00002')
doc.title = 'Updated Title'
doc.save()
```

#### Pattern 2: Fetch a Single DocType (no `name` required)

```python
# Single DocTypes (like System Settings) do not have multiple rows
doc = frappe.get_doc('System Settings')
print(doc.timezone)  # e.g., 'Asia/Kolkata'
```

#### Pattern 3: Create a new unsaved document from a dict

```python
# Returns a new Document object in memory — does NOT hit the database yet
doc = frappe.get_doc({
    'doctype': 'Task',
    'title': 'New Task',
    'status': 'Open'
})
doc.insert()
```

#### Pattern 4: Create a new unsaved document via keyword arguments

```python
# Alternative new-document creation using keyword args
user = frappe.get_doc(doctype='User', email_id='test@example.com')
user.insert()
```

#### Optional: Row-Level Locking (`for_update`)

Pass `for_update=True` to acquire a database-level `SELECT ... FOR UPDATE` row lock. This prevents other transactions from modifying the same record concurrently — critical for financial or inventory operations.

```python
# Lock the row during this transaction to prevent race conditions
doc = frappe.get_doc('Sales Invoice', 'SINV-2026-00001', for_update=True)
doc.status = 'Paid'
doc.save()
# Row lock is released when the transaction commits or rolls back
```

---

### `frappe.get_last_doc`

<span class="badge server">Server Only</span> <span class="badge stable">Stable</span>

Returns the **most recently created** Document object for the specified DocType. Useful for fetching the latest record without knowing its name.

```python
# Get the most recently created Task
task = frappe.get_last_doc('Task')
print(task.name)

# Filter to get the last Cancelled Task
task = frappe.get_last_doc('Task', filters={"status": "Cancelled"})

# Use a custom field for ordering instead of 'creation'
task = frappe.get_last_doc(
    'Task',
    filters={"status": "Cancelled"},
    order_by="approved_on desc"   # Use your custom datetime field
)
```

---

### `frappe.new_doc`

<span class="badge server">Server Only</span> <span class="badge stable">Stable</span>

Initializes a new Document instance with default values from the DocType schema. Equivalent to creating a new form in the Desk UI.

```python
task = frappe.new_doc('Task')
task.title = 'Setup Monitoring Alerts'
task.priority = 'High'
task.insert()
```

---

### `frappe.get_cached_doc`

<span class="badge server">Server Only</span> <span class="badge stable">Stable</span>

Retrieves a document from Redis memory cache first. If not found in cache, queries the database and stores the result in cache for subsequent calls. Ideal for Settings documents and reference master data that are read frequently.

```python
# High-performance retrieval for frequently-read configuration documents
company = frappe.get_cached_doc("Company", "My Acme Corp")
print(company.default_currency)  # Served from Redis on subsequent calls
```

---

### `frappe.get_docs`

<span class="badge server">Server Only</span> <span class="badge stable">Stable</span>

Returns a **list of Document objects** matching the given filters. Use `as_iterator=True` to process large datasets in memory-efficient chunks, preventing out-of-memory errors.

```python
# Fetch up to 10 Open tasks as full Document objects
tasks = frappe.get_docs('Task', filters={'status': 'Open'}, limit=10)

for task in tasks:
    task.status = "Closed"
    task.save()

# Efficiently iterate through a large dataset in chunks of 500
# Each 'lead' is a full Document instance with child tables loaded
leads = frappe.get_docs('Lead', as_iterator=True, chunk_size=500)

for lead in leads:
    lead.process_lead()  # Custom controller method
```

---

## 2. Document Instance Methods

Given an instantiated `doc = frappe.get_doc(...)` or `doc = frappe.new_doc(...)`:

### `doc.insert()`

Inserts a new document record into the database. Triggers the full insert lifecycle chain.

```python
doc.insert(
    ignore_permissions=False,  # If True, bypasses user permission checks
    ignore_links=False,        # If True, skips validation that linked docs exist
    ignore_if_duplicate=False, # If True, silently skips insert on DuplicateEntryError
    ignore_mandatory=False     # If True, inserts even if mandatory fields are empty
)
```

**Lifecycle hooks triggered on insert:**
`before_insert` → `before_naming` → `autoname` → `before_validate` → `validate` → `before_save` → **DB INSERT** → `after_insert` → `on_update`

---

### `doc.save()`

Saves changes to an existing document. Triggers validation and update lifecycle hooks.

```python
doc.title = "Updated Task Title"
doc.save(
    ignore_permissions=False,  # If True, bypasses write permission checks
    ignore_version=False       # If True, skips creating a Version record
)
```

**Lifecycle hooks triggered on save:** `before_validate` → `validate` → `before_save` → **DB UPDATE** → `on_update`

---

### `doc.submit()` & `doc.cancel()`

Applies workflow state transitions on Submittable DocTypes (`docstatus: 0 → 1` for submit, `1 → 2` for cancel).

```python
# Submit a draft document (docstatus: 0 -> 1)
doc.submit()

# Cancel a submitted document (docstatus: 1 -> 2)
doc.cancel()
```

---

### `doc.delete()`

Deletes the document from the database. Also deletes linked child tables, Communication records, Comments, and Attachments. This is an alias to `frappe.delete_doc`.

```python
doc = frappe.get_doc('Task', 'TASK-2026-00001')
doc.delete()
```

---

### `doc.db_set()`

Updates a specific field directly in the database without triggering the full document validation lifecycle. Fast and atomic — ideal for status updates or flag changes.

```python
# Basic field update — also updates the 'modified' timestamp
doc.db_set('status', 'Closed')

# Multiple fields in one query using a dict
doc.db_set({'status': 'Closed', 'priority': 'Low'})

# Trigger notify_update() so connected clients refresh their form
doc.db_set('status', 'Closed', notify=True)

# Also run frappe.db.commit() immediately after the update
doc.db_set('status', 'Closed', commit=True)

# Prevent updating the 'modified' timestamp
doc.db_set('status', 'Closed', update_modified=False)
```

> [!WARNING]
> `doc.db_set()` **bypasses** `validate()`, `before_save()`, and `on_update()` controller hooks. Use only when you intentionally want to skip the full lifecycle — for example, during data migrations or setting computed status fields.

---

### `doc.reload()`

Fetches the latest field values directly from the database and updates the in-memory document instance. Use this when another part of your code (or another request) may have changed the document in the database while you are still holding a reference.

```python
doc = frappe.get_doc('Task', 'TASK-2026-00001')

# ... some other code modifies the same row in the DB ...

# Refresh the in-memory doc to reflect the latest DB state
doc.reload()
print(doc.status)  # Now reflects the latest value from the database
```

---

### `doc.notify_update()`

Publishes a real-time WebSocket event to all connected Desk clients viewing this document, signaling them to refresh their form. This is how Frappe achieves live collaboration in the Desk UI.

```python
# After a background job updates the document, notify the UI to refresh
doc.db_set('progress_percent', 85, update_modified=False)
doc.notify_update()
# Result: Any user currently viewing this document in Desk will see their form refresh
```

---

### `doc.get_url()`

Returns the Desk URL for this document. Useful for generating links in emails, notifications, or log messages.

```python
doc = frappe.get_doc('Task', 'TASK-2026-00001')
url = doc.get_url()
print(url)
# Output: /app/task/TASK-2026-00001
```

---

### Key Inspection & Helper Methods

| Method | Return Type | Description |
| :--- | :--- | :--- |
| `doc.is_new()` | `bool` | Returns `True` if document has not yet been saved to the database |
| `doc.is_dirty()` | `bool` | Returns `True` if in-memory field values differ from the last saved state |
| `doc.has_value_changed(fieldname)` | `bool` | Returns `True` if the specified field changed compared to its DB value before save |
| `doc.get_doc_before_save()` | `Document` | Returns a snapshot of the document's state **before** the current `save()` call |
| `doc.as_dict()` | `dict` | Serializes the document and all child table rows into a plain Python dictionary |
| `doc.append(fieldname, dict)` | `Document` | Appends a new child table row to the specified child table field |
| `doc.get_field(fieldname)` | `DocField` | Returns the DocField metadata object for the given field |
| `doc.run_method(method, *args)` | `Any` | Programmatically invokes a named controller method (also triggers hooks) |
| `doc.check_permission(permtype)` | `None` | Raises `PermissionError` if the current user lacks the specified permission |
| `doc.get_db_value(fieldname)` | `Any` | Reads a single field value directly from the database, bypassing in-memory cache |
| `doc.get_formatted(fieldname)` | `str` | Returns a human-formatted string of the field value (e.g., currency `$500.00`) |
| `doc.get_title()` | `str` | Returns the document title based on `title_field`, or falls back to `name` |
| `doc.add_comment(type, text)` | `Document` | Appends a timeline comment to the document |
| `doc.add_tag(tag)` | `None` | Attaches a tag string to the document |
| `doc.remove_tag(tag)` | `None` | Removes an attached tag string from the document |
| `doc.get_tags()` | `list` | Returns a **list** of tag strings attached to the document |
| `doc.queue_action(action, **kwargs)` | `None` | Enqueues a controller action (e.g., `'submit'`, `'cancel'`) as a background job |

```python
# 1. Append a child table row and save
doc.append("items", {
    "item_code": "CPU-INTEL-I9",
    "qty": 2,
    "rate": 450.00
})
doc.save()

# 2. Convert document instance to plain dictionary
doc_dict = doc.as_dict()
# Output: {"name": "TASK-2026-00001", "doctype": "Task", "title": "Deploy Server", ...}

# 3. Check if a field changed since last save
if doc.has_value_changed("status"):
    old_doc = doc.get_doc_before_save()
    print(f"Status changed from {old_doc.status} to {doc.status}")

# 4. Add a comment and tags
doc.add_comment("Comment", "Reviewed architecture specs with team.")
doc.add_tag("High-Priority")
doc.add_tag("Reviewed")
tags = doc.get_tags()
print(tags)  # Output: ['High-Priority', 'Reviewed']  <- a list, not a string!
```

---

## 3. Tracking Document Views & Seen Status

### `doc.add_seen(user=None)`

Adds a user to the list of users who have **seen** this document. Updates the `_seen` column (stored as a JSON array). If no user is passed, defaults to the current session user.

> Only works if **Track Seen** is enabled in the DocType settings.

```python
# Mark the current session user as having seen this document
doc.add_seen()

# Mark a specific user as having seen this document
doc.add_seen('john@company.com')
```

---

### `doc.add_viewed(user=None)`

Adds a **view log** entry when a user opens the document form. If no user is passed, defaults to the current session user.

> Only works if **Track Views** is enabled in the DocType settings.

```python
# Log a view by the current session user
doc.add_viewed()

# Log a view by a specific user
doc.add_viewed('john@company.com')
```

---

## 4. Document Flags (`doc.flags`)

Flags are temporary runtime properties set on a Document instance to control behaviour during `insert()`, `save()`, `submit()`, or `cancel()`. They are **never persisted** to the database.

| Flag Name | Description |
| :--- | :--- |
| `doc.flags.ignore_permissions` | Bypasses user permission checks — use in background jobs or migration scripts |
| `doc.flags.ignore_mandatory` | Suppresses errors for empty mandatory fields — use for partial data migrations |
| `doc.flags.ignore_links` | Skips validation that all `Link` field targets exist in the database |
| `doc.flags.ignore_validate` | Bypasses `validate()` and `before_save()` controller hooks entirely |
| `doc.flags.ignore_if_duplicate` | Silently skips duplicate primary key insertion instead of raising an error |
| `doc.flags.in_insert` | Read-only flag set by the engine while `insert()` is executing |
| `doc.flags.in_update` | Read-only flag set by the engine while `save()` is executing |

```python
# Create a document programmatically without session permission or mandatory checks
task = frappe.new_doc("Task")
task.title = "System Automated Maintenance Task"

task.flags.ignore_permissions = True
task.flags.ignore_mandatory = True

task.insert()
print("Created Task:", task.name)
# Output: Created Task: TASK-2026-00042
```

---

## 5. Model-Level Helper Functions

### `frappe.rename_doc`

Renames the primary key (`name`) of a document and automatically updates all foreign key references in linked tables throughout the database.

> [!IMPORTANT]
> `frappe.rename_doc` requires the **"Allow Rename"** checkbox to be enabled on the target DocType in the DocType Form. Without it, the rename will be blocked. Use `ignore_permissions=True` to bypass this check in scripts.

```python
# Signature:
# frappe.rename_doc(doctype, old_name, new_name, merge=False, ignore_permissions=False)

new_name = frappe.rename_doc(
    "Customer",
    "Acme Inc",           # old_name
    "Acme International", # new_name
    merge=False,          # If True, merges into an existing record with new_name
    ignore_permissions=True
)
print("Updated Primary Key:", new_name)
# Output: Updated Primary Key: Acme International
```

> [!NOTE]
> If `merge=True` and a record with `new_name` already exists, the old record's data is merged into it. Use with caution.

---

### `frappe.delete_doc`

Programmatically deletes a document, removes its child table rows, deletes linked file attachments, and logs the deletion.

```python
# Signature:
# frappe.delete_doc(doctype, name, force=0, ignore_permissions=False)

frappe.delete_doc(
    "Task",
    "TASK-2026-00042",
    force=True,              # Ignore docstatus checks (e.g. delete submitted docs)
    ignore_permissions=True  # Bypass permission check
)

# Or use the instance method equivalent:
doc = frappe.get_doc("Task", "TASK-2026-00042")
doc.delete()
```

> [!WARNING]
> `frappe.delete_doc` (or `doc.delete()`) permanently removes the database row. For recoverable deletion, enable the **Deleted Document** feature on the DocType.

---

### `frappe.model.naming.make_autoname`

Generates auto-incremented or formatted primary keys based on naming rules.

```python
from frappe.model.naming import make_autoname

# Format: PREFIX-YYYY-MM-.##### (incrementing counter)
new_name = make_autoname("INV-.YYYY.-.MM.-.#####")
print(new_name)
# Output: INV-2026-08-00001
```

---

### `frappe.model.mapper.get_mapped_doc`

Maps fields from a source document to create a new target document based on a field mapping dictionary. Commonly used to convert a Sales Order to a Sales Invoice.

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
# Output: Mapped Target DocType: Sales Invoice
```

---

## 6. Complete Insert & Save Lifecycle Diagrams

### `doc.insert()` — Full Lifecycle

```
                ┌────────────────────────────┐
                │        doc.insert()         │
                └─────────────┬──────────────┘
                              │
                              ▼
                   1. doc.before_insert()
                              │
                              ▼
                   2. doc.before_naming()     ← Sets up fields used in autoname
                              │
                              ▼
                   3. doc.autoname()          ← Resolves doc.name primary key
                              │
                              ▼
                   4. doc.before_validate()
                              │
                              ▼
                   5. doc.validate()
                              │
                              ▼
                   6. doc.before_save()
                              │
                              ▼
                   7. ── DB INSERT ──
                              │
                              ▼
                   8. doc.after_insert()     ← doc.is_new() is now False
                              │
                              ▼
                   9. doc.on_update()
```

### `doc.save()` — Lifecycle (Existing Document)

```
                ┌────────────────────────────┐
                │         doc.save()          │
                └─────────────┬──────────────┘
                              │
                              ▼
                   1. doc.before_validate()
                              │
                              ▼
                   2. doc.validate()
                              │
                              ▼
                   3. doc.before_save()
                              │
                              ▼
                   4. ── DB UPDATE ──
                              │
                              ▼
                   5. doc.on_update()
```

---

## 5. Additional Document Helper APIs

### `frappe.copy_doc`

Creates an in-memory duplicate of an existing document without saving it to the database.

```python
existing_doc = frappe.get_doc("Task", "TASK-00001")
new_doc = frappe.copy_doc(existing_doc, ignore_no_copy=True)
new_doc.subject = "Cloned Task"
new_doc.insert()
```

---

### `doc.queue_action`

Enqueues a submittable document action (such as `submit`, `cancel`, `update_after_submit`) to run asynchronously in a background worker queue.

```python
doc = frappe.get_doc("Sales Invoice", "ACC-SINV-2026-00001")
doc.queue_action("submit", timeout=300)
```

---

### `doc.is_dirty` & `doc.get_doc_before_save`

Track changes made to a document in memory before committing to the database.

```python
doc = frappe.get_doc("Task", "TASK-00001")
doc.subject = "Modified Subject"

if doc.is_dirty():
    old_doc = doc.get_doc_before_save()
    print("Old Subject:", old_doc.subject if old_doc else "Not saved yet")
    print("Has subject changed?:", doc.has_value_changed("subject"))
```

---

### `doc.append` & `doc.remove`

Programmatically add or remove child table rows on a document object.

```python
doc = frappe.get_doc("Sales Order", "SO-2026-00001")

# Add a child table row
new_row = doc.append("items", {
    "item_code": "ITEM-001",
    "qty": 5,
    "rate": 100
})

# Remove a specific child row
doc.remove(new_row)
doc.save()
```

---

### `doc.run_method` & `doc.check_permission`

Invoke controller methods or explicitly enforce security permissions on a document instance.

```python
doc = frappe.get_doc("Task", "TASK-00001")

# Raises PermissionError if current user lacks 'write' permission
doc.check_permission("write")

# Execute a custom method defined on the controller class
doc.run_method("custom_recalculate_totals")
```

---

### `doc.add_comment`

Appends a comment entry to a document's activity timeline.

```python
doc = frappe.get_doc("Task", "TASK-00001")
doc.add_comment("Comment", "Reviewed and verified order details.")
```

---

## Related Topics

- [05. DocTypes & Fields](/05-doctypes/)
- [07. Controllers & Events](/07-controllers/)
- [10. Database API](/10-database/)
