---
title: Authentication, Session & User Roles in Frappe v15
description: Comprehensive guide to frappe.session.user, Session data, User Roles (get_roles, has_role), User Permissions (get_user_permissions), and CSRF/CORS.
version: v15
category: Web, Integrations & APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Authentication, Session & User Roles

Frappe Framework v15 manages active user sessions, role-based access control (RBAC), and instance-level User Permissions across both Python backend and JavaScript client environments.

---

## 1. Active Session Context (`frappe.session`)

The `frappe.session` object contains metadata regarding the current authenticated user making an HTTP request or executing server code.

### Python Backend `frappe.session` Reference

| Attribute | Return Type | Description & Value Example |
| :--- | :--- | :--- |
| `frappe.session.user` | `str` | Active user ID email (e.g., `'john@example.com'` or `'Guest'`) |
| `frappe.session.sid` | `str` | Active HTTP session cookie ID hash |
| `frappe.session.data` | `dict` | Session data dict containing `user_type`, `language`, `session_ip` |
| `frappe.session.user_type`| `str` | User classification (`'System User'` or `'Website User'`) |

```python
import frappe

@frappe.whitelist()
def get_current_user_profile():
    # 1. Identify active session user
    current_user = frappe.session.user
    
    if current_user == "Guest":
        frappe.throw("Authentication required to access user profile.", frappe.AuthenticationError)
        
    # 2. Access session SID and data
    session_id = frappe.session.sid
    user_type = frappe.session.data.user_type
    
    return {
        "user": current_user,
        "user_type": user_type,
        "roles": frappe.get_roles(current_user)
    }
```

---

### Client-Side JavaScript `frappe.session` & `frappe.user`

On the browser client Desk interface, session details are exposed globally:

| Client Attribute | Return Type | Description & Example |
| :--- | :--- | :--- |
| `frappe.session.user` | `string` | Email string of logged-in user (`"admin@example.com"`) |
| `frappe.session.user_fullname`| `string` | Display full name string (`"Administrator"`) |
| `frappe.user_roles` | `Array` | List array of role strings assigned to user |

```javascript
frappe.ui.form.on("Task", {
    refresh(frm) {
        // 1. Get current logged-in user email
        let current_user = frappe.session.user;
        
        // 2. Check if user is Guest
        if (current_user === "Guest") {
            frappe.show_alert({ message: __("Please log in"), indicator: "orange" });
        }
        
        // 3. Inspect user full name
        console.log("Logged in as:", frappe.session.user_fullname);
    }
});
```

---

## 2. User Roles API (`get_roles` & `has_role`)

Roles determine permission capabilities across DocTypes.

### Server-Side Python Role APIs

```python
import frappe

# 1. Get all roles assigned to current session user (or target user)
user_roles = frappe.get_roles(frappe.session.user)
# Returns: ['System Manager', 'Projects User', 'All', 'Guest']

# 2. Check if user possesses specific role
is_manager = frappe.has_role("System Manager", user=frappe.session.user)

if not is_manager:
    frappe.throw("Access denied: Requires System Manager role.")
```

---

### Client-Side JavaScript Role Inspection (`frappe.user.has_role`)

```javascript
frappe.ui.form.on("Task", {
    refresh(frm) {
        // 1. Check if client user has specific role
        if (frappe.user.has_role("System Manager")) {
            frm.add_custom_button(__("Admin Settings"), () => {
                frappe.set_route("Form", "System Settings");
            });
        }
        
        // 2. Inspect all roles assigned to current user
        if (frappe.user_roles.includes("Projects Manager")) {
            frm.set_df_property("priority", "read_only", 0);
        }
    }
});
```

---

## 3. Session User Permissions (`get_user_permissions`)

**User Permissions** constrain users to specific record instances (e.g. User `john@company.com` is restricted to `Company: Acme North`).

### Fetching & Evaluating User Permissions (Python)

```python
import frappe
from frappe.permissions import get_user_permissions, has_permission

# 1. Fetch dictionary of all User Permissions assigned to active user
user_perms = get_user_permissions(user=frappe.session.user)
# Returns: {'Company': [{'doc': 'Acme North'}], 'Territory': [{'doc': 'North America'}]}

# 2. Programmatically evaluate document permission
can_read = has_permission("Sales Invoice", ptype="read", doc="SINV-00001", user=frappe.session.user)
can_write = has_permission("Sales Invoice", ptype="write", doc="SINV-00001")

if not can_write:
    frappe.throw("You do not have write permission for this invoice.")
```

---

### Client-Side User Defaults & Permissions (JavaScript)

```javascript
// 1. Get user default setting (e.g. default Company or Fiscal Year)
let default_company = frappe.defaults.get_user_default("Company");

// 2. Get user permission restrictions object
let user_permissions = frappe.defaults.get_user_permissions();
if (user_permissions && user_permissions.Company) {
    console.log("Allowed Companies:", user_permissions.Company.map(d => d.doc));
}
```

---

## 4. Programmatic Permission Hooks

### `has_permission` Hook

Evaluates custom Python logic to grant or deny access to a specific document instance.

```python
# hooks.py
has_permission = {
    "Task": "my_custom_app.permissions.check_task_access"
}
```

```python
# my_custom_app/permissions.py
import frappe

def check_task_access(doc, ptype="read", user=None):
    if not user:
        user = frappe.session.user
    
    # System Managers always have access
    if "System Manager" in frappe.get_roles(user):
        return True
    
    # Restrict read/write to task owner or allocated user
    if ptype in ["read", "write"]:
        if doc.owner == user or doc.allocated_to == user:
            return True
        return False
    
    return True
```

---

### `permission_query_conditions` Hook

Injects dynamic SQL `WHERE` clauses into all `frappe.get_list` and Desk ListView database queries.

```python
# hooks.py
permission_query_conditions = {
    "Task": "my_custom_app.permissions.get_task_query_conditions"
}
```

```python
def get_task_query_conditions(user=None):
    if not user:
        user = frappe.session.user
    if "System Manager" in frappe.get_roles(user):
        return ""
    
    # Inject SQL condition ensuring users only see their own tasks
    return f"`tabTask`.owner = {frappe.db.escape(user)} OR `tabTask`.allocated_to = {frappe.db.escape(user)}"
```

---

## 5. Web Security: CSRF & CORS Configuration

- **CSRF Protection**: Frappe automatically injects CSRF token `X-Frappe-CSRF-Token` headers into form submissions and client RPC calls.
- **CORS Setup**: Configure allowed origins in `site_config.json`:

```json
{
  "allow_cors": "https://myfrontend-app.com"
}
```

---

## Related Topics

- [08. Hooks Reference](/08-hooks/)
- [09. Server API](/09-server-api/)
- [11. Client API](/11-client-api/)
- [13. REST API & RPC](/13-rest-api/)
- [21. Security & Performance](/21-security-performance/)
