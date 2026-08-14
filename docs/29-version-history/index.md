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
| :--- | :--- | :--- | :---: | :---: |
| **v1.3.0 (v1.3)** | **Client JS API Cataloging & Open Source Ecosystem** | Added exhaustive Client JS API Matrix (Section 10 in Chapter 11), updated Searchable API Index under Section F, and created unnumbered Open Source Ecosystem section (`opensource-projects`) for ERPNext, HRMS, and India Compliance. | **30 Chapters + 1 Ecosystem Section** | **Current Release** |
| **v1.2.0 (v1.2)** | **Exhaustive Documentation Expansion** | Added easy-to-understand explanations across all chapters, setup troubleshooting, real-world analogies, complete `doc_events` table, client document mapping, REST uploads, and 13 cookbook recipes. | **30 Chapters** | Stable |
| **v1.1.0 (v1.1)** | **GitHub Navigation & Frappe ORM Masterclass** | Added GitHub logo in navbar (left of theme toggle), landing page repo buttons, and brand-new Chapter 30: Frappe ORM Masterclass (`SELECT`, `WHERE`, `LIMIT`, `GROUP BY`, `HAVING`, `JOINs`, `UNION`, `INTERSECT`). | **30 Chapters** | Stable |
| **v1.0.0 (v1.0)** | **Initial Baseline Build** | Core architecture overview, basic DocType fields, basic ORM methods (`get_all`, `get_list`, `get_doc`), standard REST CRUD, Bench CLI commands, and standard reports guide. | **29 Chapters** | Baseline |

---

## 🆕 Version 1.3.0 (v1.3) — Client JS APIs & Open Source Ecosystem (Current)

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
