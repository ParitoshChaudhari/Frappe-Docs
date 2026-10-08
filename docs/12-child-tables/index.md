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

## 3. Restricting or Hiding Add & Delete Rows in Child Tables

Frappe offers several techniques to restrict, hide, or control child table row addition and deletion depending on your specific use case:

---

### Approach 1: Official Frappe API (`frm.set_df_property` or `grid` properties) ⭐ *(Recommended)*

This is the standard, idiomatic way. Setting `cannot_add_rows` and `cannot_delete_rows` natively disables the "+ Add Row" button, row insertion triggers, and row deletion buttons/menus in the grid without breaking reactivity.

```javascript
frappe.ui.form.on("Your DocType", {
    refresh(frm) {
        // Option A: Using frm.set_df_property (Recommended)
        // Disables the "Add Row" button
        frm.set_df_property("component_configuration", "cannot_add_rows", true);
        
        // Disables row deletion (checkbox delete button and row menu remove action)
        frm.set_df_property("component_configuration", "cannot_delete_rows", true);

        // Option B: Directly on the field's grid instance
        let grid = frm.get_field("component_configuration").grid;
        grid.cannot_add_rows = true;
        grid.cannot_delete_rows = true;
        grid.refresh();
    }
});
```

> **Why use this approach?**
> - Clean and officially supported across Frappe versions.
> - Preserves grid state across re-renders and form updates.
> - Automatically handles shortcut keys and row action menus.

---

### Approach 2: Grid Strict Sort-Only Mode (`grid.only_sortable()`)

If you want a fixed set of rows that users can **reorder** but neither add new rows to nor delete existing rows from:

```javascript
frappe.ui.form.on("Your DocType", {
    refresh(frm) {
        // Disables both "Add Row" button and row-level insert above/below options,
        // while preserving drag-to-sort reordering functionality
        frm.get_field("component_configuration").grid.only_sortable();
    }
});
```

> **When to use:**
> - Step sequences, routing stages, or predefined configuration templates where the number of rows is predetermined and users should only reorder or edit them.

---

### Approach 3: DOM Manipulation via jQuery (`grid.wrapper`)

If you want direct UI/CSS control to visually hide specific action buttons:

```javascript
frappe.ui.form.on("Your DocType", {
    refresh(frm) {
        let grid = frm.get_field("component_configuration").grid;

        // 1. Hide the "+ Add Row" button
        grid.wrapper.find(".grid-add-row").hide();

        // 2. Hide the "+ Add Multiple" / download / upload buttons if present
        grid.wrapper.find(".grid-add-multiple-rows").hide();
        grid.wrapper.find(".grid-download").hide();
        grid.wrapper.find(".grid-upload").hide();

        // 3. Hide row delete button / selection controls when rows are selected
        grid.wrapper.find(".grid-remove-rows").hide();
        grid.wrapper.find(".grid-remove-all-rows").hide();
    }
});
```

> **Considerations:**
> - Because Frappe re-renders child table rows when grid actions occur, DOM elements hidden via jQuery may reappear if the grid is refreshed (`frm.refresh_field` or `grid.refresh()`). In contrast, **Approach 1** persists automatically with the field state.

---

### Approach 4: Making Entire Table Read-Only (`read_only` / `toggle_enable`)

When a document reaches a certain state (e.g. submitted or approved), you can lock the entire child table. This automatically disables adding, deleting, and editing any rows or columns:

```javascript
frappe.ui.form.on("Your DocType", {
    refresh(frm) {
        // Option A: Set read_only property on the field
        frm.set_df_property("component_configuration", "read_only", 1);

        // Option B: Using frm.toggle_enable shorthand
        frm.toggle_enable("component_configuration", false);
    }
});
```

---

### Approach 5: Client-Side Event Interceptors (`before_items_add` / `before_items_remove`)

Frappe child tables fire specific client event triggers before adding or removing rows. You can intercept these to enforce custom logic, permissions, or conditions programmatically:

```javascript
frappe.ui.form.on("Your DocType", {
    // Intercept row creation: triggered BEFORE a row is added
    before_component_configuration_add(frm) {
        if (frm.doc.status === "Locked") {
            frappe.msgprint(__("Cannot add rows when configuration is Locked."));
            frappe.validated = false;
            throw new Error("Row addition prevented");
        }
    },

    // Intercept row deletion: triggered BEFORE a row is removed
    before_component_configuration_remove(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.is_system_generated) {
            frappe.throw(__("System-generated rows cannot be removed."));
        }
    }
});
```

---

### Approach 6: Role & Permission Level Enforcement (DocPerm / Schema)

For enterprise security, UI-only JavaScript restrictions should be backed by Frappe permissions:

1. **Child Table DocPerms**: In the child DocType's permission table, set read/write permissions per role.
2. **Server-side Controller Validation**: Block unauthorized addition or deletion in Python lifecycle hooks:

```python
# In parent doctype controller (your_doctype.py)
import frappe
from frappe import _
from frappe.model.document import Document

class YourDocType(Document):
    def validate(self):
        if self.docstatus == 0 and self.status == "Locked":
            # Compare with database state if needed
            if len(self.component_configuration) > len(self.get_doc_before_save().component_configuration or []):
                frappe.throw(_("Cannot add rows to Component Configuration when Locked."))
```

---

### Comparison Matrix

| Approach | Method / API | Adds Prevented? | Deletes Prevented? | Sorting Allowed? | Inline Edits Allowed? | Recommended Use Case |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **1. Property API** ⭐ | `frm.set_df_property('field', 'cannot_add_rows', true)` | ✅ | Optional (`cannot_delete_rows`) | ✅ | ✅ | Standard forms, conditional UI lockdown |
| **2. Sort-Only** | `grid.only_sortable()` | ✅ | ✅ | ✅ | ✅ | Fixed row list where only reordering is allowed |
| **3. jQuery DOM** | `grid.wrapper.find('.grid-add-row').hide()` | ✅ (UI only) | Optional | ✅ | ✅ | Quick UI tweaks or hiding secondary buttons |
| **4. Read-Only** | `frm.set_df_property('field', 'read_only', 1)` | ✅ | ✅ | ❌ | ❌ | Completed, locked, or submitted documents |
| **5. Interceptors** | `before_<field>_add` / `before_<field>_remove` | ✅ | ✅ | ✅ | ✅ | Conditional validation based on document state |
| **6. Server-Side** | DocType DocPerm & Python `validate()` | ✅ | ✅ | ✅ | ✅ | Strict security and permission auditing |

---

## 4. Other Common Desk Grid UI Controls

```javascript
let grid = frm.get_field("items").grid;

// 1. Make a specific column read-only dynamically
grid.get_field("rate").df.read_only = 1;
grid.refresh();

// 2. Toggle static row numbers / disable sortable rows
grid.sortable = false;

// 3. Make specific row editable or read-only dynamically
frappe.ui.form.on("Sales Invoice Item", {
    status(frm, cdt, cdn) {
        let grid_row = frm.get_field("items").grid.get_row(cdn);
        let is_locked = (locals[cdt][cdn].status === "Locked");
        grid_row.toggle_editable("rate", !is_locked);
    }
});
```

---

## Related Topics

- [05. DocTypes & Fields](/05-doctypes/)
- [06. Document API & Lifecycle](/06-documents/)
- [11. Client API](/11-client-api/)
