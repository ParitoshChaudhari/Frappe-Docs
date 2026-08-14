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

Frappe provides 17+ controller lifecycle methods executed in an **exact, deterministic chronological order**.

> [!IMPORTANT]
> The insert lifecycle fires hooks in this order: `before_insert` → `before_naming` → `autoname` → `before_validate` → `validate` → `before_save` → **DB INSERT** → `after_insert` → `on_update`. Note that `before_naming` fires **before** `autoname` — missing this step is a common source of naming bugs.

| Method Name | Trigger Point | Allowed Operations | Operations to AVOID |
| :--- | :--- | :--- | :--- |
| `before_insert` | Immediately prior to first DB insert (new docs only) | Set default field values; one-time initialization logic | Querying `frappe.db` using `self.name` — it is not assigned yet |
| `before_naming` | Fires immediately before `autoname()` is invoked | Pre-process or format field values that are used inside the `autoname` expression | Reading `self.name` — it is still `None` at this point |
| `autoname` | Primary key `self.name` resolution step | Assign `self.name` a custom string value | Modifying other doc field values |
| `before_validate` | Prior to mandatory field checks | Sanitize inputs, trim strings, set computed defaults | Throwing hard `frappe.throw()` exceptions |
| `validate` | Runs on every `save()` and `submit()` | Enforce business rules; call `frappe.throw()` to abort | Heavy external HTTP calls (blocks web threads) |
| `before_save` | Immediately prior to SQL `INSERT` or `UPDATE` | Finalize calculated field values before DB write | Heavy background network operations |
| `after_insert` | Immediately after the initial DB row insertion | Create child or linked documents | Calling `self.save()` (causes double-save); modifying `self` without `db_set` |
| `on_update` | Immediately after DB `INSERT`/`UPDATE` commit | Emit real-time WebSocket events; invalidate Redis cache | **NEVER call `self.save()`** — causes infinite recursion |
| `before_submit` | Prior to workflow submission check | Validate submittable fields before `docstatus` changes to 1 | Posting ledger entries (do that in `on_submit`) |
| `on_submit` | Immediately after submission (`docstatus: 1`) | Post Stock/GL/Inventory vouchers | Editing non-submittable fields |
| `before_cancel` | Prior to cancellation (`docstatus: 1 → 2`) | Verify no dependent vouchers prevent cancellation | Deleting database rows |
| `on_cancel` | Immediately after cancellation (`docstatus: 2`) | Reverse GL & Stock ledger entries | Calling `doc.submit()` |
| `before_update_after_submit` | Prior to saving edits on a submitted document | Validate fields configured with `allow_on_submit: 1` | Changing core document fields |
| `on_update_after_submit` | After saving edits on a submitted document | Write audit logs for modifications on submitted records | Re-submitting the document |
| `before_trash` | Prior to the document deletion process | Block deletion of referenced or critical records | Modifying document field values |
| `after_delete` | Immediately after the database row is deleted | Clean up external file attachments (S3, disk) | Dereferencing `self` in the database |
| `on_change` | Fires on any save/submit/cancel state change | Dispatch webhook notifications; global audit tracking | Calling `self.save()` |
| `on_rollback` | Fires if the database transaction rolls back | Revert non-database side effects (temp files, external API calls) | Performing DB queries inside the handler |

### Complete Lifecycle Code Example

This example demonstrates every commonly used hook in order of execution:

```python
import frappe
from frappe import _
from frappe.model.document import Document

class CustomTask(Document):
    def before_insert(self):
        """
        Step 1 (insert only): Runs before the name is resolved.
        Use for one-time initialization that should only happen on creation.
        """
        self.status = "Open"
        print("[LIFECYCLE] 1. before_insert: Initialized status=Open")

    def before_naming(self):
        """
        Step 2 (insert only): Runs immediately before autoname().
        Use to format or clean fields that feed into the naming expression.
        self.name is still None here!
        """
        if self.subject:
            # Normalize the subject before it's used in the name expression
            self.subject = self.subject.strip().title()
        print("[LIFECYCLE] 2. before_naming: Normalized subject for autoname")

    def autoname(self):
        """
        Step 3 (insert only): Assign the primary key.
        """
        prefix = f"TASK-{frappe.utils.today()}-"
        count = frappe.db.count("Custom Task") + 1
        self.name = f"{prefix}{count:05d}"
        print(f"[LIFECYCLE] 3. autoname: Assigned name={self.name}")

    def before_validate(self):
        """
        Step 4 (every save/submit): Runs before mandatory field checks.
        Use to auto-fill defaults or sanitize inputs.
        """
        if not self.priority:
            self.priority = "Medium"  # Set a default if not provided
        print("[LIFECYCLE] 4. before_validate: Set default priority")

    def validate(self):
        """
        Step 5 (every save/submit): Primary validation checkpoint.
        frappe.throw() here will abort the save and rollback the transaction.
        """
        if not self.subject:
            frappe.throw(_("Subject is mandatory!"))
        if self.end_date and self.start_date and self.end_date < self.start_date:
            frappe.throw(_("End Date cannot be before Start Date."))
        print("[LIFECYCLE] 5. validate: All validations passed")

    def before_save(self):
        """
        Step 6 (every save): Finalize computed values before writing to DB.
        """
        self.subject = self.subject.strip()
        print("[LIFECYCLE] 6. before_save: Trimmed subject whitespace")

    def on_update(self):
        """
        Step 7 (after DB commit): Post-save tasks like cache/realtime updates.
        NEVER call self.save() here — it will cause infinite recursion!
        """
        print(f"[LIFECYCLE] 7. on_update: Saved document {self.name}")

    def before_trash(self):
        """Runs before deletion — use to block unsafe deletes."""
        if self.status == "Closed":
            frappe.throw(_("Cannot delete Closed tasks!"))
        print(f"[LIFECYCLE] 8. before_trash: Deletion allowed for {self.name}")

    def after_delete(self):
        """Runs after the row is deleted — use for external cleanup."""
        print(f"[LIFECYCLE] 9. after_delete: Cleaned up task {self.name}")
```

#### Expected Log Output on First Insert

```text
[LIFECYCLE] 1. before_insert: Initialized status=Open
[LIFECYCLE] 2. before_naming: Normalized subject for autoname
[LIFECYCLE] 3. autoname: Assigned name=TASK-2026-08-14-00001
[LIFECYCLE] 4. before_validate: Set default priority
[LIFECYCLE] 5. validate: All validations passed
[LIFECYCLE] 6. before_save: Trimmed subject whitespace
[LIFECYCLE] 7. on_update: Saved document TASK-2026-08-14-00001
```

#### Expected Log Output on Subsequent Save

```text
[LIFECYCLE] 4. before_validate: Set default priority
[LIFECYCLE] 5. validate: All validations passed
[LIFECYCLE] 6. before_save: Trimmed subject whitespace
[LIFECYCLE] 7. on_update: Saved document TASK-2026-08-14-00001
```

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

