---
title: Controller Classes & Lifecycle Events in Frappe v15
description: Master Frappe controller classes, document lifecycle methods, validate, on_update, on_submit, and controller execution rules.
version: v15
category: DocTypes & Data Modeling
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge server">Server Only</span> <span class="badge stable">Stable</span> Controllers & Lifecycle Events

Every DocType in Frappe Framework v15 is backed by a Python class inheriting from `frappe.model.document.Document`. This class acts as the business logic **Controller**.

---

## 1. Controller Class Structure

The Python file is located in the DocType directory: `apps/<app_name>/<app_name>/<module>/doctype/<doctype_name>/<doctype_name>.py`.

```python
import frappe
from frappe import _
from frappe.model.document import Document

class CustomTask(Document):
    def validate(self):
        """Executes before saving or submitting."""
        if self.end_date and self.start_date and self.end_date < self.start_date:
            frappe.throw(_("End Date cannot be before Start Date"))

    def on_update(self):
        """Executes after database save."""
        self.sync_task_status_with_project()

    def sync_task_status_with_project(self):
        if self.project:
            frappe.db.set_value("Project", self.project, "last_updated", frappe.utils.now())
```

---

## 2. Complete Lifecycle Events Reference Matrix

Frappe provides 15+ controller lifecycle methods executed in exact chronological order:

| Method Name | Trigger Point | Allowed Operations | Operations to AVOID |
| :--- | :--- | :--- | :--- |
| `before_insert` | Immediately prior to first DB insert | Default field calculations | Database `frappe.db.sql` queries on unsaved name |
| `before_naming` | Prior to primary key name resolution | Altering autoname parameters | Fetching `self.name` (not yet assigned) |
| `autoname` | Generating primary key `self.name` | Custom name string assignment | Modifying docfield values |
| `before_validate` | Prior to mandatory field checks | Data sanitization & trimming | Throwing hard validation exceptions |
| `validate` | Save & Submit validation step | Calculations & throwing `frappe.throw()` | Modifying sibling database records |
| `before_save` | Immediately prior to DB INSERT/UPDATE | Finalizing doc attributes | Heavy background network operations |
| `after_insert` | Right after initial DB row insertion | Child record generation | Modifying `self` attributes without `db_set` |
| `on_update` | Right after DB save commit | Triggering real-time sockets & cache invalidations | Calling `self.save()` (causes infinite recursion!) |
| `before_submit` | Prior to submission workflow check | Validation of submittable fields | Cancelling linked records |
| `on_submit` | Right after submission (`docstatus: 1`) | Stock movement, ledger entries, posting | Editing non-submittable fields |
| `before_cancel` | Prior to cancellation (`docstatus: 2`) | Verification of linked vouchers | Deleting primary records |
| `on_cancel` | Right after cancellation | Reversing GL & Stock ledger entries | Calling `doc.submit()` |
| `before_update_after_submit` | Prior to editing submittable doc fields | Validating editable submittable fields | Changing core document fields |
| `on_update_after_submit` | After editing submittable doc fields | Audit logging | Re-submitting document |
| `after_delete` | Right after database row deletion | Cleaning external file attachments | Dereferencing `self` in database |

---

## 3. Controller Execution Best Practices & Anti-Patterns

### ❌ Never Call `self.save()` Inside `on_update()`

Calling `self.save()` inside `on_update()` triggers `on_update()` again, creating an infinite recursive loop resulting in Python `RecursionError` or server memory exhaustion.

```python
# BAD (Infinite Recursion)
class Task(Document):
    def on_update(self):
        self.status = "Updated"
        self.save()  # ❌ NEVER DO THIS!

# GOOD
class Task(Document):
    def validate(self):
        self.status = "Updated"  # Set before save!
```

---

### ❌ Avoid External API Calls in `validate()`

HTTP requests to external APIs (e.g. Stripe, Slack) inside `validate()` will block web server threads, drastically degrading site responsiveness.

```python
# GOOD: Offload heavy network calls to background jobs
class Task(Document):
    def on_update(self):
        if self.status == "Closed":
            frappe.enqueue(
                "my_app.tasks.notify_slack",
                task_name=self.name,
                queue="short"
            )
```

---

## Related Topics

- [06. Document API & Lifecycle](/06-documents/)
- [08. Hooks Reference](/08-hooks/)
- [15. Background Jobs](/15-background-jobs-scheduler/)
