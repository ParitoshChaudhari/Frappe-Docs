---
title: Documentation Version History & Changelog
description: Comprehensive version history documenting v1.0 initial baseline, v1.1 GitHub & ORM masterclass, and v1.2 exhaustive documentation expansion.
version: v15
category: Overview & Basics
status: Stable
---

# 📜 Documentation Version History & Changelog

This document tracks the evolution, feature additions, API expansions, and revision history of the **Frappe Framework v15 Developer Documentation & Reference** website.

---

## 🚀 Version Summary Matrix

| Version | Release Name | Major Focus & Key Additions | Total Chapters | Status |
| :--- | :--- | :--- | :---: | :---: |
| **v1.2.0 (v1.2)** | **Exhaustive Documentation Expansion** | Added easy-to-understand explanations across all chapters, setup troubleshooting, real-world analogies, complete `doc_events` table, client document mapping, REST uploads, and 13 cookbook recipes. | **30 Chapters** | **Current Release** |
| **v1.1.0 (v1.1)** | **GitHub Navigation & Frappe ORM Masterclass** | Added GitHub logo in navbar (left of theme toggle), landing page repo buttons, and brand-new Chapter 30: Frappe ORM Masterclass (`SELECT`, `WHERE`, `LIMIT`, `GROUP BY`, `HAVING`, `JOINs`, `UNION`, `INTERSECT`). | **30 Chapters** | Stable |
| **v1.0.0 (v1.0)** | **Initial Baseline Build** | Core architecture overview, basic DocType fields, basic ORM methods (`get_all`, `get_list`, `get_doc`), standard REST CRUD, Bench CLI commands, and standard reports guide. | **29 Chapters** | Baseline |

---

## 🆕 Version 1.2.0 (v1.2) — Exhaustive Documentation Expansion (Current)

**Release Date:** August 14, 2026

Version 1.2 represents a major documentation enhancement focusing on readability, depth, easy-to-understand explanations, step-by-step troubleshooting, and practical production recipes.

### 🌟 Key Enhancements in v1.2

#### 1. Plain-English Explanations & Real-World Analogies (`docs/01-getting-started`)
- **Apartment Building Analogy**: Introduced real-world analogy explaining Bench (Property Management), Sites (Apartments), Apps (Furniture), and DocTypes (Blueprints).
- **Step-by-Step MariaDB Config**: Added precise `50-server.cnf` settings (`utf8mb4` character set & `barracuda` file format).
- **Setup Troubleshooting Matrix**: Added quick-fix guide for `Access denied`, `Index column size too large`, port 8000 conflicts, and Redis connection issues.

#### 2. Client-Side Document Mapping (`docs/11-client-api`)
- **Unsaved Form Mapping**: Added `frappe.model.make_new_doc_and_get_name` example mapping parent fields (`customer`, `company`, `posting_date`, `remarks`) and child table items (`items` array).
- **Direct Client DB Insertion**: Added `frappe.db.insert` example creating records directly in the background.

#### 3. REST API File Uploads (`docs/13-rest-api`)
- **Multipart Upload Endpoint**: Documented `/api/method/upload_file` with parameter matrix, cURL commands, and Python `requests` code examples.

#### 4. Expanded Developer Cookbook (`docs/22-cookbook`)
- **13 Production Recipes**: Expanded cookbook from 8 to 13 copy-pasteable recipes:
  - Recipe 9: Programmatically generate & attach PDF to document
  - Recipe 10: Upgrade-safe controller override in `hooks.py`
  - Recipe 11: Document mapping from client script with unsaved form view
  - Recipe 12: Scheduled daily email digest cron task
  - Recipe 13: High-performance Redis cache key invalidation strategy

---

## 🟢 Version 1.1.0 (v1.1) — GitHub Navigation & Frappe ORM Masterclass

**Release Date:** August 14, 2026

Version 1.1 introduced deep-dive documentation for Frappe ORM querying alongside GitHub repository integration.

### 🌟 Key Additions in v1.1

#### 1. GitHub Logo in Navbar & Landing Page Integration
- Added GitHub logo in the top navigation bar directly to the left of the theme toggle switch linking to [`https://github.com/ParitoshChaudhari/Frappe-Docs`](https://github.com/ParitoshChaudhari/Frappe-Docs).
- Added GitHub repository action button and feature cards to the landing page ([`docs/index.md`](/)).

#### 2. Chapter 30: Frappe ORM & Query Builder Masterclass (`docs/30-frappe-orm`)
Created a dedicated, 5-part masterclass for Frappe ORM and PyPika Query Builder (`frappe.qb`):
- **Part 1: Selection, Filtering & Pagination**: `SELECT`, `WHERE`, logical operators (`&`, `|`, `~`), `isin`, `like`, `between`, `ORDER BY`, `LIMIT`, `OFFSET`, `DISTINCT`, and `frappe.db` shortcuts.
- **Part 2: Grouping, Aggregations & Set Operations**: `GROUP BY`, `HAVING`, aggregations (`Count`, `Sum`, `Avg`, `Min`, `Max`), `UNION`, `UNION ALL`, and `INTERSECT`.
- **Part 3: Multi-Table Joins**: `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, and 3-table multi-joins (`Sales Order` + `Sales Order Item` + `Customer`).
- **Part 4: Subqueries, Conditional Logic & Write Operations**: Subqueries in `WHERE`, `Case()`, `When()`, `Else()`, `UPDATE`, `INSERT`, `DELETE`.
- **Part 5: Complete Frappe ORM Method Comparison Matrix**.

Every example includes **Sample Table Schemas with Mock Data**, **Python Code**, **Generated Raw SQL**, and **Exact Output Data**.

---

## 🏛️ Version 1.0.0 (v1.0) — Initial Baseline Build

**Release Date:** August 14, 2026

The initial baseline build of the Frappe Framework v15 Developer Documentation:

### 📄 Included in Baseline (v1.0)
- **Chapter 01–04**: Getting Started, Frappe Architecture, Bench CLI Reference, Apps & Sites Structure.
- **Chapter 05–08**: DocTypes & Fields, Document API & Lifecycle, Controllers & Events, Hooks Reference.
- **Chapter 09–10**: Server API (`frappe.*`), Database API & Query Builder intro.
- **Chapter 11–12**: Client API (`frappe.ui.form`), Child Tables (Python & JS).
- **Chapter 13–16**: REST API, Authentication & Session, Background Jobs, Cache/Realtime/Email/Files.
- **Chapter 17–19**: Web Pages & Jinja, Complete Reports Guide, Utilities Reference.
- **Chapter 20–23**: Testing & Debugging, Security & Performance, Cookbook Recipes, Client vs Server Matrix.
- **Chapter 24–27**: Searchable API Index, DevOps Installation, Operations & Load Relief, Production Frappe Docker.
- **Chapter 28–29**: Desk Views & Customization, Version History & Changelog.

---

## 🔗 Related Topics

- [01. Getting Started](/01-getting-started/)
- [30. Frappe ORM Masterclass](/30-frappe-orm/)
- [24. Searchable API Index](/24-api-index/)
