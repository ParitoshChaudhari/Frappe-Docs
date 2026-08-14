---
title: Client API vs Server API Comparison Matrix
description: Side-by-side comparative analysis of Client JavaScript APIs vs Server Python APIs in Frappe Framework v15.
version: v15
category: Client-Side JavaScript APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Client API vs Server API Reference Matrix

Understanding the boundary between **Client-side JavaScript** (browser) and **Server-side Python** (WSGI web worker) is essential for developing secure, performant Frappe applications.

---

## 1. Feature & API Equivalents Matrix

| Operation Category | Client-Side JS API | Server-Side Python API | Primary Differences |
| :--- | :--- | :--- | :--- |
| **Fetch Single Value** | `frappe.db.get_value(dt, dn, field, callback)` | `frappe.db.get_value(dt, dn, field)` | Client is asynchronous (requires callback/Promise); Server is synchronous. |
| **Fetch Document** | `frappe.db.get_doc(dt, dn)` | `frappe.get_doc(dt, dn)` | Client retrieves cached doc or calls REST API; Server reads directly from DB. |
| **Fetch Record List** | `frappe.db.get_list(dt, args)` | `frappe.get_list(dt, filters=...)` | Both enforce active user role permissions. |
| **Set Field Value** | `frm.set_value(fieldname, value)` | `doc.set(fieldname, value)` or `doc.fieldname = val` | Client updates browser DOM & triggers JS field handlers; Server updates Python instance memory. |
| **Save Document** | `frm.save()` | `doc.save()` | Client triggers HTTP POST request to `/api/method/frappe.desk.form.save.savedocs`. |
| **Direct DB Field Update** | Unavailable (Security restriction) | `doc.db_set(field, val)` or `frappe.db.set_value()` | Server directly executes SQL `UPDATE` query. |
| **Display User Popup** | `frappe.msgprint(msg)` | `frappe.msgprint(msg)` | Both send user popups (Server serializes popup to HTTP response JSON payload). |
| **Raise Exception & Block**| `frappe.validated = false` | `frappe.throw(msg)` | Server aborts request & executes database transaction rollback. |
| **Background Jobs** | Unavailable | `frappe.enqueue(method, queue=...)` | Offloads processing to Redis RQ workers. |

---

## 2. Security & Execution Boundaries

```
┌──────────────────────────────────────────────┐
│             CLIENT BROWSER (JS)              │
│  - User-controlled environment               │
│  - Never trust client inputs or calculations │
│  - Uses frappe.call() to request server RPC  │
└──────────────────────┬───────────────────────┘
                       │ HTTP / REST / RPC
                       ▼
┌──────────────────────────────────────────────┐
│             SERVER PYTHON WORKER             │
│  - Trusted backend environment               │
│  - Enforces @frappe.whitelist() security     │
│  - Validates write permissions               │
│  - Manages database transaction commit/roll  │
└──────────────────────────────────────────────┘
```

---

## Related Topics

- [09. Server API](/09-server-api/)
- [11. Client API](/11-client-api/)
- [21. Security & Performance](/21-security-performance/)
