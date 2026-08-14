# Frappe Framework v15 Complete Developer Documentation & Reference

[![Documentation Version](https://img.shields.io/badge/version-v1.3.0-blue.svg)](https://github.com/ParitoshChaudhari/Frappe-Docs)
[![Frappe Framework](https://img.shields.io/badge/frappe-v15-0052CC.svg)](https://frappeframework.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A fast, lightweight, static-first developer documentation website and technical handbook for **Frappe Framework v15**, built with **VitePress**.

🔗 **GitHub Repository**: [https://github.com/ParitoshChaudhari/Frappe-Docs](https://github.com/ParitoshChaudhari/Frappe-Docs)

---

## 🌟 Key Features & Documentation Highlights

- **Open Source Ecosystem**: Dedicated unnumbered section (`opensource-projects`) providing project tables, descriptions, GitHub links, and Bench CLI installation commands for **ERPNext**, **Frappe HR (HRMS)**, and **India Compliance**.
- **Exhaustive Client Script JS API Matrix**: Detailed reference in Chapter 11 for missing client script methods (`frm.trigger()`, `frm.refresh_fields()`, `frappe.msgprint`, `frappe.warn`, `frappe.show_progress`, `frappe.get_route`, `frappe.db.*`, `frappe.meta.*`, `frappe.format`, `frappe.model.*`, `frappe.ui.form.MultiSelectDialog`).
- **Navbar GitHub Integration**: Instant link to the GitHub repository directly to the left of the theme toggle switch in the top navigation bar.
- **Chapter 30: Frappe ORM Masterclass**: Comprehensive, 5-part guide covering `SELECT`, `WHERE`, `LIMIT`, `GROUP BY`, `HAVING`, `INNER`/`LEFT`/`RIGHT` Joins, `UNION`, `INTERSECT`, and subqueries with sample data tables, Python code, generated raw SQL, and exact output data.
- **Easy-to-Understand Explanations**: Real-world analogies (e.g. Apartment building analogy for Bench, Sites, Apps, DocTypes in Chapter 01) and step-by-step troubleshooting matrices.
- **Header Navbar Simplicity**: Clean header featuring instant search modal, GitHub logo link, and dark/light theme switcher toggle.
- **Strict Sequential Sidebar Navigation**: Organized into 30 sequential chapters (`01` through `30`) plus an unnumbered Open Source Ecosystem section covering the complete developer journey.
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
| **v1.3.0 (v1.3)** | **Current Release** | Added exhaustive Client JS API Matrix (Section 10 in Chapter 11), updated Searchable API Index under Section F, and created unnumbered Open Source Ecosystem section (`opensource-projects`) for ERPNext, HRMS, and India Compliance. |
| **v1.2.0 (v1.2)** | **Exhaustive Expansion** | Added easy-to-understand explanations across all chapters, setup troubleshooting, real-world analogies, complete `doc_events` table, client document mapping, REST uploads, and 13 cookbook recipes. |
| **v1.1.0 (v1.1)** | **GitHub & ORM Masterclass** | Added GitHub navbar integration, hero action buttons, and Chapter 30: Frappe ORM Masterclass (`SELECT`, `WHERE`, `LIMIT`, `GROUP BY`, `HAVING`, `JOINs`, `UNION`, `INTERSECT`). |
| **v1.0.0 (v1.0)** | **Initial Baseline** | Initial release of Frappe Framework v15 Developer Documentation. |

For detailed revision history, see [Version History & Changelog](docs/29-version-history/index.md).

---

## 📁 Repository Directory Structure

```text
frappe-docs/
├── package.json                          # Package scripts & dependencies (v1.3.0)
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
    └── opensource-projects/              # Open Source Ecosystem Projects (ERPNext, HRMS, India Compliance)
```

---

## 📜 License

MIT License. Developed for the Frappe Framework & ERPNext developer community.
