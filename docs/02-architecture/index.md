---
title: Frappe v15 Architecture & Request Lifecycle
description: Deep technical breakdown of Frappe Framework v15 execution stack, HTTP request pipeline, database ORM layer, background workers, and event architecture.
version: v15
category: Overview & Basics
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Frappe Framework Architecture

Understanding Frappe’s architecture is essential for writing scalable, secure, and maintainable applications. Frappe handles everything from HTTP requests to database transactions, background jobs, real-time messaging, and permissions seamlessly.

---

## 1. System High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                            │
│                 (JavaScript / Desk UI / Vue 3 / REST Client)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / HTTPS / WebSockets
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              NGINX (Reverse Proxy)                     │
│               - Serves static assets directly (/assets)                │
│               - Terminates SSL/TLS                                     │
│               - Routes /api & desk requests to Gunicorn/WSGI          │
│               - Routes /socket.io to Node WebSocket Server             │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌───────────────────────────────┐   ┌────────────────────────────────────┐
│      GUNICORN / WERKZEUG      │   │    NODE.JS SOCKET.IO SERVER        │
│       (WSGI Web Server)       │   │   (Realtime Event Emitter)         │
└───────────────┬───────────────┘   └────────────────┬───────────────────┘
                │                                    │
                ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FRAPPE PYTHON FRAMEWORK                         │
│  - Middleware: WSGI App (frappe.app)                                   │
│  - Request Context: frappe.local (site, db, session, user, conf)       │
│  - Controller Layer: Document ORM & Controller Hooks                   │
│  - Event Layer: doc_events, hooks.py, permission_query_conditions     │
└──────┬────────────────────┬────────────────────┬──────────────────┬────┘
       │                    │                    │                  │
       ▼                    ▼                    ▼                  ▼
┌──────────────┐     ┌──────────────┐    ┌──────────────┐   ┌────────────┐
│   MARIADB    │     │ REDIS CACHE  │    │ REDIS QUEUE  │   │ FILE SYSTEM│
│ (PostgreSQL) │     │ (Session &   │    │  (RQ Jobs)   │   │  (Site     │
│ Persistent DB│     │ Doc Caching) │    │  Background  │   │  Uploads)  │
└──────────────┘     └──────────────┘    └──────┬───────┘   └────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │      RQ WORKER PROCESSES     │
                                 │ (Default, Short, Long Queues)│
                                 └──────────────────────────────┘
```

---

## 2. Request Lifecycle Detailed Pipeline

Every incoming HTTP request goes through `frappe.app.application` in `frappe/app.py`:

```
Incoming Request
      │
      ▼
1. Init Context ────────► frappe.init(site_name) -> setup frappe.local
      │
      ▼
2. Connect DB ──────────► frappe.connect() -> establish MySQL / Postgres connection
      │
      ▼
3. Authenticate ────────► frappe.sessions.SessionDB() -> validate session cookie / OAuth / API Key
      │
      ▼
4. Pre-Request Hooks ──► Run hooks.before_request handlers
      │
      ▼
5. Route Handler ───────► Determine endpoint:
                          ├── REST API (/api/resource/DocType/name)
                          ├── RPC Whitelisted Method (/api/method/path)
                          └── Web Page Renderer (/path)
      │
      ▼
6. Controller / ORM ────► Execute DocType Controller validation, DB queries, business logic
      │
      ▼
7. Post-Request Hooks ─► Run hooks.after_request handlers
      │
      ▼
8. Commit / Rollback ───► frappe.db.commit() (if HTTP 200 OK) else frappe.db.rollback()
      │
      ▼
9. Destroy Context ────► frappe.destroy() -> Close DB connection, flush log streams
```

---

## 3. The `frappe.local` Thread-Local State

Frappe utilizes Python's thread-local storage mechanism (`frappe.local`) to manage contextual state for each active request.

### Core Properties Available in `frappe.local`

```python
import frappe

# Current active site name
site = frappe.local.site

# Active MariaDB / PostgreSQL database connection object
db = frappe.local.db

# Current user session information
session = frappe.local.session  # e.g., frappe.session.user

# Parsed site configuration dict (site_config.json)
conf = frappe.local.conf

# Active Werkzeug Request object
request = frappe.local.request

# Request flags (transient flags used during request lifecycle)
flags = frappe.local.flags
```

> [!WARNING]
> Do not persist state in global variables! Frappe handles multiple concurrent HTTP requests across worker processes. Always use `frappe.local` or `frappe.flags` for request-scoped context.

---

## 4. Database Abstraction Architecture

Frappe provides a 3-tier database access strategy:

1. **Document ORM Layer (`frappe.get_doc`)**: Complete object wrapper with full lifecycle hooks, validations, permissions, child tables, and audit logs. Use for writing and modifying business entities.
2. **Database API Layer (`frappe.db.get_value`, `frappe.db.get_all`)**: Lightweight, high-performance query execution bypassing document creation. Use for standard reads and set operations.
3. **Query Builder Layer (`frappe.qb`)**: Type-safe, SQL-injection proof programmatic query generator based on PyPika. Use for complex analytical queries, JOINs, and aggregates.

---

## 5. Multi-Tenancy Architecture

A single Frappe Bench installation supports **multi-tenancy** out of the box:

- **Hostname-Based Multi-Tenancy**: Nginx inspects the `Host` header (e.g., `site1.com`, `site2.com`) and routes requests to the corresponding site directory under `sites/`.
- **Database Isolation**: Each site owns its independent MariaDB database and isolated upload folders (`sites/<site>/public/` & `sites/<site>/private/`).
- **Shared Codebase**: All sites share the same installed python apps inside `apps/`, keeping memory footprint minimal.

---

## Related Topics

- [03. Bench CLI Reference](/03-bench-cli/)
- [06. Document API & Lifecycle](/06-documents/)
- [09. Server API Reference](/09-server-api/)
