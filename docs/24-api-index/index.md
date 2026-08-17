---
title: Searchable API Index for Frappe v15
description: Complete, exhaustive alphabetical reference index of all public Python server APIs, database methods, document functions, JS form APIs, session utilities, Jinja filters, and CLI commands in Frappe Framework v15.
version: v15
category: Quality, Operations & Best Practices
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Searchable API Index

Exhaustive alphabetical reference index of all public functions, methods, hooks, decorators, CLI commands, and utility APIs in **Frappe Framework v15** with direct links to their detailed documentation, code examples, and execution environment badges.

---

<div style="background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 1rem 1.25rem; margin: 1.5rem 0;">
  <strong style="display: block; margin-bottom: 0.5rem; font-size: 0.92rem;">🏷️ Execution Environment Legend:</strong>
  <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; font-size: 0.85rem;">
    <div><span class="badge server">Server</span> <strong>Server (Python)</strong>: Executes on backend WSGI / Gunicorn Python process or RQ worker.</div>
    <div><span class="badge client">Client</span> <strong>Client (JavaScript)</strong>: Executes in browser Desk interface, Client Scripts, or Form engine.</div>
    <div><span class="badge both">Both</span> <strong>Both (Server &amp; Client)</strong>: Available in both Python and JS with identical/equivalent signatures.</div>
  </div>
</div>

---

## A

- [`_()`](/19-utils/#5-internationalization-translation-frappe-_) <span class="badge both">Both</span> — Multilingual translation function wrapper (`_()` in Python, `__()` / `frappe._()` in JS).
- [`add_days()`](/19-utils/#1-date-time-utilities) <span class="badge both">Both</span> — Add or subtract N days from date string (`frappe.utils.add_days` in Python, `frappe.datetime.add_days` in JS).
- [`add_months()`](/19-utils/#1-date-time-utilities) <span class="badge both">Both</span> — Add or subtract N months from date string (`frappe.utils.add_months` in Python, `frappe.datetime.add_months` in JS).
- [`add_to_date()`](/19-utils/#1-date-time-utilities) <span class="badge server">Server</span> — Add date/time intervals (years, months, days, hours) to target date.
- [`add_years()`](/19-utils/#1-date-time-utilities) <span class="badge server">Server</span> — Add or subtract N years from date string.
- [`after_delete()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Controller lifecycle hook executed after database row deletion.
- [`after_insert()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Controller lifecycle hook executed immediately after initial DB row insertion.
- [`after_job`](/08-hooks/#9-request-job-middleware-hooks) <span class="badge server">Server</span> — Background RQ job completion middleware hook in `hooks.py`.
- [`after_request`](/08-hooks/#9-request-job-middleware-hooks) <span class="badge server">Server</span> — HTTP request completion middleware hook in `hooks.py`.
- [`app_include_css`](/08-hooks/#5-client-desk-assets-script-inclusions) <span class="badge server">Server</span> — Include global custom CSS bundle in Desk interface (`hooks.py`).
- [`app_include_js`](/08-hooks/#5-client-desk-assets-script-inclusions) <span class="badge server">Server</span> — Include global custom JS bundle in Desk interface (`hooks.py`).
- [`autoname()`](/05-doctypes/#option-5-programmatic-naming-autoname-controller-method) <span class="badge server">Server</span> — Custom document primary key generator controller method.

---

## B

- [`before_change()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Controller hook executed prior to document state modification.
- [`before_insert()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Controller hook executed right before initial database `INSERT`.
- [`before_job`](/08-hooks/#9-request-job-middleware-hooks) <span class="badge server">Server</span> — Background RQ job pre-execution middleware hook.
- [`before_naming()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Controller hook executed immediately before `autoname()` resolution.
- [`before_request`](/08-hooks/#9-request-job-middleware-hooks) <span class="badge server">Server</span> — HTTP request pre-processing middleware hook.
- [`before_save()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Controller hook executed right before SQL `INSERT`/`UPDATE` write.
- [`before_submit()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Controller hook executed prior to document submission checks.
- [`before_trash()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Controller hook executed prior to starting document deletion.
- [`bench backup`](/03-bench-cli/#bench-backup-bench-restore) <span class="badge server">Server</span> — Backup site database, public files, and private attachments.
- [`bench build`](/03-bench-cli/#bench-build) <span class="badge server">Server</span> — Compile static frontend assets (JS/CSS) using Esbuild.
- [`bench build-search-index`](/03-bench-cli/#bench-build-search-index) <span class="badge server">Server</span> — Rebuild global search index for site database.
- [`bench clear-cache`](/03-bench-cli/#bench-clear-cache-bench-clear-website-cache) <span class="badge server">Server</span> — Flush Redis site cache, session keys, and Jinja web pages.
- [`bench console`](/03-bench-cli/#bench-console) <span class="badge server">Server</span> — Launch interactive IPython REPL pre-loaded with Frappe site context.
- [`bench doctor`](/03-bench-cli/#bench-doctor) <span class="badge server">Server</span> — Monitor status of Redis queues, workers, and background jobs.
- [`bench drop-site`](/03-bench-cli/#bench-drop-site) <span class="badge server">Server</span> — Delete a site directory and drop its associated MariaDB/PostgreSQL database.
- [`bench execute`](/03-bench-cli/#bench-execute) <span class="badge server">Server</span> — Run Python dotted path function directly from CLI terminal.
- [`bench export-fixtures`](/03-bench-cli/#bench-export-fixtures) <span class="badge server">Server</span> — Export JSON fixtures configured in `hooks.py` into application directory.
- [`bench get-app`](/03-bench-cli/#bench-get-app) <span class="badge server">Server</span> — Clone Frappe application repository into `apps/` and install in virtualenv.
- [`bench get-config`](/03-bench-cli/#bench-set-config-bench-get-config) <span class="badge server">Server</span> — Inspect site configuration keys.
- [`bench get-untranslated`](/19-utils/#translation-csv-files-cli-commands) <span class="badge server">Server</span> — Extract untranslated strings into language CSV file.
- [`bench init`](/03-bench-cli/#1-bench-initialization-environment-commands) <span class="badge server">Server</span> — Initialize new Bench environment directory with Python virtualenv.
- [`bench install-app`](/03-bench-cli/#bench-install-app-bench-uninstall-app) <span class="badge server">Server</span> — Install Frappe application onto target site database.
- [`bench list-apps`](/03-bench-cli/#bench-list-apps-bench--site-list-apps) <span class="badge server">Server</span> — List applications installed in bench or on a specific site.
- [`bench list-sites`](/03-bench-cli/#bench-list-sites) <span class="badge server">Server</span> — List all site directories configured in bench workspace.
- [`bench mariadb`](/03-bench-cli/#bench-mariadb-bench-postgres) <span class="badge server">Server</span> — Open interactive MariaDB database prompt pre-connected to site.
- [`bench migrate`](/03-bench-cli/#bench-migrate) <span class="badge server">Server</span> — Execute database schema migrations, patches, and sync DocType schemas.
- [`bench new-app`](/03-bench-cli/#3-app-lifecycle-commands) <span class="badge server">Server</span> — Generate boilerplate directory structure for a new Frappe app.
- [`bench new-site`](/03-bench-cli/#2-site-management-commands) <span class="badge server">Server</span> — Create new site with fresh MariaDB/PostgreSQL database.
- [`bench reinstall`](/03-bench-cli/#bench-reinstall) <span class="badge server">Server</span> — Wipe existing site database and reinstall clean initial schema.
- [`bench remove-app`](/03-bench-cli/#bench-remove-app) <span class="badge server">Server</span> — Remove application directory and uninstall package from virtualenv.
- [`bench reset-perms`](/03-bench-cli/#bench-reset-perms) <span class="badge server">Server</span> — Reset site DocType permissions to standard code defaults.
- [`bench restart`](/03-bench-cli/#bench-restart) <span class="badge server">Server</span> — Restart production background workers, Gunicorn, and supervisor services.
- [`bench restore`](/03-bench-cli/#bench-backup-bench-restore) <span class="badge server">Server</span> — Restore site database and file archives from SQL dump.
- [`bench run-tests`](/03-bench-cli/#bench-run-tests) <span class="badge server">Server</span> — Execute unittest suite for installed applications.
- [`bench scheduler`](/03-bench-cli/#bench-scheduler) <span class="badge server">Server</span> — Enable, disable, or check status of background job scheduler.
- [`bench set-admin-password`](/03-bench-cli/#bench-set-admin-password) <span class="badge server">Server</span> — Change Administrator account password on site.
- [`bench set-config`](/03-bench-cli/#bench-set-config-bench-get-config) <span class="badge server">Server</span> — Modify `site_config.json` configuration values programmatically.
- [`bench setup`](/03-bench-cli/#bench-setup) <span class="badge server">Server</span> — Configure production services, Nginx, Supervisor, and domain routes.
- [`bench start`](/03-bench-cli/#4-development-process-commands) <span class="badge server">Server</span> — Start all development background processes defined in Procfile.
- [`bench update`](/03-bench-cli/#bench-update) <span class="badge server">Server</span> — Update bench repositories, run migrations, and rebuild static assets.
- [`bench update-translations`](/19-utils/#translation-csv-files-cli-commands) <span class="badge server">Server</span> — Sync and update application translation CSV files.
- [`bench use`](/03-bench-cli/#bench-use) <span class="badge server">Server</span> — Set default active site for subsequent bench commands.
- [`bench version`](/03-bench-cli/#bench-version) <span class="badge server">Server</span> — Display installed versions of bench tool and apps.
- [`bench worker`](/03-bench-cli/#bench-worker-bench-schedule) <span class="badge server">Server</span> — Start background RQ worker process daemon.
- [`boot_session`](/08-hooks/#6-jinja-templating-session-extensions) <span class="badge server">Server</span> — Extend `bootinfo` dictionary sent to Desk client upon user login.

---

## C

- [`cint()`](/19-utils/#2-type-conversion-safe-casting) <span class="badge both">Both</span> — Safe integer type conversion returning default on failure (Python &amp; JS).
- [`cstr()`](/19-utils/#2-type-conversion-safe-casting) <span class="badge both">Both</span> — Safe string type conversion handling `None` safely (Python &amp; JS).
- [`date_diff()`](/19-utils/#1-date-time-utilities) <span class="badge both">Both</span> — Calculate integer day difference between two dates (Python &amp; JS).
- [`db_insert()`](/05-doctypes/#virtual-doctypes-is_virtual-1) <span class="badge server">Server</span> — Controller override method for Virtual DocType database insertion.
- [`db_update()`](/05-doctypes/#virtual-doctypes-is_virtual-1) <span class="badge server">Server</span> — Controller override method for Virtual DocType update.
- [`delete()`](/05-doctypes/#virtual-doctypes-is_virtual-1) <span class="badge server">Server</span> — Controller override method for Virtual DocType record deletion.
- [`doc.add_comment()`](/06-documents/#key-inspection-helper-methods) <span class="badge server">Server</span> — Appends activity timeline comment to document.
- [`doc.add_tag()`](/06-documents/#key-inspection-helper-methods) <span class="badge server">Server</span> — Attaches tag string to document.
- [`doc.append()`](/06-documents/#key-inspection-helper-methods) <span class="badge server">Server</span> — Appends new row to child table field.
- [`doc.as_dict()`](/06-documents/#key-inspection-helper-methods) <span class="badge server">Server</span> — Serializes document and child tables to plain Python dictionary.
- [`doc.cancel()`](/06-documents/#doc-submit-doc-cancel) <span class="badge server">Server</span> — Cancels submitted document (`docstatus: 2`).
- [`doc.db_set()`](/06-documents/#doc-db-set) <span class="badge server">Server</span> — Updates field directly in database bypassing validation hooks.
- [`doc.flags.ignore_if_duplicate`](/06-documents/#3-document-flags-docflags) <span class="badge server">Server</span> — Prevents throwing duplicate name exception during insert.
- [`doc.flags.ignore_links`](/06-documents/#3-document-flags-docflags) <span class="badge server">Server</span> — Skips validation of linked document existence.
- [`doc.flags.ignore_mandatory`](/06-documents/#3-document-flags-docflags) <span class="badge server">Server</span> — Suppresses errors for missing mandatory fields.
- [`doc.flags.ignore_permissions`](/06-documents/#3-document-flags-docflags) <span class="badge server">Server</span> — Bypasses user permission checks during insert/save/submit.
- [`doc.flags.ignore_validate`](/06-documents/#3-document-flags-docflags) <span class="badge server">Server</span> — Bypasses execution of controller `validate()` hooks.
- [`doc.get_db_value()`](/06-documents/#key-inspection-helper-methods) <span class="badge server">Server</span> — Reads field value directly from database disk bypassing cache.
- [`doc.get_doc_before_save()`](/06-documents/#key-inspection-helper-methods) <span class="badge server">Server</span> — Returns immutable snapshot of document prior to save.
- [`doc.get_formatted()`](/06-documents/#key-inspection-helper-methods) <span class="badge server">Server</span> — Returns human-formatted string of field value.
- [`doc.get_tags()`](/06-documents/#key-inspection-helper-methods) <span class="badge server">Server</span> — Returns comma-separated string of assigned tags.
- [`doc.has_value_changed()`](/06-documents/#key-inspection-helper-methods) <span class="badge server">Server</span> — Checks if field value changed compared to DB value.
- [`doc.insert()`](/06-documents/#doc-insert) <span class="badge server">Server</span> — Inserts new document record into MariaDB/PostgreSQL.
- [`doc.is_dirty()`](/06-documents/#key-inspection-helper-methods) <span class="badge server">Server</span> — Returns `True` if document fields have unsaved memory edits.
- [`doc.is_new()`](/06-documents/#key-inspection-helper-methods) <span class="badge server">Server</span> — Returns `True` if document is not yet saved to database.
- [`doc.queue_action()`](/06-documents/#key-inspection-helper-methods) <span class="badge server">Server</span> — Queues document action for background worker execution.
- [`doc.remove_tag()`](/06-documents/#key-inspection-helper-methods) <span class="badge server">Server</span> — Removes tag string from document.
- [`doc.run_method()`](/06-documents/#key-inspection-helper-methods) <span class="badge server">Server</span> — Programmatically executes method on document instance.
- [`doc.save()`](/06-documents/#doc-save) <span class="badge server">Server</span> — Saves changes on existing document to database.
- [`doc.submit()`](/06-documents/#doc-submit-doc-cancel) <span class="badge server">Server</span> — Submits draft document (`docstatus: 1`).
- [`doc_events`](/08-hooks/#1-document-event-hooks-doc-events) <span class="badge server">Server</span> — Registers document lifecycle event hooks in `hooks.py`.
- [`doctype_calendar_js`](/08-hooks/#5-client-desk-assets-script-inclusions) <span class="badge server">Server</span> — Injects custom JS bundle into DocType Calendar view (`hooks.py`).
- [`doctype_js`](/08-hooks/#5-client-desk-assets-script-inclusions) <span class="badge server">Server</span> — Injects custom JS bundle into DocType Form view (`hooks.py`).
- [`doctype_list_js`](/08-hooks/#5-client-desk-assets-script-inclusions) <span class="badge server">Server</span> — Injects custom JS bundle into DocType List view (`hooks.py`).
- [`doctype_tree_js`](/08-hooks/#5-client-desk-assets-script-inclusions) <span class="badge server">Server</span> — Injects custom JS bundle into DocType Tree view (`hooks.py`).

---

## F

- [`flt()`](/19-utils/#2-type-conversion-safe-casting) <span class="badge both">Both</span> — Safe float type conversion with optional precision rounding (Python &amp; JS).
- [`fmt_money()`](/19-utils/#3-formatting-text-manipulation) <span class="badge server">Server</span> — Formats numeric value into monetary currency string.
- [`format_currency`](/17-web-jinja-print-reports/#built-in-jinja-filters-matrix) <span class="badge server">Server</span> — Jinja template filter for currency formatting.
- [`format_date()`](/19-utils/#1-date-time-utilities) <span class="badge server">Server</span> — Formats ISO date string to user system format.
- [`format_datetime()`](/19-utils/#1-date-time-utilities) <span class="badge server">Server</span> — Formats ISO datetime string.
- [`format_time()`](/19-utils/#1-date-time-utilities) <span class="badge server">Server</span> — Formats time string.
- [`frappe._()`](/19-utils/#5-internationalization-translation-frappe-_) <span class="badge both">Both</span> — Multilingual translation function wrapper (Python &amp; JS).
- [`frappe.breadcrumbs.add()`](/11-client-api/#3-client-navigation-route-inspection-breadcrumbs) <span class="badge client">Client</span> — Inject breadcrumb link into Desk header toolbar.
- [`frappe.cache()`](/16-cache-realtime-email-files/#1-redis-caching-api-frappe-cache) <span class="badge server">Server</span> — Access site Redis Cache connection wrapper instance.
- [`frappe.call()`](/11-client-api/#7-asynchronous-server-rpc-frappe-call) <span class="badge client">Client</span> — Executes client-side AJAX RPC call to server method.
- [`frappe.confirm()`](/11-client-api/#8-ui-dialogs-user-prompting-apis) <span class="badge client">Client</span> — Displays client confirmation modal dialog.
- [`frappe.copy_doc()`](/06-documents/#frappe-copy_doc) <span class="badge server">Server</span> — Duplicates existing document in memory without saving to DB.
- [`frappe.datetime.add_days()`](/19-utils/#2-client-side-javascript-datetime-utilities-frappe-datetime-frappe-utils) <span class="badge client">Client</span> — Client JS helper adding days to date.
- [`frappe.datetime.add_months()`](/19-utils/#2-client-side-javascript-datetime-utilities-frappe-datetime-frappe-utils) <span class="badge client">Client</span> — Client JS helper adding months to date.
- [`frappe.datetime.get_diff()`](/19-utils/#2-client-side-javascript-datetime-utilities-frappe-datetime-frappe-utils) <span class="badge client">Client</span> — Client JS helper calculating day difference between dates.
- [`frappe.datetime.get_today()`](/19-utils/#2-client-side-javascript-datetime-utilities-frappe-datetime-frappe-utils) <span class="badge client">Client</span> — Client JS helper returning today's date string (`YYYY-MM-DD`).
- [`frappe.datetime.now_datetime()`](/19-utils/#2-client-side-javascript-datetime-utilities-frappe-datetime-frappe-utils) <span class="badge client">Client</span> — Client JS helper returning current datetime string.
- [`frappe.datetime.pretty_date()`](/19-utils/#2-client-side-javascript-datetime-utilities-frappe-datetime-frappe-utils) <span class="badge client">Client</span> — Client JS helper returning human-friendly relative date string.
- [`frappe.datetime.str_to_user()`](/19-utils/#2-client-side-javascript-datetime-utilities-frappe-datetime-frappe-utils) <span class="badge client">Client</span> — Client JS helper formatting system date string to active user format.
- [`frappe.db.commit()`](/10-database/#database-transactions-commit-rollback-savepoint) <span class="badge server">Server</span> — Explicitly commits current database transaction.
- [`frappe.db.count()`](/10-database/#5-client-side-database-proxy-frappe-db-in-javascript) <span class="badge both">Both</span> — Counts matching database records without instantiating objects (Server &amp; Client JS Promise).
- [`frappe.db.delete()`](/10-database/#frappe-db-delete) <span class="badge server">Server</span> — Performs direct SQL row deletion based on filter conditions.
- [`frappe.db.delete_doc()`](/10-database/#5-client-side-database-proxy-frappe-db-in-javascript) <span class="badge both">Both</span> — Deletes document record (Server &amp; Client JS Promise).
- [`frappe.db.exists()`](/10-database/#5-client-side-database-proxy-frappe-db-in-javascript) <span class="badge both">Both</span> — Checks record existence in database (Server &amp; Client JS Promise).
- [`frappe.db.get_all()`](/09-server-api/#frappe-get-all-frappe-get-list) <span class="badge server">Server</span> — Fetches record list bypassing user permissions.
- [`frappe.db.get_default()`](/10-database/#frappedbget_default-frappedbset_default) <span class="badge server">Server</span> — Retrieves user/system default value setting.
- [`frappe.db.get_doc()`](/10-database/#5-client-side-database-proxy-frappe-db-in-javascript) <span class="badge both">Both</span> — Fetches document instance object (Server &amp; Client JS Promise).
- [`frappe.db.get_list()`](/10-database/#5-client-side-database-proxy-frappe-db-in-javascript) <span class="badge both">Both</span> — Fetches record list enforcing user permissions (Server &amp; Client JS Promise).
- [`frappe.db.get_single_value()`](/10-database/#frappedbget_values-frappedbget_single_value) <span class="badge both">Both</span> — Retrieves field value from Single DocType (Server &amp; Client JS Promise).
- [`frappe.db.get_value()`](/10-database/#5-client-side-database-proxy-frappe-db-in-javascript) <span class="badge both">Both</span> — Queries single or multiple field values efficiently (Server &amp; Client JS Promise).
- [`frappe.db.get_values()`](/10-database/#frappedbget_values-frappedbget_single_value) <span class="badge server">Server</span> — Queries field values across multiple records.
- [`frappe.db.has_column()`](/10-database/#schema-inspection-table_exists-has_column) <span class="badge server">Server</span> — Verifies table column existence in database.
- [`frappe.db.insert()`](/10-database/#5-client-side-database-proxy-frappe-db-in-javascript) <span class="badge client">Client</span> — Client-side Promise document insertion API.
- [`frappe.db.rollback()`](/10-database/#transaction-controls-frappedbsavepoint-frappedbrollback) <span class="badge server">Server</span> — Reverts pending database transaction or rolls back to savepoint.
- [`frappe.db.savepoint()`](/10-database/#transaction-controls-frappedbsavepoint-frappedbrollback) <span class="badge server">Server</span> — Creates named database transaction savepoint.
- [`frappe.db.set_default()`](/10-database/#frappedbget_default-frappedbset_default) <span class="badge server">Server</span> — Sets user or system default setting value.
- [`frappe.db.set_single_value()`](/10-database/#frappedbget_values-frappedbget_single_value) <span class="badge server">Server</span> — Updates field value on Single DocType.
- [`frappe.db.set_value()`](/10-database/#5-client-side-database-proxy-frappe-db-in-javascript) <span class="badge both">Both</span> — Direct SQL field update bypassing validation hooks (Server &amp; Client JS Promise).
- [`frappe.db.sql()`](/10-database/#frappe-db-sql-raw-sql-execution) <span class="badge server">Server</span> — Executes raw SQL queries with mandatory parameter binding.
- [`frappe.db.table_exists()`](/10-database/#schema-inspection-table_exists-has_column) <span class="badge server">Server</span> — Verifies database table existence.
- [`frappe.db.touch()`](/10-database/#schema-inspection-maintenance-table_exists-has_column-touch) <span class="badge server">Server</span> — Updates document `modified` timestamp without field edits.
- [`frappe.defaults.get_user_default()`](/14-authentication-permissions/#client-side-user-defaults-permissions-javascript) <span class="badge client">Client</span> — Retrieves client user default setting.
- [`frappe.defaults.get_user_permissions()`](/14-authentication-permissions/#client-side-user-defaults-permissions-javascript) <span class="badge client">Client</span> — Retrieves user permission restrictions array.
- [`frappe.enqueue()`](/15-background-jobs-scheduler/#1-asynchronous-execution-frappe-enqueue) <span class="badge server">Server</span> — Enqueues background RQ worker job with queue/timeout options.
- [`frappe.format()`](/11-client-api/#5-client-schema-field-formatting-frappe-meta-frappe-format) <span class="badge client">Client</span> — Universal field value formatter helper based on field metadata.
- [`frappe.get_all()`](/09-server-api/#frappe-get-all-frappe-get-list) <span class="badge server">Server</span> — Fetches records list bypassing user permissions.
- [`frappe.get_cached_doc()`](/06-documents/#frappe-get-cached-doc) <span class="badge server">Server</span> — Retrieves document from Redis cache.
- [`frappe.get_cached_value()`](/16-cache-realtime-email-files/#high-performance-value-caching-frappe-get_cached_value) <span class="badge server">Server</span> — Retrieves field value from Redis cache if present.
- [`frappe.get_doc()`](/06-documents/#frappe-get-doc) <span class="badge server">Server</span> — Instantiates Document ORM object from database or dictionary.
- [`frappe.get_list()`](/09-server-api/#frappe-get-all-frappe-get-list) <span class="badge server">Server</span> — Fetches records list enforcing active user permissions.
- [`frappe.get_meta()`](/10-database/#2-doctype-metadata-request-context-apis) <span class="badge server">Server</span> — Returns Meta structure object for specified DocType.
- [`frappe.get_roles()`](/14-authentication-permissions/#2-user-roles-api-get_roles-has_role) <span class="badge server">Server</span> — Fetches list of roles assigned to active user.
- [`frappe.get_route()`](/11-client-api/#3-client-navigation-route-inspection-breadcrumbs) <span class="badge client">Client</span> — Returns active browser route array.
- [`frappe.get_route_str()`](/11-client-api/#3-client-navigation-route-inspection-breadcrumbs) <span class="badge client">Client</span> — Returns active browser route string.
- [`frappe.has_permission()`](/14-authentication-permissions/#fetching-evaluating-user-permissions-python) <span class="badge server">Server</span> — Evaluates document permission for user programmatically.
- [`frappe.has_role()`](/14-authentication-permissions/#2-user-roles-api-get_roles-has_role) <span class="badge server">Server</span> — Checks if user possesses specific role.
- [`frappe.hide_progress()`](/11-client-api/#2-user-notifications-warnings-progress-bars-frappe) <span class="badge client">Client</span> — Client JS helper hiding header progress bar.
- [`frappe.local`](/10-database/#frappe-local-request-context) <span class="badge server">Server</span> — Thread-local HTTP request context object (`local.site`, `local.user`, `local.form_dict`).
- [`frappe.log_error()`](/09-server-api/#frappe-log-error) <span class="badge server">Server</span> — Logs exception traceback to system Error Log.
- [`frappe.meta.get_docfield()`](/11-client-api/#5-client-schema-field-formatting-frappe-meta-frappe-format) <span class="badge client">Client</span> — Fetches DocField definition schema object on client.
- [`frappe.meta.has_field()`](/11-client-api/#5-client-schema-field-formatting-frappe-meta-frappe-format) <span class="badge client">Client</span> — Checks if field exists in DocType schema on client.
- [`frappe.model.add_child()`](/11-client-api/#pattern-a-unsaved-form-mapping-navigation-frappe-model-make_new_doc_and_get_name) <span class="badge client">Client</span> — Appends new row to child table in client memory.
- [`frappe.model.can_create()`](/11-client-api/#6-client-model-memory-helpers-frappemodel) <span class="badge client">Client</span> — Checks if active user has permission to create records for DocType.
- [`frappe.model.can_delete()`](/11-client-api/#6-client-model-memory-helpers-frappemodel) <span class="badge client">Client</span> — Checks if active user has delete permission for DocType.
- [`frappe.model.can_read()`](/11-client-api/#6-client-model-memory-helpers-frappemodel) <span class="badge client">Client</span> — Checks if active user has read permission for DocType.
- [`frappe.model.can_submit()`](/11-client-api/#6-client-model-memory-helpers-frappemodel) <span class="badge client">Client</span> — Checks if active user has submit permission for DocType.
- [`frappe.model.can_write()`](/11-client-api/#6-client-model-memory-helpers-frappemodel) <span class="badge client">Client</span> — Checks if active user has write/edit permission for DocType.
- [`frappe.model.clear_doc()`](/11-client-api/#6-client-model-memory-helpers-frappe-model) <span class="badge client">Client</span> — Clears document from local client memory cache.
- [`frappe.model.delete_doc()`](/06-documents/#frappe-model-delete_doc) <span class="badge server">Server</span> — Programmatically deletes document and linked child records.
- [`frappe.model.get_new_doc()`](/11-client-api/#6-client-model-memory-helpers-frappe-model) <span class="badge client">Client</span> — Instantiates new unsaved document object in client memory.
- [`frappe.model.make_new_doc_and_get_name()`](/11-client-api/#pattern-a-unsaved-form-mapping-navigation-frappe-model-make_new_doc_and_get_name) <span class="badge client">Client</span> — Instantiates unsaved new document in client memory and returns name.
- [`frappe.model.mapper.get_mapped_doc()`](/06-documents/#frappe-model-mapper-get_mapped_doc) <span class="badge server">Server</span> — Maps values from source document to target document.
- [`frappe.model.naming.make_autoname()`](/06-documents/#frappe-model-naming-make_autoname) <span class="badge server">Server</span> — Generates auto-incremented primary keys based on format string.
- [`frappe.model.rename_doc()`](/06-documents/#frappe-model-rename_doc) <span class="badge server">Server</span> — Renames document primary key and updates all foreign key references.
- [`frappe.model.set_value()`](/11-client-api/#6-client-model-memory-helpers-frappe-model) <span class="badge client">Client</span> — Sets field value in local client model memory and triggers UI updates.
- [`frappe.model.with_doctype()`](/11-client-api/#6-client-model-memory-helpers-frappe-model) <span class="badge client">Client</span> — Loads DocType schema metadata before executing callback.
- [`frappe.msgprint()`](/09-server-api/#frappe-msgprint) <span class="badge both">Both</span> — Displays message dialog popup to user (Server &amp; Client JS).
- [`frappe.new_doc()`](/06-documents/#frappe-new-doc) <span class="badge server">Server</span> — Initializes new Document instance with schema defaults.
- [`frappe.permissions.get_user_permissions()`](/14-authentication-permissions/#fetching-evaluating-user-permissions-python) <span class="badge server">Server</span> — Fetches User Permission restrictions.
- [`frappe.prompt()`](/11-client-api/#8-ui-dialogs-user-prompting-apis) <span class="badge client">Client</span> — Displays interactive input prompt modal.
- [`frappe.publish_progress()`](/16-cache-realtime-email-files/#2-realtime-websocket-events-frappe-publish_realtime-frappe-publish_progress) <span class="badge server">Server</span> — Displays header progress bar in Desk interface.
- [`frappe.publish_realtime()`](/16-cache-realtime-email-files/#2-realtime-websocket-events-frappe-publish_realtime-frappe-publish_progress) <span class="badge server">Server</span> — Publishes WebSocket event to connected browser clients.
- [`frappe.qb`](/10-database/#3-query-builder-frappe-qb) <span class="badge server">Server</span> — PyPika SQL Query Builder interface.
- [`frappe.realtime.emit()`](/16-cache-realtime-email-files/#client-side-websockets-subscription-frapperealtime) <span class="badge client">Client</span> — Emits client-side Socket.IO WebSockets event to server.
- [`frappe.realtime.off()`](/11-client-api/#10-complete-client-javascript-api-utility-reference-matrix) <span class="badge client">Client</span> — Client JS helper removing WebSocket event listener.
- [`frappe.realtime.on()`](/16-cache-realtime-email-files/#client-side-websockets-subscription-frapperealtime) <span class="badge both">Both</span> — Subscribes client-side Socket.IO WebSockets to server events.
- [`frappe.sendmail()`](/16-cache-realtime-email-files/#3-transactional-email-api-frappe-sendmail) <span class="badge server">Server</span> — Queues email delivery in background.
- [`frappe.session.user`](/14-authentication-permissions/#1-active-session-context-frappe-session) <span class="badge server">Server</span> — Returns active authenticated user email string.
- [`frappe.set_route()`](/11-client-api/#navigation-route-state-frappe-set_route) <span class="badge client">Client</span> — Navigates Desk view to specified route array.
- [`frappe.set_route_options()`](/11-client-api/#3-client-navigation-route-inspection-breadcrumbs) <span class="badge client">Client</span> — Sets route options object for target view navigation.
- [`frappe.share.add()`](/14-authentication-permissions/#5-document-sharing-api-frappe-share) <span class="badge server">Server</span> — Shares specific document instance with user.
- [`frappe.share.get_users()`](/14-authentication-permissions/#5-document-sharing-api-frappe-share) <span class="badge server">Server</span> — Gets list of users a document is shared with.
- [`frappe.share.remove()`](/14-authentication-permissions/#5-document-sharing-api-frappe-share) <span class="badge server">Server</span> — Removes sharing permission from user.
- [`frappe.show_alert()`](/11-client-api/#toast-alerts-frappe-show_alert) <span class="badge client">Client</span> — Displays non-blocking temporary toast notification.
- [`frappe.show_progress()`](/11-client-api/#2-user-notifications-warnings-progress-bars-frappe) <span class="badge client">Client</span> — Client JS helper displaying header progress bar.
- [`frappe.throw()`](/09-server-api/#frappe-throw) <span class="badge both">Both</span> — Raises ValidationError and displays error alert message (Server &amp; Client JS).
- [`frappe.ui.Dialog`](/11-client-api/#custom-modal-dialogs-frappe-ui-dialog) <span class="badge client">Client</span> — Instantiates custom client modal dialog.
- [`frappe.ui.form.MultiSelectDialog`](/11-client-api/#7-multiselect-dialog-selector-frappe-ui-form-multiselectdialog) <span class="badge client">Client</span> — Pop-up modal dialog for multi-selecting document records.
- [`frappe.ui.form.on()`](/11-client-api/#1-form-event-handlers-frappe-ui-form-on) <span class="badge client">Client</span> — Binds JS event handlers to form lifecycle triggers.
- [`frappe.user.has_role()`](/14-authentication-permissions/#client-side-javascript-role-inspection-frappe-user-has_role) <span class="badge client">Client</span> — Checks role assignment on client browser.
- [`frappe.user_roles`](/14-authentication-permissions/#client-side-javascript-role-inspection-frappe-user-has_role) <span class="badge client">Client</span> — Array of roles assigned to active client user.
- [`frappe.utils.now()`](/19-utils/#1-date-time-utilities) <span class="badge server">Server</span> — Returns current datetime string.
- [`frappe.utils.today()`](/19-utils/#1-date-time-utilities) <span class="badge server">Server</span> — Returns current date string (`YYYY-MM-DD`).
- [`frappe.warn()`](/11-client-api/#2-user-notifications-warnings-progress-bars-frappe) <span class="badge client">Client</span> — Displays client confirmation warning dialog with custom action button.
- [`frm.add_child()`](/12-child-tables/#adding-clearing-editing-child-rows-in-desk-form) <span class="badge client">Client</span> — Appends new row to child table field on form.
- [`frm.add_custom_button()`](/11-client-api/#2-custom-buttons-api-frm-add_custom_button) <span class="badge client">Client</span> — Adds custom button or dropdown group button to toolbar.
- [`frm.add_fetch()`](/11-client-api/#8-additional-form-child-table-helpers-frm) <span class="badge client">Client</span> — Configures auto-fetching of field values when Link field changes.
- [`frm.change_custom_button_type()`](/11-client-api/#2-custom-buttons-api-frm-add_custom_button) <span class="badge client">Client</span> — Styles custom button (`primary`, `danger`, `warning`).
- [`frm.clear_custom_buttons()`](/11-client-api/#clearing-custom-buttons) <span class="badge client">Client</span> — Removes all custom buttons from form toolbar.
- [`frm.clear_table()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Wipes all child table rows from form field.
- [`frm.copy_doc()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Duplicates active document into new unsaved draft form.
- [`frm.dirty()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Returns `true` if form contains unsaved memory edits.
- [`frm.disable_form()`](/11-client-api/#2-disabling-the-entire-form-input-disable_form) <span class="badge client">Client</span> — Makes all form fields read-only and hides save button.
- [`frm.disable_save()`](/11-client-api/#1-disabling-hiding-the-standard-save-button-disable_save) <span class="badge client">Client</span> — Disables and hides standard Save button.
- [`frm.enable_form()`](/11-client-api/#8-additional-form-child-table-helpers-frm) <span class="badge client">Client</span> — Re-enables form editing and inputs.
- [`frm.enable_save()`](/11-client-api/#1-disabling-hiding-the-standard-save-button-disable_save) <span class="badge client">Client</span> — Re-enables standard Save button.
- [`frm.get_field()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) <span class="badge client">Client</span> — Returns DocField control instance (`df`, `$wrapper`, `$input`).
- [`frm.is_new()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Returns `true` if document has not yet been saved to DB.
- [`frm.page.add_action_item()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) <span class="badge client">Client</span> — Adds custom item to standard Actions dropdown menu.
- [`frm.page.add_inner_button()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Adds button into inner toolbar group.
- [`frm.page.add_menu_item()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) <span class="badge client">Client</span> — Adds custom menu item to standard Menu dropdown.
- [`frm.page.clear_action_items()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) <span class="badge client">Client</span> — Clears all custom action items from Actions dropdown menu.
- [`frm.page.clear_inner_actions()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Clears secondary inner action buttons.
- [`frm.page.clear_user_actions()`](/11-client-api/#3-hiding-clearing-action-menus-frm-page) <span class="badge client">Client</span> — Clears custom user action buttons.
- [`frm.page.hide_actions_menu()`](/11-client-api/#3-hiding-clearing-action-menus-frm-page) <span class="badge client">Client</span> — Hides standard Actions dropdown menu.
- [`frm.page.hide_menu()`](/11-client-api/#3-hiding-clearing-action-menus-frm-page) <span class="badge client">Client</span> — Hides standard Menu dropdown button.
- [`frm.page.remove_menu_item()`](/11-client-api/#4-hiding-specific-menu-items-eg-delete-duplicate-print) <span class="badge client">Client</span> — Removes specific option from Menu dropdown.
- [`frm.page.set_indicator()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Sets header indicator badge color.
- [`frm.page.set_primary_action()`](/11-client-api/#7-form-header-toolbar-controls-frmpage) <span class="badge client">Client</span> — Overrides primary action button in page header.
- [`frm.page.set_title()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Sets form header title dynamically.
- [`frm.refresh_field()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Forces DOM re-render of docfield element.
- [`frm.refresh_fields()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) <span class="badge client">Client</span> — Forces DOM re-render for multiple docfields at once.
- [`frm.reload_doc()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Reloads document data from server and re-renders form.
- [`frm.save()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Saves current form (`'Save'`, `'Submit'`, `'Cancel'`).
- [`frm.save_or_update()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) <span class="badge client">Client</span> — Intelligently saves draft or updates existing document on client.
- [`frm.scroll_to_field()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Smooth-scrolls form container to target field.
- [`frm.set_df_property()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Dynamically sets docfield property (`reqd`, `read_only`, `hidden`).
- [`frm.set_intro()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Displays colored header banner on top of form view.
- [`frm.set_query()`](/11-client-api/#5-dynamic-field-filters-frm-set-query) <span class="badge client">Client</span> — Sets custom REST filter on Link field.
- [`frm.set_read_only()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) <span class="badge client">Client</span> — Sets all fields on form to read-only state.
- [`frm.set_value()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Sets docfield value on client form.
- [`frm.toggle_display()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Shorthand to toggle field visibility.
- [`frm.toggle_enable()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Shorthand to toggle field read-only state.
- [`frm.toggle_reqd()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) <span class="badge client">Client</span> — Shorthand to toggle mandatory field requirement.
- [`frm.trigger()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) <span class="badge client">Client</span> — Programmatically triggers form or field event handler.

---

## G

- [`get_datetime()`](/19-utils/#1-date-time-utilities) <span class="badge server">Server</span> — Parses datetime string into Python `datetime.datetime` object.
- [`getdate()`](/19-utils/#1-date-time-utilities) <span class="badge server">Server</span> — Parses string into Python `datetime.date` object.
- [`global_date_format`](/17-web-jinja-print-reports/#built-in-jinja-filters-matrix) <span class="badge server">Server</span> — Jinja template filter formatting ISO date to global format.

---

## H

- [`has_permission`](/08-hooks/#4-permission-hooks) <span class="badge server">Server</span> — Registers custom document permission hook in `hooks.py`.
- [`hdel()`](/16-cache-realtime-email-files/#1-redis-caching-api-frappe-cache) <span class="badge server">Server</span> — Deletes key from Redis hash map.
- [`hget()`](/16-cache-realtime-email-files/#1-redis-caching-api-frappe-cache) <span class="badge server">Server</span> — Retrieves key value from Redis hash map.
- [`hset()`](/16-cache-realtime-email-files/#1-redis-caching-api-frappe-cache) <span class="badge server">Server</span> — Stores key value in Redis hash map.

---

## L

- [`load_from_db()`](/05-doctypes/#virtual-doctypes-is_virtual-1) <span class="badge server">Server</span> — Controller override method for Virtual DocType record retrieval.

---

## M

- [`money_in_words`](/17-web-jinja-print-reports/#built-in-jinja-filters-matrix) <span class="badge both">Both</span> — Jinja filter, server utility &amp; client formatter converting numeric amount to words.

---

## O

- [`on_cancel()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Controller hook executed right after cancellation.
- [`on_change()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Controller hook executed whenever workflow status changes.
- [`on_rollback()`](/08-hooks/#1-document-event-hooks-doc-events) <span class="badge server">Server</span> — Hook executed if database transaction rolls back (`hooks.py`).
- [`on_submit()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Controller hook executed right after submission.
- [`on_trash()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Controller hook executed right before database row deletion.
- [`on_update()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Controller hook executed right after SQL save commit.
- [`on_update_after_submit()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Controller hook executed after editing submitted document.
- [`override_doctype_class`](/08-hooks/#3-overriding-controllers-methods) <span class="badge server">Server</span> — Overrides core controller Python class in `hooks.py`.
- [`override_whitelisted_methods`](/08-hooks/#3-overriding-controllers-methods) <span class="badge server">Server</span> — Overrides core whitelisted API method in `hooks.py`.

---

## P

- [`permission_query_conditions`](/08-hooks/#4-permission-hooks) <span class="badge server">Server</span> — Injects dynamic SQL permission conditions (`hooks.py`).
- [`portal_menu_items`](/08-hooks/#7-website-route-rules-portal-customizations) <span class="badge server">Server</span> — Registers custom client portal menu links (`hooks.py`).

---

## R

- [`random_string()`](/19-utils/#3-formatting-text-manipulation) <span class="badge server">Server</span> — Generates secure random string.

---

## S

- [`scheduler_events`](/08-hooks/#2-scheduler-hooks-scheduler-events) <span class="badge server">Server</span> — Defines periodic background cron tasks in `hooks.py`.
- [`scrub()`](/19-utils/#3-formatting-text-manipulation) <span class="badge server">Server</span> — Scrubs string into valid Python variable/field identifier.
- [`slug()`](/19-utils/#3-formatting-text-manipulation) <span class="badge server">Server</span> — Slugifies text string for URL routing.

---

## T

- [`time_diff_in_seconds()`](/19-utils/#1-date-time-utilities) <span class="badge server">Server</span> — Calculates time difference in seconds.
- [`today()`](/19-utils/#1-date-time-utilities) <span class="badge both">Both</span> — Returns current date string (`YYYY-MM-DD`) in Python or JS.

---

## V

- [`validate()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) <span class="badge server">Server</span> — Primary controller validation hook.
- [`validate_email_address()`](/19-utils/#4-validation-utilities) <span class="badge server">Server</span> — Validates email string format.
- [`validate_url()`](/19-utils/#4-validation-utilities) <span class="badge server">Server</span> — Validates URL string format.
- [`Virtual DocType`](/05-doctypes/#virtual-doctypes-is_virtual-1) <span class="badge server">Server</span> — External data source backed DocType (`is_virtual=1`).

---

## W

- [`web_include_css`](/08-hooks/#5-client-desk-assets-script-inclusions) <span class="badge server">Server</span> — Includes global portal CSS bundle (`hooks.py`).
- [`web_include_js`](/08-hooks/#5-client-desk-assets-script-inclusions) <span class="badge server">Server</span> — Includes global portal JS bundle (`hooks.py`).
- [`website_redirects`](/08-hooks/#7-website-route-rules-portal-customizations) <span class="badge server">Server</span> — Registers website URL redirect rules (`hooks.py`).
- [`website_route_rules`](/08-hooks/#7-website-route-rules-portal-customizations) <span class="badge server">Server</span> — Rewrites web routes cleanly in `hooks.py`.
- [`@frappe.whitelist()`](/09-server-api/#4-whitelisting-api-access-frappe-whitelist) <span class="badge server">Server</span> — Exposes Python function as HTTP REST/RPC endpoint.
