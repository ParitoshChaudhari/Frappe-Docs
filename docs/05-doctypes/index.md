---
title: DocTypes, Fields & Naming in Frappe v15
description: Complete guide to Frappe DocTypes, 30+ field types, field configuration properties, and document auto-naming conventions.
version: v15
category: DocTypes & Data Modeling
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> DocTypes, Fields & Naming Rules

In Frappe Framework v15, a **DocType** (Document Type) is the foundational model definition. It describes both the MariaDB/PostgreSQL database table schema and the auto-generated client Desk form UI.

---

## 1. DocType Classifications

Frappe supports 5 primary DocType classifications:

| Classification | DB Table | Purpose & Description | Example |
| :--- | :--- | :--- | :--- |
| **Standard DocType** | `tab<DocType>` | Standard record entities supporting multiple persistent document instances. | `Task`, `Customer`, `User` |
| **Submittable DocType** | `tab<DocType>` | Documents supporting immutable workflow state (`0: Draft`, `1: Submitted`, `2: Cancelled`). | `Sales Invoice`, `Purchase Order` |
| **Child Table** | `tab<DocType>` | Embedded sub-records parented to a main DocType. | `Sales Invoice Item`, `Task Assignee` |
| **Single DocType** | Single row in `tabSingles` | System-wide settings or configuration dashboards (no dedicated DB table). | `System Settings`, `Global Defaults` |
| **Virtual DocType** | None | Data source backed by external REST APIs, S3, or SQLite (`is_virtual=1`). | `Stripe Customer`, `S3 File Log` |

---

### Virtual DocTypes (`is_virtual=1`)

Virtual DocTypes allow developers to create standard Frappe forms and lists that interact with external data sources without creating database tables in MariaDB.

To create a Virtual DocType, enable **Is Virtual** in the DocType schema and override standard ORM methods in your Python class:

```python
import frappe
import requests
from frappe.model.document import Document

class ExternalTask(Document):
    def db_insert(self, *args, **kwargs):
        # Called when inserting new record -> POST to external API
        res = requests.post("https://api.external.com/v1/tasks", json=self.as_dict())
        self.name = res.json().get("id")

    def load_from_db(self):
        # Called when fetching single record -> GET from external API
        res = requests.get(f"https://api.external.com/v1/tasks/{self.name}")
        data = res.json()
        super(Document, self).__init__(data)

    def db_update(self, *args, **kwargs):
        # Called when saving changes -> PUT/PATCH external API
        requests.put(f"https://api.external.com/v1/tasks/{self.name}", json=self.as_dict())

    def delete(self):
        # Called when deleting record -> DELETE external API
        requests.delete(f"https://api.external.com/v1/tasks/{self.name}")
```

---

### Tree DocTypes (`is_tree=1`)

Tree DocTypes represent hierarchical parent-child trees (such as Chart of Accounts or Territory Tree) using nested set storage (`lft`, `rgt`, `is_group`, `parent_field`, `old_parent`).

---

## 2. Frappe Field Types Reference

Frappe v15 provides over 35 built-in field types:

### Relational & Link Fields

| Field Type | DB Type | Description & Example |
| :--- | :--- | :--- |
| `Link` | `VARCHAR(140)` | Foreign key link to another DocType. Options set to linked DocType name. |
| `Dynamic Link` | `VARCHAR(140)` | Polymorphic link where target DocType is specified dynamically by another field. |
| `Table` | — | Embedded sub-table (Child Table). Options set to Child DocType name. |
| `Table MultiSelect` | — | Multi-select pill selector backed by a child table schema. |

### Text & String Fields

| Field Type | DB Type | Description |
| :--- | :--- | :--- |
| `Data` | `VARCHAR(140)` | Standard single-line text input |
| `Select` | `VARCHAR(140)` | Dropdown list. Options populated with newline-separated strings |
| `Small Text` | `TEXT` | Multi-line plain text area |
| `Text` | `LONGTEXT` | Large plain text area |
| `Text Editor` | `LONGTEXT` | Rich text HTML editor (Quill / TipTap) |
| `Code` | `LONGTEXT` | Code editor with syntax highlighting (Monaco / Ace) |
| `Markdown Editor`| `LONGTEXT` | Markdown editor with live HTML preview |
| `Password` | `TEXT` | Encrypted password storage |

### Numeric & Currency Fields

| Field Type | DB Type | Description |
| :--- | :--- | :--- |
| `Int` | `BIGINT` | Integer value |
| `Float` | `DECIMAL(21, 9)` | Floating point number |
| `Currency` | `DECIMAL(21, 9)` | Formatted monetary value bound to currency symbol |
| `Percent` | `DECIMAL(21, 9)` | Percentage value |
| `Rating` | `DECIMAL(3, 2)` | Star rating input (1 to 5 stars) |
| `Duration` | `DECIMAL(21, 9)` | Time duration input (e.g. `2d 4h 30m`) |
| `Check` | `INT(1)` | Boolean checkbox (`0` or `1`) |

### Date, Time & Media Fields

| Field Type | DB Type | Description |
| :--- | :--- | :--- |
| `Date` | `DATE` | ISO date picker (`YYYY-MM-DD`) |
| `Time` | `TIME` | Time picker (`HH:mm:ss`) |
| `Datetime` | `DATETIME` | Date and time picker |
| `Attach` | `TEXT` | File upload attachment path |
| `Attach Image` | `TEXT` | Image upload attachment path with preview |
| `Signature` | `LONGTEXT` | Base64 canvas signature input |
| `Color` | `VARCHAR(140)` | Hex color picker |
| `Geolocation` | `LONGTEXT` | Leaflet map geo-JSON coordinates picker |
| `Barcode` | `VARCHAR(140)` | Barcode / QR Code scanner field |

### Layout & Structural Fields

| Field Type | DB Type | Description |
| :--- | :--- | :--- |
| `Section Break` | — | Group fields into horizontal sections (can collapse/expand) |
| `Column Break` | — | Splitting fields inside a Section into columns |
| `Tab Break` | — | Multi-tab form layout navigation |
| `HTML` | — | Dynamic custom HTML container rendered on form |
| `Button` | — | Form field button executing client script triggers |
| `Fold` | — | Hide preceding fields behind a "More Info" expander |

---

## 3. Core Field Properties & Attributes

Field behaviors are controlled via JSON metadata attributes:

```json
{
  "fieldname": "customer_email",
  "fieldtype": "Data",
  "label": "Customer Email",
  "reqd": 1,
  "unique": 1,
  "read_only": 0,
  "hidden": 0,
  "fetch_from": "customer.email_id",
  "depends_on": "eval:doc.status=='Closed'",
  "in_list_view": 1,
  "in_standard_filter": 1
}
```

- `reqd` (`1`/`0`): Mandatory field validation.
- `read_only` (`1`/`0`): Prevents client edit.
- `hidden` (`1`/`0`): Hides field from desk form.
- `fetch_from`: Automates fetching linked document field (`<link_fieldname>.<remote_fieldname>`).
- `fetch_if_empty`: Only populates fetched value if local field is empty.
- `depends_on`: JS evaluation string for dynamic visibility (`eval:doc.amount > 5000`).
- `mandatory_depends_on`: JS evaluation string for dynamic mandatory requirement.
- `read_only_depends_on`: JS evaluation string for dynamic read-only toggling.
- `in_list_view` (`1`/`0`): Displays column in Desk ListView table.
- `unique` (`1`/`0`): Enforces database-level unique constraint.

---

## 4. Document Auto-Naming Rules (`autoname`)

Every document in Frappe is uniquely identified by its `name` primary key column (`VARCHAR(140)`). The `autoname` property dictates how document names are generated:

### Option 1: Naming Series (`naming_series:`)

Generates incremental document names based on prefixes:

```text
# DocType JSON attribute:
"autoname": "naming_series:"

# Default Naming Series format:
TSK-.YYYY.-.#####
# Result: TSK-2026-00001, TSK-2026-00002
```

### Option 2: Field-Based Naming (`field:<fieldname>`)

Uses the slugified value of a specific field:

```text
"autoname": "field:subject"
# Input subject: "Fix Login Bug" -> name: "Fix Login Bug"
```

### Option 3: Expression Naming (`format:`)

Formats name using date tokens and field variables:

```text
"autoname": "format:TASK-{YYYY}-{MM}-{customer_code}-.#####"
# Result: TASK-2026-08-CUST01-00001
```

### Option 4: Prompt Naming (`prompt`)

Prompts the user to manually enter a unique `name` string when creating a new document.

### Option 5: Programmatic Naming (`autoname()` Controller Method)

Override `autoname(self)` in your Document controller Python class:

```python
import frappe
from frappe.model.document import Document

class CustomTask(Document):
    def autoname(self):
        # Programmatic custom primary key logic
        prefix = f"TASK-{self.priority.upper()}"
        count = frappe.db.count("Custom Task", {"priority": self.priority}) + 1
        self.name = f"{prefix}-{count:05d}"
```

---

## Related Topics

- [06. Document API & Lifecycle](/06-documents/)
- [07. Controllers & Events](/07-controllers/)
- [12. Child Tables](/12-child-tables/)

