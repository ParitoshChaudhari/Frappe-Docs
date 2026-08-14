---
title: Frappe ORM & Query Builder Masterclass
description: Comprehensive deep-dive documentation for Frappe Framework v15 ORM, Database APIs, PyPika Query Builder (frappe.qb), Joins, Aggregations, Set Operations, Subqueries, and Data Manipulation with sample tables, Python code, SQL translations, and exact outputs.
version: v15
category: Server-Side Python APIs & ORM
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge server">Server Only</span> <span class="badge stable">Stable</span> Frappe ORM & Query Builder Masterclass

Frappe Framework v15 provides a powerful, multi-layered Database & ORM system. Developers can interact with the database using high-level Document APIs (`frappe.get_doc`), high-performance DB methods (`frappe.db.get_all`, `frappe.db.get_value`), or the programmatic, type-safe **PyPika Query Builder** (`frappe.qb`).

This masterclass provides an end-to-end, in-depth guide covering every aspect of Frappe ORM querying. Each example contains:
1. **Sample Table Schemas & Mock Data**
2. **Frappe Python Code**
3. **Generated SQL Equivalent**
4. **Exact Output Returned**

---

## 📊 Sample Database Tables & Mock Data

Throughout this documentation, we will execute queries against the following 4 interrelated sample tables:

### Table 1: `tabCustomer`
| `name` | `customer_name` | `customer_group` | `territory` | `credit_limit` | `disabled` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `CUST-001` | Acme Corp | Commercial | United States | 50000.00 | `0` |
| `CUST-002` | Globex Inc | Enterprise | United States | 120000.00 | `0` |
| `CUST-003` | Stark Industries | Enterprise | Europe | 250000.00 | `0` |
| `CUST-004` | Umbrella Corp | Government | Asia | 15000.00 | `1` |
| `CUST-005` | Cyberdyne Systems | Commercial | Europe | 80000.00 | `0` |

### Table 2: `tabSales Order`
| `name` | `customer` | `posting_date` | `status` | `grand_total` | `total_qty` | `docstatus` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SO-2026-001` | `CUST-001` | `2026-01-15` | Submitted | 15000.00 | 10 | `1` |
| `SO-2026-002` | `CUST-001` | `2026-02-01` | Draft | 4500.00 | 3 | `0` |
| `SO-2026-003` | `CUST-002` | `2026-02-10` | Submitted | 85000.00 | 50 | `1` |
| `SO-2026-004` | `CUST-003` | `2026-02-12` | Cancelled | 12000.00 | 8 | `2` |
| `SO-2026-005` | `CUST-002` | `2026-02-14` | Submitted | 32000.00 | 20 | `1` |

### Table 3: `tabSales Order Item`
| `name` | `parent` | `item_code` | `item_name` | `qty` | `rate` | `amount` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SOI-0001` | `SO-2026-001` | `ITEM-LAPTOP` | Pro Laptop v15 | 5 | 2000.00 | 10000.00 |
| `SOI-0002` | `SO-2026-001` | `ITEM-MONITOR` | 4K Display 32" | 5 | 1000.00 | 5000.00 |
| `SOI-0003` | `SO-2026-002` | `ITEM-MONITOR` | 4K Display 32" | 3 | 1500.00 | 4500.00 |
| `SOI-0004` | `SO-2026-003` | `ITEM-SERVER` | Rack Server X1 | 50 | 1700.00 | 85000.00 |

### Table 4: `tabSupplier`
| `name` | `supplier_name` | `supplier_group` | `country` | `disabled` |
| :--- | :--- | :--- | :--- | :--- |
| `SUPP-001` | TechSupply Co | Hardware | United States | `0` |
| `SUPP-002` | ChipMaker Ltd | Components | Europe | `0` |
| `SUPP-003` | Globex Inc | Logistics | United States | `0` |

---

## 🔹 Part 1: Selection, Filtering & Pagination (`SELECT`, `WHERE`, `LIMIT`, `OFFSET`, `ORDER BY`, `DISTINCT`)

### 1.1 Field Selection & Basic Filtering (`SELECT` & `WHERE`)

Extract specific fields with conditions using `frappe.qb` or `frappe.get_all`.

```python
import frappe
from frappe.query_builder import DocType

Customer = DocType("Customer")

# Query Builder syntax
query = (
    frappe.qb.from_(Customer)
    .select(Customer.name, Customer.customer_name, Customer.credit_limit)
    .where((Customer.territory == "United States") & (Customer.disabled == 0))
)

result = query.run(as_dict=True)
print(result)
```

**Generated SQL:**
```sql
SELECT `name`, `customer_name`, `credit_limit`
FROM `tabCustomer`
WHERE `territory` = 'United States' AND `disabled` = 0
```

**Output:**
```python
[
    {"name": "CUST-001", "customer_name": "Acme Corp", "credit_limit": 50000.0},
    {"name": "CUST-002", "customer_name": "Globex Inc", "credit_limit": 120000.0}
]
```

---

### 1.2 Multi-Condition Logical Filtering (`AND`, `OR`, `NOT`, `IS IN`, `LIKE`, `BETWEEN`)

Frappe ORM supports complex boolean expressions:
- `&` represents SQL `AND`
- `|` represents SQL `OR`
- `~` represents SQL `NOT`
- `.isin([...])` represents SQL `IN (...)`
- `.like("%val%")` represents SQL `LIKE`
- `.between(a, b)` represents SQL `BETWEEN a AND b`

```python
import frappe
from frappe.query_builder import DocType

Customer = DocType("Customer")

query = (
    frappe.qb.from_(Customer)
    .select(Customer.name, Customer.customer_name, Customer.customer_group, Customer.credit_limit)
    .where(
        (Customer.customer_group.isin(["Commercial", "Enterprise"])) &
        ((Customer.credit_limit.between(50000, 200000)) | (Customer.customer_name.like("%Corp%"))) &
        ~(Customer.disabled == 1)
    )
)

result = query.run(as_dict=True)
```

**Generated SQL:**
```sql
SELECT `name`, `customer_name`, `customer_group`, `credit_limit`
FROM `tabCustomer`
WHERE `customer_group` IN ('Commercial', 'Enterprise')
  AND (`credit_limit` BETWEEN 50000 AND 200000 OR `customer_name` LIKE '%Corp%')
  AND NOT (`disabled` = 1)
```

**Output:**
```python
[
    {"name": "CUST-001", "customer_name": "Acme Corp", "customer_group": "Commercial", "credit_limit": 50000.0},
    {"name": "CUST-002", "customer_name": "Globex Inc", "customer_group": "Enterprise", "credit_limit": 120000.0}
]
```

---

### 1.3 Sorting, Pagination & Distinct Records (`ORDER BY`, `LIMIT`, `OFFSET`, `DISTINCT`)

```python
import frappe
from frappe.query_builder import DocType, Order

SalesOrder = DocType("Sales Order")

# Fetch unique statuses sorted by grand_total descending, offset by 0, limit 2
query = (
    frappe.qb.from_(SalesOrder)
    .select(SalesOrder.status, SalesOrder.grand_total)
    .distinct()
    .where(SalesOrder.docstatus != 2)
    .orderby(SalesOrder.grand_total, order=Order.desc)
    .limit(2)
    .offset(0)
)

result = query.run(as_dict=True)
```

**Generated SQL:**
```sql
SELECT DISTINCT `status`, `grand_total`
FROM `tabSales Order`
WHERE `docstatus` != 2
ORDER BY `grand_total` DESC
LIMIT 2 OFFSET 0
```

**Output:**
```python
[
    {"status": "Submitted", "grand_total": 85000.0},
    {"status": "Submitted", "grand_total": 32000.0}
]
```

---

### 1.4 High-Performance Helper APIs (`frappe.db.get_value`, `exists`, `count`)

When you do not need the full `frappe.qb` syntax, Frappe provides built-in shortcuts under `frappe.db`:

```python
# 1. Fetch single scalar value
credit = frappe.db.get_value("Customer", "CUST-001", "credit_limit")
# Output: 50000.00

# 2. Fetch multiple columns as dictionary
customer_info = frappe.db.get_value(
    "Customer",
    {"name": "CUST-001"},
    ["customer_name", "territory", "credit_limit"],
    as_dict=True
)
# Output: {'customer_name': 'Acme Corp', 'territory': 'United States', 'credit_limit': 50000.0}

# 3. Check record existence
exists = frappe.db.exists("Customer", {"customer_name": "Acme Corp"})
# Output: 'CUST-001'

# 4. Count matching rows
active_customer_count = frappe.db.count("Customer", filters={"disabled": 0})
# Output: 4
```

---

## 🔹 Part 2: Grouping, Aggregations & Set Operations (`GROUP BY`, `HAVING`, Aggregations, `UNION`, `INTERSECT`)

### 2.1 Aggregations (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) & `GROUP BY`

Summarize transactional data per entity using PyPika functions imported from `frappe.query_builder.functions`.

```python
import frappe
from frappe.query_builder import DocType
from frappe.query_builder.functions import Count, Sum, Avg, Max, Min

SalesOrder = DocType("Sales Order")

query = (
    frappe.qb.from_(SalesOrder)
    .select(
        SalesOrder.customer,
        Count(SalesOrder.name).as_("total_orders"),
        Sum(SalesOrder.grand_total).as_("total_spent"),
        Avg(SalesOrder.grand_total).as_("avg_order_value"),
        Max(SalesOrder.grand_total).as_("max_order"),
        Min(SalesOrder.grand_total).as_("min_order")
    )
    .where(SalesOrder.docstatus == 1)
    .groupby(SalesOrder.customer)
)

result = query.run(as_dict=True)
```

**Generated SQL:**
```sql
SELECT `customer`,
       COUNT(`name`) AS `total_orders`,
       SUM(`grand_total`) AS `total_spent`,
       AVG(`grand_total`) AS `avg_order_value`,
       MAX(`grand_total`) AS `max_order`,
       MIN(`grand_total`) AS `min_order`
FROM `tabSales Order`
WHERE `docstatus` = 1
GROUP BY `customer`
```

**Output:**
```python
[
    {
        "customer": "CUST-001",
        "total_orders": 1,
        "total_spent": 15000.0,
        "avg_order_value": 15000.0,
        "max_order": 15000.0,
        "min_order": 15000.0
    },
    {
        "customer": "CUST-002",
        "total_orders": 2,
        "total_spent": 117000.0,
        "avg_order_value": 58500.0,
        "max_order": 85000.0,
        "min_order": 32000.0
    }
]
```

---

### 2.2 Filtering Aggregated Groups (`HAVING`)

Use `.having(...)` to apply conditions to aggregated results after `GROUP BY`.

```python
import frappe
from frappe.query_builder import DocType
from frappe.query_builder.functions import Sum, Count

SalesOrder = DocType("Sales Order")

query = (
    frappe.qb.from_(SalesOrder)
    .select(
        SalesOrder.customer,
        Count(SalesOrder.name).as_("order_count"),
        Sum(SalesOrder.grand_total).as_("cumulative_total")
    )
    .where(SalesOrder.docstatus != 2)
    .groupby(SalesOrder.customer)
    .having(Sum(SalesOrder.grand_total) > 20000)
)

result = query.run(as_dict=True)
```

**Generated SQL:**
```sql
SELECT `customer`, COUNT(`name`) AS `order_count`, SUM(`grand_total`) AS `cumulative_total`
FROM `tabSales Order`
WHERE `docstatus` != 2
GROUP BY `customer`
HAVING SUM(`grand_total`) > 20000
```

**Output:**
```python
[
    {"customer": "CUST-002", "order_count": 2, "cumulative_total": 117000.0}
]
```

---

### 2.3 Set Operations: Combining Datasets (`UNION` & `UNION ALL`)

- `union()` combines two queries and **removes duplicate rows**.
- `union_all()` combines two queries and **retains all rows**.

```python
import frappe
from frappe.query_builder import DocType

Customer = DocType("Customer")
Supplier = DocType("Supplier")

# Query 1: Active Customers
q1 = (
    frappe.qb.from_(Customer)
    .select(Customer.customer_name.as_("entity_name"), Customer.territory.as_("region"))
    .where(Customer.disabled == 0)
)

# Query 2: Active Suppliers
q2 = (
    frappe.qb.from_(Supplier)
    .select(Supplier.supplier_name.as_("entity_name"), Supplier.country.as_("region"))
    .where(Supplier.disabled == 0)
)

# Combine both queries removing duplicates
union_query = q1.union(q2)
result = union_query.run(as_dict=True)
```

**Generated SQL:**
```sql
(SELECT `customer_name` AS `entity_name`, `territory` AS `region` FROM `tabCustomer` WHERE `disabled` = 0)
UNION
(SELECT `supplier_name` AS `entity_name`, `country` AS `region` FROM `tabSupplier` WHERE `disabled` = 0)
```

**Output:**
```python
[
    {"entity_name": "Acme Corp", "region": "United States"},
    {"entity_name": "Globex Inc", "region": "United States"},
    {"entity_name": "Stark Industries", "region": "Europe"},
    {"entity_name": "Cyberdyne Systems", "region": "Europe"},
    {"entity_name": "TechSupply Co", "region": "United States"},
    {"entity_name": "ChipMaker Ltd", "region": "Europe"}
    # Note: 'Globex Inc' appearing in both tables is deduplicated into 1 row by UNION!
]
```

---

### 2.4 Set Operations: Intersecting Datasets (`INTERSECT`)

`intersect()` returns only rows that appear in **both** query result sets.

```python
import frappe
from frappe.query_builder import DocType

Customer = DocType("Customer")
Supplier = DocType("Supplier")

# Customers in United States
q_cust = (
    frappe.qb.from_(Customer)
    .select(Customer.customer_name.as_("company_name"))
    .where(Customer.territory == "United States")
)

# Suppliers in United States
q_supp = (
    frappe.qb.from_(Supplier)
    .select(Supplier.supplier_name.as_("company_name"))
    .where(Supplier.country == "United States")
)

intersect_query = q_cust.intersect(q_supp)
result = intersect_query.run(as_dict=True)
```

**Generated SQL:**
```sql
(SELECT `customer_name` AS `company_name` FROM `tabCustomer` WHERE `territory` = 'United States')
INTERSECT
(SELECT `supplier_name` AS `company_name` FROM `tabSupplier` WHERE `country` = 'United States')
```

**Output:**
```python
[
    {"company_name": "Globex Inc"}
]
```

---

## 🔹 Part 3: Multi-Table Joins (`INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, Multi-Table Joins)

When querying normalized schemas or child tables in Frappe, joins connect primary and foreign keys.

### 3.1 Inner Join (`INNER JOIN`)

Returns only rows where matching keys exist in both tables.

```python
import frappe
from frappe.query_builder import DocType

Customer = DocType("Customer")
SalesOrder = DocType("Sales Order")

query = (
    frappe.qb.from_(SalesOrder)
    .inner_join(Customer)
    .on(SalesOrder.customer == Customer.name)
    .select(
        SalesOrder.name.as_("order_id"),
        Customer.customer_name,
        Customer.territory,
        SalesOrder.grand_total,
        SalesOrder.status
    )
    .where(SalesOrder.docstatus == 1)
)

result = query.run(as_dict=True)
```

**Generated SQL:**
```sql
SELECT `tabSales Order`.`name` AS `order_id`,
       `tabCustomer`.`customer_name`,
       `tabCustomer`.`territory`,
       `tabSales Order`.`grand_total`,
       `tabSales Order`.`status`
FROM `tabSales Order`
INNER JOIN `tabCustomer` ON `tabSales Order`.`customer` = `tabCustomer`.`name`
WHERE `tabSales Order`.`docstatus` = 1
```

**Output:**
```python
[
    {
        "order_id": "SO-2026-001",
        "customer_name": "Acme Corp",
        "territory": "United States",
        "grand_total": 15000.0,
        "status": "Submitted"
    },
    {
        "order_id": "SO-2026-003",
        "customer_name": "Globex Inc",
        "territory": "United States",
        "grand_total": 85000.0,
        "status": "Submitted"
    },
    {
        "order_id": "SO-2026-005",
        "customer_name": "Globex Inc",
        "territory": "United States",
        "grand_total": 32000.0,
        "status": "Submitted"
    }
]
```

---

### 3.2 Left Outer Join (`LEFT JOIN`)

Returns **all** rows from the left table (`Customer`), even if no matching order exists in the right table (`Sales Order`).

```python
import frappe
from frappe.query_builder import DocType
from frappe.query_builder.functions import Count, Coalesce, Sum

Customer = DocType("Customer")
SalesOrder = DocType("Sales Order")

query = (
    frappe.qb.from_(Customer)
    .left_join(SalesOrder)
    .on((Customer.name == SalesOrder.customer) & (SalesOrder.docstatus == 1))
    .select(
        Customer.name.as_("customer_id"),
        Customer.customer_name,
        Count(SalesOrder.name).as_("submitted_orders"),
        Coalesce(Sum(SalesOrder.grand_total), 0).as_("total_revenue")
    )
    .where(Customer.disabled == 0)
    .groupby(Customer.name)
)

result = query.run(as_dict=True)
```

**Generated SQL:**
```sql
SELECT `tabCustomer`.`name` AS `customer_id`,
       `tabCustomer`.`customer_name`,
       COUNT(`tabSales Order`.`name`) AS `submitted_orders`,
       COALESCE(SUM(`tabSales Order`.`grand_total`), 0) AS `total_revenue`
FROM `tabCustomer`
LEFT JOIN `tabSales Order`
       ON `tabCustomer`.`name` = `tabSales Order`.`customer` AND `tabSales Order`.`docstatus` = 1
WHERE `tabCustomer`.`disabled` = 0
GROUP BY `tabCustomer`.`name`
```

**Output:**
```python
[
    {"customer_id": "CUST-001", "customer_name": "Acme Corp", "submitted_orders": 1, "total_revenue": 15000.0},
    {"customer_id": "CUST-002", "customer_name": "Globex Inc", "submitted_orders": 2, "total_revenue": 117000.0},
    {"customer_id": "CUST-003", "customer_name": "Stark Industries", "submitted_orders": 0, "total_revenue": 0.0},
    {"customer_id": "CUST-005", "customer_name": "Cyberdyne Systems", "submitted_orders": 0, "total_revenue": 0.0}
]
```

---

### 3.3 Right Outer Join (`RIGHT JOIN`) & Multi-Table Joins (Parent + Child Table)

Joining 3 tables: `Sales Order` (Parent), `Sales Order Item` (Child), and `Customer`.

```python
import frappe
from frappe.query_builder import DocType

SalesOrder = DocType("Sales Order")
SOItem = DocType("Sales Order Item")
Customer = DocType("Customer")

query = (
    frappe.qb.from_(SOItem)
    .inner_join(SalesOrder).on(SOItem.parent == SalesOrder.name)
    .right_join(Customer).on(SalesOrder.customer == Customer.name)
    .select(
        Customer.customer_name,
        SalesOrder.name.as_("order_id"),
        SOItem.item_code,
        SOItem.qty,
        SOItem.amount
    )
    .where(Customer.territory == "United States")
)

result = query.run(as_dict=True)
```

**Generated SQL:**
```sql
SELECT `tabCustomer`.`customer_name`,
       `tabSales Order`.`name` AS `order_id`,
       `tabSales Order Item`.`item_code`,
       `tabSales Order Item`.`qty`,
       `tabSales Order Item`.`amount`
FROM `tabSales Order Item`
INNER JOIN `tabSales Order` ON `tabSales Order Item`.`parent` = `tabSales Order`.`name`
RIGHT JOIN `tabCustomer` ON `tabSales Order`.`customer` = `tabCustomer`.`name`
WHERE `tabCustomer`.`territory` = 'United States'
```

**Output:**
```python
[
    {"customer_name": "Acme Corp", "order_id": "SO-2026-001", "item_code": "ITEM-LAPTOP", "qty": 5, "amount": 10000.0},
    {"customer_name": "Acme Corp", "order_id": "SO-2026-001", "item_code": "ITEM-MONITOR", "qty": 5, "amount": 5000.0},
    {"customer_name": "Acme Corp", "order_id": "SO-2026-002", "item_code": "ITEM-MONITOR", "qty": 3, "amount": 4500.0},
    {"customer_name": "Globex Inc", "order_id": "SO-2026-003", "item_code": "ITEM-SERVER", "qty": 50, "amount": 85000.0}
]
```

---

## 🔹 Part 4: Subqueries, Conditional Logic & Data Modification

### 4.1 Subqueries in `WHERE` Clause

Find all customers whose total sales order spending exceeds the company-wide average order value.

```python
import frappe
from frappe.query_builder import DocType
from frappe.query_builder.functions import Avg

SalesOrder = DocType("Sales Order")
Customer = DocType("Customer")

# Subquery: Calculate average grand_total
avg_subquery = (
    frappe.qb.from_(SalesOrder)
    .select(Avg(SalesOrder.grand_total))
    .where(SalesOrder.docstatus == 1)
)

# Main Query: Select orders greater than subquery average
main_query = (
    frappe.qb.from_(SalesOrder)
    .select(SalesOrder.name, SalesOrder.customer, SalesOrder.grand_total)
    .where(
        (SalesOrder.docstatus == 1) &
        (SalesOrder.grand_total > avg_subquery)
    )
)

result = main_query.run(as_dict=True)
```

**Generated SQL:**
```sql
SELECT `name`, `customer`, `grand_total`
FROM `tabSales Order`
WHERE `docstatus` = 1
  AND `grand_total` > (
      SELECT AVG(`grand_total`)
      FROM `tabSales Order`
      WHERE `docstatus` = 1
  )
```

**Output:**
```python
[
    # Company average for docstatus=1 is (15000 + 85000 + 32000)/3 = 44000
    {"name": "SO-2026-003", "customer": "CUST-002", "grand_total": 85000.0}
]
```

---

### 4.2 Conditional Expressions (`Case`, `When`, `Else`)

Dynamically categorize results based on conditional rules.

```python
import frappe
from frappe.query_builder import DocType, Case, When

Customer = DocType("Customer")

query = (
    frappe.qb.from_(Customer)
    .select(
        Customer.name,
        Customer.customer_name,
        Customer.credit_limit,
        Case()
        .when(Customer.credit_limit >= 100000, "Tier 1 (VIP)")
        .when(Customer.credit_limit >= 50000, "Tier 2 (Standard)")
        .else_("Tier 3 (Basic)")
        .as_("customer_tier")
    )
    .where(Customer.disabled == 0)
)

result = query.run(as_dict=True)
```

**Generated SQL:**
```sql
SELECT `name`, `customer_name`, `credit_limit`,
       CASE
         WHEN `credit_limit` >= 100000 THEN 'Tier 1 (VIP)'
         WHEN `credit_limit` >= 50000 THEN 'Tier 2 (Standard)'
         ELSE 'Tier 3 (Basic)'
       END AS `customer_tier`
FROM `tabCustomer`
WHERE `disabled` = 0
```

**Output:**
```python
[
    {"name": "CUST-001", "customer_name": "Acme Corp", "credit_limit": 50000.0, "customer_tier": "Tier 2 (Standard)"},
    {"name": "CUST-002", "customer_name": "Globex Inc", "credit_limit": 120000.0, "customer_tier": "Tier 1 (VIP)"},
    {"name": "CUST-003", "customer_name": "Stark Industries", "credit_limit": 250000.0, "customer_tier": "Tier 1 (VIP)"},
    {"name": "CUST-005", "customer_name": "Cyberdyne Systems", "credit_limit": 80000.0, "customer_tier": "Tier 2 (Standard)"}
]
```

---

### 4.3 Data Modification Query Builder (`UPDATE`, `INSERT`, `DELETE`)

You can perform write operations directly via `frappe.qb`:

```python
import frappe
from frappe.query_builder import DocType

Customer = DocType("Customer")

# 1. UPDATE Query
update_query = (
    frappe.qb.update(Customer)
    .set(Customer.credit_limit, Customer.credit_limit * 1.10)
    .where((Customer.territory == "Europe") & (Customer.disabled == 0))
)
update_query.run()

# 2. DELETE Query
delete_query = (
    frappe.qb.from_(Customer)
    .delete()
    .where(Customer.disabled == 1)
)
delete_query.run()
```

---

## 🔹 Part 5: Complete Frappe ORM API Comparison Matrix

| Query Interface | Use Case | Lifecycle Hooks (`validate`, `on_update`) | Permission Checks (`has_permission`) | Speed |
| :--- | :--- | :--- | :--- | :--- |
| `frappe.get_doc` | Complete entity modifications, workflow triggers | ✅ Triggers All | ✅ Enforced | Standard |
| `frappe.get_list` | UI List views, user queries | ❌ None | ✅ Enforced | High |
| `frappe.get_all` | System background processes | ❌ None | ❌ Bypassed | High |
| `frappe.db.get_value` | Fetching 1 to 5 fields from 1 row | ❌ None | ❌ Bypassed | Very High |
| `frappe.qb` | Complex JOINS, UNION, GROUP BY, Subqueries | ❌ None | ❌ Bypassed | Maximum |
| `frappe.db.sql` | Raw SQL fallback queries | ❌ None | ❌ Bypassed | Maximum |

---

## 🔗 Related Topics

- [10. Database, ORM & Query Builder Reference](/10-database/)
- [06. Document API & Lifecycle](/06-documents/)
- [09. Server API Reference](/09-server-api/)
