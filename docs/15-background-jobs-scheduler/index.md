---
title: Background Jobs & Scheduler in Frappe v15
description: Comprehensive reference for frappe.enqueue, frappe.enqueue_doc, Redis RQ background workers, correct queue timeouts, scheduler_events (including *_long variants), bench migrate requirement, and job monitoring.
version: v15
category: Server-Side Python APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge server">Server Only</span> <span class="badge stable">Stable</span> Background Jobs & Scheduler

Frappe Framework v15 manages asynchronous background job execution and periodic scheduled tasks using **Redis** and **RQ (Redis Queue)**. Offloading heavy work to background workers keeps your HTTP request cycle fast and responsive — the web server returns a response immediately while the worker picks up the job from Redis.

---

## 1. Asynchronous Execution (`frappe.enqueue`)

`frappe.enqueue` offloads long-running or computationally expensive tasks (PDF generation, bulk emails, third-party API sync) to background RQ worker processes.

### Syntax

```python
frappe.enqueue(
    method,                    # Python function or dotted module path string
    queue="default",           # One of: "short", "default", "long"
    timeout=None,              # Custom timeout in seconds (overrides queue default)
    is_async=True,             # If False, runs synchronously in the same thread (for testing)
    now=False,                 # If True, executes immediately inline (ignores queue)
    enqueue_after_commit=False, # Delays push to Redis until frappe.db.commit() completes
    at_front=False,            # Inserts job at front/head of queue for priority execution
    job_name=None,             # Custom job name to prevent duplicate enqueuing
    **kwargs                   # Keyword arguments forwarded to the target function
)
```

### Parameter Reference

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `method` | `str` \| `function` | Mandatory | Python dotted function path string OR a direct callable reference |
| `queue` | `str` | `"default"` | Queue category: `"short"`, `"default"`, or `"long"` |
| `timeout` | `int` \| `None` | `None` | Override the queue default timeout in seconds; `None` uses the queue's default |
| `is_async` | `bool` | `True` | If `False`, runs synchronously in the main thread (useful for unit testing) |
| `now` | `bool` | `False` | If `True`, executes function immediately without queueing (bypasses Redis) |
| `enqueue_after_commit` | `bool` | `False` | Delays pushing job to Redis until the current request's `frappe.db.commit()` succeeds |
| `at_front` | `bool` | `False` | Inserts job at the front (head) of the queue for urgent priority execution |
| `job_name` | `str` | `None` | Custom identifier; prevents duplicate job if same `job_name` is already in queue |
| `**kwargs` | keyword args | — | Keyword arguments forwarded as arguments to the target function |

### Example: Two Ways to Pass the Method

```python
import frappe

def generate_pdf_report(year, month):
    """Long-running report generation task."""
    # ... expensive PDF logic
    pass

# Method 1: Pass function reference directly
frappe.enqueue(generate_pdf_report, queue="long", timeout=1800, year=2026, month=8)

# Method 2: Pass dotted module path as a string (recommended — works reliably across worker processes)
frappe.enqueue(
    "my_custom_app.tasks.generate_pdf_report",
    queue="long",
    timeout=1800,
    enqueue_after_commit=True,      # Wait for current DB transaction to commit first
    job_name="monthly_pdf_2026_08", # Prevents duplicate jobs with the same name
    year=2026,
    month=8
)
frappe.msgprint("Report generation started in background.")
```

> [!TIP]
> Always prefer the **dotted module path string** format (`"my_app.tasks.my_func"`) when the function call crosses process boundaries. Python function references may not always serialize correctly in background worker contexts.

---

## 2. Enqueueing a Document Controller Method (`frappe.enqueue_doc`)

Use `frappe.enqueue_doc` when the background task is a **controller method defined on a DocType class**. It automatically handles loading the document in the worker context.

### Syntax

```python
frappe.enqueue_doc(
    doctype,       # DocType name string
    name,          # Document primary key (name)
    method,        # Controller method name as a string (e.g. "send_digest")
    queue="default",
    timeout=300,
    **kwargs       # Extra keyword arguments forwarded to the method
)
```

### Example

```python
# apps/my_custom_app/my_module/doctype/task/task.py
import frappe
from frappe.model.document import Document

class Task(Document):
    def generate_task_report(self, notify_user=False):
        """This method runs inside a background worker process."""
        frappe.logger().info(f"Generating report for task: {self.name}")
        if notify_user and self.allocated_to:
            frappe.sendmail(
                recipients=[self.allocated_to],
                subject=f"Report Ready: {self.subject}",
                message=f"Your report for task {self.name} is ready."
            )
```

```python
# Triggering the background job from a whitelisted API:
@frappe.whitelist()
def trigger_task_report(task_name):
    frappe.enqueue_doc(
        "Task",
        task_name,
        "generate_task_report",  # String name of the controller method
        queue="long",
        timeout=4000,
        notify_user=True         # Passed as kwarg to generate_task_report()
    )
    frappe.msgprint(f"Report for task {task_name} queued in background.")
```

> [!NOTE]
> `frappe.enqueue_doc` is preferred over `frappe.enqueue` when the task operates directly on a document — it ensures the document is correctly loaded in the worker's database context.

---

## 3. Background Queue Classifications & Correct Timeouts

Frappe v15 configures **3 default Redis RQ queues**. Each has a default timeout that governs how long a worker runs a job before forcefully terminating it with a `JobTimeoutException`.

```text
┌──────────────┬──────────────────────────┬──────────────────────────────────────────────┐
│ Queue Name   │ Default Timeout          │ Recommended Workload                         │
├──────────────┼──────────────────────────┼──────────────────────────────────────────────┤
│ short        │ 300 seconds  (5 min)     │ Fast webhooks, single emails, quick alerts   │
│ default      │ 300 seconds  (5 min)     │ Standard background syncs, batch reads       │
│ long         │ 1500 seconds (25 min)    │ Large PDF exports, bulk email sends          │
└──────────────┴──────────────────────────┴──────────────────────────────────────────────┘
```

> [!CAUTION]
> The `default` queue timeout is **300 seconds** — the same as `short`. Do not assume a longer window on the `default` queue. Use the `long` queue for tasks that may exceed 5 minutes, or pass a custom `timeout` value explicitly.

### Overriding the Timeout

You can always override a queue's default timeout using the `timeout` parameter:

```python
# Use long queue and set a custom 45-minute timeout
frappe.enqueue(
    "my_custom_app.tasks.bulk_email_send",
    queue="long",
    timeout=2700    # 45 minutes — overrides the 1500-second queue default
)
```

### Adding Custom Queues

For jobs exceeding 25 minutes, define custom queues in `common_site_config.json`:

```json
{
    "workers": {
        "my_heavy_queue": {
            "timeout": 7200,
            "background_workers": 2
        }
    }
}
```

Then start the custom worker:

```bash
bench worker --queue my_heavy_queue
```

---

## 4. Scheduled Tasks (`scheduler_events`)

Periodic background tasks are declared in your application's `hooks.py` using the `scheduler_events` dictionary. Frappe's scheduler daemon reads these and fires them at the appropriate intervals.

> [!IMPORTANT]
> After adding or modifying any `scheduler_events` entries in `hooks.py`, you **must run `bench migrate`** for the changes to be registered and take effect.
> ```bash
> bench migrate
> ```

### Complete Scheduler Event Type Reference

| Event Key | Execution Frequency | Worker Queue | Use Case |
| :--- | :--- | :--- | :--- |
| `all` | Every 4 minutes *(configurable)* | `default` | Heartbeat checks, lightweight polling tasks |
| `hourly` | Every hour | `default` | Cache refreshes, lightweight syncs |
| `hourly_long` | Every hour | `long` | Slow or large hourly syncs (up to 25 min) |
| `daily` | Once per day | `default` | Daily summaries, session cleanup |
| `daily_long` | Once per day | `long` | Database backups, large nightly exports |
| `weekly` | Once per week | `default` | Token cleanup, weekly analytics |
| `weekly_long` | Once per week | `long` | Long-running weekly data processing |
| `monthly` | Once per month | `default` | Billing cycles, monthly reports |
| `monthly_long` | Once per month | `long` | Long-running monthly data migrations |
| `cron` | Custom cron expression | `default` | Precise timing using standard cron strings |

> [!NOTE]
> The `all` event fires every **4 minutes** by default. You can change this interval by setting `scheduler_interval` (in seconds) in `common_site_config.json`:
> ```json
> { "scheduler_interval": 600 }
> ```

> [!IMPORTANT]
> All scheduled jobs run as the **Administrator** user. Any documents created inside a scheduled task will be owned by `Administrator` unless you call `frappe.set_user("target@example.com")` first.

### Complete `hooks.py` Example

```python
# my_custom_app/hooks.py

scheduler_events = {
    # Fires every ~4 minutes — keep this FAST (under 30 seconds expected runtime)
    "all": [
        "my_custom_app.tasks.check_server_heartbeat"
    ],

    # Runs every hour in the DEFAULT queue (300s timeout)
    "hourly": [
        "my_custom_app.tasks.sync_external_orders"
    ],

    # Runs every hour in the LONG queue (1500s timeout) — for slow or large syncs
    "hourly_long": [
        "my_custom_app.tasks.sync_large_inventory_catalog"
    ],

    # Runs once per day in the DEFAULT queue
    "daily": [
        "my_custom_app.tasks.generate_daily_summary",
        "my_custom_app.tasks.cleanup_expired_sessions"
    ],

    # Runs once per day in the LONG queue — ideal for backups and large exports
    "daily_long": [
        "my_custom_app.tasks.take_daily_database_backup"
    ],

    # Runs once per week in the DEFAULT queue
    "weekly": [
        "my_custom_app.tasks.cleanup_expired_tokens"
    ],

    # Runs once per month in the DEFAULT queue
    "monthly": [
        "my_custom_app.tasks.calculate_monthly_analytics"
    ],

    # Custom cron expressions for precise timing
    "cron": {
        # Every weekday at 9:00 AM
        "0 9 * * 1-5": [
            "my_custom_app.tasks.weekday_morning_report"
        ],
        # Every 15 minutes
        "*/15 * * * *": [
            "my_custom_app.tasks.check_payment_gateway_status"
        ],
        # Once a year
        "annual": [
            "my_custom_app.tasks.annual_data_archival"
        ]
    }
}
```

### Scheduler Task Handler Definition

```python
# my_custom_app/tasks.py
import frappe

def sync_external_orders():
    """
    Executed every hour by the Bench Scheduler (default queue, 300s timeout).
    All scheduled jobs run as the Administrator user.
    """
    frappe.logger("scheduler").info("[Scheduler] Starting hourly order sync...")

    # Fetch unsynced submitted orders
    orders = frappe.get_all(
        "Sales Order",
        filters={"custom_synced": 0, "docstatus": 1},
        fields=["name"]
    )

    synced_count = 0
    for order in orders:
        try:
            sync_order_to_external_erp(order.name)
            frappe.db.set_value("Sales Order", order.name, "custom_synced", 1)
            synced_count += 1
        except Exception:
            frappe.log_error(
                title=f"Order Sync Failed: {order.name}",
                message=frappe.get_traceback()
            )

    frappe.db.commit()
    frappe.logger("scheduler").info(f"[Scheduler] Synced {synced_count}/{len(orders)} orders.")


def take_daily_database_backup():
    """
    Runs daily in the LONG queue (1500s timeout).
    Long-running tasks should always use 'daily_long' or 'hourly_long' events.
    """
    frappe.logger("scheduler").info("[Scheduler] Starting daily backup...")
    # ... backup logic here
```

---

## 5. Monitoring Background Jobs & Workers

View active, queued, and failed background jobs in the Desk under the **RQ Job** DocType, or via terminal commands:

```bash
# Check health of all Bench processes (workers, scheduler, web server)
bench doctor

# Purge all failed background jobs from Redis queues
bench purge-jobs

# Start a single-queue worker manually (development)
bench worker --queue short
bench worker --queue default
bench worker --queue long

# Multi-queue: one worker handles both short and default queues
bench worker --queue short,default

# Burst mode: spawn a temporary worker that exits when the queue is empty
bench worker --queue short --burst
```

---

## Related Topics

- [08. Hooks Reference](/08-hooks/)
- [16. Cache, Realtime, Email & Files](/16-cache-realtime-email-files/)
