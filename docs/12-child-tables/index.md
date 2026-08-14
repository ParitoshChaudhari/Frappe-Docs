---
title: Child Table Management (Python & JS) in Frappe v15
description: Complete reference for handling Frappe Child Tables server-side in Python and client-side in JavaScript Grid APIs.
version: v15
category: Client-Side JavaScript APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Child Tables API (Python & JS)

In Frappe Framework v15, **Child Tables** are embedded sub-documents (DocTypes with `istable: 1`) linked directly to a parent document via `parent`, `parentfield`, and `parenttype` schema columns.

---

## 1. Server-Side Child Table API (Python)

### Appending & Inserting Child Rows (`doc.append`)

```python
import frappe

doc = frappe.get_doc("Sales Invoice", "SINV-2026-00001")

# Append new row to 'items' child table
new_row = doc.append("items", {
    "item_code": "LAPTOP-DELL-XPS",
    "qty": 1,
    "rate": 1200.00,
    "amount": 1200.00
})

# Access newly assigned child row properties
print(new_row.name)  # Auto-generated row primary key (e.g. 'row-0001')
doc.save()
```

---

### Iterating, Updating & Removing Child Rows

```python
doc = frappe.get_doc("Task", "TASK-00001")

# 1. Iterate child table rows
total_estimated_hours = 0.0
for row in doc.get("assignees"):
    total_estimated_hours += row.hours
    if row.user == "inactive_user@example.com":
        # Modify child row attribute
        row.status = "Inactive"

# 2. Filter & remove child table rows matching condition
doc.assignees = [row for row in doc.assignees if row.status != "Inactive"]

# Save parent document
doc.save()
```

---

## 2. Client-Side Child Table API (JavaScript)

### Binding Child Table Field Triggers

Use `frappe.ui.form.on(child_doctype_name, handlers)` to bind events to child table fields:

```javascript
// Target the Child DocType name ("Sales Invoice Item"), NOT the table fieldname!
frappe.ui.form.on("Sales Invoice Item", {
    item_code(frm, cdt, cdn) {
        // cdt: Child DocType name string ("Sales Invoice Item")
        // cdn: Child Document row name string ("row-0001")
        let row = frappe.get_doc(cdt, cdn);
        
        if (row.item_code) {
            frappe.db.get_value("Item", row.item_code, "standard_rate", (r) => {
                if (r && r.standard_rate) {
                    frappe.model.set_value(cdt, cdn, "rate", r.standard_rate);
                    frappe.model.set_value(cdt, cdn, "amount", r.standard_rate * row.qty);
                }
            });
        }
    },
    qty(frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        frappe.model.set_value(cdt, cdn, "amount", row.qty * row.rate);
    },
    items_remove(frm, cdt, cdn) {
        // Triggered when a child row is deleted from grid
        frm.trigger("calculate_totals");
    }
});
```

---

### Adding, Clearing & Editing Child Rows in Desk Form

```javascript
frappe.ui.form.on("Sales Invoice", {
    add_default_service_fee(frm) {
        // 1. Add new child row programmatically
        let child_row = frm.add_child("items");
        child_row.item_code = "SERVICE-FEE";
        child_row.qty = 1;
        child_row.rate = 50.00;
        
        // 2. Refresh table DOM grid view
        frm.refresh_field("items");
    },
    clear_all_items(frm) {
        // Clear all rows from 'items' table
        frm.clear_table("items");
        frm.refresh_field("items");
    }
});
```

---

### Filtering Link Fields in Child Tables (`frm.set_query`)

```javascript
frappe.ui.form.on("Sales Invoice", {
    refresh(frm) {
        // Apply filter to 'item_code' field inside 'items' child table grid
        frm.set_query("item_code", "items", function(doc, cdt, cdn) {
            return {
                filters: {
                    is_sales_item: 1,
                    disabled: 0
                }
            };
        });
    }
});
```

---

## 3. Desk Grid UI API Reference

```javascript
// Access underlying Grid object
let grid = frm.get_field("items").grid;

// 1. Toggle grid row buttons (Add, Delete)
grid.cannot_add_rows = true;
grid.refresh();

// 2. Make specific column read-only dynamically
grid.get_field("rate").df.read_only = 1;
grid.refresh();
```

---

## Related Topics

- [05. DocTypes & Fields](/05-doctypes/)
- [06. Document API & Lifecycle](/06-documents/)
- [11. Client API](/11-client-api/)
