---
title: Complete hooks.py Reference for Frappe v15
description: Exhaustive hooks.py documentation for Frappe v15 - doc_events reference table, scheduler_events, override_doctype_class, override_whitelisted_methods, permissions, fixtures, Jinja.
version: v15
category: DocTypes & Data Modeling
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge server">Server Only</span> <span class="badge stable">Stable</span> Hooks Reference (`hooks.py`)

`hooks.py` is the central configuration file of any Frappe application. It allows your custom app to extend, override, or react to events across the entire Frappe Framework and core apps like ERPNext without altering core source code.

---

## 1. Document Event Hooks (`doc_events`)

`doc_events` attach custom python handler functions to document lifecycle events across standard or custom DocTypes.

```python
doc_events = {
    "Task": {
        "validate": "my_custom_app.events.task.validate_task",
        "on_submit": "my_custom_app.events.task.on_submit_task",
        "on_trash": "my_custom_app.events.task.prevent_deletion"
    },
    "*": {
        "on_update": "my_custom_app.events.global.audit_log"
    }
}
```

### Handler Function Signature

```python
# my_custom_app/events/task.py
import frappe

def validate_task(doc, method=None):
    """
    doc: The active Document instance
    method: String name of event (e.g. 'validate')
    """
    if doc.priority == "Urgent" and not doc.allocated_to:
        frappe.throw("Urgent tasks must have an assigned owner.")
```

---

### Exhaustive `doc_events` Lifecycle Reference Table

The table below details every document event hook supported by Frappe v15, its execution timing, document state, primary use cases, and operations to avoid:

| Event Hook Name | Execution Timing & Lifecycle Stage | Document State & `docstatus` | Primary Purpose & Use Case | Recommended Actions & Avoidances |
| :--- | :--- | :--- | :--- | :--- |
| **`before_insert`** | Right before the initial `INSERT` query on a new record. | `is_new() == True`<br>`docstatus: 0` | Setting initial default attributes prior to primary key resolution. | ✅ Assign default values.<br>❌ Avoid `frappe.db.sql` on `doc.name`. |
| **`before_naming`** | Executes immediately before `autoname()` is invoked. | `is_new() == True`<br>`docstatus: 0` | Pre-processing field values used in naming format expressions. | ✅ Format fields used in `autoname`.<br>❌ Don't read `doc.name` yet. |
| **`autoname`** | Primary key `doc.name` resolution step. | `is_new() == True`<br>`docstatus: 0` | Programmatic assignment of custom document primary key string. | ✅ Set `doc.name = "MY-PREFIX-001"`.<br>❌ Avoid modifying docfields. |
| **`before_validate`** | Executed before mandatory field validation checks. | `is_new()` varies<br>`docstatus: 0` | Sanitizing user inputs, trimming strings, setting defaults. | ✅ Strip whitespace, format numbers.<br>❌ Avoid throwing hard exceptions. |
| **`validate`** | Primary validation step on every `save()` and `submit()`. | `docstatus: 0` | Enforcing business rules & throwing `frappe.throw()`. | ✅ Perform calculations & validations.<br>❌ Avoid heavy external HTTP calls. |
| **`before_save`** | Immediately prior to SQL `INSERT` or `UPDATE` commit. | `docstatus: 0` | Finalizing document attribute values prior to DB write. | ✅ Set calculated fields.<br>❌ Avoid background network calls. |
| **`after_insert`** | Executed immediately after initial DB row insertion. | `is_new() == False`<br>`docstatus: 0` | Creating child records or dependent linked entities. | ✅ Insert child linked documents.<br>❌ Avoid calling `doc.save()`. |
| **`on_update`** | Executed right after SQL `INSERT`/`UPDATE` execution. | `docstatus: 0` | Triggering real-time WebSockets & cache invalidation. | ✅ Emit sockets, update cache.<br>❌ **NEVER call `doc.save()`!** |
| **`before_submit`** | Prior to workflow submission checks. | `docstatus: 0 -> 1` | Validating submittable fields before status change. | ✅ Verify approval signatures.<br>❌ Don't post ledger entries yet. |
| **`on_submit`** | Immediately after document submission (`docstatus: 1`). | `docstatus: 1` | Posting Stock Ledger, General Ledger, or Inventory moves. | ✅ Post financial/inventory vouchers.<br>❌ Don't edit non-submittable fields. |
| **`before_cancel`** | Prior to document cancellation (`docstatus: 1 -> 2`). | `docstatus: 1 -> 2` | Verifying dependent vouchers before cancellation. | ✅ Check linked invoice status.<br>❌ Don't delete database rows. |
| **`on_cancel`** | Immediately after document cancellation (`docstatus: 2`). | `docstatus: 2` | Reversing General Ledger and Stock Ledger entries. | ✅ Reverse GL/Stock ledger entries.<br>❌ Don't call `doc.submit()`. |
| **`before_update_after_submit`** | Prior to saving edits on submitted documents. | `docstatus: 1` | Validating fields configured with `allow_on_submit: 1`. | ✅ Validate editable submitted fields.<br>❌ Don't modify core doc fields. |
| **`on_update_after_submit`** | After saving edits on submitted documents. | `docstatus: 1` | Audit logging modifications on submitted records. | ✅ Write audit logs.<br>❌ Don't re-submit document. |
| **`on_trash`** | Right before document row is deleted from DB. | `docstatus` varies | Preventing deletion of critical business documents. | ✅ Check dependent records & throw.<br>❌ Don't delete linked docs manually. |
| **`after_delete`** | Immediately after database row deletion. | Deleted from DB | Cleaning up external file attachments or S3 assets. | ✅ Remove attached S3 files.<br>❌ Don't dereference `doc` in DB. |
| **`on_change`** | Triggered whenever document workflow state changes. | `docstatus` varies | Global audit tracking & webhooks. | ✅ Enqueue webhook notifications.<br>❌ Avoid blocking main HTTP thread. |
| **`on_rollback`** | Triggered if the active database transaction is rolled back (e.g., on server error or `frappe.db.rollback()`). | Transaction failed / rolled back | Reverting any non-database side effects that were performed during the request (e.g., deleting temp files, reversing external API calls). | ✅ Cleanup temporary disk files or reverse external API state.<br>❌ Don't perform DB queries inside this handler — the transaction is already rolled back. |

---

## 2. Scheduler Hooks (`scheduler_events`)

Defines automated background tasks executed periodically by the Frappe Scheduler daemon.

```python
scheduler_events = {
    "all": [
        "my_custom_app.tasks.run_every_4_minutes"
    ],
    "hourly": [
        "my_custom_app.tasks.sync_external_orders"
    ],
    "daily": [
        "my_custom_app.tasks.generate_daily_summary"
    ],
    "weekly": [
        "my_custom_app.tasks.cleanup_expired_tokens"
    ],
    "monthly": [
        "my_custom_app.tasks.calculate_monthly_analytics"
    ],
    "cron": {
        "0 9 * * 1-5": [
            "my_custom_app.tasks.weekday_morning_report"
        ]
    }
}
```

---

## 3. Overriding Controllers & Methods

### `override_doctype_class`

Extends or replaces standard Frappe/ERPNext Document Controller Python classes in an upgrade-safe manner.

```python
override_doctype_class = {
    "Task": "my_custom_app.overrides.task.CustomTaskController"
}
```

```python
# my_custom_app/overrides/task.py
from frappe.desk.doctype.task.task import Task

class CustomTaskController(Task):
    def validate(self):
        super().validate()  # Execute standard core validations first
        # Custom validation logic
        self.apply_custom_business_logic()
```

---

### `override_whitelisted_methods`

Replaces core `@frappe.whitelist()` API endpoints with your application's custom function handler.

```python
override_whitelisted_methods = {
    "frappe.desk.doctype.event.event.get_events": "my_custom_app.api.get_custom_events"
}
```

---

## 4. Permission Hooks

### `permission_query_conditions`

Applies custom SQL `WHERE` conditions dynamically based on active user roles or permissions.

```python
permission_query_conditions = {
    "Task": "my_custom_app.permissions.get_task_query_conditions"
}
```

```python
def get_task_query_conditions(user=None):
    if not user: user = frappe.session.user
    if "System Manager" in frappe.get_roles(user):
        return ""
    # Restrict users to tasks they own or are assigned to
    return f"`tabTask`.owner = {frappe.db.escape(user)}"
```

### `has_permission`

Programmatically grants or denies permission for specific document instances.

```python
has_permission = {
    "Task": "my_custom_app.permissions.check_task_permission"
}
```

---

## 5. Client Desk Assets & Script Inclusions

Injects custom JavaScript and CSS bundles into Frappe Desk.

```python
# Include JS in specific DocType Views
doctype_js = {
    "Task": "public/js/task_custom.js"
}

doctype_list_js = {
    "Task": "public/js/task_list.js"
}

doctype_tree_js = {
    "Account": "public/js/account_tree.js"
}

doctype_calendar_js = {
    "Event": "public/js/event_calendar.js"
}

# Global Desk JS & CSS inclusions
app_include_js = "/assets/my_custom_app/js/my_custom_app.js"
app_include_css = "/assets/my_custom_app/css/my_custom_app.css"

# Global Web/Portal JS & CSS inclusions
web_include_js = "/assets/my_custom_app/js/portal.js"
web_include_css = "/assets/my_custom_app/css/portal.css"
```

---

## 6. Jinja Templating & Session Extensions

```python
# Extend Jinja template engine with custom methods & filters
jinja = {
    "methods": [
        "my_custom_app.utils.format_currency_symbol"
    ],
    "filters": [
        "my_custom_app.utils.custom_slugify"
    ]
}

# Extend bootinfo dictionary sent to desk client on login
boot_session = "my_custom_app.utils.boot_session_handler"
```

---

## 7. Website Route Rules & Portal Customizations

```python
# Rewrite web routes cleanly
website_route_rules = [
    {"from_route": "/projects/<project_id>", "to_route": "project_detail"},
]

# Add custom portal menu links in /me page
portal_menu_items = [
    {"title": "My Support Tickets", "route": "/tickets", "role": "Customer"}
]
```

---

## 8. Fixtures Export

Exports specific database records (e.g. Custom Fields, Property Setters, Print Formats) as JSON files inside your app directory to be automatically imported on other sites during `bench migrate`.

```python
fixtures = [
    {
        "dt": "Custom Field",
        "filters": [["module", "=", "My Custom App"]]
    },
    {
        "dt": "Property Setter",
        "filters": [["module", "=", "My Custom App"]]
    }
]
```

---

## 9. Request & Job Middleware Hooks

```python
# Executed on every HTTP request before processing
before_request = ["my_custom_app.middleware.check_ip_whitelist"]

# Executed on every HTTP request after completion
after_request = ["my_custom_app.middleware.log_api_metrics"]

# Executed before background RQ job execution
before_job = ["my_custom_app.middleware.set_job_context"]

# Executed after background RQ job completion
after_job = ["my_custom_app.middleware.clear_job_context"]
```

---

## Related Topics

- [07. Controllers & Events](/07-controllers/)
- [14. Authentication & Permissions](/14-authentication-permissions/)
- [15. Background Jobs](/15-background-jobs-scheduler/)

