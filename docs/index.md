---
layout: home

hero:
  name: "Frappe Framework v15"
  text: "The Complete Developer Handbook"
  tagline: "The definitive technical reference for Frappe v15 — APIs, DocTypes, Hooks, Query Builder, JS SDK, REST, Realtime, Security, DevOps & Docker."
  actions:
    - theme: brand
      text: 🚀 Get Started (v15)
      link: /01-getting-started/
    - theme: brand
      text: 🔍 Searchable API Index
      link: /24-api-index/
    - theme: alt
      text: 📊 ORM Masterclass
      link: /30-frappe-orm/
    - theme: alt
      text: ↔️ Server vs Client Matrix
      link: /23-client-vs-server/
    - theme: alt
      text: 🍳 Cookbook Recipes
      link: /22-cookbook/
    - theme: alt
      text: 📦 GitHub Repository
      link: https://github.com/ParitoshChaudhari/Frappe-Docs

features:
  - title: ⚡ Server Python APIs & ORM
    details: Complete reference for frappe.get_doc, frappe.db, PyPika QueryBuilder, transactions, savepoints, background RQ jobs, and Redis caching.
    link: /10-database/
  - title: 🌐 Client-Side JavaScript SDK
    details: Comprehensive guide to frappe.ui.form, frm.set_value, frm.page header controls, frappe.db client proxy, and frappe.model.can_* checks.
    link: /11-client-api/
  - title: 📊 Frappe ORM Masterclass
    details: Deep dive into SELECT, WHERE, LIMIT, GROUP BY, HAVING, INNER/LEFT/RIGHT Joins, UNION & INTERSECT with SQL examples and table outputs.
    link: /30-frappe-orm/
  - title: 🔄 Server ↔ Client API Mapping
    details: Side-by-side comparison table mapping Python backend methods to JavaScript browser equivalents across 13 distinct functional categories.
    link: /23-client-vs-server/
  - title: 🔌 REST API & RPC Endpoints
    details: Authentication, token headers, resource REST endpoints, whitelisted RPC functions, bulk operations, and file upload parameter matrices.
    link: /13-rest-api/
  - title: ⏱️ Background Jobs & Scheduler
    details: Asynchronous execution via frappe.enqueue, frappe.enqueue_doc, queue timeouts (short 300s, long 1500s), and hooks.py scheduler_events.
    link: /15-background-jobs-scheduler/
  - title: 📈 Complete Reports Engine
    details: Master Standard Reports, Query Reports, Script Reports, Tree Reports, Frappe Charts, KPI summary cards & MultiSelect filters.
    link: /18-reports/
  - title: 🐳 Production Frappe Docker & DevOps
    details: Tabbed OS dependency commands (macOS, Linux, WSL2), Docker Compose, pwd.yml, custom app images, and Kubernetes Helm deployment.
    link: /27-frappe-docker/
  - title: 📦 Open Source Ecosystem
    details: Overview of major open-source apps built on Frappe Framework v15, including ERPNext, Frappe HR (HRMS), and India Compliance.
    link: /opensource-projects/
---

<div class="vp-doc" style="max-width: 1152px; margin: 0 auto; padding: 1.5rem 1.5rem 4rem;">

<!-- Release Pill Banner -->
<div style="text-align: center; margin-bottom: 2.5rem;">
  <a href="/29-version-history/" class="hero-pill" style="text-decoration: none;">
    <span style="background: #36b37e; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 0.72rem;">NEW v1.4.0</span>
    <span>Full Official Accuracy Audit & 110+ API Gap Integration</span>
    <span style="opacity: 0.6;">→</span>
  </a>
</div>

<!-- Key Performance Stats Banner -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 3.5rem;">
  <div class="stat-box">
    <div style="font-size: 2.4rem; font-weight: 800; color: var(--vp-c-brand-1);">30+</div>
    <div style="font-size: 0.88rem; font-weight: 600; color: var(--vp-c-text-2); margin-top: 0.25rem;">Technical Chapters</div>
  </div>
  <div class="stat-box">
    <div style="font-size: 2.4rem; font-weight: 800; color: #36b37e;">110+</div>
    <div style="font-size: 0.88rem; font-weight: 600; color: var(--vp-c-text-2); margin-top: 0.25rem;">Cataloged APIs & Methods</div>
  </div>
  <div class="stat-box">
    <div style="font-size: 2.4rem; font-weight: 800; color: #ffab00;">13</div>
    <div style="font-size: 0.88rem; font-weight: 600; color: var(--vp-c-text-2); margin-top: 0.25rem;">Production Recipes</div>
  </div>
  <div class="stat-box">
    <div style="font-size: 2.4rem; font-weight: 800; color: #00b8d9;">v15</div>
    <div style="font-size: 0.88rem; font-weight: 600; color: var(--vp-c-text-2); margin-top: 0.25rem;">Frappe Framework Version</div>
  </div>
</div>

---

## 🎯 Quick Learning Pathways by Developer Role

Select your primary development focus to jump directly to target documentation:

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin: 1.5rem 0 3.5rem;">
  
  <div class="role-card" style="border-left-color: #0052cc;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
      <h3 style="margin: 0; font-size: 1.15rem; color: var(--vp-c-text-1);">🐍 Python & Backend Developers</h3>
      <span class="badge server">SERVER</span>
    </div>
    <p style="font-size: 0.9rem; color: var(--vp-c-text-2); margin-bottom: 1.25rem; line-height: 1.5;">Master Document ORM (<code>frappe.get_doc</code>), PyPika QueryBuilder, raw SQL parameters, controller hooks, background RQ jobs, and Redis caching.</p>
    <a href="/10-database/" style="font-weight: 600; font-size: 0.88rem; color: var(--vp-c-brand-1); text-decoration: none;">Explore Database & ORM →</a>
  </div>

  <div class="role-card" style="border-left-color: #ffab00;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
      <h3 style="margin: 0; font-size: 1.15rem; color: var(--vp-c-text-1);">🌐 Frontend & Client Scripting</h3>
      <span class="badge client">CLIENT</span>
    </div>
    <p style="font-size: 0.9rem; color: var(--vp-c-text-2); margin-bottom: 1.25rem; line-height: 1.5;">Learn <code>frm</code> event handlers, dynamic form properties, <code>frm.page</code> toolbar controls, <code>frappe.db</code> JS promises, and Socket.IO WebSockets.</p>
    <a href="/11-client-api/" style="font-weight: 600; font-size: 0.88rem; color: var(--vp-c-brand-1); text-decoration: none;">Explore Client Scripting →</a>
  </div>

  <div class="role-card" style="border-left-color: #36b37e;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
      <h3 style="margin: 0; font-size: 1.15rem; color: var(--vp-c-text-1);">⚙️ DevOps & Systems Engineers</h3>
      <span class="badge v15">DEVOPS</span>
    </div>
    <p style="font-size: 0.9rem; color: var(--vp-c-text-2); margin-bottom: 1.25rem; line-height: 1.5;">Install Bench dependencies across macOS, Linux, WSL2, monitor Supervisor/MariaDB/Redis, and deploy production Frappe Docker with Helm.</p>
    <a href="/25-devops-installation/" style="font-weight: 600; font-size: 0.88rem; color: var(--vp-c-brand-1); text-decoration: none;">Explore DevOps Guide →</a>
  </div>

  <div class="role-card" style="border-left-color: #904ee2;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
      <h3 style="margin: 0; font-size: 1.15rem; color: var(--vp-c-text-1);">🔌 Integration & API Engineers</h3>
      <span class="badge stable">INTEGRATIONS</span>
    </div>
    <p style="font-size: 0.9rem; color: var(--vp-c-text-2); margin-bottom: 1.25rem; line-height: 1.5;">Build authenticated REST integrations, handle file uploads, implement custom <code>@frappe.whitelist()</code> RPC endpoints, and token authentication.</p>
    <a href="/13-rest-api/" style="font-weight: 600; font-size: 0.88rem; color: var(--vp-c-brand-1); text-decoration: none;">Explore REST & RPC APIs →</a>
  </div>

</div>

---

## ⚡ Interactive Multi-Language API Code Playground

Compare how Frappe Framework handles common development operations across Python Server, Client JavaScript, Background Workers, and REST API:

::: code-group

```python [🐍 Python Server (frappe.db / ORM)]
import frappe
from frappe.query_builder import DocType

# 1. ORM Document Retrieval & Edit
doc = frappe.get_doc("Task", "TASK-00001")
doc.priority = "High"
doc.save()

# 2. Fast Parameterized SQL Query
open_tasks = frappe.db.sql("""
    SELECT name, subject, priority
    FROM `tabTask`
    WHERE status = %(status)s AND priority = %(priority)s
""", {"status": "Open", "priority": "High"}, as_dict=True)

# 3. Direct Field Update (Bypasses Lifecycle Hooks)
frappe.db.set_value("Task", "TASK-00001", "status", "Completed")
```

```javascript [🌐 Client JavaScript (frm / frappe.db JS)]
// 1. Form Event Script (Runs in Browser Desk)
frappe.ui.form.on("Task", {
    refresh(frm) {
        if (!frm.is_new() && frm.doc.status !== "Completed") {
            frm.add_custom_button(__("Complete Task"), () => {
                frm.set_value("status", "Completed");
                frm.save();
            });
        }
    }
});

// 2. Client-Side Database Promise API (Proxy to Server)
frappe.db.get_list("Task", {
    filters: { status: "Open", priority: "High" },
    fields: ["name", "subject", "allocated_to"]
}).then(tasks => {
    console.log("High Priority Tasks:", tasks);
});
```

```python [⏱️ Background RQ Job (frappe.enqueue)]
import frappe

# Offload heavy tasks to background workers
frappe.enqueue(
    "my_custom_app.tasks.generate_pdf_report",
    queue="long",                 # Options: "short", "default", "long"
    timeout=1800,                 # 30 minute custom timeout
    enqueue_after_commit=True,    # Wait for DB commit before pushing to Redis
    job_name="pdf_export_2026",
    year=2026,
    month=8
)
```

```javascript [📡 Socket.IO Realtime WebSockets]
// Subscribe to server-push events in Client Script
frappe.realtime.on("task_progress", (data) => {
    frappe.show_alert({
        message: __("Export Progress: {0}%", [data.progress]),
        indicator: "blue"
    });
});

// Server pushes event:
// frappe.publish_realtime("task_progress", {"progress": 85}, user=frappe.session.user)
```

```bash [🔌 REST API (cURL Endpoint)]
# Fetch resource record via REST API
curl -X GET "https://mysite.localhost/api/resource/Task/TASK-00001" \
  -H "Authorization: token api_key:api_secret" \
  -H "Content-Type: application/json"
```

:::

---

## 🏛️ Frappe Framework Architecture Overview

Frappe Framework is a full-stack, battery-included meta-framework. Here is how its architectural components fit together:

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin: 1.5rem 0 3rem;">

  <div class="arch-card">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.5rem;">
      <span style="font-size: 1.3rem;">🖥️</span>
      <strong style="color: var(--vp-c-text-1);">Desk UI & Views</strong>
    </div>
    <p style="font-size: 0.85rem; color: var(--vp-c-text-2); margin: 0; line-height: 1.4;">Vanilla JS, Vue.js, Form Engine, List Views, Kanban, Gantt, Reports, and Dialogs.</p>
  </div>

  <div class="arch-card">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.5rem;">
      <span style="font-size: 1.3rem;">⚙️</span>
      <strong style="color: var(--vp-c-text-1);">Python Web Server</strong>
    </div>
    <p style="font-size: 0.85rem; color: var(--vp-c-text-2); margin: 0; line-height: 1.4;">Werkzeug WSGI, Gunicorn web workers, Jinja2 templating, and REST API routing.</p>
  </div>

  <div class="arch-card">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.5rem;">
      <span style="font-size: 1.3rem;">📦</span>
      <strong style="color: var(--vp-c-text-1);">Document ORM</strong>
    </div>
    <p style="font-size: 0.85rem; color: var(--vp-c-text-2); margin: 0; line-height: 1.4;">Document class, <code>frappe.db</code> APIs, PyPika QueryBuilder, and JSON DocType metadata.</p>
  </div>

  <div class="arch-card">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.5rem;">
      <span style="font-size: 1.3rem;">🚀</span>
      <strong style="color: var(--vp-c-text-1);">Redis & RQ Workers</strong>
    </div>
    <p style="font-size: 0.85rem; color: var(--vp-c-text-2); margin: 0; line-height: 1.4;">Redis Cache, Session store, Redis Queue workers (short, default, long), and Bench Scheduler.</p>
  </div>

</div>

---

## ⚡ Most Frequently Used Developer APIs

Quick cheat sheet for essential day-to-day Frappe Framework methods:

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin: 1.5rem 0 3.5rem;">
  
  <a href="/06-documents/#frappe-get-doc" style="text-decoration: none; color: inherit;">
    <div style="background: var(--vp-c-bg-mute); border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 1rem 1.25rem;">
      <code style="color: var(--vp-c-brand-1); font-weight: 700;">frappe.get_doc(dt, name)</code>
      <p style="font-size: 0.82rem; color: var(--vp-c-text-2); margin: 0.4rem 0 0;">Load document ORM object from database</p>
    </div>
  </a>

  <a href="/10-database/#1-frappe-db-api-reference" style="text-decoration: none; color: inherit;">
    <div style="background: var(--vp-c-bg-mute); border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 1rem 1.25rem;">
      <code style="color: var(--vp-c-brand-1); font-weight: 700;">frappe.db.get_value(dt, filters, field)</code>
      <p style="font-size: 0.82rem; color: var(--vp-c-text-2); margin: 0.4rem 0 0;">Fast single or multi-field SQL reader</p>
    </div>
  </a>

  <a href="/11-client-api/#1-form-event-handlers-frappe-ui-form-on" style="text-decoration: none; color: inherit;">
    <div style="background: var(--vp-c-bg-mute); border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 1rem 1.25rem;">
      <code style="color: var(--vp-c-brand-1); font-weight: 700;">frm.set_value(field, value)</code>
      <p style="font-size: 0.82rem; color: var(--vp-c-text-2); margin: 0.4rem 0 0;">Set field value & trigger UI handlers</p>
    </div>
  </a>

  <a href="/15-background-jobs-scheduler/#1-asynchronous-execution-frappe-enqueue" style="text-decoration: none; color: inherit;">
    <div style="background: var(--vp-c-bg-mute); border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 1rem 1.25rem;">
      <code style="color: var(--vp-c-brand-1); font-weight: 700;">frappe.enqueue(method, queue)</code>
      <p style="font-size: 0.82rem; color: var(--vp-c-text-2); margin: 0.4rem 0 0;">Enqueue async background worker task</p>
    </div>
  </a>

</div>

---

## 🌟 Ecosystem & Open Source Projects

Built on top of Frappe Framework v15:

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; margin: 1.5rem 0 2rem;">

  <div style="background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 10px; padding: 1.25rem;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
      <h3 style="margin: 0; font-size: 1.05rem;">ERPNext</h3>
      <span class="indicator-pill green">Official ERP</span>
    </div>
    <p style="font-size: 0.85rem; color: var(--vp-c-text-2); margin: 0 0 0.75rem;">Full-featured open-source ERP for Accounting, Inventory, CRM, Sales, Purchase & Manufacturing.</p>
    <code style="font-size: 0.78rem; background: #1e1e1e; color: #36b37e; padding: 4px 8px; border-radius: 4px; display: inline-block;">bench get-app erpnext</code>
  </div>

  <div style="background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 10px; padding: 1.25rem;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
      <h3 style="margin: 0; font-size: 1.05rem;">Frappe HR</h3>
      <span class="indicator-pill green">Official HRMS</span>
    </div>
    <p style="font-size: 0.85rem; color: var(--vp-c-text-2); margin: 0 0 0.75rem;">Modern HR & Payroll solution covering Employee Lifecycle, Attendance, Expense Claims & Appraisals.</p>
    <code style="font-size: 0.78rem; background: #1e1e1e; color: #36b37e; padding: 4px 8px; border-radius: 4px; display: inline-block;">bench get-app hrms</code>
  </div>

  <div style="background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 10px; padding: 1.25rem;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
      <h3 style="margin: 0; font-size: 1.05rem;">India Compliance</h3>
      <span class="indicator-pill orange">Statutory</span>
    </div>
    <p style="font-size: 0.85rem; color: var(--vp-c-text-2); margin: 0 0 0.75rem;">Official Indian tax compliance app for GST Returns, E-Invoicing via IRP, E-Way Bills & MCA Audit Trail.</p>
    <code style="font-size: 0.78rem; background: #1e1e1e; color: #36b37e; padding: 4px 8px; border-radius: 4px; display: inline-block;">bench get-app india_compliance</code>
  </div>

</div>

</div>
