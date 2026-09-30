# Frappe Framework v15 Complete Developer Documentation & Reference

[![Documentation Version](https://img.shields.io/badge/version-v1.11.0-magenta.svg)](https://github.com/ParitoshChaudhari/Frappe-Docs)
[![Frappe Framework](https://img.shields.io/badge/frappe-v15%20%7C%20v16-0052CC.svg)](https://frappeframework.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A fast, lightweight, static-first developer documentation website and technical handbook for **Frappe Framework v15** and **Frappe v16**, built with **VitePress**.

🔗 **GitHub Repository**: [https://github.com/ParitoshChaudhari/Frappe-Docs](https://github.com/ParitoshChaudhari/Frappe-Docs)

---

## 🌟 Key Features & Documentation Highlights

- **Chapter 32: Frappe Framework v16 Differences, Breaking Changes & Migration Guide**: Comprehensive guide detailing the default sorting shift from `modified` to `creation`, prohibition of `frappe.db.commit()` in document hooks, Python 3.14+ & Node 24+ runtime requirements, sandboxed IIFE client scripts, strict ISO country codes, Desk `/desk` routing, and decoupled modules.
- **Document Field Access Strategy & Best Practice Callouts (Chapters 06, 07, 09, 10, 30, 31)**: Exhaustive Python field-reading patterns comparing full document instantiation (`frappe.get_doc` + `doc.get("fieldname", default)`) vs direct SQL scalar reads (`frappe.db.get_value()`). Includes defensive null-safety against `AttributeError`, in-memory child table filtering, and `> [!TIP]` callout boxes with official Frappe documentation references.
- **Tree Reports & Folded First-Child Architecture (Chapter 18)**: High-density layout rendering the first child reading inline with the parent inspection row at `indent: 0` while expanding secondary child records as collapsible sub-rows at `indent: 1`.
- **Authentication, LoginManager & User Registration (Chapter 14)**: Deep dive into `frappe.auth.LoginManager`, programmatic session impersonation (`login_as`), headless registration (`sign_up`), and auth hooks.
- **Bench CLI Nginx & Port-Based Multi-Tenancy (Chapter 03)**: Complete reverse-proxy guide covering `bench setup nginx`, port allocation (`bench set-nginx-port <site> <port>`), and Let's Encrypt SSL.
- **Exhaustive Python & JavaScript Utilities (Chapter 19)**: Date/time manipulation, null-safe type casting (`cint`, `flt`, `cstr`), string sanitization, and universal field formatters.
- **Conditional Date Filtering in Script Reports (Chapter 18)**: Complete guide on building reports with unpopulated initial dates, client-side dynamic requirement triggers (`on_change` modifying `df.reqd = 1`), server-side validation guards (`frappe.throw`), and multi-table parameterized SQL JOINs.
- **Exhaustive Bench CLI Reference Expansion**: Added `bench --site <site-name> list-apps`, `bench list-sites`, `bench set-admin-password`, `bench mariadb`/`postgres`, `bench reset-perms`, `bench scheduler` (`status`, `enable`, `disable`), `bench build-search-index`, `bench remove-app`, `bench update`, `bench restart`, `bench setup`, `bench doctor`, `bench worker`, `bench schedule`, and `bench version`.
- **Chapter 31: Frappe Data Types & Custom Containers Reference**: Comprehensive reference covering `frappe._dict` (dot-accessible dictionary, KeyError safety, parameter typing), `Document` ORM classes, `DF` synthetic IDE type stubs (`frappe.types`), `frappe.form_dict`, thread-local `frappe.local` context, DB query return types, null-safe primitives (`cint`, `flt`, `cstr`), and developer type annotation cheat sheets.
- **Open Source Ecosystem**: Dedicated unnumbered section (`opensource-projects`) providing project tables, descriptions, GitHub links, and Bench CLI installation commands for **ERPNext**, **Frappe HR (HRMS)**, and **India Compliance**.
- **Exhaustive Client Script JS API Matrix**: Detailed reference in Chapter 11 for missing client script methods (`frm.trigger()`, `frm.refresh_fields()`, `frappe.msgprint`, `frappe.warn`, `frappe.show_progress`, `frappe.get_route`, `frappe.db.*`, `frappe.meta.*`, `frappe.format`, `frappe.model.*`, `frappe.ui.form.MultiSelectDialog`).
- **Navbar GitHub Integration**: Instant link to the GitHub repository directly to the left of the theme toggle switch in the top navigation bar.
- **Chapter 30: Frappe ORM Masterclass**: Comprehensive, 5-part guide covering `SELECT`, `WHERE`, `LIMIT`, `GROUP BY`, `HAVING`, `INNER`/`LEFT`/`RIGHT` Joins, `UNION`, `INTERSECT`, and subqueries with sample data tables, Python code, generated raw SQL, and exact output data.
- **Strict Sequential Sidebar Navigation**: Organized into 31 sequential chapters (`01` through `31`) plus an unnumbered Open Source Ecosystem section covering the complete developer journey.
- **Scrollable & Sticky Tables**: All data matrices and parameter tables feature horizontal scrollability and sticky/floating table headers (`th`).
- **Exhaustive Document Event Hooks (`doc_events`)**: 18-row reference table detailing execution lifecycle stage, `docstatus`, allowed actions, and anti-patterns to avoid.
- **13 Production Recipes (Chapter 22)**: Practical cookbook featuring copy-pasteable real-world examples (PDF generation, controller overrides, cron tasks, cache invalidation, client form mapping).
- **Complete Reports Guide (Chapter 18)**: Deep technical breakdown of Standard Reports, Query Reports, Script Reports, Tree Reports, Frappe Charts, KPI Summary Cards, MultiSelect filters, and Prepared Reports.
- **Searchable API Index (Chapter 24)**: Alphabetical index of all public Frappe Framework v15 functions, server APIs, and client script JavaScript methods.

---

## 🚀 Getting Started & Local Development

### Prerequisites

- **Node.js**: `18.x` or `20.x` (LTS)
- **npm**: `9+` or `yarn`

### Installation

```bash
# Clone the repository
git clone https://github.com/ParitoshChaudhari/Frappe-Docs.git
cd Frappe-Docs

# Install dependencies
npm install
```

### Development Server

```bash
# Launch VitePress live dev server
npm run docs:dev
```

This starts the local development server at `http://localhost:5173`.

---

## 📦 Building for Production

```bash
# Compile static production bundle
npm run docs:build
```

Static HTML, CSS, JavaScript, and local full-text search indexes will be generated inside `docs/.vitepress/dist`.

---

## 📜 Version History & Changelog Summary

| Version | Release Stage | Highlights |
| :--- | :--- | :--- |
| **v1.11.0 (v16)** | **Current Release** | Added Chapter 32 (Frappe v16 Differences & Migration), covering default sorting shift (`creation desc` vs `modified desc`), ban of `frappe.db.commit()` in document hooks, Python 3.14+ & Node 24+ runtime requirements, sandboxed IIFE client scripts, strict ISO country codes, Desk `/desk` routing, and landing page v16 hub. |
| **v1.10.0 (v1.10)** | **Field Access Patterns** | Added comprehensive Python field-reading patterns (`doc.get("fieldname")` vs `frappe.db.get_value`) across Chapters 06, 07, 09, 10, 30, and 31; integrated defensive null-safety, in-memory child table filtering, technical callout boxes (`> [!TIP]`), official Frappe documentation references, and synced API Index. |
| **v1.9.0 (v1.9)** | **Tree Reports & Utils** | Added folded first-child Tree Report architecture in Chapter 18, LoginManager & custom signup/login APIs in Chapter 14, Nginx port assignment & port-based multi-tenancy in Chapter 03, complete Python/JS utilities expansion in Chapter 19, and synced API Index. |
| **v1.8.0 (v1.8)** | **Conditional Reports** | Added conditional date requirement pattern in Chapter 18 (Reports Guide), client-side dynamic `on_change` requirement toggle (`df.reqd = 1`), server-side validation guard (`frappe.throw`), and multi-table parameterized SQL query examples. |
| **v1.7.0 (v1.7)** | **Bench CLI Expansion** | Added `bench --site <site-name> list-apps`, `list-sites`, `remove-app`, `set-admin-password`, `mariadb`/`postgres`, `reset-perms`, `scheduler`, `build-search-index`, `update`, `restart`, `setup`, `doctor`, `worker`/`schedule`, `version`, and updated API Index. |
| **v1.6.0 (v1.6)** | **Data Types & Custom Containers** | Added Chapter 31: Frappe Data Types & Custom Containers Reference (`frappe._dict`, `Document`, `DF` type stubs, `frappe.local`, query return types, null-safe primitives, type annotation cheat sheet). |
| **v1.5.0 (v1.5)** | **Notifications & Search** | Added sub-heading TOC navigation (`outline: [2, 6]`), complete System & Email Notifications guide, and expanded navbar search bar to 560px. |
| **v1.4.0 (v1.4)** | **Accuracy Audit & 110+ APIs** | Full official accuracy audit, corrected queue timeouts, added 110+ missing APIs (`frappe.db` JS proxy, `frm.page.*`, `frappe.realtime`), and updated API Index. |
| **v1.3.0 (v1.3)** | **Client JS & Ecosystem** | Added Client JS API Matrix, updated Searchable API Index, and created Open Source Ecosystem section for ERPNext, HRMS, and India Compliance. |
| **v1.2.0 (v1.2)** | **Exhaustive Expansion** | Added easy-to-understand explanations across all chapters, setup troubleshooting, real-world analogies, complete `doc_events` table, client document mapping, REST uploads, and 13 cookbook recipes. |
| **v1.1.0 (v1.1)** | **GitHub & ORM Masterclass** | Added GitHub navbar integration, hero action buttons, and Chapter 30: Frappe ORM Masterclass (`SELECT`, `WHERE`, `LIMIT`, `GROUP BY`, `HAVING`, `JOINs`, `UNION`, `INTERSECT`). |
| **v1.0.0 (v1.0)** | **Initial Baseline** | Initial release of Frappe Framework v15 Developer Documentation. |

For detailed revision history, see [Version History & Changelog](docs/29-version-history/index.md).

---

## 📁 Repository Directory Structure

```text
frappe-docs/
├── package.json                          # Package scripts & dependencies (v1.11.0)
├── README.md                             # Project documentation & guide
└── docs/
    ├── .vitepress/
    │   ├── config.mjs                    # VitePress configuration & sidebar navigation
    │   └── theme/
    │       ├── index.js                  # Custom theme entry point
    │       └── custom.css                # Custom CSS styling (sticky tables, badges)
    ├── public/                           # Site assets (logo.svg, favicon.svg)
    ├── index.md                          # Landing home page
    ├── 01-getting-started/               # Quickstart & installation
    ├── 02-architecture/                  # Request lifecycle & stack diagrams
    ├── 03-bench-cli/                     # Bench CLI command reference
    ├── 04-apps-and-sites/                # Apps & sites architecture
    ├── 05-doctypes/                      # DocTypes, fields, autoname rules
    ├── 06-documents/                     # Document ORM & lifecycles
    ├── 07-controllers/                   # Controller classes & 15+ events
    ├── 08-hooks/                         # Complete hooks.py reference & doc_events table
    ├── 09-server-api/                    # Python frappe.* API reference & data-fetching decision matrix
    ├── 10-database/                      # frappe.db, Query Builder & SQL
    ├── 11-client-api/                    # frappe.ui.form, custom buttons, & Client JS API Matrix
    ├── 12-child-tables/                  # Child table APIs (Python & JS)
    ├── 13-rest-api/                      # REST & RPC endpoints reference
    ├── 14-authentication-permissions/    # Auth, session.user, roles & User Permissions
    ├── 15-background-jobs-scheduler/     # frappe.enqueue, RQ queues & scheduler
    ├── 16-cache-realtime-email-files/    # Redis, Socket.IO, Email & Files
    ├── 17-web-jinja-print-reports/       # Web pages, Jinja & Print Formats
    ├── 18-reports/                       # Complete Reports Guide (Standard, Query, Script, Tree)
    ├── 19-utils/                         # frappe.utils helper function matrix
    ├── 20-testing-debugging/             # FrappeTestCase, bench run-tests, Error Log
    ├── 21-security-performance/          # SQLi prevention, N+1 queries & anti-patterns
    ├── 22-cookbook/                      # 13 copy-pasteable practical recipes
    ├── 23-client-vs-server/              # Side-by-side Client vs Server matrix
    ├── 24-api-index/                     # Alphabetical searchable API index
    ├── 25-devops-installation/           # Tabbed OS installation guide (Node, Python, DB, Redis)
    ├── 26-devops-operations/             # Supervisor monitoring, restarting DB, load relief
    ├── 27-frappe-docker/                 # Production Frappe Docker, compose.yaml, Kubernetes
    ├── 28-views-desk-customization/      # Desk Views, List, Tree, Calendar & Custom Scripts
    ├── 29-version-history/               # Documentation Version History & Changelog
    ├── 30-frappe-orm/                    # Frappe ORM Masterclass (SELECT, WHERE, JOINs, UNION)
    ├── 31-frappe-types/                  # Frappe Data Types & Custom Containers (frappe._dict, Document, DF)
    ├── 32-frappe-v16-differences/        # Frappe Framework v16 Differences, Breaking Changes & Migration
    └── opensource-projects/              # Open Source Ecosystem Projects (ERPNext, HRMS, India Compliance)
```

---

## 📜 License

MIT License. Developed for the Frappe Framework & ERPNext developer community.
