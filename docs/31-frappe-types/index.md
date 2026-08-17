---
title: Frappe Data Types & Custom Containers Reference (frappe._dict, Document, DF & Type System)
description: Complete technical reference for Python types, custom containers, and type hints in Frappe Framework v15. Covers frappe._dict, Document, DF stubs, frappe.local context, ORM return types, utility primitives, and production type annotation patterns with comprehensive code examples.
version: v15
category: Server-Side Python APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge server">Server Only</span> <span class="badge stable">Stable</span> Frappe Data Types & Custom Containers Reference

Frappe Framework introduces specialized Python data types, container classes, and utility primitives designed to make server-side code **cleaner**, **null-safe**, and **type-safe**. 

This document provides an exhaustive breakdown of every custom type in Frappe—explaining **what** it is, **why** to use it over standard Python types, **how** to use it, **when** to use it, and concrete code examples for each.

---

## 1. Frappe Type System Matrix Overview

| Frappe Type / Class | Module Path | Inherits From | Core Purpose | Access Syntax | Null / Missing Key Safety |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`frappe._dict`** | `frappe._dict` (or `frappe.dict`) | `dict` | Dot-accessible dictionary for dynamic key-value payloads. | `d.key` or `d["key"]` | 🟢 Safe (returns `None` on attribute access `d.key`) |
| **`Document`** | `frappe.model.document.Document` | `BaseDocument` | Core ORM class for database records with field attributes & lifecycle hooks. | `doc.field_name` | 🟡 Raises `AttributeError` if field is invalid |
| **`BaseDocument`** | `frappe.model.base_document.BaseDocument` | `object` | Lightweight document parent class used internally for unsaved child table rows. | `doc.field_name` | 🟡 Minimal validation |
| **`frappe.form_dict`** | `frappe.local.form_dict` | `frappe._dict` | Thread-local container holding incoming HTTP GET/POST request parameters. | `frappe.form_dict.param` | 🟢 Safe (returns `None` if param missing) |
| **`frappe.local`** | `frappe.local` | `Local` (Werkzeug) | Thread-local context wrapper holding site context, active user, DB connection. | `frappe.local.site` | 🔴 Raises `AttributeError` if key unset |
| **`DF` Type Stubs** | `frappe.types.DF` | — | Synthetic IDE type annotations (`DF.Data`, `DF.Link`, `DF.Table[T]`). | Visual IDE Hints | 🟢 Static analysis only (Mypy/Pyright) |
| **`cint` / `flt` / `cstr`** | `frappe.utils` | `int`, `float`, `str` | Null-safe type casting functions for numbers and strings. | `cint(val)` | 🟢 Safe (converts `None` to `0`, `0.0`, `""`) |

---

## 2. Deep Dive: `frappe._dict` (Dot-Accessible Dictionary)

### What is `frappe._dict`?

`frappe._dict` is a specialized dictionary subclass provided by Frappe Framework. It extends the standard Python dictionary (`dict`) by overriding `__getattr__`, `__setattr__`, `__delattr__`, `.copy()`, and serialization methods to allow accessing dictionary keys as if they were **object attributes** using dot notation (`d.key`).

```python
import frappe

# Standard Python dict:
standard_dict = {"item_code": "ITEM-001", "qty": 10}
# print(standard_dict.item_code) # ❌ AttributeError!
# print(standard_dict["warehouse"]) # ❌ KeyError!

# Frappe _dict:
frappe_dict = frappe._dict({"item_code": "ITEM-001", "qty": 10})
print(frappe_dict.item_code) # ✅ Output: "ITEM-001"
print(frappe_dict.warehouse) # ✅ Output: None (No KeyError!)
```

---

### Why use `frappe._dict` instead of standard `dict`?

1. **Eliminates `KeyError` Crashes**: When querying dynamic database fields or parsing API responses, accessing missing keys with standard dict bracket access `d["key"]` throws a `KeyError` if the key isn't present. With `frappe._dict`, accessing `d.key` returns `None` safely.
2. **Cleaner, Idiomatic Code**: Avoids wrapping every dictionary field read in `.get()` (e.g. `data.get("qty", 0)` vs `data.qty or 0`).
3. **Seamless Serialization**: Implements `.as_dict()`, `.to_dict()`, and standard JSON/Pickle serialization interfaces.
4. **Consistency with Frappe ORM**: Frappe `Document` instances use dot-attribute access (`doc.status`). Using `frappe._dict` keeps helper functions and dictionary data structures visually identical to ORM documents.

---

### How to use `frappe._dict`?

#### Creation & Initialization Syntax

```python
import frappe

# Method 1: Wrapping an existing Python dictionary
d1 = frappe._dict({"item_code": "ITEM-100", "price": 45.50})

# Method 2: Keyword arguments constructor
d2 = frappe._dict(item_code="ITEM-200", price=99.00, is_active=True)

# Method 3: Dynamic attribute assignment
d3 = frappe._dict()
d3.item_code = "ITEM-300"
d3.stock_qty = 500
```

#### Key Access Behavior Matrix

```python
d = frappe._dict(name="Laptop", price=1200)

# Attribute Read (Safe)
print(d.name)       # Returns: "Laptop"
print(d.category)   # Returns: None (Safe!)

# Bracket Read (Standard Dict Behavior)
print(d["name"])    # Returns: "Laptop"
# print(d["category"]) # ❌ Raises KeyError! Always use dot-notation (d.category)

# Attribute Assignment
d.category = "Electronics"
print(d.get("category")) # Returns: "Electronics"
```

---

### When to use `frappe._dict`?

- **Function Parameter Annotations**: When writing custom DocType methods, API functions, or service helpers that accept dictionary configurations or structural payloads.
- **Database Query Result Processing**: When fetching results with `frappe.db.sql(..., as_dict=True)` or `frappe.get_all(...)`, Frappe automatically returns instances of `frappe._dict`.
- **API Payloads & Hooks**: When passing context dicts to background jobs (`frappe.enqueue`) or controller hook triggers.

---

### Code Examples for `frappe._dict`

#### Example 1: Function Parameter & Return Type Annotation (As Requested)

```python
import frappe
from frappe.model.document import Document

class MainItemController(Document):
    def update_storage_in_main_item(
        self, 
        current_item: str, 
        struct_data: frappe._dict
    ) -> str:
        """
        Updates storage warehouse and bin parameters for a specific item using structural data payload.
        
        :param current_item: Item code identifier
        :param struct_data: Dictionary containing storage specifications (warehouse, rack, bin, reorder_level)
        :return: Status summary string
        """
        # Safely extract attribute values without risking KeyError
        warehouse = struct_data.warehouse or "Default Warehouse"
        rack = struct_data.rack or "RACK-01"
        bin_no = struct_data.bin or "BIN-A"
        reorder_level = struct_data.reorder_level or 0

        # Update document fields dynamically
        self.default_warehouse = warehouse
        self.storage_location = f"{rack}-{bin_no}"
        self.reorder_level = reorder_level
        self.save()

        frappe.logger().info(
            f"Updated storage for {current_item} in {self.name}: Warehouse={warehouse}, Location={self.storage_location}"
        )

        return f"Successfully allocated {current_item} to {warehouse} [{rack}-{bin_no}]"
```

#### Example 2: Calling `update_storage_in_main_item` with `frappe._dict`

```python
# Instantiating the payload as frappe._dict
payload = frappe._dict(
    warehouse="Main Logistics Hub",
    rack="RACK-99",
    bin="BIN-104",
    reorder_level=500
)

# Invoking controller method
doc = frappe.get_doc("Item", "ITEM-RAW-STEEL")
result = doc.update_storage_in_main_item(
    current_item="ITEM-RAW-STEEL", 
    struct_data=payload
)

print(result)
# Output: "Successfully allocated ITEM-RAW-STEEL to Main Logistics Hub [RACK-99-BIN-104]"
```

#### Example 3: Deep Nested `frappe._dict` Traversal

```python
def process_order_payload(payload: frappe._dict) -> frappe._dict:
    # Convert nested dicts into frappe._dict recursively if needed
    customer_info = frappe._dict(payload.customer or {})
    shipping_address = frappe._dict(customer_info.address or {})

    city = shipping_address.city or "Unknown City"
    postal_code = shipping_address.pincode or "000000"

    return frappe._dict(
        status="processed",
        delivery_destination=f"{city}, Pincode: {postal_code}",
        item_count=len(payload.items or [])
    )
```

---

## 3. `frappe.model.document.Document` & `BaseDocument`

### What is `Document`?

`Document` is the fundamental ORM base class in Frappe Framework. Every DocType controller class in Python (`class SalesInvoice(Document):`) inherits from `Document`.

```python
from frappe.model.document import Document

class WorkOrder(Document):
    def validate(self):
        if self.qty <= 0:
            frappe.throw("Quantity must be greater than zero.")
```

---

### Key Properties & Methods on `Document`

| Attribute / Method | Type | Description |
| :--- | :--- | :--- |
| `doc.name` | `str` | Primary key identifier of the document (e.g. `ACC-INV-2026-00001`). |
| `doc.doctype` | `str` | DocType name string (e.g. `Sales Invoice`). |
| `doc.docstatus` | `int` | Document state: `0` = Draft, `1` = Submitted, `2` = Cancelled. |
| `doc.is_new()` | `bool` | Returns `True` if document is not yet saved to database. |
| `doc.as_dict()` | `frappe._dict` | Serializes document attributes and child tables into a dictionary. |
| `doc.append(key, value)` | `BaseDocument` | Appends a row to a Child Table field (`self.append("items", {...})`). |
| `doc.save()` | `Document` | Validates, updates timestamps, and persists document changes to DB. |

---

### When to use `Document` as a Type Annotation?

Use `Document` as a type hint whenever a function or utility expects a full Frappe document instance (with access to child tables, dirty flags, and ORM persistence methods).

```python
import frappe
from frappe.model.document import Document
from typing import Optional

def calculate_invoice_totals(doc: Document) -> frappe._dict:
    """
    Calculates total amount and tax breakdown for a Sales Invoice document object.
    """
    subtotal = 0.0
    for item in doc.get("items", []):
        subtotal += flt(item.qty) * flt(item.rate)
    
    tax_rate = 0.18 if doc.is_interstate else 0.12
    total_tax = subtotal * tax_rate
    grand_total = subtotal + total_tax

    return frappe._dict(
        subtotal=subtotal,
        total_tax=total_tax,
        grand_total=grand_total
    )
```

---

## 4. `DF` Type Hints & Synthetic Type Generator (`frappe.types`)

### What are `DF` (DocField) Type Hints?

In Frappe v15+, synthetic type stubs generated for DocTypes use the `DF` namespace to provide **IDE autocompletion** and **static type analysis (Mypy / Pyright)** for DocType fields.

```python
# Example of generated type stub file for a custom DocType:
from typing import List, Optional
import frappe
from frappe.model.document import Document
from frappe.types import DF

class WarehouseStorage(Document):
    # Field Type Annotations generated by Frappe type engine:
    item_code: DF.Link              # Represents a Link field pointing to 'Item'
    storage_capacity: DF.Float      # Represents a Float field
    is_refrigerated: DF.Check       # Represents a Check/Boolean field (0 or 1)
    notes: DF.SmallText | None      # Optional Small Text field
    items: DF.Table[StorageRow]     # Child Table field containing 'StorageRow' documents
```

### Supported `DF` Field Mapping Reference

| DocType Fieldtype | `DF` Type Hint Annotation | Python Runtime Type |
| :--- | :--- | :--- |
| **Data**, **Select**, **Link**, **Dynamic Link** | `DF.Data`, `DF.Link` | `str` |
| **Int** | `DF.Int` | `int` |
| **Float**, **Currency**, **Percent** | `DF.Float`, `DF.Currency` | `float` |
| **Check** | `DF.Check` | `int` (0 or 1) |
| **Date** | `DF.Date` | `datetime.date` or `str` |
| **Datetime** | `DF.Datetime` | `datetime.datetime` or `str` |
| **Table** (Child Table) | `DF.Table[ChildDocClass]` | `list[ChildDocClass]` |
| **Code**, **Text**, **JSON** | `DF.Code`, `DF.JSON` | `str` or `dict` |

---

## 5. `frappe.form_dict` & Thread-Local Context (`frappe.local`)

### What is `frappe.form_dict`?

`frappe.form_dict` is an active instance of `frappe._dict` attached to the thread-local request scope (`frappe.local.form_dict`). It collects all incoming HTTP parameters:
- URL query string parameters (`?doctype=Task&status=Open`)
- Form-encoded POST body parameters (`application/x-www-form-urlencoded`)
- JSON payload body (`application/json`)

### How to use `frappe.form_dict` safely in `@frappe.whitelist` methods?

```python
import frappe

@frappe.whitelist(methods=["POST"])
def submit_feedback():
    # frappe.form_dict is a frappe._dict instance
    user_email = frappe.form_dict.email or frappe.session.user
    rating = frappe.utils.cint(frappe.form_dict.rating)
    comments = frappe.form_dict.comments or ""

    if rating < 1 or rating > 5:
        frappe.throw("Rating must be between 1 and 5.")

    feedback = frappe.get_doc({
        "doctype": "User Feedback",
        "user": user_email,
        "rating": rating,
        "comments": comments
    }).insert(ignore_permissions=True)

    return frappe._dict(
        status="success",
        feedback_id=feedback.name
    )
```

---

## 6. Database Query Return Types Matrix

Database access methods in Frappe (`frappe.db.sql`, `frappe.get_all`, `frappe.db.get_value`, `frappe.qb`) return distinct Python data structures depending on parameter flags (`as_dict`, `pluck`, `as_list`).

| Database API Method | Parameter Flag | Return Type | Sample Output Return Value |
| :--- | :--- | :--- | :--- |
| `frappe.db.get_value` | Default (`as_dict=False`) | `Any` (Primitive scalar value or `tuple`) | `"ITEM-001"` or `("ITEM-001", 50.0)` |
| `frappe.db.get_value` | `as_dict=True` | `frappe._dict \| None` | `{"name": "ITEM-001", "qty": 50.0}` |
| `frappe.get_all` / `get_list` | Default | `list[frappe._dict]` | `[{"name": "TASK-1"}, {"name": "TASK-2"}]` |
| `frappe.db.sql` | `as_dict=True` | `list[frappe._dict]` | `[{"status": "Open", "count": 12}]` |
| `frappe.db.sql` | `as_dict=False` | `tuple[tuple[Any, ...]]` | `(("Open", 12), ("Closed", 45))` |
| `frappe.db.sql` | `pluck=True` | `list[Any]` | `["TASK-001", "TASK-002", "TASK-003"]` |
| `frappe.qb.run()` | `as_dict=True` | `list[frappe._dict]` | `[{"subject": "Fix Bug"}]` |

### Database Return Type Example

```python
import frappe

# 1. Fetching single record as frappe._dict
item_data: frappe._dict = frappe.db.get_value(
    "Item", 
    "ITEM-001", 
    ["item_name", "item_group", "standard_rate"], 
    as_dict=True
)
print(item_data.item_name) # Accessing via dot-notation!

# 2. Fetching multiple records as list[frappe._dict]
high_priority_tasks: list[frappe._dict] = frappe.get_all(
    "Task",
    filters={"priority": "High", "status": "Open"},
    fields=["name", "subject", "allocated_to"]
)

for task in high_priority_tasks:
    print(f"Task ID: {task.name} -> Assigned to: {task.allocated_to or 'Unassigned'}")

# 3. Plucking a single column list
all_item_codes: list[str] = frappe.db.get_all(
    "Item",
    filters={"disabled": 0},
    pluck="name"
)
# Returns: ["ITEM-001", "ITEM-002", "ITEM-003"]
```

---

## 7. Null-Safe Frappe Primitive Utility Types (`cint`, `flt`, `cstr`)

Standard Python type casting (`int(val)`, `float(val)`, `str(val)`) raises `TypeError` or `ValueError` when passed `None` or invalid string formats. Frappe provides null-safe conversion primitives in `frappe.utils`.

```python
from frappe.utils import cint, flt, cstr, to_timedelta
import datetime

# 1. Safe Integer Casting (cint)
print(cint("42"))     # 42
print(cint(None))     # 0 (Does not crash!)
print(cint("invalid"))# 0

# 2. Safe Float Casting with Precision (flt)
print(flt("123.4567", 2)) # 123.46 (Rounds to 2 decimal places)
print(flt(None))          # 0.0

# 3. Safe String Casting (cstr)
print(cstr(None))     # "" (Empty string instead of "None")
print(cstr(100))      # "100"

# 4. Safe TimeDelta Conversion (to_timedelta)
td = to_timedelta("02:30:00") # datetime.timedelta(seconds=9000)
```

---

## 8. Type Annotations Cheat Sheet for Frappe Developers

Use these standard Python type hint combinations across your Frappe backend codebases:

```python
from typing import Dict, List, Optional, Union, Any, Tuple
import frappe
from frappe.model.document import Document

# 1. Function accepting frappe._dict and returning frappe._dict
def process_config(config: frappe._dict) -> frappe._dict:
    ...

# 2. Function accepting Document or str (Name) and returning Optional[Document]
def get_user_doc(user_input: Union[str, Document]) -> Optional[Document]:
    if isinstance(user_input, Document):
        return user_input
    if frappe.db.exists("User", user_input):
        return frappe.get_doc("User", user_input)
    return None

# 3. Method accepting a list of frappe._dict objects
def bulk_update_items(item_rows: List[frappe._dict]) -> Dict[str, int]:
    updated_count = 0
    for row in item_rows:
        if row.item_code and row.new_rate:
            frappe.db.set_value("Item", row.item_code, "standard_rate", flt(row.new_rate))
            updated_count += 1
    return {"updated": updated_count}

# 4. Standard Hook Handler signature (doc, method=None)
def validate_purchase_order(doc: Document, method: Optional[str] = None) -> None:
    if flt(doc.grand_total) > 100000 and not doc.amended_from:
        doc.requires_special_approval = 1
```

---

## Related Documentation

- [06. Document API & Lifecycle](/06-documents/)
- [09. Server API Reference (`frappe.*`)](/09-server-api/)
- [10. Database, ORM & Query Builder](/10-database/)
- [19. Utilities Reference (`frappe.utils`)](/19-utils/)
- [30. Frappe ORM Masterclass](/30-frappe-orm/)
