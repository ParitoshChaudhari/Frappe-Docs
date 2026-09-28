---
title: Utilities Reference (Python & JavaScript) in Frappe v15
description: Complete function reference for frappe.utils Python helper methods (formatdate, dates, numbers, strings) and client-side frappe.datetime, frappe.format, and frappe.utils in Frappe v15.
version: v15
category: Server-Side Python APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge both">Both (Server & Client)</span> <span class="badge stable">Stable</span> Utilities Reference (`frappe.utils` & `frappe.datetime`)

Frappe Framework v15 provides an extensive library of helper utilities across both the Python server runtime (`frappe.utils`) and browser client scripts (`frappe.datetime`, `frappe.format`, and `frappe.utils`).

---

## 1. Python Date & Time Utilities (`frappe.utils`)

### Where to Import

```python
from frappe.utils import (
    formatdate,
    format_time,
    format_datetime,
    getdate,
    get_datetime,
    get_time,
    get_timedelta,
    now,
    nowdate,
    today,
    nowtime,
    now_datetime,
    add_to_date,
    add_days,
    add_months,
    add_years,
    date_diff,
    month_diff,
    time_diff_in_seconds,
    pretty_date,
    get_first_day,
    get_last_day,
    get_year_start,
    get_year_ending,
    is_last_day_of_the_month,
)
```

### Complete Date/Time Method Matrix

| Function | Signature | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `formatdate()` | `formatdate(string_date=None, format_string=None)` | `str` | Formats date string or object to user's localized date format (e.g., `dd-mm-yyyy`, `mm/dd/yyyy`) or specified pattern. |
| `format_time()` | `format_time(string_time=None, format_string=None)` | `str` | Formats time string or object into user localized time string (`HH:mm:ss`). |
| `format_datetime()` | `format_datetime(datetime_string=None, format_string=None)` | `str` | Formats ISO datetime string to user-configured datetime display format. |
| `getdate()` | `getdate(string_date=None)` | `datetime.date` | Parses date string, datetime, or date into a Python `datetime.date` object. |
| `get_datetime()` | `get_datetime(string_dt=None)` | `datetime.datetime` | Parses string or datetime into a Python `datetime.datetime` object. |
| `get_time()` | `get_time(string_time=None)` | `datetime.time` | Parses time string (e.g. `'14:30:00'`) into Python `datetime.time`. |
| `get_timedelta()` | `get_timedelta(time_str=None)` | `datetime.timedelta` | Parses time string or interval into Python `datetime.timedelta`. |
| `now()` | `now()` | `str` | Returns current datetime string (`YYYY-MM-DD HH:mm:ss.uuuuuu`). |
| `nowdate()` / `today()` | `nowdate()` or `today()` | `str` | Returns current system date string (`YYYY-MM-DD`). |
| `nowtime()` | `nowtime()` | `str` | Returns current time string (`HH:mm:ss.uuuuuu`). |
| `now_datetime()` | `now_datetime()` | `datetime.datetime` | Returns current local datetime as Python `datetime.datetime` object. |
| `add_to_date()` | `add_to_date(date, years=0, months=0, weeks=0, days=0, hours=0, minutes=0, seconds=0)` | `datetime.datetime` / `str` | Versatile datetime addition and subtraction utility. |
| `add_days()` | `add_days(date, days)` | `str` | Adds or subtracts N days from date string (`YYYY-MM-DD`). |
| `add_months()` | `add_months(date, months)` | `str` | Adds or subtracts N calendar months from date string. |
| `add_years()` | `add_years(date, years)` | `str` | Adds or subtracts N calendar years from date string. |
| `date_diff()` | `date_diff(d1, d2)` | `int` | Computes integer day difference between two dates (`d1 - d2`). |
| `month_diff()` | `month_diff(d1, d2)` | `int` | Computes difference in months between two dates. |
| `time_diff_in_seconds()`| `time_diff_in_seconds(t1, t2)` | `float` | Computes difference between two datetimes or times in seconds. |
| `pretty_date()` | `pretty_date(iso_datetime)` | `str` | Converts datetime into relative human-friendly string (e.g., `"2 hours ago"`, `"in 3 days"`). |
| `get_first_day()` | `get_first_day(date)` | `str` | Returns first date of the given month (`YYYY-MM-01`). |
| `get_last_day()` | `get_last_day(date)` | `str` | Returns last date of the given month (`YYYY-MM-28/30/31`). |
| `get_year_start()` | `get_year_start(date)` | `str` | Returns first date of the calendar or fiscal year (`YYYY-01-01`). |
| `get_year_ending()` | `get_year_ending(date)` | `str` | Returns ending date of the year (`YYYY-12-31`). |
| `is_last_day_of_the_month()` | `is_last_day_of_the_month(date)` | `bool` | Checks if the given date is the final day of its month. |

### Python Date/Time Code Examples

```python
import frappe
from frappe.utils import (
    formatdate,
    format_time,
    format_datetime,
    today,
    add_days,
    add_months,
    add_to_date,
    date_diff,
    getdate,
    get_datetime,
    pretty_date,
    get_first_day,
    get_last_day,
    is_last_day_of_the_month
)

# 1. Date formatting according to system / user preferences
current_date = today()                             # '2026-09-28'
user_formatted = formatdate(current_date)          # '28-09-2026' (or user's date format)
custom_pattern = formatdate(current_date, "dd MMM yyyy") # '28 Sep 2026'

# 2. Datetime and Time formatting
formatted_time = format_time("14:35:00")           # '02:35 PM' or '14:35:00'
formatted_dt = format_datetime("2026-09-28 14:35:00") # '28-09-2026 14:35:00'

# 3. Arithmetic with intervals
start = today()
due_date = add_days(start, 30)                     # '2026-10-28'
quarter_later = add_months(start, 3)               # '2026-12-28'
future_time = add_to_date(start, days=15, hours=4)

# 4. Difference calculation
days_left = date_diff(due_date, start)             # 30

# 5. Relative human time
relative = pretty_date("2026-09-28 10:00:00")     # '2 hours ago'

# 6. Month boundary lookups
month_start = get_first_day("2026-09-28")          # '2026-09-01'
month_end = get_last_day("2026-09-28")             # '2026-09-30'
is_end = is_last_day_of_the_month("2026-09-30")    # True
```

---

## 2. Python Type Conversion & Safe Casting (`frappe.utils`)

Safely cast inputs without triggering unhandled `ValueError` or `TypeError` exceptions:

| Function | Signature | Return Type | Description & Behavior |
| :--- | :--- | :--- | :--- |
| `cint()` | `cint(val, default=0)` | `int` | Converts `val` to integer; returns `default` if invalid or `None`. |
| `flt()` | `flt(val, precision=None)` | `float` | Converts `val` to float; rounds to `precision` decimals if specified. |
| `cstr()` | `cstr(val)` | `str` | Safely casts object to string; converts `None` to empty string `""`. |
| `sbool()` | `sbool(val)` | `bool` | Converts string (`"true"`, `"1"`, `"yes"`, `"y"`) to `True`, otherwise `False`. |
| `rounded()` | `rounded(val, precision=2)` | `float` | Safely rounds float to specified precision using standard rounding rules. |
| `parse_val()` | `parse_val(val)` | `Any` | Autodetects and casts string to int, float, date, or datetime object. |

```python
from frappe.utils import cint, flt, cstr, sbool, rounded, parse_val

# Safe conversion without throwing ValueError
qty = cint("45")               # 45
invalid_qty = cint("abc", 1)   # 1 (fallback default)

rate = flt("125.4567", 2)      # 125.46
blank_rate = flt(None)         # 0.0

text = cstr(None)              # ""
number_text = cstr(123)        # "123"

is_active = sbool("true")      # True
is_enabled = sbool("0")        # False

rounded_amt = rounded(10.555, 2) # 10.56
parsed_int = parse_val("100")    # 100 (type int)
```

---

## 3. Python Currency & Number Formatting (`frappe.utils`)

| Function | Signature | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `fmt_money()` | `fmt_money(amount, precision=None, currency=None)` | `str` | Formats numeric value with commas and currency symbol. |
| `money_in_words()` | `money_in_words(amount, currency=None, main_currency=None, fraction_currency=None)` | `str` | Converts currency amount to spoken formal English words. |
| `in_words()` | `in_words(amount, integer_only=False)` | `str` | Converts plain numeric integer/float into English words. |

```python
from frappe.utils import fmt_money, money_in_words, in_words

# 1. Format Currency with Symbol and Commas
formatted_usd = fmt_money(1250000.50, currency="USD")
# Result: "$ 1,250,000.50"

formatted_inr = fmt_money(55000.75, currency="INR")
# Result: "₹ 55,000.75"

# 2. Amount in Words
words = money_in_words(1250.50, "USD")
# Result: "USD One Thousand, Two Hundred Fifty And Fifty Cents Only."

# 3. Plain Number in Words
plain_words = in_words(450)
# Result: "Four Hundred Fifty"
```

---

## 4. Python String, HTML, Identifier & Markdown Utilities (`frappe.utils`)

| Function | Signature | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `strip_html()` | `strip_html(text)` | `str` | Strips all HTML/XML tags from string, leaving raw text. |
| `clean_whitespace()` | `clean_whitespace(text)` | `str` | Collapses consecutive whitespace, tabs, and newlines into single spaces. |
| `scrub()` | `scrub(text)` | `str` | Converts string into valid Python variable/field identifier (`"Item Name!" -> "item_name"`). |
| `slug()` | `slug(text)` | `str` | Converts string to URL-safe hyphenated slug (`"My Post!" -> "my-post"`). |
| `random_string()` | `random_string(length=16)` | `str` | Generates cryptographically secure alphanumeric random string. |
| `get_abbr()` | `get_abbr(string, max_len=2)` | `str` | Generates uppercase acronym from string (`"Quality Inspection" -> "QI"`). |
| `markdown()` | `markdown(text)` | `str` | Converts Markdown text into sanitized HTML markup. |
| `escape_html()` | `escape_html(text)` | `str` | Escapes special HTML characters (`&`, `<`, `>`, `"`, `'`). |

```python
from frappe.utils import (
    strip_html,
    clean_whitespace,
    scrub,
    slug,
    random_string,
    get_abbr,
    markdown,
    escape_html
)

# 1. Strip HTML tags from Rich Text fields
clean_text = strip_html("<p>Hello <b>World</b>!</p>") # "Hello World!"

# 2. Clean messy user whitespace
clean = clean_whitespace("  Task    Name \n\n with tabs\t ") # "Task Name with tabs"

# 3. Scrub identifiers for dynamic DocFields
field_id = scrub("Customer Phone Number!") # "customer_phone_number"

# 4. Generate URL slug
blog_slug = slug("Frappe Framework v15 Release Notes") # "frappe-framework-v15-release-notes"

# 5. Cryptographic token / random key
token = random_string(32) # '4a7b9e1c2d3f4a5b6c7d8e9f0a1b2c3d'

# 6. DocType abbreviation
abbr = get_abbr("Sales Invoice") # "SI"

# 7. Convert Markdown to HTML
html_output = markdown("### Heading\n- Item 1\n- Item 2")
```

---

## 5. Python Validation, URL & Path Utilities (`frappe.utils`)

| Function | Signature | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `validate_email_address()` | `validate_email_address(email, throw=False)` | `str` / `None` | Validates single email address format. Throws exception if `throw=True`. |
| `split_emails()` | `split_emails(txt)` | `list[str]` | Splits comma/semicolon/newline string into list of clean email strings. |
| `validate_url()` | `validate_url(val, throw=False)` | `bool` | Validates web URL structure. |
| `get_url()` | `get_url(path=None)` | `str` | Returns absolute canonical site URL with optional path appended. |
| `get_url_to_form()` | `get_url_to_form(doctype, name)` | `str` | Returns direct Desk link to document form view. |
| `get_url_to_list()` | `get_url_to_list(doctype)` | `str` | Returns direct Desk link to DocType list view. |
| `get_site_path()` | `get_site_path(*path)` | `str` | Returns absolute filesystem path within active site directory. |
| `get_files_path()` | `get_files_path(*path)` | `str` | Returns absolute filesystem path to `sites/<site>/public/files`. |
| `get_bench_path()` | `get_bench_path()` | `str` | Returns absolute filesystem path to the bench root folder. |

```python
from frappe.utils import (
    validate_email_address,
    split_emails,
    validate_url,
    get_url,
    get_url_to_form,
    get_files_path,
    get_site_path
)

# 1. Email validation
valid_email = validate_email_address("user@example.com", throw=True)

# 2. Multi-email parser
recipients = split_emails("one@test.com, two@test.com; three@test.com\nfour@test.com")
# Returns: ['one@test.com', 'two@test.com', 'three@test.com', 'four@test.com']

# 3. Desk URL generators
site_link = get_url("/api/method/ping")
doc_link = get_url_to_form("Sales Order", "SO-2026-0001")
# Returns: "https://mysite.local/app/sales-order/SO-2026-0001"

# 4. Filesystem path resolvers
attachment_path = get_files_path("invoices", "INV-001.pdf")
site_config_path = get_site_path("site_config.json")
```

---

## 6. Python Data Structure, Collection & JSON Helpers (`frappe.utils`)

| Function | Signature | Return Type | Description |
| :--- | :--- | :--- | :--- |
| `safe_json_loads()` | `safe_json_loads(data, default=None)` | `dict` / `list` / `default` | Safely parses JSON string without raising `JSONDecodeError`. |
| `unique()` | `unique(seq)` | `list` | Removes duplicates from list while preserving original insertion order. |
| `dictify()` | `dictify(obj)` | `frappe._dict` | Converts dictionary to `frappe._dict` allowing dot-notation key access. |

```python
from frappe.utils import safe_json_loads, unique, dictify

# 1. Safe JSON loading
data = safe_json_loads('{"status": "success"}', default={})
# Returns: {'status': 'success'}

invalid = safe_json_loads('bad-json-string', default=[])
# Returns: [] (no exception thrown)

# 2. Deduplication preserving order
items = ["apple", "banana", "apple", "orange", "banana"]
deduped = unique(items)
# Returns: ['apple', 'banana', 'orange']

# 3. Dot-access dictionary
user_info = dictify({"name": "Administrator", "email": "admin@example.com"})
print(user_info.name)  # "Administrator" (instead of user_info["name"])
```

---

## 7. Client-Side JavaScript Datetime Utilities (`frappe.datetime`)

In client scripts and Desk form scripts, `frappe.datetime` provides client-side date manipulation without triggering server round-trips:

| Function | Return Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `frappe.datetime.get_today()` | `string` | Returns current system date (`YYYY-MM-DD`). | `let today = frappe.datetime.get_today();` |
| `frappe.datetime.now_date()` | `string` | Alias returning current date (`YYYY-MM-DD`). | `let d = frappe.datetime.now_date();` |
| `frappe.datetime.now_time()` | `string` | Returns current local time (`HH:mm:ss`). | `let t = frappe.datetime.now_time();` |
| `frappe.datetime.now_datetime()` | `string` | Returns current datetime (`YYYY-MM-DD HH:mm:ss`). | `let dt = frappe.datetime.now_datetime();` |
| `frappe.datetime.str_to_user(date)` | `string` | Converts `YYYY-MM-DD` to user's localized date format (`DD-MM-YYYY`). | `let display = frappe.datetime.str_to_user("2026-09-28");` |
| `frappe.datetime.user_to_str(date)` | `string` | Converts localized display string back to database `YYYY-MM-DD`. | `let db_str = frappe.datetime.user_to_str("28-09-2026");` |
| `frappe.datetime.str_to_obj(str)` | `Date` / `moment` | Parses date string into Date/Moment object. | `let obj = frappe.datetime.str_to_obj("2026-09-28");` |
| `frappe.datetime.obj_to_str(obj)` | `string` | Formats Date object into `YYYY-MM-DD`. | `let str = frappe.datetime.obj_to_str(new Date());` |
| `frappe.datetime.obj_to_user(obj)` | `string` | Formats Date object into user's display format. | `let user_str = frappe.datetime.obj_to_user(new Date());` |
| `frappe.datetime.add_days(date, n)` | `string` | Adds or subtracts N days from date string. | `let next_week = frappe.datetime.add_days(today, 7);` |
| `frappe.datetime.add_months(date, n)`| `string` | Adds or subtracts N months from date string. | `let next_month = frappe.datetime.add_months(today, 1);` |
| `frappe.datetime.get_diff(d1, d2)` | `number` | Calculates integer day difference (`d1 - d2`). | `let diff = frappe.datetime.get_diff(due, today);` |
| `frappe.datetime.pretty_date(date)` | `string` | Returns human relative string (e.g. `"2 hours ago"`). | `let rel = frappe.datetime.pretty_date(frm.doc.creation);` |
| `frappe.datetime.validate(str)` | `boolean` | Validates if date string matches expected format. | `let ok = frappe.datetime.validate("2026-09-28");` |
| `frappe.datetime.get_datetime_as_string(d)` | `string` | Formats date object to full datetime string. | `let s = frappe.datetime.get_datetime_as_string(new Date());` |

```javascript
frappe.ui.form.on("Sales Order", {
    delivery_date(frm) {
        let today = frappe.datetime.get_today();
        let delivery = frm.doc.delivery_date;

        // Check if delivery date is in the past
        if (delivery && frappe.datetime.get_diff(delivery, today) < 0) {
            frappe.msgprint(__("Delivery Date cannot be before today"));
            frm.set_value("delivery_date", frappe.datetime.add_days(today, 1));
        }

        // Show localized date string in alert
        let localized = frappe.datetime.str_to_user(frm.doc.delivery_date);
        frappe.show_alert({
            message: __("Scheduled for {0}", [localized]),
            indicator: "green"
        });
    }
});
```

---

## 8. Client-Side Universal Field Formatter (`frappe.format`)

`frappe.format` is the universal client-side renderer that converts raw database values into formatted UI representations based on DocField definitions or field options.

### Signature

```javascript
frappe.format(value, df, options, doc)
```

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `value` | `any` | Raw database value to format. |
| `df` | `object` | DocField schema dictionary or mock field definition (`{ fieldtype: "Currency", options: "currency" }`). |
| `options` | `object` | Optional overrides (e.g., `{ only_value: true }`). |
| `doc` | `object` | Parent document instance (used for contextual currency or link resolution). |

### Client-Side Formatting Examples

```javascript
// 1. Format Currency
let formatted_price = frappe.format(1250000.50, {
    fieldtype: "Currency",
    options: "USD"
});
// Result: "$ 1,250,000.50"

// 2. Format Date
let formatted_date = frappe.format("2026-09-28", {
    fieldtype: "Date"
});
// Result: "28-09-2026" (based on user settings)

// 3. Format Percent
let formatted_pct = frappe.format(85.65, {
    fieldtype: "Percent"
});
// Result: "85.65%"

// 4. Format Datetime
let formatted_dt = frappe.format("2026-09-28 14:30:00", {
    fieldtype: "Datetime"
});
// Result: "28-09-2026 14:30:00"

// 5. Format Indicator Pill / Rating
let stars = frappe.format(4, { fieldtype: "Rating" });
```

---

## 9. Client-Side General Utilities (`frappe.utils`)

| Function | Signature | Description | Example |
| :--- | :--- | :--- | :--- |
| `copy_to_clipboard()` | `frappe.utils.copy_to_clipboard(val)` | Copies string to OS clipboard and displays toast. | `frappe.utils.copy_to_clipboard("INV-001");` |
| `get_url()` | `frappe.utils.get_url(path)` | Resolves path against site base URL. | `let link = frappe.utils.get_url("/app");` |
| `get_form_link()` | `frappe.utils.get_form_link(doctype, name, html)` | Generates clickable HTML anchor link to document form. | `let a = frappe.utils.get_form_link("Customer", "Acme");` |
| `comma_and()` | `frappe.utils.comma_and(array)` | Formats array to `"A, B and C"`. | `frappe.utils.comma_and(["Red", "Green", "Blue"]);` |
| `comma_or()` | `frappe.utils.comma_or(array)` | Formats array to `"A, B or C"`. | `frappe.utils.comma_or(["Apple", "Orange"]);` |
| `escape_html()` | `frappe.utils.escape_html(html)` | Escapes HTML entities to prevent XSS. | `let safe = frappe.utils.escape_html("<script>");` |
| `unescape_html()` | `frappe.utils.unescape_html(html)` | Decodes escaped HTML entity strings. | `let raw = frappe.utils.unescape_html("&amp;");` |
| `filter_dict()` | `frappe.utils.filter_dict(list, dict)` | Filters array of objects by matching properties. | `let open = frappe.utils.filter_dict(items, { status: "Open" });` |
| `sleep()` | `frappe.utils.sleep(ms)` | Async Promise sleep delay. | `await frappe.utils.sleep(1000);` |
| `play_sound()` | `frappe.utils.play_sound(name)` | Plays Desk audio notification (`"submit"`, `"delete"`, `"alert"`). | `frappe.utils.play_sound("submit");` |
| `is_empty()` | `frappe.utils.is_empty(val)` | Returns `true` if null, undefined, empty array, or empty string. | `if (frappe.utils.is_empty(frm.doc.items)) ...` |
| `to_title_case()` | `frappe.utils.to_title_case(str)` | Capitalizes first letter of each word in string. | `frappe.utils.to_title_case("hello world");` |
| `icon()` | `frappe.utils.icon(name, size, class)` | Generates SVG markup for standard Frappe icons. | `let svg = frappe.utils.icon("lock", "sm");` |

```javascript
frappe.ui.form.on("Task", {
    async refresh(frm) {
        // 1. Add copy ID action button
        frm.add_custom_button(__("Copy Task ID"), () => {
            frappe.utils.copy_to_clipboard(frm.doc.name);
        });

        // 2. Play sound on specific conditions
        if (frm.doc.status === "Completed") {
            frappe.utils.play_sound("submit");
        }

        // 3. Filter child rows
        let pending_items = frappe.utils.filter_dict(frm.doc.items || [], { completed: 0 });
        console.log("Pending items count:", pending_items.length);
    }
});
```

---

## 10. Internationalization & Translation (`frappe._` & `__()`)

Frappe Framework includes built-in multi-language translation support. Strings wrapped in `frappe._()` (Python) or `__()` / `frappe._()` (JavaScript) are extracted during translation build and mapped to the active site user session language.

### Python Backend Translation (`frappe._`)

```python
import frappe
from frappe import _

# 1. Simple Translation
msg = _("Task status has been updated")

# 2. Translation with Positional Placeholders
# Note: Always place .format() OUTSIDE of the _() translation wrapper!
msg_formatted = _("Task {0} allocated to {1}").format(doc.name, doc.allocated_to)

# 3. Contextual Translation (Disambiguating identical words with different meanings)
lead_sales = _("Lead", context="Sales")
lead_metal = _("Lead", context="Chemistry")
```

> [!IMPORTANT]
> Never format strings inside the translation call (`_(f"Task {doc.name}")`)! This prevents the string extractor from discovering static translation keys.

### Client-Side JavaScript Translation (`__()`)

```javascript
// 1. Simple string translation
frappe.msgprint(__("Operation completed successfully"));

// 2. String with replacement tokens
frappe.show_alert({
    message: __("Document {0} saved", [frm.doc.name]),
    indicator: "green"
});
```

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
- [11. Client API](/11-client-api/)
- [14. Authentication & Permissions](/14-authentication-permissions/)
- [17. Web Pages, Jinja & Print Formats](/17-web-jinja-print-reports/)
- [24. Searchable API Index](/24-api-index/)
