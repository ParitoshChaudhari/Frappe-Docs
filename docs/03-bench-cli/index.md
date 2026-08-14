---
title: Bench CLI Reference for Frappe v15
description: Complete reference for Bench CLI commands - init, new-site, new-app, install-app, migrate, update, build, console, execute, and troubleshooting.
version: v15
category: Overview & Basics
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Bench CLI Command Reference

`bench` is the official command-line interface for managing Frappe Framework v15 environments, applications, sites, background processes, database migrations, and static asset compilation.

---

## 1. Bench Initialization & Environment Commands

### `bench init`

Initializes a new bench directory with Python virtual environment, Node modules, Redis configurations, and Frappe framework app.

```bash
bench init [options] <bench-name>
```

#### Parameters & Flags

| Flag | Type | Description |
| :--- | :--- | :--- |
| `<bench-name>` | string | Name of the directory to create for bench |
| `--frappe-branch` | string | Branch of Frappe to install (e.g. `version-15`, `develop`) |
| `--frappe-path` | string | Git URL or local file path to Frappe framework repository |
| `--python` | string | Path to specific Python executable (e.g. `python3.11`) |
| `--no-procfile` | flag | Skip generating default Procfile |
| `--skip-redis-config-generation` | flag | Skip generating Redis configuration files |

```bash
# Example: Initialize v15 Bench with Python 3.11
bench init --frappe-branch version-15 --python python3.11 frappe-bench
```

---

## 2. Site Management Commands

### `bench new-site`

Creates a new site with a fresh MariaDB/PostgreSQL database and installs Frappe framework core DocTypes.

```bash
bench new-site [options] <site-name>
```

| Parameter / Flag | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `<site-name>` | string | Yes | Fully qualified site domain (e.g., `erp.localhost`) |
| `--db-name` | string | No | Custom MariaDB database name |
| `--db-password` | string | No | Database user password |
| `--admin-password` | string | No | Default password for `Administrator` user |
| `--db-type` | string | No | Database backend: `mariadb` (default) or `postgres` |
| `--source_sql` | string | No | Path to initial SQL dump file to import |

```bash
# Example
bench new-site site1.localhost --admin-password admin --db-name site1_db
```

---

### `bench use`

Sets the default active site for subsequent bench commands, avoiding the need to pass `--site`.

```bash
bench use site1.localhost
```

---

### `bench drop-site`

Deletes a site directory and completely drops its associated database.

```bash
bench drop-site [site-name] --root-password <db-root-password>
```

---

### `bench backup` & `bench restore`

```bash
# 1. Create database and file attachments backup
bench --site site1.localhost backup --with-files

# Output:
# Backup created at ./site1.localhost/private/backups/20260814_145500-site1_localhost-db.sql.gz

# 2. Restore site from SQL database backup file
bench --site site1.localhost restore /path/to/backup-db.sql.gz --with-public-files /path/to/public.tar --with-private-files /path/to/private.tar
```

---

### `bench set-config` & `bench get-config`

Modifies `site_config.json` or `common_site_config.json` configurations programmatically.

```bash
# Set maintenance mode on site
bench --site site1.localhost set-config maintenance_mode 1

# Disable maintenance mode
bench --site site1.localhost set-config maintenance_mode 0
```

---

### `bench reinstall`

Wipes all existing site data and reinstalls a clean database for the site.

```bash
bench --site site1.localhost reinstall --admin-password admin
```

---

### `bench export-fixtures`

Exports JSON fixtures configured in `hooks.py` into your app's `fixtures/` folder.

```bash
bench --site site1.localhost export-fixtures --app my_custom_app
```

---

### `bench migrate`

Executes pending database schema modifications, runs `patches.txt` migration scripts, syncs DocTypes, and updates site assets.

```bash
bench --site <site-name> migrate
```

#### Parameters & Flags

| Flag | Description |
| :--- | :--- |
| `--skip-failing` | Skip failing patches during migration (use with caution) |
| `--skip-search-index` | Skip updating full-text search indexes during migration |

---

### `bench clear-cache` / `bench clear-website-cache`

Flushes Redis cache keys, clears session cache, clears Jinja web page cache, and reloads site configuration.

```bash
bench --site site1.localhost clear-cache
```

---

## 3. App Lifecycle Commands

### `bench new-app`

Generates the boilerplate directory structure for a new Frappe v15 application.

```bash
bench new-app <app-name>
```

### `bench get-app`

Clones a Frappe application repository into `apps/` and installs it in the Python virtualenv.

```bash
bench get-app <git-url-or-app-name> [--branch <branch-name>]
```

```bash
# Example
bench get-app https://github.com/frappe/erpnext --branch version-15
```

### `bench install-app` / `bench uninstall-app`

Installs or uninstalls an app on a specific site database.

```bash
# Install app
bench --site site1.localhost install-app erpnext

# Uninstall app
bench --site site1.localhost uninstall-app erpnext
```

---

## 4. Development & Process Commands

### `bench start`

Starts all development server processes defined in `Procfile` (WSGI server, Redis servers, Socket.IO, RQ workers).

```bash
bench start
```

### `bench build`

Bundles static assets (JS, CSS, Vue files) across all installed apps using Esbuild.

```bash
# Build production assets
bench build

# Build with file watching (auto rebuild on changes)
bench build --watch

# Build specific app assets
bench build --app my_custom_app
```

---

## 5. Console & Execution Commands

### `bench console`

Opens an interactive IPython REPL pre-loaded with Frappe environment context (`frappe`, `frappe.db`, site context).

```bash
bench --site site1.localhost console
```

```python
# Inside bench console:
In [1]: frappe.db.get_value("User", "Administrator", "email")
Out[1]: 'admin@example.com'
```

### `bench execute`

Executes a specific Python dotted path function directly from terminal.

```bash
bench --site site1.localhost execute <python.dotted.path.function_name> [--args "['arg1', 'arg2']"] [--kwargs "{'key': 'value'}"]
```

```bash
# Example: Trigger daily scheduled tasks manually
bench --site site1.localhost execute frappe.celery.nightly.daily
```

### `bench run-tests`

Runs unittest suite for installed applications.

```bash
bench --site site1.localhost run-tests --app my_custom_app --module my_custom_app.tests.test_task
```

---

## 6. Common Bench Errors & Solutions

### Error 1: `MariaDB Access Denied for user 'root'@'localhost'`

**Cause**: Incorrect database root password specified during site creation.  
**Fix**: Specify correct root password using `--root-password`:
```bash
bench new-site site1.localhost --root-password YOUR_MARIADB_ROOT_PASSWORD
```

### Error 2: `redis.exceptions.ConnectionError: Error 111 connecting to 127.0.0.1:13000`

**Cause**: Redis cache service is stopped.  
**Fix**: Start Redis or run `bench start` in background.

---

## Related Topics

- [01. Getting Started](/01-getting-started/)
- [04. Apps & Sites Structure](/04-apps-and-sites/)
