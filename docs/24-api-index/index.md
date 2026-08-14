---
title: Searchable API Index for Frappe v15
description: Alphabetical index of all public Python server APIs, database methods, document functions, JS form APIs, session utilities, and button handlers in Frappe Framework v15.
version: v15
category: Quality, Operations & Best Practices
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Searchable API Index

Alphabetical reference index of all public functions, methods, decorators, and CLI utilities in **Frappe Framework v15**.

---

## A

- [`add_days()`](/19-utils/#1-date-time-utilities) — Add N days to date string.
- [`add_months()`](/19-utils/#1-date-time-utilities) — Add N months to date string.
- [`app_include_js`](/08-hooks/#5-client-desk-assets-script-inclusions) — Include global JS asset in Desk.
- [`autoname()`](/05-doctypes/#option-5-programmatic-naming-autoname-controller-method) — Custom document primary key generator controller method.

---

## B

- [`bench build`](/03-bench-cli/#4-development-process-commands) — Build static JS/CSS assets using Esbuild.
- [`bench console`](/03-bench-cli/#5-console-execution-commands) — Launch IPython REPL pre-loaded with site context.
- [`bench execute`](/03-bench-cli/#5-console-execution-commands) — Run Python dotted path function from terminal.
- [`bench init`](/03-bench-cli/#bench-init) — Initialize a new Bench environment.
- [`bench migrate`](/03-bench-cli/#bench-migrate) — Run database migrations, sync DocTypes, and execute patches.
- [`bench new-app`](/03-bench-cli/#3-app-lifecycle-commands) — Generate boilerplate for new Frappe app.
- [`bench new-site`](/03-bench-cli/#bench-new-site) — Create a new site and database.
- [`bench start`](/03-bench-cli/#4-development-process-commands) — Start all development background processes.
- [`before_insert()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook before initial DB insert.
- [`before_save()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook before DB insert/update.
- [`before_submit()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook before submission.

---

## C

- [`cint()`](/19-utils/#2-type-conversion-safe-casting) — Safe integer type conversion.
- [`cstr()`](/19-utils/#2-type-conversion-safe-casting) — Safe string type conversion.
- [`doc_events`](/08-hooks/#1-document-event-hooks-doc-events) — Register document lifecycle event hooks in `hooks.py`.
- [`doc.append()`](/06-documents/#key-inspection-helper-methods) — Append new child row to table field.
- [`doc.as_dict()`](/06-documents/#key-inspection-helper-methods) — Convert document and child tables to dict.
- [`doc.cancel()`](/06-documents/#doc-submit-doc-cancel) — Cancel submitted document (`docstatus: 2`).
- [`doc.db_set()`](/06-documents/#doc-db-set) — Direct atomic field database update.
- [`doc.insert()`](/06-documents/#doc-insert) — Insert new document into database.
- [`doc.is_dirty()`](/06-documents/#key-inspection-helper-methods) — Check if document has unsaved edits.
- [`doc.is_new()`](/06-documents/#key-inspection-helper-methods) — Check if document is not yet saved to DB.
- [`doc.save()`](/06-documents/#doc-save) — Save modifications on existing document.
- [`doc.submit()`](/06-documents/#doc-submit-doc-cancel) — Submit draft document (`docstatus: 1`).

---

## F

- [`flt()`](/19-utils/#2-type-conversion-safe-casting) — Safe float type conversion with precision rounding.
- [`fmt_money()`](/19-utils/#3-formatting-text-manipulation) — Format monetary numeric value into currency string.
- [`frappe.call()`](/11-client-api/#6-asynchronous-server-rpc-frappe-call) — Client-side AJAX RPC call to server method.
- [`frappe.confirm()`](/11-client-api/#7-ui-dialogs-user-prompting-apis) — Display client confirmation modal dialog.
- [`frappe.db.count()`](/10-database/#frappe-db-exists-frappe-db-count) — Count matching database records.
- [`frappe.db.exists()`](/10-database/#frappe-db-exists-frappe-db-count) — Check database record existence.
- [`frappe.db.get_all()`](/10-database/#1-frappe-db-api-reference) — Fast database record list query.
- [`frappe.db.get_value()`](/10-database/#frappe-db-get-value) — Query single/multiple field values from database.
- [`frappe.db.set_value()`](/10-database/#frappe-db-set-value) — Execute direct SQL update on database fields.
- [`frappe.db.sql()`](/10-database/#frappe-db-sql-raw-sql-execution) — Execute raw SQL query with parameter binding.
- [`frappe.defaults.get_user_default()`](/14-authentication-permissions/#client-side-user-defaults-permissions-javascript) — Get user default value.
- [`frappe.enqueue()`](/15-background-jobs-scheduler/#1-asynchronous-execution-frappe-enqueue) — Enqueue background RQ worker job.
- [`frappe.get_all()`](/09-server-api/#frappe-get-all-frappe-get-list) — Fetch records list (bypasses permission checks).
- [`frappe.get_cached_doc()`](/06-documents/#frappe-get-cached-doc) — Retrieve cached document from Redis.
- [`frappe.get_doc()`](/06-documents/#frappe-get-doc) — Instantiate document ORM object from database or dict.
- [`frappe.get_list()`](/09-server-api/#frappe-get-all-frappe-get-list) — Fetch records list (enforces user permissions).
- [`frappe.get_roles()`](/14-authentication-permissions/#2-user-roles-api-get_roles-has_role) — Get list of roles assigned to user.
- [`frappe.has_permission()`](/14-authentication-permissions/#3-session-user-permissions-get_user_permissions) — Check document permission for user.
- [`frappe.has_role()`](/14-authentication-permissions/#2-user-roles-api-get_roles-has_role) — Check if user possesses role.
- [`frappe.log_error()`](/09-server-api/#frappe-log-error) — Log exception traceback to system Error Log.
- [`frappe.msgprint()`](/09-server-api/#frappe-msgprint) — Send popup/alert notification to user.
- [`frappe.new_doc()`](/06-documents/#frappe-new-doc) — Initialize new document with default values.
- [`frappe.permissions.get_user_permissions()`](/14-authentication-permissions/#3-session-user-permissions-get_user_permissions) — Fetch User Permission restrictions.
- [`frappe.publish_realtime()`](/16-cache-realtime-email-files/#2-realtime-websocket-events-frappe-publish-realtime) — Publish WebSocket event to clients.
- [`frappe.qb`](/10-database/#2-query-builder-frappe-qb) — PyPika SQL Query Builder interface.
- [`frappe.sendmail()`](/16-cache-realtime-email-files/#3-transactional-email-api-frappe-sendmail) — Queue email delivery in background.
- [`frappe.session.user`](/14-authentication-permissions/#1-active-session-context-frappe-session) — Active authenticated user email.
- [`frappe.throw()`](/09-server-api/#frappe-throw) — Raise ValidationError and display error toast.
- [`frappe.ui.Dialog`](/11-client-api/#custom-modal-dialogs-frappe-ui-dialog) — Instantiate custom client modal dialog.
- [`frappe.ui.form.on()`](/11-client-api/#1-form-event-handlers-frappe-ui-form-on) — Bind client JS handlers to Form views.
- [`frappe.user.has_role()`](/14-authentication-permissions/#client-side-javascript-role-inspection-frappe-user-has_role) — Check role on client browser.
- [`frappe.user_roles`](/14-authentication-permissions/#client-side-javascript-role-inspection-frappe-user-has_role) — Client user roles array.
- [`@frappe.whitelist()`](/09-server-api/#4-whitelisting-api-access-frappe-whitelist) — Expose Python function as HTTP REST/RPC endpoint.
- [`frm.add_child()`](/12-child-tables/#adding-clearing-editing-child-rows-in-desk-form) — Append new child row to table field on client.
- [`frm.add_custom_button()`](/11-client-api/#2-custom-buttons-api-frm-add_custom_button) — Add custom button or dropdown group button.
- [`frm.change_custom_button_type()`](/11-client-api/#2-custom-buttons-api-frm-add_custom_button) — Style custom button (`primary`, `danger`, `warning`).
- [`frm.clear_custom_buttons()`](/11-client-api/#clearing-custom-buttons) — Remove all custom buttons from form bar.
- [`frm.clear_table()`](/12-child-tables/#adding-clearing-editing-child-rows-in-desk-form) — Clear all child rows from table field.
- [`frm.disable_form()`](/11-client-api/#2-disabling-the-entire-form-input-disable_form) — Make all form fields read-only and hide save button.
- [`frm.disable_save()`](/11-client-api/#1-disabling-hiding-the-standard-save-button-disable_save) — Disable and hide standard Save button.
- [`frm.enable_save()`](/11-client-api/#1-disabling-hiding-the-standard-save-button-disable_save) — Re-enable standard Save button.
- [`frm.page.clear_user_actions()`](/11-client-api/#3-hiding-clearing-action-menus-frm-page) — Clear custom user action buttons.
- [`frm.page.hide_actions_menu()`](/11-client-api/#3-hiding-clearing-action-menus-frm-page) — Hide standard Actions dropdown menu.
- [`frm.page.hide_menu()`](/11-client-api/#3-hiding-clearing-action-menus-frm-page) — Hide standard Menu dropdown button.
- [`frm.page.remove_menu_item()`](/11-client-api/#4-hiding-specific-menu-items-eg-delete-duplicate-print) — Remove specific option from Menu dropdown.
- [`frm.refresh_field()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Force re-render of docfield DOM element.
- [`frm.set_df_property()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Dynamically set docfield property (`reqd`, `read_only`, `hidden`).
- [`frm.set_query()`](/11-client-api/#5-dynamic-field-filters-frm-set-query) — Set custom REST filter on Link field.
- [`frm.set_value()`](/11-client-api/#4-form-instance-frm-core-methods-matrix) — Set docfield value on client form.

---

## H

- [`has_permission`](/08-hooks/#4-permission-hooks) — Register custom document permission hook in `hooks.py`.

---

## O

- [`on_submit()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook executed after submission.
- [`on_update()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Controller hook executed after DB save.
- [`override_doctype_class`](/08-hooks/#3-overriding-controllers-methods) — Override core controller Python class in `hooks.py`.

---

## P

- [`permission_query_conditions`](/08-hooks/#4-permission-hooks) — Inject dynamic SQL permission conditions.

---

## S

- [`scheduler_events`](/08-hooks/#2-scheduler-hooks-scheduler-events) — Define periodic background tasks in `hooks.py`.
- [`scrub()`](/19-utils/#3-formatting-text-manipulation) — Scrub string into valid python identifier.

---

## V

- [`validate()`](/07-controllers/#2-complete-lifecycle-events-reference-matrix) — Primary controller validation hook.
