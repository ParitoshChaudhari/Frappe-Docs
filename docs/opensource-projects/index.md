---
title: Open Source Projects in Frappe Ecosystem
description: Reference guide to popular open-source applications built on Frappe Framework v15, including ERPNext, HRMS, and India Compliance with project links, descriptions, and installation commands.
version: v15
category: Ecosystem & Open Source
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Open Source Ecosystem Projects

Frappe Framework powers a large, vibrant ecosystem of production-grade open-source applications. Below is an overview of major open-source projects built on Frappe Framework v15, their core features, official links, and installation commands.

---

## 📊 Open Source Projects Overview

| Project Name | Category / Domain | Short Description | Repository Link | Installation Command |
| :--- | :--- | :--- | :--- | :--- |
| **ERPNext** | Enterprise Resource Planning (ERP) | Full-featured open-source ERP covering Financial Accounting, Stock, Selling, Buying, Manufacturing, CRM, and Projects. | [frappe/erpnext](https://github.com/frappe/erpnext) | `bench get-app erpnext --branch version-15`<br>`bench --site site1.localhost install-app erpnext` |
| **Frappe HR (HRMS)** | HR & Payroll Management | Modern Human Resource Management & Payroll application handling Attendance, Leave, Payroll, Expense Claims, and Appraisals. | [frappe/hrms](https://github.com/frappe/hrms) | `bench get-app hrms --branch version-15`<br>`bench --site site1.localhost install-app hrms` |
| **India Compliance** | Statutory & Tax Compliance | Official Indian tax compliance app for ERPNext providing GST Returns, E-Invoicing, E-Way Bills, TDS, and Audit Trail. | [resilient-tech/india-compliance](https://github.com/resilient-tech/india-compliance) | `bench get-app india_compliance --branch version-15`<br>`bench --site site1.localhost install-app india_compliance` |

---

## 🔍 Detailed Project Profiles

### 1. ERPNext

**ERPNext** is the flagship open-source ERP application built on Frappe Framework. It is used by tens of thousands of enterprises worldwide across manufacturing, distribution, retail, services, and non-profits.

#### Key Features & Modules
- **Accounts & Financials**: Chart of Accounts, General Ledger, Multi-currency, Invoicing, Tax Templates, Payment Reconciliation.
- **Stock & Inventory**: Multi-warehouse stock tracking, Serialized & Batch inventory, Valuation (FIFO/Moving Average), Stock Transfers.
- **Selling & CRM**: Lead management, Quotations, Sales Orders, Customer Portals, Sales Partner Commissions.
- **Buying & Procurement**: Supplier Quotations, Purchase Orders, Material Requests, Supplier Scorecards.
- **Manufacturing**: Work Orders, Bill of Materials (BOM), Workstations, Job Cards, Capacity Planning.

```bash
# Install ERPNext on a site
bench get-app erpnext --branch version-15
bench --site site1.localhost install-app erpnext
```

---

### 2. Frappe HR (HRMS)

**Frappe HR** (formerly part of core ERPNext) is a standalone application dedicated to complete Human Resource Management and Payroll automation.

#### Key Features & Modules
- **Employee Lifecycle**: Onboarding, Transfers, Promotions, Separations, Employee Directory.
- **Attendance & Shift Management**: Biometric attendance integration, Shift Rosters, Late Entry / Early Exit rules.
- **Leave Management**: Leave Allocation rules, Encashment, Leave Applications, Holiday Lists.
- **Payroll Processing**: Salary Structures, Salary Slips, Tax Deductions, Direct Bank Transfers, Expense Claims.
- **Performance & Training**: Goal Tracking, KRA Appraisals, Training Programs, Feedback Surveys.

```bash
# Install Frappe HR on a site
bench get-app hrms --branch version-15
bench --site site1.localhost install-app hrms
```

---

### 3. India Compliance

**India Compliance** is the community-standard open-source app built by Resilient Tech for Indian businesses using ERPNext. It automates Indian GST tax compliance and government portal integrations.

#### Key Features & Modules
- **GST Invoicing & Tax Calculation**: Automated HSN/SAC code mapping, CGST/SGST/IGST calculation, UTGST support.
- **E-Invoicing API Integration**: Direct 1-click E-Invoice generation (IRN) via government Invoice Registration Portals (IRP) directly from Sales Invoices.
- **E-Way Bill Generation**: Automated E-Way Bill generation with vehicle number tracking and distance calculation.
- **GST Returns & Reconciliation**: GSTR-1 JSON export, GSTR-3B summary reports, and automated GSTR-2B purchase reconciliation.
- **TDS & Audit Trail**: Income tax TDS withholding calculations and Ministry of Corporate Affairs (MCA) audit trail log compliance.

```bash
# Install India Compliance on an ERPNext site
bench get-app india_compliance --branch version-15
bench --site site1.localhost install-app india_compliance
```

---

## 🔗 Related Topics

- [01. Getting Started](/01-getting-started/)
- [04. Apps & Sites Structure](/04-apps-and-sites/)
- [25. DevOps & Installation](/25-devops-installation/)
