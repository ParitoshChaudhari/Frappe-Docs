---
title: Searchable API Index for Frappe v15
description: Complete, exhaustive alphabetical reference index of all public Python server APIs, database methods, document functions, JS form APIs, session utilities, Jinja filters, and CLI commands in Frappe Framework v15.
version: v15
category: Quality, Operations & Best Practices
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Searchable API Index

Exhaustive alphabetical reference index of all public functions, methods, hooks, decorators, CLI commands, and utility APIs in **Frappe Framework v15** with direct links to their detailed documentation and code examples.

---

## A

- [`_()`](/19-utils/#5-internationalization-translation-frappe-_) — Multilingual translation function wrapper.
- [`add_days()`](/19-utils/#1-date-time-utilities) — Add or subtract N days from date string (Server API).
- [`add_months()`](/19-utils/#1-date-time-utilities) — Add or subtract N months from date string (Server API).
- [`add_to_date()`](/19-utils/#1-date-time-utilities) — Add date/time intervals to target date.
- [`add_years()`](/19-utils/#1-date-time-utilities) — Add or subtract N years from date string.
- [`after_delete()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller lifecycle hook executed after database row deletion.
- [`after_insert()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller lifecycle hook executed immediately after initial DB row insertion.
- [`after_job`](/08-hooks/#9-request-job-middleware-hooks) — Background RQ job completion middleware hook in `hooks.py`.
- [`after_request`](/08-hooks/#9-request-job-middleware-hooks) — HTTP request completion middleware hook in `hooks.py`.
- [`app_include_css`](/08-hooks/#5-client-desk-assets-script-inclusions) — Include global custom CSS bundle in Desk interface.
- [`app_include_js`](/08-hooks/#5-client-desk-assets-script-inclusions) — Include global custom JS bundle in Desk interface.
- [`autoname()`](/05-doctypes/#option-5-programmatic-naming-autoname-controller-method) — Custom document primary key generator controller method.

---

## B

- [`before_change()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook executed prior to document state modification.
- [`before_insert()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook executed right before initial database `INSERT`.
- [`before_job`](/08-hooks/#9-request-job-middleware-hooks) — Background RQ job pre-execution middleware hook.
- [`before_naming()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook executed immediately before `autoname()` resolution.
- [`before_request`](/08-hooks/#9-request-job-middleware-hooks) — HTTP request pre-processing middleware hook.
- [`before_save()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook executed right before SQL `INSERT`/`UPDATE` write.
- [`before_submit()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook executed prior to document submission checks.
- [`before_trash()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook executed prior to starting document deletion.
- [`bench backup`](/03-bench-cli/#bench-backup-bench-restore) — Backup site database, public files, and private attachments.
- [`bench build`](/03-bench-cli/#4-development-process-commands) — Compile static frontend assets (JS/CSS) using Esbuild.
- [`bench clear-cache`](/03-bench-cli/#bench-clear-cache-bench-clear-website-cache) — Flush Redis site cache, session keys, and Jinja web pages.
- [`bench console`](/03-bench-cli/#bench-console) — Launch interactive IPython REPL pre-loaded with Frappe site context.
- [`bench doctor`](/03-bench-cli/#4-monitoring-background-jobs-workers) — Monitor status of Redis queues, workers, and background jobs.
- [`bench drop-site`](/03-bench-cli/#bench-drop-site) — Delete a site directory and drop its associated MariaDB/PostgreSQL database.
- [`bench execute`](/03-bench-cli/#bench-execute) — Run Python dotted path function directly from CLI terminal.
- [`bench export-fixtures`](/03-bench-cli/#bench-export-fixtures) — Export JSON fixtures configured in `hooks.py` into application directory.
- [`bench get-app`](/03-bench-cli/#bench-get-app) — Clone Frappe application repository into `apps/` and install in virtualenv.
- [`bench get-config`](/03-bench-cli/#bench-set-config-bench-get-config) — Inspect site configuration keys.
- [`bench get-untranslated`](/19-utils/#translation-csv-files-cli-commands) — Extract untranslated strings into language CSV file.
- [`bench init`](/03-bench-cli/#1-bench-initialization-environment-commands) — Initialize new Bench environment directory with Python virtualenv.
- [`bench install-app`](/03-bench-cli/#bench-install-app-bench-uninstall-app) — Install Frappe application onto target site database.
- [`bench migrate`](/03-bench-cli/#bench-migrate) — Execute database schema migrations, patches, and sync DocType schemas.
- [`bench new-app`](/03-bench-cli/#3-app-lifecycle-commands) — Generate boilerplate directory structure for a new Frappe app.
- [`bench new-site`](/03-bench-cli/#2-site-management-commands) — Create new site with fresh MariaDB/PostgreSQL database.
- [`bench reinstall`](/03-bench-cli/#bench-reinstall) — Wipe existing site database and reinstall clean initial schema.
- [`bench restore`](/03-bench-cli/#bench-backup-bench-restore) — Restore site database and file archives from SQL dump.
- [`bench run-tests`](/03-bench-cli/#bench-run-tests) — Execute unittest suite for installed applications.
- [`bench set-config`](/03-bench-cli/#bench-set-config-bench-get-config) — Modify `site_config.json` configuration values programmatically.
- [`bench start`](/03-bench-cli/#4-development-process-commands) — Start all development background processes defined in Procfile.
- [`bench update-translations`](/19-utils/#translation-csv-files-cli-commands) — Sync and update application translation CSV files.
- [`bench use`](/03-bench-cli/#bench-use) — Set default active site for subsequent bench commands.
- [`bench worker`](/15-background-jobs-scheduler/#4-monitoring-background-jobs-workers) — Start background RQ worker process daemon.
- [`boot_session`](/08-hooks/#6-jinja-templating-session-extensions) — Extend `bootinfo` dictionary sent to Desk client upon user login.

---

## C

- [`cint()`](/19-utils/#2-type-conversion-safe-casting) — Safe integer type conversion returning default on failure.
- [`cstr()`](/19-utils/#2-type-conversion-safe-casting) — Safe string type conversion handling `None` safely.
- [`date_diff()`](/19-utils/#1-date-time-utilities) — Calculate integer day difference between two dates (`d1 - d2`).
- [`db_insert()`](/05-doctypes/#virtual-doctypes-is_virtual-1) — Controller override method for Virtual DocType database insertion.
- [`db_update()`](/05-doctypes/#virtual-doctypes-is_virtual-1) — Controller override method for Virtual DocType update.
- [`delete()`](/05-doctypes/#virtual-doctypes-is_virtual-1) — Controller override method for Virtual DocType record deletion.
- [`doc.add_comment()`](/06-documents/#key-inspection-helper-methods) — Appends activity timeline comment to document.
- [`doc.add_tag()`](/06-documents/#key-inspection-helper-methods) — Attaches tag string to document.
- [`doc.append()`](/06-documents/#key-inspection-helper-methods) — Appends new row to child table field.
- [`doc.as_dict()`](/06-documents/#key-inspection-helper-methods) — Serializes document and child tables to plain Python dictionary.
- [`doc.cancel()`](/06-documents/#doc-submit-doc-cancel) — Cancels submitted document (`docstatus: 2`).
- [`doc.db_set()`](/06-documents/#doc-db-set) — Updates field directly in database bypassing validation hooks.
- [`doc.flags.ignore_if_duplicate`](/06-documents/#3-document-flags-docflags) — Prevents throwing duplicate name exception during insert.
- [`doc.flags.ignore_links`](/06-documents/#3-document-flags-docflags) — Skips validation of linked document existence.
- [`doc.flags.ignore_mandatory`](/06-documents/#3-document-flags-docflags) — Suppresses errors for missing mandatory fields.
- [`doc.flags.ignore_permissions`](/06-documents/#3-document-flags-docflags) — Bypasses user permission checks during insert/save/submit.
- [`doc.flags.ignore_validate`](/06-documents/#3-document-flags-docflags) — Bypasses execution of controller `validate()` hooks.
- [`doc.get_db_value()`](/06-documents/#key-inspection-helper-methods) — Reads field value directly from database disk bypassing cache.
- [`doc.get_doc_before_save()`](/06-documents/#key-inspection-helper-methods) — Returns immutable snapshot of document prior to save.
- [`doc.get_formatted()`](/06-documents/#key-inspection-helper-methods) — Returns human-formatted string of field value.
- [`doc.get_tags()`](/06-documents/#key-inspection-helper-methods) — Returns comma-separated string of assigned tags.
- [`doc.has_value_changed()`](/06-documents/#key-inspection-helper-methods) — Checks if field value changed compared to DB value.
- [`doc.insert()`](/06-documents/#doc-insert) — Inserts new document record into MariaDB/PostgreSQL.
- [`doc.is_dirty()`](/06-documents/#key-inspection-helper-methods) — Returns `True` if document fields have unsaved memory edits.
- [`doc.is_new()`](/06-documents/#key-inspection-helper-methods) — Returns `True` if document is not yet saved to database.
- [`doc.queue_action()`](/06-documents/#key-inspection-helper-methods) — Queues document action for background worker execution.
- [`doc.remove_tag()`](/06-documents/#key-inspection-helper-methods) — Removes tag string from document.
- [`doc.run_method()`](/06-documents/#key-inspection-helper-methods) — Programmatically executes method on document instance.
- [`doc.save()`](/06-documents/#doc-save) — Saves changes on existing document to database.
- [`doc.submit()`](/06-documents/#doc-submit-doc-cancel) — Submits draft document (`docstatus: 1`).
- [`doc_events`](/08-hooks/#1-document-event-hooks-doc-events) — Registers document lifecycle event hooks in `hooks.py`.
- [`doctype_calendar_js`](/08-hooks/#5-client-desk-assets-script-inclusions) — Injects custom JS bundle into DocType Calendar view.
- [`doctype_js`](/08-hooks/#5-client-desk-assets-script-inclusions) — Injects custom JS bundle into DocType Form view.
- [`doctype_list_js`](/08-hooks/#5-client-desk-assets-script-inclusions) — Injects custom JS bundle into DocType List view.
- [`doctype_tree_js`](/08-hooks/#5-client-desk-assets-script-inclusions) — Injects custom JS bundle into DocType Tree view.

---

## F

- [`flt()`](/19-utils/#2-type-conversion-safe-casting) — Safe float type conversion with optional precision rounding.
- [`fmt_money()`](/19-utils/#3-formatting-text-manipulation) — Formats numeric value into monetary currency string.
- [`format_currency`](/17-web-jinja-print-reports/#built-in-jinja-filters-matrix) — Jinja template filter for currency formatting.
- [`format_date()`](/19-utils/#1-date-time-utilities) — Formats ISO date string to user system format.
- [`format_datetime()`](/19-utils/#1-date-time-utilities) — Formats ISO datetime string.
- [`format_time()`](/19-utils/#1-date-time-utilities) — Formats time string.
- [`frappe._()`](/19-utils/#5-internationalization-translation-frappe-_) — Multilingual translation function wrapper.
- [`frappe.breadcrumbs.add()`](/11-client-api/#3-client-navigation-route-inspection-breadcrumbs) — Inject breadcrumb link into Desk header toolbar.
- [`frappe.cache()`](/16-cache-realtime-email-files/#1-redis-caching-api-frappe-cache) — Access site Redis Cache connection wrapper instance.
- [`frappe.call()`](/11-client-api/#7-asynchronous-server-rpc-frappe-call) — Executes client-side AJAX RPC call to server method.
- [`frappe.confirm()`](/11-client-api/#8-ui-dialogs-user-prompting-apis) — Displays client confirmation modal dialog.
- [`frappe.datetime.add_days()`](/11-client-api/#date-time-helpers-frappe-datetime) — Client JS helper adding days to date.
- [`frappe.datetime.add_months()`](/11-client-api/#date-time-helpers-frappe-datetime) — Client JS helper adding months to date.
- [`frappe.datetime.get_diff()`](/11-client-api/#date-time-helpers-frappe-datetime) — Client JS helper calculating day difference between dates.
- [`frappe.datetime.get_today()`](/11-client-api/#date-time-helpers-frappe-datetime) — Client JS helper returning today's date string.
- [`frappe.datetime.now_datetime()`](/11-client-api/#date-time-helpers-frappe-datetime) — Client JS helper returning current datetime string.
- [`frappe.db.commit()`](/10-database/#database-transactions-commit-rollback-savepoint) — Explicitly commits current database transaction.
- [`frappe.db.count()`](/10-database/#frappe-db-exists-frappe-db-count) — Counts matching database records without instantiating objects.
- [`frappe.db.delete()`](/10-database/#frappe-db-delete) — Performs direct SQL row deletion based on filter conditions.
- [`frappe.db.delete_doc()`](/11-client-api/#4-client-side-database-apis-frappe-db-in-js) — Client-side Promise API deleting document record.
- [`frappe.db.exists()`](/10-database/#frappe-db-exists-frappe-db-count) — Checks record existence in database (returns primary key name or `None`).
- [`frappe.db.get_all()`](/09-server-api/#frappe-get-all-frappe-get-list) — Fetches record list bypassing user permissions.
- [`frappe.db.get_doc()`](/11-client-api/#4-client-side-database-apis-frappe-db-in-js) — Client-side Promise API fetching document instance object.
- [`frappe.db.get_list()`](/09-server-api/#frappe-get-all-frappe-get-list) — Fetches record list enforcing user permissions.
- [`frappe.db.get_single_value()`](/10-database/#frappe-db-get_single_value) — Retrieves field value from Single DocType.
- [`frappe.db.get_value()`](/10-database/#1-frappe-db-api-reference) — Queries single or multiple field values efficiently.
- [`frappe.db.has_column()`](/10-database/#schema-inspection-maintenance-table_exists-has_column-touch) — Verifies table column existence in database.
- [`frappe.db.insert()`](/11-client-api/#client-side-database-apis-frappe-db-in-javascript) — Client-side Promise document insertion API.
- [`frappe.db.rollback()`](/10-database/#database-transactions-commit-rollback-savepoint) — Reverts pending database transaction.
- [`frappe.db.set_value()`](/10-database/#1-frappe-db-api-reference) — Direct SQL field update bypassing validation hooks.
- [`frappe.db.sql()`](/10-database/#frappe-db-sql-raw-sql-execution) — Executes raw SQL queries with mandatory parameter binding.
- [`frappe.db.table_exists()`](/10-database/#schema-inspection-maintenance-table_exists-has_column-touch) — Verifies database table existence.
- [`frappe.db.touch()`](/10-database/#schema-inspection-maintenance-table_exists-has_column-touch) — Updates document `modified` timestamp without field edits.
- [`frappe.defaults.get_user_default()`](/14-authentication-permissions/#client-side-user-defaults-permissions-javascript) — Retrieves client user default setting.
- [`frappe.defaults.get_user_permissions()`](/14-authentication-permissions/#client-side-user-defaults-permissions-javascript) — Retrieves user permission restrictions array.
- [`frappe.enqueue()`](/15-background-jobs-scheduler/#1-asynchronous-execution-frappe-enqueue) — Enqueues background RQ worker job with queue/timeout options.
- [`frappe.format()`](/11-client-api/#5-client-schema-field-formatting-frappe-meta-frappe-format) — Universal field value formatter helper based on field metadata.
- [`frappe.get_all()`](/09-server-api/#frappe-get-all-frappe-get-list) — Fetches records list bypassing user permissions.
- [`frappe.get_cached_doc()`](/06-documents/#frappe-get-cached-doc) — Retrieves document from Redis cache.
- [`frappe.get_cached_value()`](/16-cache-realtime-email-files/#high-performance-value-caching-frappe-get_cached_value) — Retrieves field value from Redis cache if present.
- [`frappe.get_doc()`](/06-documents/#frappe-get-doc) — Instantiates Document ORM object from database or dictionary.
- [`frappe.get_list()`](/09-server-api/#frappe-get-all-frappe-get-list) — Fetches records list enforcing active user permissions.
- [`frappe.get_meta()`](/10-database/#2-doctype-metadata-request-context-apis) — Returns Meta structure object for specified DocType.
- [`frappe.get_roles()`](/14-authentication-permissions/#2-user-roles-api-get_roles-has_role) — Fetches list of roles assigned to active user.
- [`frappe.get_route()`](/11-client-api/#3-client-navigation-route-inspection-breadcrumbs) — Returns active browser route array.
- [`frappe.get_route_str()`](/11-client-api/#3-client-navigation-route-inspection-breadcrumbs) — Returns active browser route string.
- [`frappe.has_permission()`](/14-authentication-permissions/#fetching-evaluating-user-permissions-python) — Evaluates document permission for user programmatically.
- [`frappe.has_role()`](/14-authentication-permissions/#2-user-roles-api-get_roles-has_role) — Checks if user possesses specific role.
- [`frappe.hide_progress()`](/11-client-api/#2-user-notifications-warnings-progress-bars-frappe) — Client JS helper hiding header progress bar.
- [`frappe.local`](/10-database/#frappe-local-request-context) — Thread-local HTTP request context object (`local.site`, `local.user`, `local.form_dict`).
- [`frappe.log_error()`](/09-server-api/#frappe-log-error) — Logs exception traceback to system Error Log.
- [`frappe.meta.get_docfield()`](/11-client-api/#5-client-schema-field-formatting-frappe-meta-frappe-format) — Fetches DocField definition schema object on client.
- [`frappe.meta.has_field()`](/11-client-api/#5-client-schema-field-formatting-frappe-meta-frappe-format) — Checks if field exists in DocType schema on client.
- [`frappe.model.add_child()`](/11-client-api/#pattern-a-unsaved-form-mapping-navigation-frappe-model-make_new_doc_and_get_name) — Appends new row to child table in client memory.
- [`frappe.model.clear_doc()`](/11-client-api/#6-client-model-memory-helpers-frappe-model) — Clears document from local client memory cache.
- [`frappe.model.delete_doc()`](/06-documents/#frappe-model-delete_doc) — Programmatically deletes document and linked child records.
- [`frappe.model.get_new_doc()`](/11-client-api/#6-client-model-memory-helpers-frappe-model) — Instantiates new unsaved document object in client memory.
- [`frappe.model.make_new_doc_and_get_name()`](/11-client-api/#pattern-a-unsaved-form-mapping-navigation-frappe-model-make_new_doc_and_get_name) — Instantiates unsaved new document in client memory and returns name.
- [`frappe.model.mapper.get_mapped_doc()`](/06-documents/#frappe-model-mapper-get_mapped_doc) — Maps values from source document to target document.
- [`frappe.model.naming.make_autoname()`](/06-documents/#frappe-model-naming-make_autoname) — Generates auto-incremented primary keys based on format string.
- [`frappe.model.rename_doc()`](/06-documents/#frappe-model-rename_doc) — Renames document primary key and updates all foreign key references.
- [`frappe.model.set_value()`](/11-client-api/#6-client-model-memory-helpers-frappe-model) — Sets field value in local client model memory and triggers UI updates.
- [`frappe.model.with_doctype()`](/11-client-api/#6-client-model-memory-helpers-frappe-model) — Loads DocType schema metadata before executing callback.
- [`frappe.msgprint()`](/09-server-api/#frappe-msgprint) — Displays message dialog popup to user.
- [`frappe.new_doc()`](/06-documents/#frappe-new-doc) — Initializes new Document instance with schema defaults.
- [`frappe.permissions.get_user_permissions()`](/14-authentication-permissions/#fetching-evaluating-user-permissions-python) — Fetches User Permission restrictions.
- [`frappe.prompt()`](/11-client-api/#8-ui-dialogs-user-prompting-apis) — Displays interactive input prompt modal.
- [`frappe.publish_progress()`](/16-cache-realtime-email-files/#2-realtime-websocket-events-frappe-publish_realtime-frappe-publish_progress) — Displays header progress bar in Desk interface.
- [`frappe.publish_realtime()`](/16-cache-realtime-email-files/#2-realtime-websocket-events-frappe-publish_realtime-frappe-publish_progress) — Publishes WebSocket event to connected browser clients.
- [`frappe.qb`](/10-database/#3-query-builder-frappe-qb) — PyPika SQL Query Builder interface.
- [`frappe.realtime.off()`](/11-client-api/#10-complete-client-javascript-api-utility-reference-matrix) — Client JS helper removing WebSocket event listener.
- [`frappe.realtime.on()`](/16-cache-realtime-email-files/#client-listener-javascript-desk) — Client JS event listener for WebSocket broadcasts.
- [`frappe.sendmail()`](/16-cache-realtime-email-files/#3-transactional-email-api-frappe-sendmail) — Queues email delivery in background.
- [`frappe.session.user`](/14-authentication-permissions/#1-active-session-context-frappe-session) — Returns active authenticated user email string.
- [`frappe.set_route()`](/11-client-api/#navigation-route-state-frappe-set_route) — Navigates Desk view to specified route array.
- [`frappe.set_route_options()`](/11-client-api/#3-client-navigation-route-inspection-breadcrumbs) — Sets route options object for target view navigation.
- [`frappe.share.add()`](/14-authentication-permissions/#5-document-sharing-api-frappe-share) — Shares specific document instance with user.
- [`frappe.share.get_users()`](/14-authentication-permissions/#5-document-sharing-api-frappe-share) — Gets list of users a document is shared with.
- [`frappe.share.remove()`](/14-authentication-permissions/#5-document-sharing-api-frappe-share) — Removes sharing permission from user.
- [`frappe.show_alert()`](/11-client-api/#toast-alerts-frappe-show_alert) — Displays non-blocking temporary toast notification.
- [`frappe.show_progress()`](/11-client-api/#2-user-notifications-warnings-progress-bars-frappe) — Client JS helper displaying header progress bar.
- [`frappe.throw()`](/09-server-api/#frappe-throw) — Raises ValidationError and displays error alert message.
- [`frappe.ui.Dialog`](/11-client-api/#custom-modal-dialogs-frappe-ui-dialog) — Instantiates custom client modal dialog.
- [`frappe.ui.form.MultiSelectDialog`](/11-client-api/#7-multiselect-dialog-selector-frappe-ui-form-multiselectdialog) — Pop-up modal dialog for multi-selecting document records.
- [`frappe.ui.form.on()`](/11-client-api/#1-form-event-handlers-frappe-ui-form-on) — Binds JS event handlers to form lifecycle triggers.
- [`frappe.user.has_role()`](/14-authentication-permissions/#client-side-javascript-role-inspection-frappe-user-has_role) — Checks role assignment on client browser.
- [`frappe.user_roles`](/14-authentication-permissions/#client-side-javascript-role-inspection-frappe-user-has_role) — Array of roles assigned to active client user.
- [`frappe.utils.now()`](/19-utils/#1-date-time-utilities) — Returns current datetime string.
- [`frappe.utils.today()`](/19-utils/#1-date-time-utilities) — Returns current date string (`YYYY-MM-DD`).
- [`frappe.warn()`](/11-client-api/#2-user-notifications-warnings-progress-bars-frappe) — Displays client confirmation warning dialog with custom action button.
- [`frm.add_child()`](/12-child-tables/#adding-clearing-editing-child-rows-in-desk-form) — Appends new row to child table field on form.
- [`frm.add_custom_button()`](/11-client-api/#2-custom-buttons-api-frm-add_custom_button) — Adds custom button or dropdown group button to toolbar.
- [`frm.change_custom_button_type()`](/11-client-api/#2-custom-buttons-api-frm-add_custom_button) — Styles custom button (`primary`, `danger`, `warning`).
- [`frm.clear_custom_buttons()`](/11-client-api/#clearing-custom-buttons) — Removes all custom buttons from form toolbar.
- [`frm.clear_table()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Wipes all child table rows from form field.
- [`frm.copy_doc()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Duplicates active document into new unsaved draft form.
- [`frm.dirty()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Returns `true` if form contains unsaved memory edits.
- [`frm.disable_form()`](/11-client-api/#2-disabling-the-entire-form-input-disable_form) — Makes all form fields read-only and hides save button.
- [`frm.disable_save()`](/11-client-api/#1-disabling-hiding-the-standard-save-button-disable_save) — Disables and hides standard Save button.
- [`frm.enable_save()`](/11-client-api/#1-disabling-hiding-the-standard-save-button-disable_save) — Re-enables standard Save button.
- [`frm.get_field()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) — Returns DocField control instance (`df`, `$wrapper`, `$input`).
- [`frm.is_new()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Returns `true` if document has not yet been saved to DB.
- [`frm.page.add_action_item()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) — Adds custom item to standard Actions dropdown menu.
- [`frm.page.add_inner_button()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Adds button into inner toolbar group.
- [`frm.page.add_menu_item()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) — Adds custom menu item to standard Menu dropdown.
- [`frm.page.clear_action_items()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) — Clears all custom action items from Actions dropdown menu.
- [`frm.page.clear_inner_actions()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Clears secondary inner action buttons.
- [`frm.page.clear_user_actions()`](/11-client-api/#3-hiding-clearing-action-menus-frm-page) — Clears custom user action buttons.
- [`frm.page.hide_actions_menu()`](/11-client-api/#3-hiding-clearing-action-menus-frm-page) — Hides standard Actions dropdown menu.
- [`frm.page.hide_menu()`](/11-client-api/#3-hiding-clearing-action-menus-frm-page) — Hides standard Menu dropdown button.
- [`frm.page.remove_menu_item()`](/11-client-api/#4-hiding-specific-menu-items-eg-delete-duplicate-print) — Removes specific option from Menu dropdown.
- [`frm.page.set_indicator()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Sets header indicator badge color.
- [`frm.page.set_title()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Sets form header title dynamically.
- [`frm.refresh_field()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Forces DOM re-render of docfield element.
- [`frm.refresh_fields()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) — Forces DOM re-render for multiple docfields at once.
- [`frm.reload_doc()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Reloads document data from server and re-renders form.
- [`frm.save()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Saves current form (`'Save'`, `'Submit'`, `'Cancel'`).
- [`frm.save_or_update()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) — Intelligently saves draft or updates existing document on client.
- [`frm.scroll_to_field()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Smooth-scrolls form container to target field.
- [`frm.set_df_property()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Dynamically sets docfield property (`reqd`, `read_only`, `hidden`).
- [`frm.set_intro()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Displays colored header banner on top of form view.
- [`frm.set_query()`](/11-client-api/#5-dynamic-field-filters-frm-set-query) — Sets custom REST filter on Link field.
- [`frm.set_read_only()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) — Sets all fields on form to read-only state.
- [`frm.set_value()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Sets docfield value on client form.
- [`frm.toggle_display()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Shorthand to toggle field visibility.
- [`frm.toggle_enable()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Shorthand to toggle field read-only state.
- [`frm.toggle_reqd()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Shorthand to toggle mandatory field requirement.
- [`frm.trigger()`](/11-client-api/#1-form-instance-frm-lifecycle-page-utilities) — Programmatically triggers form or field event handler.

---

## G

- [`get_datetime()`](/19-utils/#1-date-time-utilities) — Parses datetime string into Python `datetime.datetime` object.
- [`getdate()`](/19-utils/#1-date-time-utilities) — Parses string into Python `datetime.date` object.
- [`global_date_format`](/17-web-jinja-print-reports/#built-in-jinja-filters-matrix) — Jinja template filter formatting ISO date to global format.

---

## H

- [`has_permission`](/08-hooks/#4-permission-hooks) — Registers custom document permission hook in `hooks.py`.
- [`hdel()`](/16-cache-realtime-email-files/#1-redis-caching-api-frappe-cache) — Deletes key from Redis hash map.
- [`hget()`](/16-cache-realtime-email-files/#1-redis-caching-api-frappe-cache) — Retrieves key value from Redis hash map.
- [`hset()`](/16-cache-realtime-email-files/#1-redis-caching-api-frappe-cache) — Stores key value in Redis hash map.

---

## L

- [`load_from_db()`](/05-doctypes/#virtual-doctypes-is_virtual-1) — Controller override method for Virtual DocType record retrieval.

---

## M

- [`money_in_words`](/17-web-jinja-print-reports/#built-in-jinja-filters-matrix) — Jinja filter & server utility converting numeric amount to words.

---

## O

- [`on_cancel()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook executed right after cancellation.
- [`on_change()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook executed whenever workflow status changes.
- [`on_rollback()`](/08-hooks/#1-document-event-hooks-doc-events) — Hook executed if database transaction rolls back.
- [`on_submit()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook executed right after submission.
- [`on_trash()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook executed right before database row deletion.
- [`on_update()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook executed right after SQL save commit.
- [`on_update_after_submit()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook executed after editing submitted document.
- [`override_doctype_class`](/08-hooks/#3-overriding-controllers-methods) — Overrides core controller Python class in `hooks.py`.
- [`override_whitelisted_methods`](/08-hooks/#3-overriding-controllers-methods) — Overrides core whitelisted API method in `hooks.py`.

---

## P

- [`permission_query_conditions`](/08-hooks/#4-permission-hooks) — Injects dynamic SQL permission conditions.
- [`portal_menu_items`](/08-hooks/#7-website-route-rules-portal-customizations) — Registers custom client portal menu links.

---

## R

- [`random_string()`](/19-utils/#3-formatting-text-manipulation) — Generates secure random string.

---

## S

- [`scheduler_events`](/08-hooks/#2-scheduler-hooks-scheduler-events) — Defines periodic background cron tasks in `hooks.py`.
- [`scrub()`](/19-utils/#3-formatting-text-manipulation) — Scrubs string into valid Python variable/field identifier.
- [`slug()`](/19-utils/#3-formatting-text-manipulation) — Slugifies text string for URL routing.

---

## T

- [`time_diff_in_seconds()`](/19-utils/#1-date-time-utilities) — Calculates time difference in seconds.
- [`today()`](/19-utils/#1-date-time-utilities) — Returns current date string (`YYYY-MM-DD`).

---

## V

- [`validate()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Primary controller validation hook.
- [`validate_email_address()`](/19-utils/#4-validation-utilities) — Validates email string format.
- [`validate_url()`](/19-utils/#4-validation-utilities) — Validates URL string format.
- [`Virtual DocType`](/05-doctypes/#virtual-doctypes-is_virtual-1) — External data source backed DocType (`is_virtual=1`).

---

## W

- [`web_include_css`](/08-hooks/#5-client-desk-assets-script-inclusions) — Includes global portal CSS bundle.
- [`web_include_js`](/08-hooks/#5-client-desk-assets-script-inclusions) — Includes global portal JS bundle.
- [`website_redirects`](/08-hooks/#7-website-route-rules-portal-customizations) — Registers website URL redirect rules.
- [`website_route_rules`](/08-hooks/#7-website-route-rules-portal-customizations) — Rewrites web routes cleanly in `hooks.py`.
- [`@frappe.whitelist()`](/09-server-api/#4-whitelisting-api-access-frappe-whitelist) — Exposes Python function as HTTP REST/RPC endpoint.
