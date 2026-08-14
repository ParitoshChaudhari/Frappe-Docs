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

### Recipe 9: Programmatically Generate & Attach PDF to Document

Generate a PDF from a custom HTML/Jinja template server-side and attach it directly to a record.

```python
import frappe
from frappe.utils.pdf import get_pdf

def generate_and_attach_invoice_pdf(docname):
    doc = frappe.get_doc("Sales Invoice", docname)
    
    # 1. Render Jinja HTML string
    html = frappe.render_template("templates/print_formats/custom_invoice.html", {"doc": doc})
    
    # 2. Convert HTML to binary PDF bytes via wkhtmltopdf
    pdf_bytes = get_pdf(html)
    
    # 3. Save as private File document and attach to Sales Invoice
    file_doc = frappe.get_doc({
        "doctype": "File",
        "file_name": f"{doc.name}.pdf",
        "attached_to_doctype": "Sales Invoice",
        "attached_to_name": doc.name,
        "is_private": 1,
        "content": pdf_bytes
    })
    file_doc.save(ignore_permissions=True)
    return file_doc.file_url
```

---

### Recipe 10: Upgrade-Safe Controller Override in `hooks.py`

Extend core ERPNext or Frappe Document controller classes without modifying core source code.

```python
# 1. In your custom app's hooks.py:
override_doctype_class = {
    "Sales Invoice": "my_custom_app.overrides.invoice.CustomSalesInvoice"
}

# 2. In my_custom_app/overrides/invoice.py:
from erpnext.accounts.doctype.sales_invoice.sales_invoice import SalesInvoice
import frappe

class CustomSalesInvoice(SalesInvoice):
    def validate(self):
        super().validate()  # Always invoke standard core validations first!
        
        # Add custom validation logic
        if self.grand_total > 50000 and not self.po_no:
            frappe.throw("Purchase Order Number (PO No) is required for orders over $50,000.")
```

---

### Recipe 11: Document Mapping from Client Script with Unsaved Form View

Map data from a source document into a target document with child table items, opening an unsaved form view.

```javascript
frappe.ui.form.on("Quotation", {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button(__("Make Sales Order"), () => {
                frappe.model.make_new_doc_and_get_name("Sales Order", (new_doc) => {
                    // Map parent fields
                    new_doc.customer = frm.doc.customer;
                    new_doc.company = frm.doc.company;
                    
                    // Map child table items
                    (frm.doc.items || []).forEach(item => {
                        let row = frappe.model.add_child(new_doc, "items");
                        row.item_code = item.item_code;
                        row.qty = item.qty;
                        row.rate = item.rate;
                    });
                    
                    // Navigate to unsaved new form view
                    frappe.set_route("Form", "Sales Order", new_doc.name);
                });
            }, __("Create"));
        }
    }
});
```

---

### Recipe 12: Scheduled Daily Email Digest Cron Task

Send a daily summary email every weekday morning using `scheduler_events` in `hooks.py`.

```python
# 1. In hooks.py:
scheduler_events = {
    "cron": {
        "0 8 * * 1-5": [
            "my_custom_app.tasks.send_daily_digest"
        ]
    }
}

# 2. In my_custom_app/tasks.py:
import frappe

def send_daily_digest():
    open_tasks = frappe.db.count("Task", {"status": "Open"})
    
    frappe.sendmail(
        recipients=["manager@company.com"],
        subject="Daily Open Tasks Summary",
        message=f"<p>Good morning! You currently have <b>{open_tasks}</b> open tasks requiring attention.</p>"
    )
```

---

### Recipe 13: High-Performance Cache Key Invalidation Strategy

Cache complex analytics results in Redis and invalidate selectively on document update.

```python
import frappe

# 1. Fetch cached metrics (or compute and store for 1 hour)
def get_cached_dashboard_metrics(company):
    cache_key = f"dashboard_metrics:{company}"
    metrics = frappe.cache().get_value(cache_key)
    
    if not metrics:
        metrics = frappe.db.sql("""
            SELECT COUNT(name) as total_orders, SUM(grand_total) as revenue
            FROM `tabSales Order`
            WHERE company = %s AND docstatus = 1
        """, (company,), as_dict=True)[0]
        
        # Cache result in Redis for 3600 seconds (1 hour)
        frappe.cache().set_value(cache_key, metrics, expires_in_sec=3600)
        
    return metrics

# 2. Invalidate cache on Sales Order submit (doc_events in hooks.py)
def invalidate_company_metrics(doc, method=None):
    cache_key = f"dashboard_metrics:{doc.company}"
    frappe.cache().delete_value(cache_key)
```

---

## Related Topics

- [09. Server API](/09-server-api/)
- [11. Client API](/11-client-api/)
- [18. Reports Guide](/18-reports/)
- [21. Security & Performance](/21-security-performance/)
