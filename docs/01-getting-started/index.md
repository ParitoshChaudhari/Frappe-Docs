---
title: Getting Started with Frappe v15
description: Introduction, prerequisites, bench installation, and application directory architecture for Frappe Framework v15.
version: v15
category: Overview & Basics
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Getting Started with Frappe Framework v15

Frappe Framework is a full-stack, battery-included, web application framework written in Python (server) and JavaScript (client). It powers **ERPNext** and thousands of enterprise custom applications.

---

## 1. What is Frappe Framework v15?

Frappe Framework v15 is the major release of Frappe focusing on enhanced performance, modern desk interfaces, modular architecture, refined ORM & Query Builder capabilities, and robust background job processing via Redis and RQ.

### Core Pillars of Frappe

| Layer | Technology | Key Responsibility |
| :--- | :--- | :--- |
| **Database** | MariaDB 10.6+ / PostgreSQL 14+ | Persistent relational storage, automatic migrations |
| **Server** | Python 3.10+ / WSGI | Business logic, Document controllers, REST API, ORM |
| **In-Memory Cache & Queues** | Redis (Cache & Queue) | Session management, caching, RQ background workers |
| **Client Desk** | JavaScript (ES6+), jQuery, Vue 3 | Dynamic auto-generated UI, Form scripts, Controls |
| **Asset Pipeline** | Esbuild | Lightning-fast JS/CSS bundling |
| **CLI Tool** | Bench (Python CLI) | Multi-site environment management, app setup, updates |

---

## 2. System Requirements & Prerequisites

To develop with Frappe Framework v15, ensure your system meets the following requirements:

- **OS**: Linux (Ubuntu 22.04 LTS recommended), macOS (macOS 12+), or WSL2 on Windows
- **Python**: 3.10, 3.11, or 3.12
- **Node.js**: 18.x or 20.x (LTS) & Yarn 1.x
- **MariaDB**: 10.6+ (with `barracuda` format and `utf8mb4` encoding)
- **Redis**: 6.x or 7.x
- **Git**: 2.30+
- **wkhtmltopdf**: 0.12.6 with patched qt (for PDF generation)

---

## 3. Installing Bench & Setting Up Development Environment

**Bench** is the official command-line utility used to manage Frappe environments, create apps, install sites, and run database migrations.

### Step 1: Install Bench CLI

```bash
pip install bench
```

### Step 2: Initialize a New Bench Instance

```bash
bench init frappe-bench --frappe-branch version-15
cd frappe-bench
```

### Step 3: Create a New Site

```bash
bench new-site site1.localhost --admin-password admin --db-name site1_db
```

### Step 4: Start Development Servers

```bash
bench start
```

This will launch:
- Web server (Gunicorn / Werkzeug) at `http://localhost:8000`
- Redis Cache server at `localhost:13000`
- Redis Queue server at `localhost:11000`
- Node socket.io server at `localhost:9000`
- Worker processes for background jobs

---

## 4. Directory Structure of Frappe Bench

A standard Frappe v15 Bench layout:

```text
frappe-bench/
├── apps/
│   ├── frappe/                  # Core Frappe Framework app
│   └── my_custom_app/           # Your custom app directory
│       ├── my_custom_app/
│       │   ├── hooks.py         # Application events & overrides
│       │   ├── modules.txt      # List of application modules
│       │   ├── patches.txt      # Database migration patches
│       │   ├── my_module/       # Module directory (DocTypes, Reports, Pages)
│       │   ├── public/          # Client static assets (js, css, images)
│       │   ├── templates/       # Jinja web page templates
│       │   └── www/             # Web portal routes
│       └── pyproject.toml
├── sites/
│   ├── currentsite.txt          # Active site name
│   ├── assets/                  # Symlinked static assets
│   └── site1.localhost/         # Site specific data & site_config.json
│       ├── site_config.json     # DB credentials & site settings
│       ├── public/              # Site uploaded public files
│       └── private/             # Site uploaded private files
├── env/                         # Python Virtual Environment
├── config/                      # Generated Nginx & Supervisor configs
└── Procfile                     # Development process runner configuration
```

---

## 5. First Frappe App Creation

```bash
# 1. Create a new application
bench new-app my_custom_app

# 2. Install the application on your target site
bench --site site1.localhost install-app my_custom_app

# 3. Create a new DocType using Desk UI or CLI
# Navigate to http://localhost:8000 and log in as Administrator
```

---

## Related Topics & Next Steps

- Proceed to [02. Frappe Architecture](/02-architecture/) to understand request routing and execution stack.
- Check [03. Bench CLI Reference](/03-bench-cli/) for all terminal commands.
