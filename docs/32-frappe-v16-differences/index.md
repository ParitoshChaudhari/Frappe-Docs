---
title: Frappe Framework v16 Differences, Breaking Changes & Migration Guide
description: Complete guide to all methods, functions, database sorting, transaction boundary changes, frontend IIFE scoping, and paradigm shifts introduced in Frappe v16 vs v15.
version: v16-beta
category: Overview & Basics
status: Beta
---

# <span class="badge v16">v16 Beta</span> <span class="badge server">Server & Client</span> Frappe Framework v16: Breaking Changes, Methods & Architectural Shifts

Frappe Framework version 16 introduces significant architectural refinements, performance enhancements (up to **2x faster** on typical workloads), database query behavior shifts, and strict safety contracts.

This chapter documents every **method**, **function**, **database ORM rule**, **lifecycle hook**, **frontend scoping mechanism**, and **best practice** introduced in Frappe v16 compared to v15.

---

## ⚡ v15 vs v16 Executive Comparison Matrix

| Architectural Feature | Frappe v15 | Frappe v16 (Beta) | Impact & Migration Requirement |
| :--- | :--- | :--- | :--- |
| **Minimum Python Runtime** | Python 3.10 – 3.12 | **Python 3.14+** | ⚠️ Server environment upgrade required before bench setup |
| **Minimum Node.js Runtime** | Node.js 18.x – 20.x | **Node.js 24+** | ⚠️ Server Node version must be updated via nvm/apt |
| **Default Database Sorting** | Implicitly sorted by `modified desc` | **Implicitly sorted by `creation desc`** | 🔴 **Major Breaking Change**: Affects `get_all`, `get_list`, `db.get_value`, and `qb` |
| **`frappe.db.commit()` in Hooks** | Allowed in `doc_events` (often caused race conditions) | **Strictly Prohibited** (raises error / blocked) | 🔴 Remove manual `frappe.db.commit()` from all document hooks in `hooks.py` |
| **Desk URL Routing** | `/app/*` (e.g., `/app/task`) | **`/desk/*`** (e.g., `/desk/task`); `/apps` deprecated | ⚠️ Update external bookmarks, webhook redirects, and client URLs |
| **Workspace Architecture** | Standard workspaces editable in Desk | **Persistent Sidebar (`Workspace Sidebar`)**; Standard Workspaces immutable | Back up workspace edits (copy to clipboard) before running `bench migrate` |
| **Permission Hook Contract** | `has_permission` accepted `None` or truthy | **Must explicitly return `True`** | Update custom `has_permission` hooks to return boolean `True` strictly |
| **Permission Function Arguments** | `has_permission(..., raise_exception=True)` | `raise_exception` removed ➔ **`print_logs=True`** | Replace deprecated parameter in custom code |
| **Testing State Flag** | `frappe.flags.in_test` | **`frappe.in_test`** | Replace `frappe.flags.in_test` with `frappe.in_test` |
| **Client JS Scoping (Reports/Pages)** | Loaded into global `window` scope | **Evaluated as IIFE (Sandboxed)** | Explicitly attach to `window.MyModule` if global access is necessary |
| **View-Specific Translations** | `get_translated_dict` hook supported | **Removed**; all translations delivered uniformly | Move view-specific keys to standard CSV translation files |
| **Country Code Validation** | Arbitrary country strings allowed | **Strict ISO 3166 Alpha-2** code enforcement | Ensure `code` field is set with valid 2-letter ISO standard |
| **Decoupled Core Modules** | Bundled in core `frappe` | **Moved to standalone apps** (Energy Points, Newsletter, Backups, Blog) | Install standalone apps via `bench get-app` if features are needed |

---

## 1. 🗄️ Database & ORM Shift: `creation` vs `modified` Default Sorting

### The Breaking Change
Starting with Frappe v16, **all list views, database queries, and ORM reading methods sort records by `creation desc` by default**, rather than `modified desc`.

### Why Frappe Made This Change
1. **Performance & Concurrency**: The `creation` timestamp is immutable. Updating a document modifies `modified`, which causes MySQL/MariaDB and PostgreSQL to constantly update index trees, causing lock contention under high traffic.
2. **Deterministic UI State**: Users navigating list views no longer have rows jump around while background jobs touch documents.
3. **Index Optimization**: If you adopt `creation` as your DocType's primary sort order, Frappe drops the redundant index on `modified`, reducing overall table size.

### Code Comparison: v15 vs v16

```python
# -------------------------------------------------------------
# In Frappe v15:
# -------------------------------------------------------------
# Implicitly executed: SELECT ... ORDER BY `tabTask`.`modified` DESC
tasks = frappe.get_all("Task", fields=["name", "status"])

# -------------------------------------------------------------
# In Frappe v16:
# -------------------------------------------------------------
# Implicitly executes: SELECT ... ORDER BY `tabTask`.`creation` DESC
tasks = frappe.get_all("Task", fields=["name", "status"])

# ⚠️ MIGRATION PATTERN:
# If your business logic strictly requires the most recently updated records,
# you MUST now explicitly supply the order_by parameter:
recently_updated_tasks = frappe.get_all(
    "Task",
    fields=["name", "status"],
    order_by="modified desc"  # Explicitly required in v16!
)
```

### Affected Database Methods
The implicit sort change directly impacts:
* `frappe.get_all(doctype, ...)`
* `frappe.get_list(doctype, ...)`
* `frappe.db.get_value(doctype, filters, ...)` (when filters match multiple rows)
* `frappe.db.get_values(doctype, filters, ...)`
* `frappe.qb.get_query(doctype, ...)`

> [!WARNING]
> **Action Required in Custom Apps**: Audit your codebase for queries that relied on returning the latest modified record without an explicit `order_by="modified desc"`. If you need custom indexing on `modified`, add it in your controller:
> ```python
> def on_doctype_update():
>     frappe.db.add_index("Task", ["modified"])
> ```

---

## 2. 🔒 Transaction Boundaries: `frappe.db.commit()` Banned in Document Hooks

### The Breaking Change
In Frappe v16, calling `frappe.db.commit()` inside document hooks (`doc_events` in `hooks.py`) is **strictly disallowed**.

### Why This Was Enforced
When a document is inserted or saved, Frappe wraps the entire lifecycle chain (`before_insert` ➔ `validate` ➔ `before_save` ➔ `on_update`) inside a single atomic database transaction. 

In v15 and earlier, third-party apps frequently invoked `frappe.db.commit()` inside an `on_update` hook. If a later hook failed or raised an exception, the database was left in a **partially committed, corrupted state** because Frappe's rollback could not revert the committed portion.

### Code Comparison & Migration Solution

```python
# -------------------------------------------------------------
# ❌ V15 ANTI-PATTERN (CRASHES / FORBIDDEN IN V16)
# -------------------------------------------------------------
# apps/my_custom_app/my_custom_app/events.py
def sync_to_external_system(doc, method):
    # Running commit here breaks the host transaction!
    frappe.db.set_value("Task", doc.name, "sync_status", "Sent")
    frappe.db.commit()  # ❌ FORBIDDEN in v16 hooks!


# -------------------------------------------------------------
# ✅ V16 IDIOMATIC PATTERN: DEFER TO BACKGROUND QUEUE
# -------------------------------------------------------------
def sync_to_external_system(doc, method):
    """
    In v16, let the document's host transaction commit naturally.
    Enqueue heavy operations or side-effects to run asynchronously.
    """
    frappe.enqueue(
        "my_custom_app.tasks.async_sync_handler",
        queue="default",
        docname=doc.name,
        now=frappe.flags.in_test  # Immediate execution only during unit tests
    )
```

> [!TIP]
> **Best Practice**: Document hooks should only mutate in-memory document state or write rows participating in the current transaction. Never manually commit transactions inside hooks. Let the web request handler commit upon successful HTTP 200 response.

---

## 3. 🛠️ Methods & Functions: Deprecations, Renames & Replacements

### 1. `frappe.flags.in_test` ➔ `frappe.in_test`

In v15, checking if code was executing within a unit test required accessing the mutable flags dictionary. In v16, this has been promoted to a top-level framework attribute.

```python
# v15 Legacy Syntax
if frappe.flags.in_test:
    pass

# v16 Standard Syntax (Cleaner & Thread-Safe)
if frappe.in_test:
    pass
```

---

### 2. `has_permission` Hook Return Contract

In v15, returning `None` or any non-`False` value from a custom `has_permission` hook could inadvertently grant access. In v16, the engine requires a strict boolean `True` to allow access.

```python
# apps/my_custom_app/my_custom_app/permissions.py

# ❌ v15 Loose Pattern (Fails in v16)
def custom_task_permission(doc, ptype, user):
    if user == "lead@company.com":
        return 1  # Truthy integer - unsafe in v16!

# ✅ v16 Strict Boolean Pattern
def custom_task_permission(doc, ptype, user):
    if user == "lead@company.com":
        return True  # Must return explicit boolean True!
    return False
```

---

### 3. `frappe.permission.has_permission` Parameter Change

The misleading `raise_exception` parameter has been removed. Use `print_logs` to diagnose permission evaluation decisions.

```python
# v15 Legacy:
has_perm = frappe.has_permission("Task", "read", raise_exception=False)

# v16 Modern:
has_perm = frappe.has_permission("Task", "read", print_logs=False)
```

---

### 4. Translation Methods Overhaul

View-specific translations via the `get_translated_dict` hook have been removed. All user interface views now share a single, unified translation cache.

| Deprecated / Removed in v16 | v16 Modern Replacement | Notes |
| :--- | :--- | :--- |
| `get_translated_dict` in `hooks.py` | Standard `.csv` translation files | View-specific isolation removed |
| `frappe.geo.country_info.get_translated_dict` | `frappe.geo.country_info.get_translated_countries()` | Only country names returned |
| `frappe.get_lang_dict()` | `frappe.get_all("Language", ...)` | Legacy dictionary lookup removed |
| `frappe.translate.get_dict()` | Use standard `_("Text to translate")` | Unified translation engine |
| `frappe.translate.get_lang_js()` | Native asset pipeline bundling | Automated by Desk compiler |

---

### 5. Strict Country Code Validation (ISO 3166-1 Alpha-2)

In v16, the **Country** DocType strictly validates the `code` field. Any country record missing a valid 2-letter uppercase ISO code (e.g., `US`, `IN`, `DE`, `GB`) will be rejected by document validation.

```python
# v16 Safe Country Creation
country = frappe.get_doc({
    "doctype": "Country",
    "country_name": "Atlantis",
    "code": "AT"  # Mandatory ISO 3166 Alpha-2 code
})
country.insert()
```

---

## 4. 🌐 Frontend Architecture & Client JavaScript IIFE Scoping

### Sandboxed JavaScript File Execution
In Frappe v15, custom JavaScript files associated with **Reports**, **Pages**, and **Dashboard Charts** were injected into the global document scope. Scripts often accidentally polluted `window` or collided with one another.

In Frappe v16, all Page and Report scripts are loaded inside **Immediately Invoked Function Expressions (IIFEs)**:

```javascript
// How Frappe v16 wraps your custom client script:
(() => {
    // Your Report / Page code runs in an isolated lexical scope
    frappe.query_reports["Monthly Sales"] = {
        filters: [ ... ]
    };
})();
```

### Breaking Change & Migration
If your v15 code declared helper functions or variables in a Report script expecting them to be accessible from other scripts or modal dialogs:

```javascript
// ❌ Fails in v16: Variable is trapped inside IIFE scope!
let formatCustomerTier = function(val) { ... };

// ✅ v16 Safe Pattern: Explicitly attach to window or frappe namespace
window.formatCustomerTier = function(val) { ... };
// OR
frappe.my_custom_app = frappe.my_custom_app || {};
frappe.my_custom_app.formatCustomerTier = function(val) { ... };
```

---

### Persistent Sidebar & Desktop Navigation
* **New Route `/desk`**: The core Desk interface is now accessed via `/desk` rather than `/app`. Any hardcoded links or redirects targeting `/app/` should be updated or routed through `frappe.set_route()`.
* **Workspace Sidebar**: The navigation bar is now governed by the `Workspace Sidebar` DocType. Standard workspaces are locked from in-place Desk modifications.

---

### Horizontal Scrollable Views & Sticky Columns
List Views and Child Tables in v16 now support high-density horizontal scrolling with sticky primary columns:
* **Child Tables**: You can display 10+ columns without crushing table cells; the row index and primary identifier remain pinned to the left while users scroll horizontally.
* **Role-Based Field Masking**: Sensitive fields (such as salaries, tax numbers, and personal tokens) can be masked natively based on User Roles across List, Form, and Report views without writing custom client scripts.

---

## 5. 📦 Decoupled Core Modules (Standalone Apps)

In line with Frappe's architectural vision of keeping the core framework lean, several modules previously bundled inside `frappe` have been extracted into independent repositories:

| Module Extracted | Dedicated Repository | Installation Command |
| :--- | :--- | :--- |
| **Energy Points & Badges** | [`frappe/eps`](https://github.com/frappe/eps) | `bench get-app eps` |
| **Newsletter Management** | [`frappe/newsletter`](https://github.com/frappe/newsletter) | `bench get-app newsletter` |
| **Offsite Cloud Backups** (S3, GDrive, Dropbox) | [`frappe/offsite_backups`](https://github.com/frappe/offsite_backups) | `bench get-app offsite_backups` |
| **Blogging & Website Articles** | [`frappe/blog`](https://github.com/frappe/blog) | `bench get-app blog` |

> [!NOTE]
> If your site relies on Automated Google Drive / Amazon S3 backups, you must run `bench get-app offsite_backups` and `bench --site <site-name> install-app offsite_backups` after migrating to v16.

---

## 6. 🚀 v15 to v16 Developer Migration Checklist

Before migrating an existing bench or custom application to Frappe v16, run through this automated audit checklist:

```python
# bench console script to audit custom app compatibility with v16
import frappe

def audit_v16_readiness(app_name):
    print(f"=== Auditing App: {app_name} for Frappe v16 Compatibility ===")
    
    # 1. Check for manual frappe.db.commit in hook files
    hooks = frappe.get_hooks(app_name=app_name)
    doc_events = hooks.get("doc_events", {})
    if doc_events:
        print(f"⚠️ App contains {len(doc_events)} doc_events. Ensure none invoke frappe.db.commit()!")

    # 2. Check for deprecated get_translated_dict
    if "get_translated_dict" in hooks:
        print("🔴 ERROR: 'get_translated_dict' hook is removed in v16. Migrate translations to CSV files.")
    else:
        print("✅ No deprecated translation hooks found.")

    # 3. Check for default sort order on custom DocTypes
    custom_doctypes = frappe.get_all("DocType", filters={"module": ["like", f"{app_name}%"], "custom": 0}, fields=["name", "sort_field"])
    for dt in custom_doctypes:
        if dt.sort_field == "modified":
            print(f"ℹ️ DocType '{dt.name}' explicitly uses 'modified'. Review if it should migrate to 'creation'.")

    print("=== Audit Complete ===")

# Run audit in bench console:
# audit_v16_readiness("my_custom_app")
```

### Migration Execution Steps
1. **Upgrade System Runtime**:
   ```bash
   # Upgrade Python to 3.14+
   python3 --version  # Must be >= 3.14.0
   
   # Upgrade Node to 24+
   nvm install 24 && nvm use 24
   ```
2. **Back Up Custom Workspaces**: Export or copy any modifications made to standard workspaces in v15 Desk.
3. **Switch Branches & Update**:
   ```bash
   bench switch-to-branch version-16 frappe erpnext --upgrade
   bench update --patch
   ```
4. **Install Decoupled Apps** (if utilized):
   ```bash
   bench get-app offsite_backups
   bench --site <site-name> install-app offsite_backups
   ```

---

## 🔗 Related Chapters & References

* [06. Document API & Lifecycle](/06-documents/)
* [07. Controllers & Events](/07-controllers/)
* [09. Server API Reference](/09-server-api/)
* [10. Database, ORM & Query Builder](/10-database/)
* [29. Documentation Version History](/29-version-history/)
* [Official Frappe v16 Migration Guide (GitHub Wiki)](https://github.com/frappe/frappe/wiki/Migrating-to-version-16)
