# Frappe Framework v15 Complete Developer Documentation & Reference

A fast, lightweight, static-first developer documentation website for **Frappe Framework v15**, built with **VitePress**.

---

## 🌟 Key Features & Documentation Highlights

- **Frappe v15 Engine Specific**: Tailored strictly to Frappe Framework v15 APIs, controllers, database ORM, Query Builder, hooks, and Bench CLI commands.
- **Header Navbar Simplicity**: Clean header featuring instant search modal and dark/light theme switcher toggle.
- **Strict Sequential Sidebar Navigation**: Organized into 27 sequential chapters (`01` through `27`) covering the complete developer journey.
- **Scrollable & Sticky Tables**: All data matrices and parameter tables feature horizontal scrollability and sticky/floating table headers (`th`).
- **Data-Fetching Strategy Decision Matrix**: Clear guidelines on when, why, and how to use `frappe.get_all`, `frappe.get_list`, `frappe.get_doc`, `frappe.db.get_value`, `frappe.db.get_single_value`, and `frappe.qb`.
- **Exhaustive Document Event Hooks (`doc_events`)**: 18-row reference table detailing execution lifecycle stage, `docstatus`, allowed actions, and anti-patterns to avoid.
- **Complete Reports Guide (Chapter 18)**: Deep technical breakdown of Standard Reports (Report Builder), Query Reports (SQL), Script Reports (Python + JS), Tree Reports (hierarchical tree grid), Frappe Charts, KPI Summary Cards, MultiSelect filters, and Prepared Reports.
- **Custom Buttons & UI Customization**: `frm.add_custom_button`, button styling (`primary`, `danger`), dropdown button groups, and APIs for disabling standard save/form inputs (`frm.disable_save()`, `frm.disable_form()`, `frm.page.hide_menu()`, `frm.page.remove_menu_item()`).
- **Session, User Permissions & Roles**: Detailed reference for `frappe.session.user`, `frappe.get_roles()`, `frappe.has_role()`, `frappe.permissions.get_user_permissions()`, `frappe.user.has_role()`, and `frappe.user_roles`.
- **Tabbed DevOps Installation Guide (Chapter 25)**: Tabbed terminal commands (`macOS & Linux`, `Windows (WSL2)`, `Package Managers`, `Docker`) for Node.js, Python, MariaDB, Redis, wkhtmltopdf, Git, and Bench CLI.
- **Production Operations & Load Relief (Chapter 26)**: Supervisor status monitoring (`supervisorctl status`), service restarts, MariaDB process inspection (`SHOW PROCESSLIST;`), killing long queries, clearing Redis load (`redis-cli -p 13000 FLUSHDB`), purging dead RQ worker jobs.
- **Production Frappe Docker (Chapter 27)**: Container architecture breakdown, Docker Compose setup (`compose.yaml`), minimal setup (`pwd.yml`), building custom app images (`Containerfile`), and Kubernetes Helm charts.
- **20+ Production Recipes**: Practical cookbook with copy-pasteable real-world examples.
- **Searchable API Index (Chapter 24)**: Alphabetical index of all public Frappe Framework v15 functions and methods.

---

## 🚀 Getting Started & Local Development

### Prerequisites

- **Node.js**: `18.x` or `20.x` (LTS)
- **npm**: `9+` or `yarn`

### Installation

```bash
# Clone the repository
git clone https://github.com/myorg/frappe-v15-docs.git
cd frappe-docs

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

### Preview Production Build

```bash
npm run docs:preview
```

---

## 📁 Repository Directory Structure

```text
frappe-docs/
├── package.json                          # Package scripts & dependencies
├── .gitignore                            # Git ignore rule specifications
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
    ├── 11-client-api/                    # frappe.ui.form, custom buttons & disabling save
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
    ├── 22-cookbook/                      # 20+ copy-pasteable practical recipes
    ├── 23-client-vs-server/              # Side-by-side Client vs Server matrix
    ├── 24-api-index/                     # Alphabetical searchable API index
    ├── 25-devops-installation/           # Tabbed OS installation guide (Node, Python, DB, Redis)
    ├── 26-devops-operations/             # Supervisor monitoring, restarting DB, load relief
    ├── 27-frappe-docker/                 # Production Frappe Docker, compose.yaml, Kubernetes
    └── _templates/                       # Contribution templates (api, tutorial, recipe)
```

---

## 📄 Contribution Guidelines

To add new documentation pages or extend existing chapters, use the templates in `docs/_templates/`:

1. Use `docs/_templates/api.md` for documenting new API methods.
2. Use `docs/_templates/recipe.md` for adding new practical cookbook recipes.
3. Update `docs/.vitepress/config.mjs` sidebar list if introducing new markdown files.

---

## 📜 License

MIT License. Developed for the Frappe Framework & ERPNext developer community.
