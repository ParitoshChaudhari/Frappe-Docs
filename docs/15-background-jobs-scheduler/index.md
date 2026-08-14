---
title: Background Jobs & Scheduler in Frappe v15
description: Comprehensive reference for frappe.enqueue, Redis RQ background workers, queues, scheduler_events, and job error recovery.
version: v15
category: Server-Side Python APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge server">Server Only</span> <span class="badge stable">Stable</span> Background Jobs & Scheduler

Frappe Framework v15 manages asynchronous background job execution and periodic scheduled tasks using **Redis** and **RQ (Redis Queue)**.

---

## 1. Asynchronous Execution (`frappe.enqueue`)

`frappe.enqueue` offloads long-running or computationally expensive tasks (e.g. PDF generation, bulk emails, third-party API sync) to background RQ worker processes.

### Syntax

```python
frappe.enqueue(
    method,
    queue="default",
    timeout=300,
    is_async=True,
    now=False,
    enqueue_after_commit=False,
    job_name=None,
    **kwargs
)
```

### Parameter Matrix

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `method` | `str` \| `function` | Mandatory | Python dotted function path or callable |
| `queue` | `str` | `"default"` | Queue category: `"short"` (300s), `"default"` (1500s), `"long"` (21600s) |
| `timeout` | `int` | `300` | Hard job timeout in seconds before worker raises `JobTimeoutException` |
| `is_async` | `bool` | `True` | If `False`, executes synchronously in main thread (for testing) |
| `now` | `bool` | `False` | Executes function inline immediately |
| `enqueue_after_commit` | `bool` | `False` | Delays pushing job to Redis until `frappe.db.commit()` succeeds |
| `job_name` | `str` | `None` | Custom identifier to prevent duplicate job enqueuing |
| `**kwargs` | keyword args | — | Keyword arguments passed to target function |

### Practical Example

```python
import frappe

# Server method triggering background report processing
@frappe.whitelist()
def trigger_monthly_report_generation(year, month):
    frappe.enqueue(
        "my_custom_app.tasks.generate_pdf_report",
        queue="long",
        timeout=1800,
        enqueue_after_commit=True,
        job_name=f"monthly_pdf_{year}_{month}",
        year=year,
        month=month
    )
    frappe.msgprint("Report generation started in background.")
```

---

## 2. Background Queue Classifications

Frappe v15 configures 3 default Redis RQ queues:

```text
┌──────────────┬─────────────────┬───────────────────────────────────────┐
│ Queue Name   │ Default Timeout │ Recommended Workload                  │
├──────────────┼─────────────────┼───────────────────────────────────────┤
│ short        │ 300 seconds     │ Fast alerts, Webhooks, Single emails  │
│ default      │ 1500 seconds    │ Batch updates, standard syncs         │
│ long         │ 21600 seconds   │ Large PDF exports, heavy DB migrations│
└──────────────┴─────────────────┴───────────────────────────────────────┘
```

---

## 3. Scheduled Tasks (`scheduler_events`)

Periodic cron tasks are defined inside your application's `hooks.py`:

```python
# hooks.py
scheduler_events = {
    "hourly": [
        "my_custom_app.tasks.hourly_inventory_sync"
    ],
    "daily": [
        "my_custom_app.tasks.daily_backup_cleanup"
    ],
    "cron": {
        "*/15 * * * *": [
            "my_custom_app.tasks.check_server_heartbeat"
        ]
    }
}
```

### Handler Task Definition

```python
# my_custom_app/tasks.py
import frappe

def hourly_inventory_sync():
    """Executed automatically every hour by Bench Scheduler."""
    frappe.logger("scheduler").info("Starting hourly inventory sync...")
    # Business logic execution
```

---

## 4. Monitoring Background Jobs & Workers

View active, queued, and failed background jobs in Desk under **RQ Job** DocType, or via terminal console:

```bash
# Monitor RQ queues via Bench CLI
bench doctor

# Purge failed background jobs
bench purge-jobs
```

---

## Related Topics

- [08. Hooks Reference](/08-hooks/)
- [16. Cache, Realtime, Email & Files](/16-cache-realtime-email-files/)
