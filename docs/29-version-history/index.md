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
| **v1.8.0 (v1.8)** | **Conditional Date Filter Patterns & Validation in Script Reports** | Added conditional date requirement pattern in Chapter 18 (Reports Guide), client-side dynamic `on_change` requirement toggle (`df.reqd = 1`), server-side validation guard (`frappe.throw`), and multi-table parameterized SQL query examples. | **31 Chapters + 1 Ecosystem Section** | **Current Release** |
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
