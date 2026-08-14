---
layout: home

hero:
  name: "Frappe v15 Reference"
  text: "Complete Developer Documentation & Handbook"
  tagline: "Deep technical breakdown of Frappe Framework v15 — APIs, DocTypes, Hooks, Query Builder, JS SDK, REST, Security, Reports, DevOps & Docker."
  actions:
    - theme: brand
      text: Get Started
      link: /01-getting-started/
    - theme: brand
      text: Frappe ORM Guide
      link: /30-frappe-orm/
    - theme: alt
      text: GitHub Repository
      link: https://github.com/ParitoshChaudhari/Frappe-Docs
    - theme: alt
      text: DevOps Setup
      link: /25-devops-installation/
    - theme: alt
      text: Frappe Docker
      link: /27-frappe-docker/
    - theme: alt
      text: Searchable API Index
      link: /24-api-index/

features:
  - title: Frappe ORM Masterclass
    details: Deep dive into SELECT, WHERE, LIMIT, GROUP BY, HAVING, INNER/LEFT/RIGHT Joins, UNION & INTERSECT with sample table data and Python code outputs.
    link: /30-frappe-orm/
  - title: GitHub Repository
    details: Explore source code, contribute, report issues, and star the official Frappe Framework v15 Developer Documentation on GitHub.
    link: https://github.com/ParitoshChaudhari/Frappe-Docs
  - title: Database & Query Builder
    details: Complete reference for frappe.db.get_value, get_all, PyPika QueryBuilder, SQL parameters, savepoints, and transactions.
    link: /10-database/
  - title: DevOps & Installation
    details: Tabbed OS installation commands for Node, Python, MariaDB, Redis, and Bench across macOS, Linux, Windows WSL2, and Docker.
    link: /25-devops-installation/
  - title: Operations & Monitoring
    details: Monitor Supervisor status, restart web/worker processes, inspect MariaDB threads, kill long queries & release Redis load.
    link: /26-devops-operations/
  - title: Production Frappe Docker
    details: Official Frappe Docker containerization, compose.yaml, pwd.yml, custom app images, site creation & Kubernetes Helm deployment.
    link: /27-frappe-docker/
  - title: Complete Reports Engine
    details: Master Standard Reports, Query Reports, Script Reports, Tree Reports, Frappe Charts, KPI summary cards & MultiSelect filters.
    link: /18-reports/
  - title: Cookbook & Recipes
    details: Practical code recipes for real-world ERPNext / Frappe developer patterns and common anti-patterns to avoid.
    link: /22-cookbook/
---

<div class="vp-doc" style="max-width: 1152px; margin: 0 auto; padding: 2rem 1.5rem;">

## Why This Reference?

This documentation website is designed specifically for **Frappe Framework v15** developers who need clear, precise, and actionable reference material without guesswork. Every API is documented with:

- **Exact Syntax & Type Annotations** (Python & JavaScript)
- **Tabbed DevOps Installation Commands** (macOS, Linux, Windows WSL2, Package Managers & Docker)
- **Production Operations & Load Relief** (Supervisor monitoring, Nginx reload, MariaDB thread inspection, Redis flush)
- **Frappe Docker Containerization** (Docker Compose, pwd.yml, custom app images, Helm Kubernetes chart)
- **Detailed Parameter Matrices & Decision Tables** (Which method to use when, why & how)
- **Complete Reporting Engine Guide** (Standard, Query, Script, Tree Reports, Frappe Charts & MultiSelect filters)
- **Client vs. Server Boundary Distinctions**
- **Executable & Realistic Code Examples**

---

### Quick Code Example: Data Fetching Decision Strategy

```python
import frappe
from frappe.query_builder import DocType

# 1. ORM / Document API (Modifying entity & triggering lifecycle hooks)
task_doc = frappe.get_doc("Task", "TASK-2026-00001")

# 2. Database API (Fast scalar read)
task_subject, status = frappe.db.get_value(
    "Task",
    {"name": "TASK-2026-00001"},
    ["subject", "status"]
)

# 3. List Read - Enforces User Permissions (frappe.get_list)
user_tasks = frappe.get_list(
    "Task",
    filters={"docstatus": 0},
    fields=["name", "subject", "status"]
)

# 4. List Read - Bypasses Permissions / System Code (frappe.get_all)
all_tasks = frappe.get_all(
    "Task",
    filters={"docstatus": 0},
    fields=["name", "subject", "status"]
)
```

</div>
