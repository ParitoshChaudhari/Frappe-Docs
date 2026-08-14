---
title: Practical Frappe v15 Developer Cookbook
description: 20+ copy-pasteable real-world recipes for Frappe v15 - documents, child tables, custom buttons, REST calls, background jobs, reports, and hooks.
version: v15
category: Quality, Operations & Best Practices
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Practical Developer Cookbook

A collection of copy-pasteable, production-ready recipes for common development tasks in Frappe Framework v15.

---

## 1. Document & Database Recipes

### Recipe 1: Programmatic Document Creation with Child Rows

```python
import frappe

def create_project_with_tasks(project_name, tasks_list):
    project = frappe.get_doc({
        "doctype": "Project",
        "project_name": project_name,
        "status": "Active",
        "tasks": []
    })
    
    for task_title in tasks_list:
        project.append("tasks", {
            "title": task_title,
            "status": "Open"
        })
        
    project.insert(ignore_permissions=True)
    frappe.db.commit()
    return project.name
```

---

### Recipe 2: Query Builder Inner Join & Aggregation

```python
import frappe
from frappe.query_builder import DocType
from frappe.query_builder.functions import Count

def get_project_task_summary():
    Project = DocType("Project")
    Task = DocType("Task")

    return (
        frappe.qb.from_(Project)
        .inner_join(Task).on(Task.project == Project.name)
        .select(
            Project.name,
            Project.project_name,
            Count(Task.name).as_("total_tasks")
        )
        .groupby(Project.name)
        .run(as_dict=True)
    )
```

---

## 2. Client-Side Form Script Recipes

### Recipe 3: Add Custom Action Button with Input Dialog

```javascript
frappe.ui.form.on("Task", {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button(__("Reassign Owner"), () => {
                frappe.prompt(
                    [
                        {
                            label: __("New Assignee"),
                            fieldname: "user",
                            fieldtype: "Link",
                            options: "User",
                            reqd: 1
                        }
                    ],
                    (values) => {
                        frappe.call({
                            method: "my_custom_app.api.reassign_task",
                            args: {
                                task_id: frm.doc.name,
                                new_user: values.user
                            },
                            freeze: true,
                            callback(r) {
                                if (!r.exc) {
                                    frm.reload_doc();
                                    frappe.show_alert({
                                        message: __("Task reassigned successfully"),
                                        indicator: "green"
                                    });
                                }
                            }
                        });
                    },
                    __("Reassign Task"),
                    __("Assign")
                );
            }, __("Actions"));
        }
    }
});
```

---

### Recipe 4: Filter Child Table Link Field Dynamically

```javascript
frappe.ui.form.on("Sales Invoice", {
    refresh(frm) {
        frm.set_query("item_code", "items", (doc, cdt, cdn) => {
            return {
                filters: {
                    is_sales_item: 1,
                    has_variants: 0
                }
            };
        });
    }
});
```

---

## 3. Reporting Engine Recipes

### Recipe 5: SQL Query Report with Dynamic Parameter Binding

```sql
/* Query Report (.sql) */
SELECT
    si.customer AS "Customer:Link/Customer:180",
    COUNT(si.name) AS "Invoices:Int:100",
    SUM(si.grand_total) AS "Total Amount:Currency:140"
FROM
    `tabSales Invoice` si
WHERE
    si.docstatus = 1
    AND si.posting_date BETWEEN %(from_date)s AND %(to_date)s
GROUP BY
    si.customer
HAVING
    SUM(si.grand_total) > %(min_amount)s
```

---

### Recipe 6: Complete Script Report with Frappe Charts & Summary Cards

```python
# Script Report (.py)
import frappe
from frappe import _

def execute(filters=None):
    columns = [
        {"label": _("Status"), "fieldname": "status", "fieldtype": "Data", "width": 140},
        {"label": _("Task Count"), "fieldname": "task_count", "fieldtype": "Int", "width": 120}
    ]
    
    data = frappe.db.sql("""
        SELECT status, COUNT(name) as task_count
        FROM `tabTask`
        GROUP BY status
    """, as_dict=True)
    
    chart = {
        "data": {
            "labels": [d["status"] for d in data],
            "datasets": [{"name": _("Tasks"), "values": [d["task_count"] for d in data]}]
        },
        "type": "donut",
        "colors": ["#0052cc", "#28a745", "#ffc107", "#dc3545"]
    }
    
    summary = [
        {
            "value": sum(d["task_count"] for d in data),
            "label": _("Total System Tasks"),
            "datatype": "Int",
            "indicator": "Blue"
        }
    ]
    
    return columns, data, None, chart, summary
```

---

## 4. Background Processing & Integration Recipes

### Recipe 7: Enqueue Background Job After Database Commit

```python
import frappe

@frappe.whitelist()
def process_order(order_id):
    order = frappe.get_doc("Sales Order", order_id)
    order.status = "Processing"
    order.save()
    
    # Enqueue background webhook delivery AFTER DB commit succeeds!
    frappe.enqueue(
        "my_custom_app.integrations.send_webhook",
        queue="short",
        timeout=300,
        enqueue_after_commit=True,
        payload=order.as_dict()
    )
    return True
```

---

### Recipe 8: Trigger Real-time Progress Bar via Socket.IO

```python
# Server Python processing function
def export_large_dataset(user):
    total = 100
    for i in range(1, total + 1):
        # Heavy processing step
        if i % 10 == 0:
            frappe.publish_realtime(
                event="export_progress",
                message={"current": i, "total": total},
                user=user
            )
```

```javascript
// Client JS Listener
frappe.realtime.on("export_progress", (data) => {
    frappe.show_progress(__("Exporting Data"), data.current, data.total);
});
```

---

## Related Topics

- [09. Server API](/09-server-api/)
- [11. Client API](/11-client-api/)
- [18. Reports Guide](/18-reports/)
- [21. Security & Performance](/21-security-performance/)
