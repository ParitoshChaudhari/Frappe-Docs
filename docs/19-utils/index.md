---
title: Utilities Reference (frappe.utils) in Frappe v15
description: Complete function reference for frappe.utils Python helper methods - dates, times, currency formatting, type casting, and string scrubbers.
version: v15
category: Server-Side Python APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge server">Server Only</span> <span class="badge stable">Stable</span> Utilities Reference (`frappe.utils`)

The `frappe.utils` module supplies robust helper utilities for date manipulation, string scrubbing, type conversion, currency formatting, and validation.

---

## 1. Date & Time Utilities

| Function | Signature | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `now()` | `frappe.utils.now()` | `str` | Returns current datetime string (`YYYY-MM-DD HH:mm:ss.uuuuuu`) |
| `today()` | `frappe.utils.today()` | `str` | Returns current date string (`YYYY-MM-DD`) |
| `getdate()` | `getdate(string_date)` | `datetime.date` | Parses string or date into Python `date` object |
| `get_datetime()` | `get_datetime(string_dt)` | `datetime.datetime`| Parses string into Python `datetime` object |
| `add_days()` | `add_days(date, days)` | `str` | Adds or subtracts N days from date |
| `add_months()` | `add_months(date, months)` | `str` | Adds or subtracts N months from date |
| `date_diff()` | `date_diff(d1, d2)` | `int` | Calculates integer day difference (`d1 - d2`) |
| `time_diff_in_seconds()`| `time_diff_in_seconds(t1, t2)` | `float` | Calculates time difference in seconds |

```python
import frappe
from frappe.utils import today, add_days, date_diff, getdate

start_date = today()                       # '2026-08-14'
due_date = add_days(start_date, 30)         # '2026-09-13'
days_remaining = date_diff(due_date, start_date) # 30
```

---

## 2. Client-Side JavaScript Datetime & Utilities (`frappe.datetime` & `frappe.utils`)

In browser scripts, Frappe provides `frappe.datetime` for date calculations and formatting without server calls.

| Function | Description | Example |
| :--- | :--- | :--- |
| `frappe.datetime.get_today()` | Returns current date (`YYYY-MM-DD`) | `let today = frappe.datetime.get_today();` |
| `frappe.datetime.now_datetime()` | Returns current datetime string | `let now = frappe.datetime.now_datetime();` |
| `frappe.datetime.add_days(date, n)` | Adds/subtracts N days from date string | `let due = frappe.datetime.add_days(today, 7);` |
| `frappe.datetime.add_months(date, n)` | Adds/subtracts N months from date string | `let next_month = frappe.datetime.add_months(today, 1);` |
| `frappe.datetime.get_diff(d1, d2)` | Day difference (`d1 - d2`) | `let diff = frappe.datetime.get_diff("2026-12-31", today);` |
| `frappe.datetime.str_to_user(date)` | Converts `YYYY-MM-DD` to user's date format | `let user_fmt = frappe.datetime.str_to_user(today);` |
| `frappe.datetime.pretty_date(date)` | Returns relative time string (e.g. "2 hours ago") | `let ago = frappe.datetime.pretty_date("2026-08-14 10:00:00");` |
| `frappe.utils.comma_and(array)` | Formats array into human string ("A, B and C") | `let txt = frappe.utils.comma_and(["Apple", "Banana", "Orange"]);` |
| `frappe.utils.copy_to_clipboard(val)` | Copies text to system clipboard | `frappe.utils.copy_to_clipboard("Text to copy");` |
| `frappe.utils.sleep(ms)` | Async Promise sleep delay | `await frappe.utils.sleep(1000);` |

---

## 3. Type Conversion & Safe Casting

| Function | Signature | Return Type | Behavior on Failure |
| :--- | :--- | :--- | :--- |
| `cint()` | `cint(val, default=0)` | `int` | Converts `val` to integer; returns `default` if invalid |
| `flt()` | `flt(val, precision=None)` | `float` | Converts `val` to float rounded to optional precision |
| `cstr()` | `cstr(val)` | `str` | Safely casts object or `None` to string (`""` for `None`) |

```python
from frappe.utils import cint, flt, cstr

# Safe type casting without raising ValueError
qty = cint("15")               # 15
amount = flt("125.4567", 2)    # 125.46
text = cstr(None)              # ""
```

---

## 3. Formatting & Text Manipulation

```python
from frappe.utils import fmt_money, money_in_words, scrub, slug, random_string

# 1. Format Monetary Value
formatted_price = fmt_money(1250.50, currency="USD")  # "$ 1,250.50"

# 2. Convert Amount to Words
words = money_in_words(1250.50, "USD")  # "USD One Thousand, Two Hundred Fifty And Fifty Cents Only."

# 3. Scrub string into valid Python variable/field identifier
identifier = scrub("Customer Phone Number!")  # "customer_phone_number"

# 4. Slugify string for URLs
url_slug = slug("Frappe v15 Developer Reference")  # "frappe-v15-developer-reference"

# 5. Generate secure random string
random_key = random_string(16)  # 'a8f9c2d1e4b7019a'
```

---

## 5. Internationalization & Translation (`frappe._`)

Frappe Framework includes built-in multi-language translation support. Strings wrapped in `frappe._()` or `__()` (in JS) are extracted during translation build and mapped to site user session language.

```python
import frappe
from frappe import _

# 1. Simple String Translation
translated_msg = _("Task status has been updated")

# 2. String Formatting with Positional Placeholders
# Note: Always place .format() OUTSIDE of the _() translation wrapper!
formatted_msg = _("Task {0} allocated to {1}").format(doc.name, doc.allocated_to)

# 3. Contextual Translation (Disambiguating identical words with different meanings)
lead_sales = _("Lead", context="Sales")
lead_metal = _("Lead", context="Chemistry")
```

> [!IMPORTANT]
> Never format strings inside the translation call (`_ (f"Task {doc.name}")`)! This prevents the string extractor from discovering static translation keys.

### Translation CSV Files & CLI Commands

- App translations are stored in `apps/<app_name>/<app_name>/translations/<lang_code>.csv` (e.g. `hi.csv`, `de.csv`, `es.csv`).
- CSV Format: `"English Source String","Target Language Translation"`

```bash
# Extract untranslated strings across your application
bench get-untranslated hi apps/my_custom_app/my_custom_app/translations/hi.csv

# Update and sync translation files
bench update-translations hi apps/my_custom_app/my_custom_app/translations/hi.csv
```

---

## Related Topics

- [09. Server API](/09-server-api/)
- [10. Database API](/10-database/)

