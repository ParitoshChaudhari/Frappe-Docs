---
title: Authentication, Session, Login & User Roles in Frappe v15
description: Comprehensive guide to LoginManager, custom login & signup flows, password hashing, session lifecycle, User Roles (get_roles, has_role), User Permissions, and CSRF/CORS.
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

## 2. LoginManager & Authentication Flow (`frappe.auth.LoginManager`)

Frappe's authentication lifecycle is coordinated by the `LoginManager` class. Whether a user signs in via the standard Desk login page, a mobile app, or a custom headless storefront, `LoginManager` validates credentials, enforces security rules, handles Two-Factor Authentication (2FA), creates user sessions, and triggers system hooks.

```
                           AUTHENTICATION WORKFLOW
                                      │
               POST /api/method/login (usr, pwd, device)
                                      ▼
                      ┌───────────────────────────────┐
                      │   frappe.auth.LoginManager    │
                      └───────────────┬───────────────┘
                                      │
                 ┌────────────────────┼────────────────────┐
                 ▼                    ▼                    ▼
        1. authenticate()      2. check_2fa()       3. post_login()
        - Validate email       - Check OTP / SMS    - Create Session (sid)
        - Check password hash  - Enforce device     - Execute on_login hooks
        - Check user status      remembering        - Set cookies in response
```

### Where to Import

```python
from frappe.auth import LoginManager
```

### Core `LoginManager` Methods Reference

| Method | Signature | Description |
| :--- | :--- | :--- |
| `authenticate` | `login_manager.authenticate(user=None, pwd=None)` | Validates user identity and password. Throws `frappe.AuthenticationError` if invalid. |
| `post_login` | `login_manager.post_login()` | Creates active HTTP session (`sid`), updates `last_login`, and invokes `on_login` hooks. |
| `login_as` | `login_manager.login_as(user)` | Programmatically logs in as target user without password (impersonation / system login). |
| `logout` | `login_manager.logout(user=None)` | Destroys current session cookie and executes `on_logout` hooks. |
| `run_trigger` | `login_manager.run_trigger(event="on_login")` | Manually triggers authentication hook callbacks defined in `hooks.py`. |

---

### Example: Custom REST Login API Endpoint

When building a custom headless mobile application or single-page app (React / Vue / Next.js), you can expose a custom login endpoint utilizing `LoginManager`:

```python
# my_custom_app/api/auth.py
import frappe
from frappe import _
from frappe.auth import LoginManager

@frappe.whitelist(allow_guest=True)
def custom_login(usr, pwd, device="desktop"):
    """
    Custom authentication endpoint that validates credentials,
    creates an active session, and returns user metadata.
    """
    if not usr or not pwd:
        frappe.throw(_("Username and password are required"), frappe.AuthenticationError)

    # 1. Initialize LoginManager and authenticate credentials
    login_manager = LoginManager()
    
    # Passing usr and pwd triggers internal authentication and password verification
    frappe.form_dict["usr"] = usr
    frappe.form_dict["pwd"] = pwd
    frappe.form_dict["device"] = device

    login_manager.authenticate(user=usr, pwd=pwd)
    
    # 2. Complete session creation & trigger on_login hooks
    login_manager.post_login()

    # 3. Retrieve user profile and roles
    user = frappe.get_doc("User", login_manager.user)
    roles = frappe.get_roles(user.name)

    return {
        "message": _("Logged in successfully"),
        "sid": frappe.session.sid,
        "user": user.name,
        "full_name": user.full_name,
        "user_type": user.user_type,
        "roles": roles,
        "redirect_to": "/app" if user.user_type == "System User" else "/me"
    }
```

---

### Example: Programmatic Impersonation / System Login (`login_as`)

Superusers (System Managers) or automated integration tasks can switch active sessions programmatically:

```python
import frappe
from frappe.auth import LoginManager

@frappe.whitelist()
def impersonate_user(target_user):
    """Allows System Manager to switch session context to another user."""
    if not frappe.has_role("System Manager"):
        frappe.throw("Only System Managers can impersonate users", frappe.PermissionError)

    if not frappe.db.exists("User", target_user):
        frappe.throw(f"User {target_user} does not exist")

    # Switch session context
    login_manager = LoginManager()
    login_manager.login_as(target_user)
    
    return {
        "status": "success",
        "current_user": frappe.session.user,
        "sid": frappe.session.sid
    }
```

---

## 3. User Signup & Registration API (`sign_up`)

Frappe includes built-in APIs to handle user signups, generate verification keys, and dispatch onboarding emails.

### Where to Import

```python
from frappe.core.doctype.user.user import sign_up, reset_password
```

### Standard `sign_up` Method

```python
# Signature:
sign_up(email, full_name, redirect_to=None)
```

- Creates a new `User` document with `user_type: "Website User"`.
- Generates a random cryptographic verification key stored in the user document.
- Dispatches a Welcome / Account Activation email with a temporary link.
- Returns a status code (e.g. `1` for newly registered, `0` if user already exists).

---

### Example: Headless / Custom Signup API Endpoint

In many headless projects, you want a public signup endpoint that immediately registers the user, sets their password, and assigns specific roles:

```python
# my_custom_app/api/auth.py
import frappe
from frappe import _
from frappe.utils import validate_email_address
from frappe.utils.password import update_password

@frappe.whitelist(allow_guest=True)
def register_customer(email, first_name, last_name=None, password=None, mobile_no=None):
    """
    Registers a new portal customer with immediate role assignment
    and direct password hashing.
    """
    # 1. Validate inputs
    email = validate_email_address(email, throw=True)
    
    if frappe.db.exists("User", email):
        frappe.throw(_("An account with email {0} already exists").format(email))

    if not password or len(password) < 6:
        frappe.throw(_("Password must be at least 6 characters long"))

    # 2. Create User document
    user = frappe.new_doc("User")
    user.email = email
    user.first_name = first_name
    user.last_name = last_name or ""
    user.mobile_no = mobile_no
    user.user_type = "Website User"
    user.send_welcome_email = 0  # 0 = Don't send default Frappe welcome email

    # 3. Assign Portal Role (e.g., Customer)
    user.append("roles", {
        "role": "Customer"
    })

    # Save user bypassing permissions (since guest is calling)
    user.flags.ignore_permissions = True
    user.insert()

    # 4. Set password securely
    update_password(user=email, pwd=password, logout_all_sessions=0)

    frappe.db.commit()

    return {
        "status": "success",
        "message": _("User registered successfully"),
        "user": user.name
    }
```

---

## 4. Password Management & Cryptography Utilities

Frappe provides secure helper methods for hashing, checking, and updating passwords, protecting your application from common vulnerabilities.

### Where to Import

```python
# Password checking and updating
from frappe.utils.password import (
    check_password,
    update_password,
    get_decrypted_password
)

# Password reset flow
from frappe.core.doctype.user.user import reset_password
```

### Password APIs Reference

| Function | Signature | Description |
| :--- | :--- | :--- |
| `check_password` | `check_password(user, pwd)` | Verifies password against hashed value in DB. Throws `frappe.AuthenticationError` on mismatch. |
| `update_password` | `update_password(user, pwd, logout_all_sessions=0)` | Hashes password (bcrypt/argon2) and saves to `tabUser`. Optionally clears existing sessions. |
| `reset_password` | `reset_password(user)` | Generates password reset token and sends recovery email to user. |
| `get_decrypted_password` | `get_decrypted_password(doctype, name, fieldname="password")` | Decrypts encrypted password field for background integrations. |

```python
import frappe
from frappe.utils.password import check_password, update_password
from frappe.core.doctype.user.user import reset_password

# 1. Validate password programmatically
try:
    check_password("john@example.com", "MySecretPassword123!")
    print("Password valid!")
except frappe.AuthenticationError:
    print("Invalid password!")

# 2. Programmatically update password and invalidate other sessions
update_password(
    user="john@example.com",
    pwd="NewSecurePassword456!",
    logout_all_sessions=1
)

# 3. Trigger standard password reset email flow
reset_password("john@example.com")
```

---

## 5. Session Management & Lifecycle (`frappe.sessions`)

Active user sessions are tracked in MariaDB/PostgreSQL table `tabSessions` and cached in Redis.

### Where to Import

```python
from frappe.sessions import clear_sessions, Session
```

### Session Invalidation & Expiry

```python
from frappe.sessions import clear_sessions

# 1. Invalidate all active sessions for a user (forces user to log in again on all devices)
clear_sessions(user="john@example.com", keep_current=False)

# 2. Keep the current active session alive while terminating all other remote devices
clear_sessions(user=frappe.session.user, keep_current=True)

# 3. Clear sessions by device type ('desktop' or 'mobile')
clear_sessions(user="john@example.com", device="mobile")
```

### Session Configuration in `site_config.json`

Configure timeout and expiry in `frappe-bench/sites/<site_name>/site_config.json`:

```json
{
  "session_expiry": "06:00",
  "session_expiry_mobile": "720:00",
  "allow_concurrency": 1
}
```

- `session_expiry`: Idle session expiry time for desktop browser sessions (`HH:MM`).
- `session_expiry_mobile`: Session duration for mobile API clients.

---

## 6. Authentication Lifecycle Hooks (`hooks.py`)

Hook into authentication events to log audit trails, verify IP whitelists, or synchronize external SSO profiles:

```python
# hooks.py
on_login = "my_custom_app.auth.on_login_handler"
on_logout = "my_custom_app.auth.on_logout_handler"
after_login = "my_custom_app.auth.after_login_handler"
on_session_creation = "my_custom_app.auth.on_session_creation_handler"
```

```python
# my_custom_app/auth.py
import frappe

def on_login_handler(login_manager):
    """Executed immediately after user passes credential validation."""
    user = login_manager.user
    ip = frappe.local.request_ip

    # Example: Restrict specific users to internal office IP
    if user == "finance_manager@company.com" and not ip.startswith("192.168."):
        frappe.throw("Access restricted to internal office network", frappe.AuthenticationError)

def on_logout_handler(login_manager):
    """Executed during user logout."""
    frappe.logger("auth").info(f"User {login_manager.user} logged out.")
```

---

## 7. API Key & Secret Token Authentication

In addition to cookie session auth, Frappe supports stateless REST authentication using API Key pairs:

### Header Format

```http
Authorization: token <api_key>:<api_secret>
```

### Generating API Keys Programmatically

```python
import frappe

user = frappe.get_doc("User", "developer@company.com")
# Generates api_key (stored plain in tabUser) and api_secret (stored hashed)
api_secret = user.generate_keys()
frappe.db.commit()

print("API Key:", user.api_key)
print("API Secret:", api_secret)
```

---

## 8. User Roles API (`get_roles` & `has_role`)

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

## 9. Session User Permissions (`get_user_permissions`)

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

## 10. Programmatic Permission Hooks

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

## 11. Document Sharing API (`frappe.share`)

The Document Sharing API allows programmatically sharing specific document instances with users who otherwise would not have role-based read/write access.

```python
import frappe

# 1. Share document with specific user
frappe.share.add(
    doctype="Task",
    name="TASK-2026-00001",
    user="colleague@company.com",
    read=1,
    write=1,
    share=0,
    notify=1
)

# 2. Get list of users a document is shared with
shared_users = frappe.share.get_users("Task", "TASK-2026-00001")
print("Shared With:", shared_users)
# Output:
# Shared With: ['colleague@company.com']

# 3. Remove sharing permission
frappe.share.remove("Task", "TASK-2026-00001", "colleague@company.com")
```

---

## 12. Field-Level Permission Levels (`permlevel`)

Frappe allows restricting specific fields within a single DocType to distinct roles using **Permission Levels** (`permlevel` 0 through 9).

- **Level 0**: Default permission level assigned to all fields.
- **Level 1–9**: Elevated permission levels. Fields assigned `permlevel: 1` (e.g. `salary` or `discount_amount`) require explicit Role Permission Manager entries for Level 1 read/write permissions.

---

## 13. Web Security: CSRF & CORS Configuration

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

