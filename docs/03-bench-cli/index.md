---
title: Bench CLI Reference for Frappe v15
description: Complete reference for Bench CLI commands - init, new-site, list-apps, install-app, migrate, update, build, mariadb, console, execute, setup, and troubleshooting.
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

### `bench version`

Displays current versions of `bench` CLI tool and all installed Frappe applications in the bench.

```bash
bench version
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

### `bench list-sites`

Lists all sites configured in the current bench environment (`sites/` directory).

```bash
bench list-sites
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

### `bench set-admin-password`

Updates the `Administrator` user password for a specified site directly.

```bash
bench --site <site-name> set-admin-password <new-password>
```

```bash
# Example
bench --site site1.localhost set-admin-password new_secure_password
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

### `bench mariadb` / `bench postgres`

Opens an interactive CLI database prompt (MariaDB or PostgreSQL) pre-authenticated with site credentials.

```bash
# Connect to MariaDB CLI prompt for site1.localhost
bench --site site1.localhost mariadb

# Connect to PostgreSQL CLI prompt (for Postgres sites)
bench --site site1.localhost postgres
```

---

### `bench reset-perms`

Resets user permissions for all DocTypes on a site back to standard definition defaults configured in code.

```bash
bench --site site1.localhost reset-perms
```

---

### `bench scheduler`

Enables, disables, or checks the status of the background task job scheduler for a site.

```bash
# Check scheduler status
bench --site site1.localhost scheduler status

# Enable background job scheduler
bench --site site1.localhost scheduler enable

# Disable background job scheduler
bench --site site1.localhost scheduler disable
```

---

### `bench build-search-index`

Rebuilds the global full-text search index for a site database.

```bash
bench --site site1.localhost build-search-index
```

---

## 3. App Lifecycle Commands

### `bench new-app`

Generates the boilerplate directory structure for a new Frappe v15 application.

```bash
bench new-app <app-name>
```

---

### `bench get-app`

Clones a Frappe application repository into `apps/` and installs it in the Python virtualenv.

```bash
bench get-app <git-url-or-app-name> [--branch <branch-name>]
```

```bash
# Example
bench get-app https://github.com/frappe/erpnext --branch version-15
```

---

### `bench list-apps` / `bench --site list-apps`

Lists all applications installed in the bench environment or on a specific site database.

```bash
# List all apps installed on a specific site
bench --site <site-name> list-apps

# List all apps installed in the bench environment
bench list-apps
```

```bash
# Example: List apps installed on site1.localhost
bench --site site1.localhost list-apps

# Output:
# frappe
# erpnext
# hrms
```

---

### `bench install-app` / `bench uninstall-app`

Installs or uninstalls an app on a specific site database.

```bash
# Install app
bench --site site1.localhost install-app erpnext

# Uninstall app
bench --site site1.localhost uninstall-app erpnext
```

---

### `bench remove-app`

Completely removes an app from the bench environment and uninstalls it from the Python virtual environment.

```bash
bench remove-app <app-name>
```

```bash
# Example
bench remove-app my_custom_app
```

---

## 4. Development & Process Commands

### `bench start`

Starts all development server processes defined in `Procfile` (WSGI server, Redis servers, Socket.IO, RQ workers).

```bash
bench start
```

---

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

### `bench update`

Updates the bench environment, pulls latest git changes for all apps, runs database migrations, and rebuilds frontend static assets.

```bash
# Full update (git pull, migrate, build assets)
bench update

# Run database migrations and rebuild assets only (skip git pull)
bench update --patch

# Update Python and Node package dependencies only
bench update --requirements
```

---

### `bench restart`

Restarts production services (Supervisor, Gunicorn WSGI processes, background workers) running for the bench.

```bash
bench restart
```

---

---

### `bench setup nginx`

Generates the Nginx reverse-proxy configuration file (`config/nginx.conf`) based on active site configurations in the bench.

```bash
bench setup nginx
```

#### How It Works:
1. Bench scans every site folder inside `sites/`.
2. It inspects each site's `site_config.json` for domain mappings (`custom_domains`), SSL settings, and custom port settings (`nginx_port`).
3. It generates `config/nginx.conf` containing upstream proxy blocks for Gunicorn (HTTP) and NodeJS (Socket.IO websockets), along with static asset aliases pointing directly to `sites/assets`.
4. Symlink this file into your system Nginx configuration directory:

```bash
# Ubuntu / Debian
sudo ln -sf $(pwd)/config/nginx.conf /etc/nginx/conf.d/frappe-bench.conf

# Test configuration syntax
sudo nginx -t

# Reload Nginx without downtime
sudo systemctl reload nginx
```

---

### Assigning a Site to a Dedicated Port (Port-Based Multi-Tenancy)

By default, Frappe operates in **DNS-based multi-tenancy** mode (`dns_multitenant: on`), where all incoming requests arrive on port 80/443 and the site is resolved by the `Host` domain header (e.g., `site1.example.com`).

When developing locally, running on staging servers, or deploying on a single public IP without domain names, you can switch to **Port-based multi-tenancy** so each site listens on a distinct TCP port (e.g. `http://SERVER_IP:8001` and `http://SERVER_IP:8002`).

#### Step-by-Step Port Assignment Workflow

```
                   PORT-BASED MULTI-TENANCY ARCHITECTURE
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
     http://IP:8001                            http://IP:8002
      [Site: erp.local]                         [Site: crm.local]
               │                                         │
               ▼                                         ▼
   Nginx Server Block (8001)                 Nginx Server Block (8002)
   proxy_set_header Host erp.local           proxy_set_header Host crm.local
               │                                         │
               └────────────────────┬────────────────────┘
                                    ▼
                         Frappe Gunicorn (Port 8000)
```

#### Step 1: Disable DNS Multi-Tenancy
Turn off DNS-based routing across the bench:

```bash
bench config dns_multitenant off
```

#### Step 2: Assign a Port to Each Site (`bench set-nginx-port`)
Use `bench set-nginx-port` to allocate a specific port to each site:

```bash
# Assign port 8001 to site1
bench set-nginx-port site1.localhost 8001

# Assign port 8002 to site2
bench set-nginx-port site2.localhost 8002
```

> [!NOTE]
> Under the hood, this writes `"nginx_port": 8001` directly into `sites/site1.localhost/site_config.json`.

#### Step 3: Regenerate Nginx Configuration
Generate updated Nginx server blocks reflecting the new port assignments:

```bash
bench setup nginx
```

#### Step 4: Validate & Reload Nginx
Test the generated configuration file and reload the Nginx service:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 5: Open Firewall Ports (If Applicable)
If using UFW or cloud security groups (AWS, DigitalOcean, GCP), allow incoming traffic on the newly assigned ports:

```bash
sudo ufw allow 8001/tcp
sudo ufw allow 8002/tcp
sudo ufw reload
```

#### Accessing Your Sites:
- Site 1: `http://<server-ip>:8001`
- Site 2: `http://<server-ip>:8002`

#### Switching Back to DNS Multi-Tenancy
To return to standard domain-based routing on ports 80/443:

```bash
bench config dns_multitenant on
bench setup nginx
sudo systemctl reload nginx
```

---

### Customizing Internal Service Ports (`common_site_config.json`)

If the standard internal ports conflict with other software on your server, customize them in `sites/common_site_config.json`:

| Configuration Key | Default Port | Description |
| :--- | :--- | :--- |
| `webserver_port` | `8000` | Internal Gunicorn WSGI Python upstream port |
| `socketio_port` | `9000` | NodeJS Socket.IO realtime WebSocket port |
| `file_watcher_port` | `6787` | Asset file change watcher port |
| `redis_cache` | `redis://localhost:13000` | In-memory cache Redis instance port |
| `redis_queue` | `redis://localhost:11000` | Background job RQ queue Redis instance port |

```bash
# Change internal Gunicorn upstream port to 8005
bench set-config -g webserver_port 8005

# Change Socket.IO realtime port to 9005
bench set-config -g socketio_port 9005

# Regenerate configuration files for Supervisor and Nginx
bench setup supervisor
bench setup nginx

# Apply changes
sudo supervisorctl reread
sudo supervisorctl update
sudo systemctl reload nginx
```

---

### `bench setup production`

Configures both **Supervisor** (process daemon) and **Nginx** (reverse proxy) in a single command for automated production deployments:

```bash
sudo bench setup production <system-user>
```

```bash
# Example: Deploy bench under the 'frappe' linux user
sudo bench setup production frappe
```

#### What This Command Does:
1. Generates Supervisor configuration at `/etc/supervisor/conf.d/frappe-bench.conf`.
2. Generates Nginx configuration at `/etc/nginx/conf.d/frappe-bench.conf`.
3. Enables and starts the background worker queues, Gunicorn processes, and Redis servers via Supervisor.
4. Reloads Nginx and enables automatic service restarts on system reboot.

---

### Custom Domains & SSL (`bench setup add-domain` & `lets-encrypt`)

```bash
# 1. Map custom domain to a site
bench setup add-domain --site site1.localhost example.com

# 2. Regenerate Nginx configuration for new domain
bench setup nginx
sudo systemctl reload nginx

# 3. Provision free SSL certificate via Let's Encrypt Certbot
sudo bench setup lets-encrypt site1.localhost --custom-domain example.com

# 4. Remove domain mapping
bench setup remove-domain --site site1.localhost example.com
bench setup nginx
sudo systemctl reload nginx
```

---

### `bench doctor`

Inspects bench environment health, worker process status, Redis queue connection state, and stuck background jobs.

```bash
bench doctor
```

---

### `bench worker` & `bench schedule`

Runs background RQ worker queues and schedule runner in standalone background process mode.

```bash
# Start background worker handling short, default, and long queues
bench worker --queue short,default,long

# Start background periodic task scheduler
bench schedule
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

---

### `bench execute`

Executes a specific Python dotted path function directly from terminal.

```bash
bench --site site1.localhost execute <python.dotted.path.function_name> [--args "['arg1', 'arg2']"] [--kwargs "{'key': 'value'}"]
```

```bash
# Example: Trigger daily scheduled tasks manually
bench --site site1.localhost execute frappe.celery.nightly.daily
```

---

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

