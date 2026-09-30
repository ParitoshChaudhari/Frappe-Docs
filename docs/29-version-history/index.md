---
title: Documentation Version History & Changelog
description: Comprehensive version history documenting v1.0 initial baseline, v1.1 GitHub & ORM masterclass, v1.2 exhaustive documentation expansion, and v1.3 Client JS API expansion & Open Source Ecosystem section.
version: v15
category: Overview & Basics
status: Stable
---

# 📜 Documentation Version History & Changelog

This document tracks the evolution, feature additions, API expansions, and revision history of the **Frappe Framework v15 Developer Documentation & Reference** website.

---

## 🚀 Version Summary Matrix

| Version | Release Name | Major Focus & Key Additions | Total Chapters / Sections | Status |
| :--- | :--- | :--- | :--- | :---: |
| **v1.11.0 (v16)** | **Frappe Framework v16 Differences, Breaking Changes & Migration Guide** | Added Chapter 32 (Frappe v16 Differences & Migration), covering default sorting shift (`creation desc` vs `modified desc`), ban of `frappe.db.commit()` in document hooks, Python 3.14+ & Node 24+ runtime requirements, sandboxed IIFE client scripts, strict ISO country codes, Desk `/desk` routing, and landing page v16 hub. | **32 Chapters + 1 Ecosystem Section** | **Current Release** |
| **v1.10.0 (v1.10)** | **Document Field Access Strategy, Safe Getter Methods & Best Practice Callouts** | Added exhaustive Python field-reading patterns (`doc.get("fieldname")` vs `frappe.db.get_value`) across Chapters 06, 07, 09, 10, 30, and 31; integrated defensive null-safety, in-memory child table filtering, technical callout boxes (`> [!TIP]`), official Frappe documentation references, and synced API Index. | **31 Chapters + 1 Ecosystem Section** | Stable |
| **v1.9.0 (v1.9)** | **Tree Reports, LoginManager, Nginx Port Assignment & Utilities Overhaul** | Added folded first-child Tree Report architecture in Chapter 18, LoginManager & custom signup/login APIs in Chapter 14, Nginx port assignment & port-based multi-tenancy in Chapter 03, complete Python/JS utilities expansion in Chapter 19, and synced API Index. | **31 Chapters + 1 Ecosystem Section** | Stable |
| **v1.8.0 (v1.8)** | **Conditional Date Filter Patterns & Validation in Script Reports** | Added conditional date requirement pattern in Chapter 18 (Reports Guide), client-side dynamic `on_change` requirement toggle (`df.reqd = 1`), server-side validation guard (`frappe.throw`), and multi-table parameterized SQL query examples. | **31 Chapters + 1 Ecosystem Section** | Stable |

---

## 🆕 Version 1.11.0 (v16) — Frappe Framework v16 Differences & Migration Guide (Current)

**Release Date:** September 29, 2026

Version 1.11.0 introduces **Chapter 32: Frappe Framework v16 Differences, Breaking Changes & Migration Guide**, offering a comprehensive breakdown of all methods, functions, database query behaviors, transaction safety rules, and frontend scoping mechanisms introduced in Frappe v16.

### 🌟 Key Enhancements in v1.11.0
- **Chapter 32: Frappe v16 Differences & Migration Guide**: Complete technical guide detailing the default sorting shift from `modified` to `creation`, prohibition of `frappe.db.commit()` in document hooks, strict boolean return contracts for `has_permission`, sandboxed IIFE execution for client scripts, and decoupled core modules.
- **Landing Page Navigation Hub**: Added dedicated v16 Spotlight Banner, interactive hero action button, `v16 Differences` code switcher tab, and a new developer focus pathway.
- **Runtime Updates**: Documented minimum dependency bumps for Python 3.14+ and Node.js 24+.

---

## 🟢 Version 1.10.0 (v1.10) — Document Field Access Strategy, Safe Getter Methods & Best Practice Callouts

**Release Date:** September 29, 2026

Version 1.10.0 introduces an exhaustive documentation overhaul of **document field access patterns** across the server-side Python guides. It clarifies when and why to fetch the entire document and safely access fields via `doc.get("fieldname")` versus issuing direct scalar database queries with `frappe.db.get_value()`. Every method now includes dedicated **Best Practices, Reason, Why It's Used & How It Works** callout boxes and official Frappe framework documentation links.

### 🌟 Key Enhancements in v1.10.0

#### 1. Universal `doc.get("fieldname")` Safe Field Access Pattern
- **Comprehensive Coverage Across 6 Core Chapters**:
  - **[Chapter 06: Document API & Lifecycle](/06-documents/)**: Pattern 1 updated to contrast `doc.get("fieldname", default)` with direct dot access `doc.fieldname`. Added `doc.get()` to the Key Inspection & Helper Methods table.
  - **[Chapter 07: Controllers & Events](/07-controllers/)**: Documented defensive `self.get("fieldname")` inside `validate()` and `on_update()` controller hooks to protect against optional and app-extended custom fields.
  - **[Chapter 09: Server API Reference](/09-server-api/)**: Re-architected Section 2 into a 3-way comparison: `frappe.db.get_value` (fast scalar SQL) vs `frappe.get_doc` + `doc.get` (full ORM) vs `frappe.get_cached_doc` / `get_cached_value` (Redis memory cache).
  - **[Chapter 10: Database, ORM & Query Builder](/10-database/)**: Added the `frappe.get_doc` + `doc.get("fieldname")` alternative directly beneath `frappe.db.get_value`.
  - **[Chapter 30: Frappe ORM Masterclass](/30-frappe-orm/)**: Enhanced Section 1.4 Helper APIs with full document retrieval, default value fallbacks, and in-memory child table extraction.
  - **[Chapter 31: Frappe Data Types & Custom Containers](/31-frappe-types/)**: Added `doc.get()` to the `Document` method matrix and integrated safe getters into the `calculate_invoice_totals` controller example.

#### 2. Best Practices, Reason, Why It's Used & How It Works Callout Boxes (`> [!TIP]`)
- **Defensive Null-Safety**: Contrasted direct dot access `doc.custom_field` (which crashes with `AttributeError` if the field does not exist in schema or instance) against `doc.get("custom_field", default)` which gracefully falls back.
- **In-Memory Child Table Filtering**: Documented Frappe's unique ORM feature: `doc.get("items", {"item_code": "LAPTOP-01"})` filters nested child rows in Python memory without issuing secondary SQL queries.
- **Dynamic Field Iteration**: Highlighted clean iteration over dynamic field arrays (`for f in fields: val = doc.get(f)`) avoiding cumbersome `getattr(doc, f, None)` calls.
- **Performance Trade-Off Guidelines**: Established clear rules for when to bypass Document instantiation in favor of `frappe.db.get_value` (1 to 5 scalar fields, background loops, reporting queries).
- **Internal Engine Architecture**: Explained `BaseDocument.get(self, key, filters, default)` (`frappe/model/base_document.py`) and Frappe's in-memory `frappe.compare()` evaluation mechanism.

#### 3. Official Documentation References
- Embedded direct official documentation links in every chapter:
  - [Frappe Framework Official Docs: Document API Reference (`doc.get`)](https://frappeframework.com/docs/v15/user/en/api/document#docget)
  - [Frappe Framework Official Docs: Controllers & Document Methods](https://frappeframework.com/docs/v15/user/en/basics/doctypes/controllers#document-methods)
  - [Frappe Framework Official Docs: Database API (`frappe.db.get_value`)](https://frappeframework.com/docs/v15/user/en/api/database#frappedbget_value)
  - [Frappe Framework Official Docs: Cached Values (`frappe.db.get_cached_value`)](https://frappeframework.com/docs/v15/user/en/api/database#frappedbget_cached_value)

#### 4. Searchable API Index Synchronization (Chapter 24)
- Cataloged [`doc.get()`](/06-documents/#key-inspection-helper-methods) in Chapter 24 (API Index) under the `D` category with direct navigation to Document inspection.

---

## 🟢 Version 1.9.0 (v1.9) — Tree Reports, LoginManager Architecture, Port-Based Multi-Tenancy & Utilities Overhaul

**Release Date:** September 28, 2026

Version 1.9.0 delivers a major documentation expansion across five core areas: parent-child table Tree Report architectures, deep-dive authentication engineering with `LoginManager` and registration APIs, Nginx port assignment with port-based multi-tenancy in Bench CLI, exhaustive Python/JS utilities reference, and synchronized API indexing.

### 🌟 Key Enhancements in v1.9.0

#### 1. Parent-Child Table Tree Reports & Folded First-Child Pattern (Chapter 18)
- **Folded First Child Architectural Pattern**: Documented the high-density layout where the first child record (`Nj Quality Readings`) is rendered on the same table row as the parent inspection (`NJ Quality Inspection`) at `indent: 0`, while all secondary and subsequent child readings (`rows[1:]`) expand as collapsible sub-rows at `indent: 1`.
- **Synthetic Tree Keys (`row_key` & `parent_key`)**: Added hidden column patterns with JS controller properties `tree: true`, `name_field: "row_key"`, `parent_field: "parent_key"`, and `initial_depth: 3` to support nested records without primary key collisions.
- **Dynamic Filter Validation & Metadata Loading**: Included client-side dynamic requirement triggers (`on_change` forcing `from_date` when `to_date` is selected) and dynamic select options loading in `onload` using `frappe.model.with_doctype`.

#### 2. Authentication, LoginManager & User Signup Flows (Chapter 14)
- **`LoginManager` Architecture (`frappe.auth.LoginManager`)**: Documented internal authentication pipeline, methods (`authenticate`, `post_login`, `login_as`, `logout`, `run_trigger`), and complete custom REST login endpoints.
- **Programmatic Impersonation (`login_as`)**: Implementation patterns for system administrators and automation tasks to safely switch active user sessions without credentials.
- **User Signup & Registration APIs (`frappe.core.doctype.user.user.sign_up`)**: Standard welcome email registration and headless custom signup endpoints with instant role assignment and direct password setting.
- **Password Management & Cryptography**: Added `check_password`, `update_password` (with session termination flags), `reset_password`, and `get_decrypted_password` reference and import paths.
- **Session Lifecycle & Expiry**: Session invalidation via `clear_sessions()`, database inspection of `tabSessions`, and `site_config.json` timeout parameters (`session_expiry`, `session_expiry_mobile`).
- **Auth Lifecycle Hooks & API Tokens**: Implementation of `on_login`, `on_logout`, `after_login`, `on_session_creation` hooks, and HTTP Bearer/Token headers (`Authorization: token <key>:<secret>`).

#### 3. Complete Python & JavaScript Utilities Overhaul (Chapter 19)
- **Python Date & Time Utilities (`frappe.utils`)**: Added `formatdate`, `format_time`, `format_datetime`, `getdate`, `get_datetime`, `get_time`, `get_timedelta`, `now`, `nowdate`, `today`, `nowtime`, `now_datetime`, `add_to_date`, `add_days`, `add_months`, `add_years`, `date_diff`, `month_diff`, `time_diff_in_seconds`, `pretty_date`, `get_first_day`, `get_last_day`, `get_year_start`, `get_year_ending`, and `is_last_day_of_the_month`.
- **Type Casting & Number Formatting**: Added `cint`, `flt`, `cstr`, `sbool`, `rounded`, `parse_val`, `fmt_money`, `money_in_words`, and `in_words`.
- **Strings, Validation, Paths & JSON**: Added `strip_html`, `clean_whitespace`, `scrub`, `slug`, `random_string`, `get_abbr`, `markdown`, `escape_html`, `validate_email_address`, `split_emails`, `validate_url`, `get_url`, `get_url_to_form`, `get_url_to_list`, `get_site_path`, `get_files_path`, `get_bench_path`, `safe_json_loads`, `unique`, and `dictify`.
- **Client-Side `frappe.datetime`**: Added `get_today`, `now_date`, `now_time`, `now_datetime`, `str_to_user`, `user_to_str`, `str_to_obj`, `obj_to_str`, `obj_to_user`, `add_days`, `add_months`, `get_diff`, `pretty_date`, `validate`, and `get_datetime_as_string`.
- **Universal Field Formatter (`frappe.format`)**: Documented client-side formatting for Currency, Date, Datetime, Percent, Float, Int, Link, and Rating.
- **Client-Side `frappe.utils`**: Added `copy_to_clipboard`, `get_url`, `get_form_link`, `comma_and`, `comma_or`, `escape_html`, `unescape_html`, `filter_dict`, `sleep`, `play_sound`, `is_empty`, `to_title_case`, and `icon`.

#### 4. Bench CLI: Nginx Setup & Port-Based Multi-Tenancy (Chapter 03)
- **`bench setup nginx`**: Detailed reverse-proxy configuration generation, symlinking, syntax testing (`sudo nginx -t`), and zero-downtime reloading.
- **Port-Based Multi-Tenancy & Port Allocation**:
  - Disabling DNS multi-tenancy (`bench config dns_multitenant off`).
  - Assigning dedicated TCP ports (`bench set-nginx-port <site> <port>`).
  - Regenerating Nginx server blocks and managing firewall allowances (`sudo ufw allow <port>/tcp`).
  - Accessing isolated sites via `http://<server-ip>:<port>`.
- **Internal Service Port Customization**: Overriding Gunicorn (`webserver_port`), Socket.IO (`socketio_port`), and file watcher ports in `common_site_config.json`.
- **Automated Production & SSL**: Single-command deployment via `sudo bench setup production <user>` and automatic Let's Encrypt SSL provisioning (`sudo bench setup lets-encrypt`).

#### 5. Searchable API Index Synchronization (Chapter 24)
- Added over 45+ newly documented APIs, CLI commands, and utility helpers across letters A through W with direct deep links and execution environment badges (`Server`, `Client`, `Both`).

---

## 🟢 Version 1.8.0 (v1.8) — Script Reports Dynamic Date Filtering & Conditional Validation
| **v1.7.0 (v1.7)** | **Bench CLI Expansion & Comprehensive Command Coverage** | Added `bench --site <site-name> list-apps`, `list-sites`, `remove-app`, `set-admin-password`, `mariadb`/`postgres`, `reset-perms`, `scheduler`, `build-search-index`, `update`, `restart`, `setup`, `doctor`, `worker`/`schedule`, `version`, and updated API Index. | **31 Chapters + 1 Ecosystem Section** | Stable |
| **v1.6.0 (v1.6)** | **Frappe Data Types, Custom Containers (`frappe._dict`) & Type System Reference** | Added Chapter 31: Frappe Data Types & Custom Containers Reference (`frappe._dict`, `Document`, `DF` type stubs, `frappe.local`, query return types, null-safe primitives, type annotation cheat sheet). | **31 Chapters + 1 Ecosystem Section** | Stable |
| **v1.5.0 (v1.5)** | **Sub-Heading TOC Navigation, Complete Notifications & Navbar Search Expansion** | Added deep sub-heading navigation (`outline: [2, 6]`), complete System Notification & Email Notification guides (Desk Bell, Toasts, Msgprint, Confirm, Prompt, Rule Notifications, Email API), and expanded navbar search bar up to 560px. | **30 Chapters + 1 Ecosystem Section** | Stable |
| **v1.4.0 (v1.4)** | **Full Accuracy Audit & 110+ API Gap Integration** | Full official accuracy audit, corrected queue timeouts (default: 300s), added 110+ missing server & client APIs (`frappe.db` JS proxy, `frappe.model` permission checks, `frm.page.*` controls, `frappe.realtime`, `frappe.datetime`), and updated Searchable API Index. | **30 Chapters + 1 Ecosystem Section** | Stable |
| **v1.3.0 (v1.3)** | **Client JS API Cataloging & Open Source Ecosystem** | Added Client JS API Matrix, updated Searchable API Index, and created Open Source Ecosystem section for ERPNext, HRMS, and India Compliance. | **30 Chapters + 1 Ecosystem Section** | Stable |
| **v1.2.0 (v1.2)** | **Exhaustive Documentation Expansion** | Added easy-to-understand explanations across all chapters, setup troubleshooting, real-world analogies, complete `doc_events` table, client document mapping, REST uploads, and 13 cookbook recipes. | **30 Chapters** | Stable |
| **v1.1.0 (v1.1)** | **GitHub Navigation & Frappe ORM Masterclass** | Added GitHub logo in navbar, landing page repo buttons, and brand-new Chapter 30: Frappe ORM Masterclass. | **30 Chapters** | Stable |
| **v1.0.0 (v1.0)** | **Initial Baseline Build** | Core architecture overview, basic DocType fields, basic ORM methods, standard REST CRUD, Bench CLI commands, and standard reports guide. | **29 Chapters** | Baseline |

---

## 🆕 Version 1.8.0 (v1.8) — Script Reports Dynamic Date Filtering & Conditional Validation (Current)

**Release Date:** August 18, 2026

Version 1.8.0 enhances the **Complete Reports Guide (Chapter 18)** with production-ready patterns for conditional date filtering in Script Reports, showcasing client-side dynamic requirement triggers and server-side validation guards.

### 🌟 Key Enhancements in v1.8.0

#### 1. Conditional Date Filter Patterns (Chapter 18)
- **No Auto-Populated Default Dates**: Demonstrated how to leave date filters unpopulated on initial load by commenting out or omitting static default date values, allowing users to run unrestricted searches or specify custom intervals on demand.
- **Client-Side Dynamic Requirement Trigger (`on_change`)**: Documented the JavaScript client controller pattern using `on_change` on the `to_date` filter to dynamically set `from_date_filter.df.reqd = 1` and trigger `from_date_filter.refresh()`, making `From Date` mandatory only when `To Date` is selected.
- **Client-Side Guard Warning**: Added interactive validation check throwing `frappe.throw(__("Please set From Date as well since To Date is set"))` to prevent automatic query submission without required date boundaries.

#### 2. Server-Side Validation & Parameterized SQL Querying
- **Server Guard (`maintenance_schedule_report.py`)**: Added strict Python verification in `get_data()` to ensure `if filters.get("to_date") and not filters.get("from_date"): frappe.throw(...)` executes prior to running SQL.
- **Multi-Table Relational JOINs**: Complete SQL query joining `Sales Order`, `Sales Invoice`, `Maintenance Schedule Item`, and `Maintenance Visit` with secure dictionary parameter binding (`%(from_date)s`, `%(to_date)s`).

---

## 🟢 Version 1.7.0 (v1.7) — Bench CLI Expansion & Comprehensive Command Coverage

**Release Date:** August 17, 2026

Version 1.7.0 expands the **Bench CLI Command Reference (Chapter 03)** with exhaustive command parameters, flags, real-world syntax examples, and synchronizes the global Searchable API Index.

### 🌟 Key Enhancements in v1.7.0

#### 1. Detailed Site App Inspection (`bench --site <site-name> list-apps`)
- **Site-Level App Listing**: Documented `bench --site <site-name> list-apps` to list installed applications per site database context alongside `bench list-apps` for bench environment installed applications.

#### 2. Comprehensive Bench CLI Commands Expansion (Chapter 03)
- **Site Management Commands**: Added `bench list-sites`, `bench set-admin-password`, `bench mariadb` / `bench postgres` CLI interactive shell prompts, `bench reset-perms`, `bench scheduler` (`status`, `enable`, `disable`), and `bench build-search-index`.
- **App Lifecycle Commands**: Added `bench remove-app` to remove application directories and uninstall Python packages from the virtual environment.
- **Operations & Production Services**: Added `bench update` (`--pull`, `--patch`, `--requirements`), `bench restart`, `bench setup` (`production`, `nginx`, `add-domain`, `remove-domain`), `bench doctor`, `bench worker` & `bench schedule`, and `bench version`.

#### 3. Searchable API Index Synchronization (Chapter 24)
- **Global Index Integration**: Added all 13 newly documented Bench CLI commands under Section **B** in [`docs/24-api-index/index.md`](/24-api-index/) with direct deep links.

---

## 🟢 Version 1.6.0 (v1.6) — Frappe Data Types, Custom Containers (`frappe._dict`) & Type System Reference

**Release Date:** August 17, 2026

Version 1.6.0 introduces a brand-new, dedicated technical chapter (**Chapter 31: Frappe Data Types & Custom Containers Reference**) detailing every custom Python type, container class, synthetic IDE type hint, and database return structure used across Frappe Framework backend development.

### 🌟 Key Enhancements in v1.6.0

#### 1. Deep Dive on `frappe._dict` (Dot-Accessible Dictionary)
- **What, Why, How & When**: Exhaustive breakdown of `frappe._dict`, why to use it over standard Python `dict` (attribute access `d.key`, KeyError safety returning `None`, visual consistency with `Document`), and how to instantiate it.
- **Function Parameter Annotations**: Detailed examples for typing function parameters and return types (e.g. `def update_storage_in_main_item(self, current_item: str, struct_data: frappe._dict) -> str:`).
- **Code Examples**: Full class method implementation, caller payload passing, and deep nested dictionary traversal.

#### 2. Core ORM Classes (`Document` & `BaseDocument`)
- Key attributes and helper methods (`doc.name`, `doc.docstatus`, `doc.is_new()`, `doc.as_dict()`, `doc.append()`, `doc.save()`).
- Type annotation best practices for document parameters (`doc: Document`).

#### 3. Synthetic IDE Type Hints (`DF` / `frappe.types`)
- Documentation for type hints generated for DocType fields (`DF.Data`, `DF.Link`, `DF.Int`, `DF.Float`, `DF.Currency`, `DF.Check`, `DF.Table[T]`).
- Visual IDE autocompletion and static type analysis setup for PyCharm, VS Code, Mypy, and Pyright.

#### 4. Thread-Local Context & HTTP Request Parameters
- **`frappe.form_dict`**: Safe parameter retrieval from GET query strings, POST form data, and REST JSON payloads inside `@frappe.whitelist()` endpoints.
- **`frappe.local`**: Request-level context variables (`frappe.local.site`, `frappe.local.user`, `frappe.local.flags`).

#### 5. Database Return Types Matrix & Null-Safe Primitives
- **Query Return Types**: Data structure comparison matrix for `frappe.db.get_value()`, `frappe.get_all()`, `frappe.db.sql()`, `frappe.qb` with flags (`as_dict=True`, `pluck=True`, `as_list=True`).
- **Null-Safe Casting Primitives**: `cint()`, `flt()`, `cstr()`, `to_timedelta()` in `frappe.utils`.
- **Type Annotations Cheat Sheet**: Code snippets covering DocType controllers, whitelisted endpoints, background RQ job callbacks, and hook handlers (`doc, method=None`).

---

## 🟢 Version 1.5.0 (v1.5) — Sub-Heading TOC Navigation, Complete Notifications & Navbar Search Expansion

**Release Date:** August 15, 2026

Version 1.5.0 introduces deep right-side Table of Contents (TOC) sub-heading navigation, a complete multi-layered reference for System & Email Notifications, and an expanded top navbar search bar layout.

### 🌟 Key Enhancements in v1.5.0

#### 1. Deep Sub-Heading TOC Navigation (`outline: [2, 6]`)
- **Right Sidebar Sub-Heading Support (`docs/.vitepress/config.mjs`)**: Configured `themeConfig.outline` to `level: [2, 6]`.
- **Sub-Section Anchoring**: Users can now view and click all sub-headings (`###`, `####`, `#####`, `######`) directly from the right-hand "On this page" sidebar to jump straight to specific sub-parts of any documentation page.

#### 2. Complete System & Email Notifications Guide (`docs/16-cache-realtime-email-files`)
- **In-App Desk Bell Notifications (`Notification Log` DocType)**: Server-side Python code to trigger persistent bell notifications, user mentions, assignments, and doc sharing.
- **Desk Toast Alerts (`frappe.show_alert`)**: Client-Side JS toast notifications with indicator colors (`green`, `blue`, `orange`, `red`), display durations, and custom action links.
- **Dialog Alerts & Popups (`frappe.msgprint` & `frappe.throw`)**: Server & Client informational popup dialogs, primary action buttons, non-blocking vs modal popups, and exception throwing (`frappe.throw`).
- **Interactive Confirmation & Prompt Modals (`frappe.confirm` & `frappe.prompt`)**: Client-side JS confirmation modals and dynamic multi-field prompts for user input before executing actions.
- **Rule-Based Automatic Notifications (`Notification` DocType)**: Document event-triggered notifications (New, Save, Submit, Cancel, Value Change) sent via Email, System Bell, Slack, or WhatsApp webhooks.
- **Transactional Email API (`frappe.sendmail` & `Communication`)**: Standard & HTML emails, Jinja Templated emails, PDF Print Format attachments, async background queuing (`now=False`), and Communication timeline logging.
- **Notification Type Summary Matrix**: Comprehensive comparison table covering triggers, target audience, visual presentation, and primary use cases.

#### 3. Expanded Navbar Search Bar (`docs/.vitepress/theme/custom.css`)
- **Expanded Width**: Custom CSS for `.VPNavBarSearch` and `.VPNavBarSearchButton` to expand the navbar search bar width up to **560px** on desktop (`1280px+`), **480px** on laptops (`1024px+`), and **360px** on tablets (`768px+`).

---

## 🟢 Version 1.4.0 (v1.4) — Full Accuracy Audit & 110+ API Gap Integration

**Release Date:** August 14, 2026

Version 1.4.0 represents a comprehensive audit and expansion of the documentation against official Frappe v15 sources and framework codebase, correcting legacy inaccuracies and documenting over 110 previously missing server-side Python and client-side JavaScript APIs.

### 🌟 Key Enhancements in v1.4.0

#### 1. Official Documentation Accuracy Audit & Corrections
- **Queue Timeouts Corrected (`docs/15-background-jobs-scheduler`)**: Updated Redis RQ default queue timeouts to `short: 300s`, `default: 300s`, and `long: 1500s`. Corrected misconceptions regarding default queue runtime limits and added `frappe.enqueue_doc()`.
- **Top-Level API Function Corrections (`docs/06-documents`)**: Replaced deprecated/invalid `frappe.model.rename_doc` and `frappe.model.delete_doc` paths with correct top-level functions `frappe.rename_doc` and `frappe.delete_doc`. Documented "Allow Rename" DocType requirement.
- **Controller Lifecycle Matrix (`docs/07-controllers`)**: Added missing `before_naming` hook (fires between `before_insert` and `autoname`) to lifecycle diagram and matrix with code example.
- **Client Script Syntax Fix (`docs/11-client-api`)**: Fixed Python `#` comment syntax error inside JavaScript code block.
- **CLI Commands (`docs/01-getting-started`)**: Added mandatory `--mariadb-root-password` flag to `bench new-site` command and clarified PostgreSQL experimental status.

#### 2. Complete Server ↔ Client API Gap Integration (110+ APIs Added)
- **Document ORM APIs (`docs/06-documents`)**: Added `frappe.copy_doc()`, `doc.queue_action()`, `doc.is_dirty()`, `doc.get_doc_before_save()`, `doc.has_value_changed()`, `doc.append()`, `doc.remove()`, `doc.run_method()`, `doc.add_comment()`, `doc.check_permission()`.
- **Database APIs & Client DB Proxy (`docs/10-database`)**:
  - **Server**: Added `frappe.db.get_values()`, `get_single_value()`, `set_single_value()`, `get_default()`, `set_default()`, `savepoint()`, `rollback()`, `table_exists()`, `has_column()`.
  - **Client-Side Database Proxy (`frappe.db` in JS)**: Added full documentation for `frappe.db.get_doc()`, `get_value()`, `get_list()`, `set_value()`, `insert()`, `exists()`, `count()`, `delete_doc()`.
- **Client Scripts & Page Controls (`docs/11-client-api`)**:
  - **`frm.page.*` Toolbar & Page Controls**: Added `set_title()`, `set_indicator()`, `add_inner_button()`, `add_action_item()`, `add_menu_item()`, `set_primary_action()`.
  - **`frm.*` Form Helpers**: Added `frm.call()`, `frm.trigger()`, `frm.clear_table()`, `frm.add_child()`, `frm.add_fetch()`, `frm.scroll_to_field()`, `frm.set_intro()`, `frm.disable_save()`, `frm.enable_save()`, `frm.disable_form()`, `frm.enable_form()`.
  - **`frappe.model.can_*` Permission Checks**: Added `can_read()`, `can_write()`, `can_create()`, `can_delete()`, `can_submit()`.
- **Realtime Socket.IO WebSockets (`docs/16-cache-realtime-email-files`)**: Added client-side listener `frappe.realtime.on()` and client push `frappe.realtime.emit()`.
- **Client Datetime & Utilities (`docs/19-utils`)**: Added `frappe.datetime.get_today()`, `now_datetime()`, `add_days()`, `add_months()`, `get_diff()`, `str_to_user()`, `pretty_date()`, and client utility helpers `comma_and()`, `copy_to_clipboard()`, `sleep()`.

#### 3. Searchable API Index Synchronization (`docs/24-api-index`)
- Re-indexed every newly added server and client API alphabetically under sections `C`, `D`, `F`, `M`, `P`, `R`, `S`, `T` with direct links and descriptions.

---

## 🟢 Version 1.3.0 (v1.3) — Client JS APIs & Open Source Ecosystem

**Release Date:** August 14, 2026

Version 1.3 extends the documentation following the initial code push, focusing on exhaustive client-side JavaScript method cataloging, Searchable API Index synchronization, and establishing an unnumbered Open Source Ecosystem section.

### 🌟 Key Enhancements in v1.3

#### 1. Exhaustive Client Script JavaScript API Cataloging (`docs/11-client-api`)
- **Section 10 (Complete Client JavaScript API Matrix)**: Added detailed reference for missing client script methods:
  - **Form Instance (`frm`) Methods**: `frm.trigger()`, `frm.refresh_fields()`, `frm.save_or_update()`, `frm.get_field()`, `frm.set_read_only()`, `frm.page.add_action_item()`, `frm.page.clear_action_items()`, `frm.page.add_menu_item()`.
  - **Notifications & Warnings**: `frappe.msgprint()`, `frappe.throw()`, `frappe.warn()`, `frappe.show_progress()`, `frappe.hide_progress()`.
  - **Client Navigation & Breadcrumbs**: `frappe.get_route()`, `frappe.get_route_str()`, `frappe.set_route_options()`, `frappe.breadcrumbs.add()`.
  - **Client-Side Database Promises (`frappe.db.*`)**: `frappe.db.get_single_value()`, `frappe.db.get_list()`, `frappe.db.get_doc()`, `frappe.db.delete_doc()`, `frappe.db.set_value()`.
  - **Client Metadata & Formatting**: `frappe.meta.get_docfield()`, `frappe.meta.has_field()`, `frappe.format()`.
  - **Client Model Helpers**: `frappe.model.get_new_doc()`, `frappe.model.set_value()`, `frappe.model.clear_doc()`, `frappe.model.with_doctype()`.
  - **Realtime & Dialog Selectors**: `frappe.realtime.off()`, `frappe.ui.form.MultiSelectDialog`.

#### 2. Searchable API Index Update (`docs/24-api-index`)
- Cataloged every newly added client script JavaScript method alphabetically under Section **F** in the Searchable API Index with direct links.

#### 3. Unnumbered Open Source Ecosystem Section (`docs/opensource-projects`)
- Created a new sidebar section positioned directly below **DevOps, Operations & Docker** under the unnumbered title **`Ecosystem & Open Source` -> `Open Source Projects`**.
- Includes structured overview table, GitHub repository links, and Bench CLI installation commands for:
  1. **ERPNext**: Full-featured open-source ERP (Accounting, Stock, Sales, Buying, Manufacturing, CRM, Projects).
  2. **Frappe HR (HRMS)**: Human Resource & Payroll app (Employee Lifecycle, Attendance, Leave, Payroll, Appraisals).
  3. **India Compliance**: Official Indian statutory tax compliance app (GST Returns, E-Invoicing via IRP, E-Way Bills, TDS, MCA Audit Trail).
- Added an **Open Source Ecosystem** card to the home page feature grid ([`docs/index.md`](/)).

---

## 🟢 Version 1.2.0 (v1.2) — Exhaustive Documentation Expansion

**Release Date:** August 14, 2026

Version 1.2 represented a major documentation enhancement focusing on readability, depth, easy-to-understand explanations, step-by-step troubleshooting, and practical production recipes.

### 🌟 Key Enhancements in v1.2
- **Plain-English Explanations & Real-World Analogies**: Introduced real-world analogy explaining Bench (Property Management), Sites (Apartments), Apps (Furniture), and DocTypes (Blueprints).
- **Step-by-Step MariaDB Config & Troubleshooting**: Added precise `50-server.cnf` settings (`utf8mb4` & `barracuda`) and setup troubleshooting matrix.
- **Client-Side Document Mapping**: Added `frappe.model.make_new_doc_and_get_name` example mapping parent fields (`customer`, `company`, `posting_date`, `remarks`) and child table items (`items` array).
- **REST API File Uploads**: Documented `/api/method/upload_file` with parameter matrix, cURL commands, and Python `requests` code examples.
- **13 Production Recipes**: Expanded Developer Cookbook (Chapter 22) to 13 copy-pasteable recipes (PDF generation, controller overrides, cron tasks, cache invalidation).

---

## 🟢 Version 1.1.0 (v1.1) — GitHub Navigation & Frappe ORM Masterclass

**Release Date:** August 14, 2026

Version 1.1 introduced deep-dive documentation for Frappe ORM querying alongside GitHub repository integration.

### 🌟 Key Additions in v1.1
- **GitHub Logo in Navbar & Landing Page Integration**: Added GitHub logo in the top navigation bar directly to the left of the theme toggle switch linking to [`https://github.com/ParitoshChaudhari/Frappe-Docs`](https://github.com/ParitoshChaudhari/Frappe-Docs).
- **Chapter 30: Frappe ORM & Query Builder Masterclass (`docs/30-frappe-orm`)**: Created a dedicated 5-part masterclass covering `SELECT`, `WHERE`, `LIMIT`, `OFFSET`, `ORDER BY`, `DISTINCT`, `GROUP BY`, `HAVING`, aggregations (`Count`, `Sum`, `Avg`, `Min`, `Max`), `UNION`, `UNION ALL`, `INTERSECT`, `INNER`/`LEFT`/`RIGHT` Joins, subqueries, and `CASE/WHEN/ELSE` logic.

---

## 🏛️ Version 1.0.0 (v1.0) — Initial Baseline Build

**Release Date:** August 14, 2026

The initial baseline build of the Frappe Framework v15 Developer Documentation.

---

## 🔗 Related Topics

- [01. Getting Started](/01-getting-started/)
- [30. Frappe ORM Masterclass](/30-frappe-orm/)
- [Open Source Projects](/opensource-projects/)
- [24. Searchable API Index](/24-api-index/)
