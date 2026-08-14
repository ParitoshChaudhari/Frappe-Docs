---
title: Apps & Sites Anatomy in Frappe v15
description: Comprehensive breakdown of Frappe application files, hooks.py, modules.txt, patches.txt, pyproject.toml, multi-tenancy site config, and asset resolution.
version: v15
category: Overview & Basics
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Apps & Sites Architecture

Frappe Framework v15 enforces a clean, modular structure separating **Applications** (reusable codebases) from **Sites** (isolated databases, settings, and file uploads).

---

## 1. Frappe Application File Anatomy

A standard v15 Frappe application created via `bench new-app` contains:

```text
my_custom_app/
├── README.md
├── license.txt
├── pyproject.toml               # Python package build metadata & dependencies
├── my_custom_app/               # Application Python package root
│   ├── __init__.py              # Package initializer (__version__)
│   ├── hooks.py                 # Core Frappe events, hooks, & asset inclusions
│   ├── modules.txt              # List of functional modules defined by app
│   ├── patches.txt              # Sequential list of database schema migration patches
│   ├── config/                  # Module desktop icons & search configs
│   │   └── docs.py
│   ├── my_module/               # Functional Module Directory (e.g., Task Management)
│   │   ├── __init__.py
│   │   ├── doctype/             # DocType definitions & controllers
│   │   │   └── custom_task/
│   │   │       ├── custom_task.json
│   │   │       ├── custom_task.py
│   │   │       ├── custom_task.js
│   │   │       └── test_custom_task.py
│   │   ├── page/                # Custom desk pages
│   │   └── report/              # Script / Query / Analytics reports
│   ├── public/                  # Static assets compiled by Esbuild
│   │   ├── js/
│   │   ├── css/
│   │   └── images/
│   ├── templates/               # Jinja web page & email templates
│   │   ├── includes/
│   │   └── pages/
│   └── www/                     # Public website routes (e.g. /portal, /about)
```

---

## 2. Key Application Metadata Files

### `pyproject.toml` (Python Package Metadata)

Frappe v15 requires `pyproject.toml` using standard PEP 621 metadata:

```toml
[build-system]
requires = ["flit_core >=3.2,<4"]
build-backend = "flit_core.buildapi"

[project]
name = "my_custom_app"
authors = [{name = "Developer Name", email = "developer@example.com"}]
description = "Custom Task and Project Management App"
version = "1.0.0"
readme = "README.md"
requires-python = ">=3.10"
dependencies = [
    # Add python third-party dependencies here
    "requests>=2.28.0"
]

[project.urls]
Homepage = "https://github.com/myorg/my_custom_app"
```

---

### `modules.txt`

Lists all functional module categories exported by this app. Frappe uses this file during sync to associate DocTypes with their parent module:

```text
Task Management
Project Workspace
Custom Utilities
```

---

### `patches.txt`

Contains a sequential list of Python executable path functions or script files executed during `bench migrate`. Used to safely transform production database schemas between versions.

```text
# Syntax: dotted.path.to.function
my_custom_app.patches.v1_0.migrate_task_statuses
execute:frappe.db.set_value('Custom Task', {'status': 'Pending'}, 'status', 'Open')
```

---

## 3. Site Directory Anatomy (`sites/<site-name>/`)

Each site directory holds isolated settings and site storage:

```text
sites/site1.localhost/
├── site_config.json             # Core site parameters & secrets
├── locks/                       # Active migration & task lock files
├── public/                      # Publicly accessible file attachments
│   └── files/
└── private/                     # Access-controlled private attachments
    └── back-ups/                # Database backup tarballs
```

### `site_config.json` Reference

```json
{
  "db_name": "site1_db",
  "db_password": "secure_db_password",
  "db_type": "mariadb",
  "db_port": 3306,
  "encryption_key": "base64_encoded_secret_key",
  "developer_mode": 1,
  "maintenance_mode": 0,
  "pause_scheduler": 0,
  "host_name": "http://site1.localhost:8000"
}
```

#### Important `site_config.json` Keys

| Key | Type | Description |
| :--- | :--- | :--- |
| `developer_mode` | `0` or `1` | Enables live editing of DocTypes, saves JSON files directly to disk |
| `encryption_key` | `string` | Secret key used by `frappe.db.get_value` for encrypted password fields |
| `maintenance_mode` | `0` or `1` | Blocks all client incoming HTTP requests during maintenance |
| `pause_scheduler` | `0` or `1` | Disables background scheduler execution on this site |

---

## Related Topics

- [01. Getting Started](/01-getting-started/)
- [05. DocTypes & Fields](/05-doctypes/)
- [08. Hooks Reference](/08-hooks/)
