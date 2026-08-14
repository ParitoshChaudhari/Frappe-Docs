---
title: Cache, Realtime WebSockets, Email & Files in Frappe v15
description: Comprehensive reference for Redis caching (frappe.cache), Realtime Socket.IO WebSockets (frappe.publish_realtime), Email API (frappe.sendmail), and File attachment management.
version: v15
category: Server-Side Python APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Cache, Realtime, Email & File APIs

Frappe Framework v15 integrates caching, WebSocket event publishing, transactional email delivery, and file attachment handling out of the box.

---

## 1. Redis Caching API (`frappe.cache`)

Frappe uses Redis to cache session data, user settings, system defaults, and expensive database query results.

```python
import frappe

# Access site Redis Cache connection wrapper instance
cache = frappe.cache()

# 1. Store key with Expiry (TTL in seconds)
cache.set_value("system_metrics_summary", {"active_users": 42}, expires_in_sec=3600)

# 2. Retrieve cached key value
metrics = cache.get_value("system_metrics_summary")

# 3. Hash Map Caching Operations
cache.hset("user_settings", "user_123", {"theme": "dark"})
user_theme = cache.hget("user_settings", "user_123")
cache.hdel("user_settings", "user_123")

# 4. Delete specific key or pattern
cache.delete_value("system_metrics_summary")
cache.delete_keys("user_permissions:*")
```

### High-Performance Value Caching (`frappe.get_cached_value`)

```python
# Fetches field value from Redis cache if available, else queries DB and caches result
currency = frappe.get_cached_value("Company", "Acme Corp", "default_currency")
```

---

## 2. Realtime WebSocket Events (`frappe.publish_realtime` & `frappe.publish_progress`)

Publishes real-time events to connected browser clients via Node.js Socket.IO server.

### Server Event & Progress Publishing

```python
# 1. Publish custom event to specific user
frappe.publish_realtime(
    event="task_progress_update",
    message={"progress": 85, "task_id": "TASK-00001"},
    user=frappe.session.user
)

# 2. Publish progress bar directly to Desk header
frappe.publish_progress(
    percent=60,
    title="Exporting Data...",
    description="Processing row 60 of 100"
)

# 3. Publish event to all users viewing a specific DocType record
frappe.publish_realtime(
    event="doc_update",
    message={"status": "Approved"},
    doctype="Sales Invoice",
    docname="SINV-00001"
)
```

### Client Listener (JavaScript Desk)

```javascript
frappe.realtime.on("task_progress_update", (data) => {
    console.log("Progress Update:", data.progress);
    frappe.show_alert({ message: __("Progress: {0}%", [data.progress]), indicator: "blue" });
});
```

---

## 3. Transactional Email API (`frappe.sendmail`)

Queues emails in `tabEmail Queue` for background delivery.

```python
frappe.sendmail(
    recipients=["client@example.com"],
    cc=["manager@example.com"],
    subject="Task Completed Notice",
    message="<p>Your task <b>TASK-00001</b> has been closed.</p>",
    reference_doctype="Task",
    reference_name="TASK-00001",
    attachments=[{
        "fname": "report.pdf",
        "fcontent": pdf_bytes_data
    }],
    now=False  # Queue in background vs send synchronously
)
```

---

## 4. File Attachment API (`File` DocType)

Frappe categorizes uploaded files as either **Public** (`/files/...`) or **Private** (`/private/files/...`).

### Server File Creation

```python
# Save file attachment programmatically
file_doc = frappe.get_doc({
    "doctype": "File",
    "file_name": "contract.pdf",
    "attached_to_doctype": "Task",
    "attached_to_name": "TASK-00001",
    "is_private": 1,  # 1: Access controlled, 0: Public URL
    "content": b"PDF raw binary content bytes"
})
file_doc.save()

print(file_doc.file_url)  # Returns '/private/files/contract.pdf'
```

---

## Related Topics

- [09. Server API](/09-server-api/)
- [15. Background Jobs](/15-background-jobs-scheduler/)
