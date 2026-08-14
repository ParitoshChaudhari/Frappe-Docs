---
title: Getting Started with Frappe v15
description: Introduction, prerequisites, bench installation, and application directory architecture for Frappe Framework v15.
version: v15
category: Overview & Basics
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Getting Started with Frappe Framework v15

Frappe Framework is a battery-included, full-stack web application framework built on **Python** (server-side) and **JavaScript** (client-side). 

Think of Frappe like a **plug-and-play engine for enterprise web apps**. Instead of writing code from scratch for user login, database tables, form generation, permission systems, file uploads, PDF generation, and REST APIs, Frappe automatically provides all of these features out of the box through a meta-data driven design called **DocTypes**.

### 🏢 Real-World Analogy: The Apartment Building
Imagine Frappe as a modern apartment complex:
- **Bench**: The property management team that builds the building, handles plumbing (Redis/MariaDB), and manages electrical wiring.
- **Sites**: Individual apartments inside the building. Each apartment has its own locked door (separate database, separate uploaded files, separate domain).
- **Apps** (like `frappe` or `erpnext`): The furniture and appliances installed inside the apartments.
- **DocTypes**: The architectural blueprints used to construct rooms (forms, tables, logic).

### Core Pillars of Frappe

| Layer | Technology | Key Responsibility | Why It Matters |
| :--- | :--- | :--- | :--- |
| **Database** | MariaDB 10.6+ *(primary & recommended)*; PostgreSQL 14+ *(experimental)* | Persistent relational storage, automatic migrations | You define models in JSON; Frappe auto-creates SQL tables. MariaDB is the only fully supported database. |
| **Server** | Python 3.10+ / WSGI | Business logic, Document controllers, REST API, ORM | Clean, Pythonic backend code with auto-generated APIs. |
| **In-Memory Cache & Queues** | Redis (Cache & Queue) | Session management, caching, RQ background workers | Keeps web requests fast by offloading heavy work to background workers. |
| **Client Desk** | JavaScript (ES6+), jQuery, Vue 3 | Dynamic auto-generated UI, Form scripts, Controls | Renders beautiful, fully interactive forms directly from JSON schemas. |
| **Asset Pipeline** | Esbuild | Lightning-fast JS/CSS bundling | Bundles and minifies client-side assets in milliseconds. |
| **CLI Tool** | Bench (Python CLI) | Multi-site environment management, app setup, updates | Single command-line interface to manage everything. |

---

## 2. System Requirements & Setup Prerequisites

To develop with Frappe Framework v15, ensure your environment meets these precise software requirements:

- **Operating System**: Linux (Ubuntu 22.04 LTS recommended), macOS (Apple Silicon M1/M2/M3 supported natively), or Windows via **WSL2** (Ubuntu 22.04).
- **Python**: 3.10, 3.11, or 3.12 (Python `dev` packages required: `python3-dev`, `python3-pip`, `python3-venv`).
- **Node.js**: 18.x or 20.x (LTS) & Yarn 1.x (`corepack enable` or `npm install -g yarn`).
- **MariaDB**: 10.6+ (must use `utf8mb4` character set and `barracuda` file format).
- **Redis**: 6.x or 7.x (for caching and job queues).
- **Git**: 2.30+ for app repository management.
- **wkhtmltopdf**: 0.12.6 with patched qt (for server-side PDF generation).

---

## 3. Step-by-Step Bench Installation & Environment Setup

**Bench** is the official CLI tool used to manage Frappe sites, install applications, execute database migrations, and launch development servers.

### Step 1: Install System Dependencies (Ubuntu / macOS)

**On Ubuntu / Debian:**
```bash
sudo apt update && sudo apt install -y \
  python3-dev python3-pip python3-venv \
  mariadb-server mariadb-client \
  redis-server \
  curl git build-essential \
  libffi-dev liblcms2-dev libwebp-dev libssl-dev
```

**On macOS (using Homebrew):**
```bash
brew install python@3.11 node yarn mariadb redis wkhtmltopdf
brew services start mariadb
brew services start redis
```

### Step 2: Configure MariaDB for Frappe

Frappe requires specific MariaDB configuration settings to support long text fields, proper collation, and strict transaction isolation. Edit `/etc/mysql/mariadb.conf.d/50-server.cnf` (or `/usr/local/etc/my.cnf` on macOS):

```ini
[mysqld]
character-set-client-handshake = FALSE
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

[mysql]
default-character-set = utf8mb4
```

Restart MariaDB:
```bash
sudo service mariadb restart   # Ubuntu
# or
brew services restart mariadb  # macOS
```

### Step 3: Install Bench CLI

Install `bench` globally via `pip`:
```bash
pip install bench
```

Verify installation:
```bash
bench --version
```

### Step 4: Initialize a Bench Workspace

Create a new bench workspace directory named `frappe-bench`:

```bash
bench init frappe-bench --frappe-branch version-15
cd frappe-bench
```

This step creates:
- A Python virtual environment inside `./env/`
- Clones the core `frappe` framework app into `./apps/frappe/`
- Downloads and builds Node package dependencies using Yarn.

### Step 5: Create Your First Local Site

Frappe is **multi-tenant**. A single bench instance can host multiple websites (e.g., `site1.localhost`, `dev.company.com`).

```bash
bench new-site site1.localhost \
  --admin-password admin \
  --mariadb-root-password root \
  --db-name site1_db
```

### Step 6: Start Development Servers

```bash
bench start
```

This single command launches the development process runner (Procfile), starting 5 background services:

```text
16:00:00 web.1            | * Running on http://127.0.0.1:8000/
16:00:00 worker_short.1   | Background worker (short queue) started
16:00:00 worker_long.1    | Background worker (long queue) started
16:00:00 schedule.1       | Scheduler process active (Cron jobs)
16:00:00 socketio.1       | Realtime WebSocket server running on port 9000
```

Open your browser and navigate to **`http://localhost:8000`**. Log in using:
- **Username**: `Administrator`
- **Password**: `admin` (or the password you set during `bench new-site`).

---

## 4. Bench Workspace Directory Layout Explained

Understanding the bench directory structure helps you locate code, assets, and configuration files quickly:

```text
frappe-bench/
├── apps/                        # Source code for all installed applications
│   ├── frappe/                  # Core Frappe Framework app repository
│   └── my_custom_app/           # Your custom app repository
│       ├── my_custom_app/       # Python package root
│       │   ├── hooks.py         # Application event listeners & overrides
│       │   ├── modules.txt      # Module registry list
│       │   ├── patches.txt      # Database schema migration scripts
│       │   ├── my_module/       # Module directory containing DocTypes, Reports
│       │   ├── public/          # Static assets (JS, CSS, SVGs, images)
│       │   ├── templates/       # Jinja HTML templates for portal pages
│       │   └── www/             # Public web portal routes & HTML pages
│       └── pyproject.toml       # Python package metadata
├── sites/                       # Site-specific data & multi-tenant storage
│   ├── currentsite.txt          # Active site for single-site bench commands
│   ├── assets/                  # Symlinked static assets served by Nginx
│   └── site1.localhost/         # Site directory
│       ├── site_config.json     # DB credentials, secret key, site settings
│       ├── public/              # Uploaded public files (images, PDFs)
│       └── private/             # Uploaded private attachments
├── env/                         # Isolated Python Virtual Environment
├── config/                      # Auto-generated Nginx & Supervisor configs
└── Procfile                     # Development process runner configuration
```

---

## 5. Creating & Installing Custom Apps

```bash
# 1. Generate a new app scaffold
bench new-app my_custom_app

# 2. Install your new app on your site
bench --site site1.localhost install-app my_custom_app

# 3. Enable developer mode on your site (Allows creating DocTypes)
bench --site site1.localhost set-config developer_mode 1
bench --site site1.localhost clear-cache
```

> [!TIP]
> Enabling `developer_mode: 1` in `site_config.json` is **essential** during development. It tells Frappe to auto-generate JSON schema files in your app folder whenever you create or modify a DocType in the Desk UI!

---

## 🛑 Troubleshooting Common Setup Issues

| Symptom / Error | Cause | Easy Solution |
| :--- | :--- | :--- |
| `Access denied for user 'root'@'localhost'` | MariaDB root password not set or misconfigured | Run `sudo mysql_secure_installation` or set password in `site_config.json`. |
| `Index column size too large` | MariaDB table format not set to Barracuda | Ensure `50-server.cnf` has `innodb_file_per_table = 1` and `utf8mb4` character set. |
| `Port 8000 already in use` | Another `bench start` or Gunicorn process running | Kill existing process with `lsof -i :8000` or run `bench set-web-server-port 8005`. |
| `redis.exceptions.ConnectionError` | Redis server not running | Start Redis service: `sudo service redis-server start` or `brew services start redis`. |

---

## Related Topics & Next Steps

- Proceed to [02. Frappe Architecture](/02-architecture/) to learn how Werkzeug, WSGI, ORM, and Desk interact.
- Explore [03. Bench CLI Reference](/03-bench-cli/) for an exhaustive list of all terminal commands.
