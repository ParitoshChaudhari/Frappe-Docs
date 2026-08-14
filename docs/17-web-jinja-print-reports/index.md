---
title: Web Pages, Jinja & Print Formats in Frappe v15
description: Guide to Web Pages, Portal routes, Jinja template rendering, Standard Print Formats, and Custom Jinja Print Formats in Frappe v15.
version: v15
category: Web, Analytics & Integrations
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Web Pages, Jinja & Print Formats

Frappe Framework v15 integrates a dynamic web portal layout system and PDF print format generator powered by **Jinja2**.

---

## 1. Public Web Pages & Portal Routes

Create public portal pages by creating Python and HTML files inside your app's `www/` directory:

```text
my_custom_app/
└── www/
    ├── portal.py       # Route Controller (Populates Jinja context)
    └── portal.html     # Jinja Web Template
```

### Route Controller (`www/portal.py`)

```python
import frappe

def get_context(context):
    """Executes on HTTP request to /portal."""
    context.title = "Customer Support Portal"
    context.open_tasks = frappe.get_all(
        "Task",
        filters={"status": "Open", "owner": frappe.session.user},
        fields=["name", "subject", "creation"]
    )
    return context
```

### Jinja Template (`www/portal.html`)

```jinja
{% extends "templates/web.html" %}

{% block page_content %}
<div class="container my-4">
    <h2>{{ title }}</h2>
    <table class="table table-bordered mt-3">
        <thead>
            <tr>
                <th>Task ID</th>
                <th>Subject</th>
                <th>Created Date</th>
            </tr>
        </thead>
        <tbody>
            {% for task in open_tasks %}
            <tr>
                <td><a href="/task-details?name={{ task.name }}">{{ task.name }}</a></td>
                <td>{{ task.subject }}</td>
                <td>{{ frappe.format_date(task.creation) }}</td>
            </tr>
            {% else %}
            <tr><td colspan="3">No open tasks found.</td></tr>
            {% endfor %}
        </tbody>
    </table>
</div>
{% endblock %}
```

---

## 2. Web Forms DocType

**Web Forms** allow non-authenticated public users or portal clients to fill out dynamic multi-step forms on the web that map directly to backend DocTypes (such as Job Applications, Lead Capture, or Support Tickets).

- Configured via Desk UI (**Web Form** DocType).
- Supports dynamic client-side scripting (`web_form.js`).

---

## 3. Jinja Print Formats & Built-In Filters

Custom Print Formats render PDF and print documents using Jinja HTML templates:

### Available Frappe Jinja Methods & Globals

- `doc`: Current Document object instance
- `frappe.format(val, df, doc)`: Formats data according to field metadata rules
- `frappe.db.get_value(dt, dn, fn)`: Queries database field from Jinja
- `frappe.format_date(date)`: Formats date to user preference

<div v-pre>

### Built-in Jinja Filters Matrix

| Jinja Filter | Usage Example | Description |
| :--- | :--- | :--- |
| `_()` | `{{ _("Invoice Status") }}` | Translates text to active user session language |
| `money_in_words` | `{{ doc.grand_total \| money_in_words }}` | Converts currency number into words (e.g. *"Five Hundred USD Only"*) |
| `global_date_format` | `{{ doc.posting_date \| global_date_format }}` | Formats ISO date to global system date format |
| `format_currency` | `{{ doc.amount \| format_currency(doc.currency) }}` | Formats numeric value as currency string with symbol |

```jinja
<div class="print-format">
    <div class="row">
        <div class="col-xs-6">
            <h3>Invoice: {{ doc.name }}</h3>
            <p>Date: {{ frappe.format_date(doc.posting_date) }}</p>
        </div>
        <div class="col-xs-6 text-right">
            <h4>Customer: {{ doc.customer_name }}</h4>
        </div>
    </div>

    <table class="table table-bordered mt-4">
        <thead>
            <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            {% for row in doc.items %}
            <tr>
                <td>{{ row.item_code }}</td>
                <td class="text-right">{{ row.qty }}</td>
                <td class="text-right">{{ frappe.format_value(row.rate, {"fieldtype": "Currency"}) }}</td>
                <td class="text-right">{{ frappe.format_value(row.amount, {"fieldtype": "Currency"}) }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>

    <div class="mt-3">
        <p><strong>Amount in Words:</strong> {{ doc.grand_total | money_in_words }}</p>
    </div>
</div>
```

</div>

---

## Related Topics

- [18. Complete Reports Guide](/18-reports/)
- [19. Utilities Reference](/19-utils/)

