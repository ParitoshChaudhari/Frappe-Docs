---
title: Testing & Debugging Framework in Frappe v15
description: Guide to unit testing with FrappeTestCase, bench run-tests, test data fixtures, Error Logs, tracebacks, and debugging techniques.
version: v15
category: Quality, Operations & Best Practices
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Testing & Debugging Framework

Frappe Framework v15 incorporates a built-in automated testing environment backed by `unittest` and `FrappeTestCase` featuring automatic database transaction rollback per test method.

---

## 1. Writing Unit Tests (`FrappeTestCase`)

Create test modules inside your app: `my_custom_app/my_module/doctype/custom_task/test_custom_task.py`.

```python
import frappe
from frappe.tests.utils import FrappeTestCase

class TestCustomTask(FrappeTestCase):
    def setUp(self):
        """Executes prior to each test method execution."""
        self.task = frappe.get_doc({
            "doctype": "Custom Task",
            "subject": "Unit Test Task",
            "priority": "Medium",
            "status": "Open"
        }).insert()

    def tearDown(self):
        """FrappeTestCase automatically rolls back DB transactions after each test!"""
        pass

    def test_task_creation(self):
        self.assertTrue(self.task.name.startswith("TASK-"))
        self.assertEqual(self.task.status, "Open")

    def test_invalid_date_validation(self):
        self.task.start_date = "2026-09-01"
        self.task.end_date = "2026-08-01"  # Invalid end date prior to start date
        
        # Verify validation error exception is raised
        self.assertRaises(frappe.ValidationError, self.task.save)
```

---

## 2. Running Automated Tests via Bench

```bash
# 1. Run all tests for your custom app
bench --site site1.localhost run-tests --app my_custom_app

# 2. Run specific test module
bench --site site1.localhost run-tests --module my_custom_app.my_module.doctype.custom_task.test_custom_task

# 3. Run specific test method
bench --site site1.localhost run-tests --module my_custom_app.my_module.doctype.custom_task.test_custom_task --test test_invalid_date_validation
```

---

## 3. Server-Side Debugging & Logging Techniques

### Interactive Debugging (`pdb` / `breakpoint()`)

Insert `breakpoint()` directly inside controller Python functions:

```python
def validate(self):
    breakpoint()  # Opens interactive Python PDB shell in terminal running Gunicorn/Bench
    if self.priority == "High":
        pass
```

---

### Diagnostic Error Logging (`frappe.log_error`)

Inspect error tracebacks in Desk under **Error Log** list view:

```python
import frappe

try:
    process_third_party_payment()
except Exception as e:
    frappe.log_error(
        title="Payment Gateway Sync Error",
        message=frappe.get_traceback()
    )
```

---

## Related Topics

- [03. Bench CLI Reference](/03-bench-cli/)
- [09. Server API](/09-server-api/)
