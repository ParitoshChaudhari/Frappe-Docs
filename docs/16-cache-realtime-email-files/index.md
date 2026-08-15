---
title: Cache, Realtime, System Notifications, Email & File APIs in Frappe v15
description: Comprehensive reference for Redis caching (frappe.cache), Realtime WebSockets, System Notifications (Bell Icon, Toasts, Msgprint, Confirm, Prompt), Rule-Based Notifications, Email API (frappe.sendmail), and File attachments.
version: v15
category: Server-Side Python APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Cache, Realtime WebSockets, System Notifications, Email & File APIs

Frappe Framework v15 integrates Redis caching, Socket.IO WebSockets, in-app bell notifications, client UI alert toasts, modal confirmation dialogs, event-driven rule notifications, transactional email delivery, and file attachment handling.

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

### Server Event & Progress Publishing (Python)

```python
import frappe

# 1. Target specific user client session
frappe.publish_realtime(
    event="task_progress",
    message={"task_id": "TASK-00001", "progress": 75},
    user=frappe.session.user  # Target specific user or omit for all connected users
)

# 2. Target users viewing a specific DocType record
frappe.publish_realtime(
    event="doc_update",
    message={"status": "Approved", "approved_by": frappe.session.user},
    doctype="Sales Invoice",
    docname="SINV-00001"
)

# 3. Publish interactive progress bar update to Desk UI
frappe.publish_progress(
    percent=75,
    title="Processing Bulk Export...",
    description="Processing row 750 of 1000"
)
```

### Client-Side WebSockets Subscription (JavaScript)

```javascript
// Listen for custom server-push event in Desk Client Scripts
frappe.realtime.on("task_progress", (data) => {
    console.log("Progress update received:", data.progress);
    frappe.show_alert({
        message: __("Task {0} Progress: {1}%", [data.task_id, data.progress]),
        indicator: "blue"
    });
});

// Emit event from client to server socket
frappe.realtime.emit("ping_server", { client_timestamp: Date.now() });
```

---

## 3. System Notifications & Desk UI Alerts (All Types)

Frappe v15 supports multiple notification layers ranging from in-app desk bell notifications to non-intrusive toasts, modal dialogs, and event-driven rule notifications.

### Type 1: In-App Desk Bell Notifications (`Notification Log` DocType)

Creates persistent notifications under the **Bell Icon (🔔)** in the Frappe Desk top bar.

```python
import frappe

# 1. Create a Bell Notification Log programmatically
notification = frappe.get_doc({
    "doctype": "Notification Log",
    "subject": "Task Assigned: Review Q3 Financial Audit",
    "for_user": "auditor@example.com",
    "type": "Assignment",  # Types: 'Mention', 'Assignment', 'Share', 'System Notification', 'Alert', 'Energy Point'
    "document_type": "Task",
    "document_name": "TASK-2026-00042",
    "email_content": "<p>You have been assigned to review the Q3 Financial Audit task.</p>"
})
notification.insert(ignore_permissions=True)

# 2. Mention User Notification Helper
frappe.share.add_docshare(
    doctype="Task",
    name="TASK-2026-00042",
    user="auditor@example.com",
    read=1,
    write=1,
    notify=1  # Triggers automatic notification log + email notification
)
```

### Type 2: Desk UI Toast Notifications (`frappe.show_alert`)

Non-intrusive floating toast alerts in the bottom-right corner of the browser UI.

```javascript
// Basic Toast Alert with Indicator Colors ('green', 'blue', 'orange', 'red')
frappe.show_alert({
    message: __("Document saved successfully!"),
    indicator: "green"
}, 5); // 5 seconds display duration

// Advanced Toast Alert with Click Action Link
frappe.show_alert({
    message: __("New Sales Order received"),
    indicator: "blue",
    actions: [
        {
            label: __("View Order"),
            action: function() {
                frappe.set_route("Form", "Sales Order", "SO-00001");
            }
        }
    ]
}, 8);
```

### Type 3: Dialog Alerts & Popups (`frappe.msgprint` & `frappe.throw`)

Modal dialog messages that pop up in front of the user. Works both in **Python (Server)** and **JavaScript (Client)**.

#### Server-Side Python Popup Alert:
```python
import frappe

# 1. Non-blocking Informational Message
frappe.msgprint(
    msg="Payment gateway synchronized 15 new transactions.",
    title="Sync Complete",
    indicator="green",  # 'blue', 'green', 'orange', 'red'
    alert=False         # True: renders as toast, False: renders as modal popup dialog
)

# 2. Message with Primary Action Button
frappe.msgprint(
    msg="The item stock level is critically low.",
    title="Stock Warning",
    indicator="orange",
    primary_action={
        "label": "Create Material Request",
        "client_action": "frappe.set_route",
        "args": ["Form", "Material Request", "new-material-request-1"]
    }
)

# 3. Interrupt Execution & Throw Exception
frappe.throw(
    msg="Credit limit exceeded for Customer Acme Corp. Maximum limit: $10,000.",
    title="Credit Limit Violation",
    exc=frappe.ValidationError
)
```

#### Client-Side JavaScript Popup Alert:
```javascript
frappe.msgprint({
    title: __("Validation Warning"),
    message: __("Please verify the delivery address before submitting."),
    indicator: "orange"
});
```

### Type 4: Interactive Confirmation & Prompt Modals

Prompt users for input or explicit confirmation before proceeding with sensitive operations.

#### A. Confirmation Modal (`frappe.confirm`)
```javascript
frappe.confirm(
    __("Are you sure you want to cancel and delete invoice {0}?", ["SINV-001"]),
    function() {
        // User clicked YES
        frappe.call({
            method: "frappe.client.delete",
            args: { doctype: "Sales Invoice", name: "SINV-001" },
            callback: function(r) {
                if (!r.exc) {
                    frappe.show_alert({ message: __("Invoice deleted"), indicator: "green" });
                }
            }
        });
    },
    function() {
        // User clicked NO / Cancelled
        frappe.show_alert({ message: __("Action cancelled"), indicator: "orange" });
    }
);
```

#### B. Dynamic Input Prompt (`frappe.prompt`)
```javascript
frappe.prompt([
    {
        label: "Cancellation Reason",
        fieldname: "reason",
        fieldtype: "Small Text",
        reqd: 1
    },
    {
        label: "Notify Supervisor",
        fieldname: "notify_supervisor",
        fieldtype: "Check",
        default: 1
    }
], function(values) {
    console.log("User entered reason:", values.reason);
    console.log("Notify supervisor:", values.notify_supervisor);
    
    // Execute custom server RPC with prompt values
    frappe.call({
        method: "my_app.api.cancel_order",
        args: { reason: values.reason }
    });
}, __("Cancel Order Confirmation"), __("Submit Cancellation"));
```

### Type 5: Rule-Based Automatic Notifications (`Notification` DocType)

Frappe allows zero-code automatic notifications configured via the **Notification** DocType in Desk.

| Field | Configuration Options |
| :--- | :--- |
| **Channel** | Email, Slack, System Notification (Bell), WhatsApp / SMS Webhook |
| **Subjected DocType** | e.g. `Sales Order`, `Issue`, `Leave Application` |
| **Event Trigger** | `New`, `Save`, `Submit`, `Cancel`, `Value Change`, `Days Before`, `Days After` |
| **Condition (Python)** | e.g. `doc.grand_total > 50000 and doc.status == "Submitted"` |
| **Recipients** | Document Owner, Assigned User, Dynamic Field (`doc.contact_email`), Specific Role |

---

## 4. Transactional & Templated Email API (`frappe.sendmail`)

Queues emails in `tabEmail Queue` for background delivery via background worker threads.

### Standard & HTML Email Delivery

```python
import frappe

frappe.sendmail(
    recipients=["client@example.com", "billing@example.com"],
    cc=["manager@example.com"],
    bcc=["audit@example.com"],
    subject="Invoice SINV-2026-001 Submission",
    message="""
        <h3>Dear Customer,</h3>
        <p>Your invoice <b>SINV-2026-001</b> has been processed.</p>
        <p>Total Amount: <b>$1,250.00</b></p>
    """,
    reference_doctype="Sales Invoice",
    reference_name="SINV-2026-001",
    unsubscribe_message="Click here to manage email preferences",
    delayed=True, # Default True: Queues in Email Queue table for async background worker
    now=False     # True: Send synchronously in current HTTP request (blocking)
)
```

### Email with Attachments & Print Format PDF

```python
import frappe

# Generate PDF document attachment in-memory
pdf_content = frappe.get_print(
    doctype="Sales Invoice",
    name="SINV-2026-001",
    print_format="Standard",
    as_pdf=True
)

frappe.sendmail(
    recipients=["customer@example.com"],
    subject="Your Invoice PDF - SINV-2026-001",
    message="Please find attached your invoice copy.",
    reference_doctype="Sales Invoice",
    reference_name="SINV-2026-001",
    attachments=[
        {
            "fname": "Invoice_SINV_2026_001.pdf",
            "fcontent": pdf_content
        }
    ]
)
```

### Jinja Templated Email Sending

```python
import frappe

frappe.sendmail(
    recipients=["user@example.com"],
    subject="Welcome to Frappe v15 Desk",
    template="welcome_user_template",  # Template name stored in Email Template DocType
    args={
        "first_name": "Jane",
        "login_url": "https://site.example.com/login",
        "expiry_days": 7
    },
    reference_doctype="User",
    reference_name="user@example.com"
)
```

### Creating Communication Records

Logs emails under the timeline thread of a document record.

```python
import frappe

comm = frappe.get_doc({
    "doctype": "Communication",
    "communication_type": "Communication",
    "communication_medium": "Email",
    "sent_or_received": "Sent",
    "subject": "Follow up on Issue #402",
    "content": "<p>We have updated the issue status to In-Progress.</p>",
    "sender": frappe.session.user,
    "recipients": "customer@example.com",
    "reference_doctype": "Issue",
    "reference_name": "ISS-2026-00402",
    "status": "Linked"
})
comm.insert(ignore_permissions=True)
```

---

## 5. File Attachment API (`File` DocType)

Frappe categorizes uploaded files as either **Public** (`/files/...`) or **Private** (`/private/files/...`).

### Server File Creation

```python
import frappe

# Save file attachment programmatically
file_doc = frappe.get_doc({
    "doctype": "File",
    "file_name": "contract_agreement.pdf",
    "attached_to_doctype": "Task",
    "attached_to_name": "TASK-2026-00042",
    "is_private": 1,  # 1: Access controlled, 0: Public URL
    "content": b"PDF raw binary content bytes"
})
file_doc.save()

print(file_doc.file_url)  # Returns '/private/files/contract_agreement.pdf'
```

---

## 💡 Summary Matrix of Notification Types

| Notification Type | Trigger Mechanism | Target Audience | Visual Presentation | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Desk Bell Notification** | Python `Notification Log` DocType | Specific User | Bell Icon Badge (🔔) in Top Bar | Assignment, Mentions, Document Sharing |
| **Desk Toast Alert** | JS `frappe.show_alert()` | Current Browser Session | Non-blocking Toast at bottom right | Quick feedback, non-critical save confirmations |
| **Modal Message Popup** | Python/JS `frappe.msgprint()` | Current User | Centered Modal Popup Window | Important notices, multi-step user guidance |
| **Exception Error Throw** | Python/JS `frappe.throw()` | Current User | Red Error Modal Popup + Code Halting | Validation failures, permission checks |
| **Confirmation Modal** | JS `frappe.confirm()` | Current User | Modal with Yes / No action buttons | Destructive actions (Delete, Cancel, Revoke) |
| **Input Prompt Modal** | JS `frappe.prompt()` | Current User | Form Modal with input fields | Requesting user input (Reason, Password, Data) |
| **Rule-Based Notification** | DocType Event Hooks | Dynamic Recipients | Email, Bell, Slack, WhatsApp | Automated workflow notifications |
| **Transactional Email** | Python `frappe.sendmail()` | External / Internal Users | Inbox Email + Attachments | Invoices, Reports, System Alerts, Welcome Emails |

---

## Related Topics

- [09. Server API (`frappe.*`)](/09-server-api/)
- [11. Client API (`frappe.ui.form`)](/11-client-api/)
- [15. Background Jobs & Scheduler](/15-background-jobs-scheduler/)
