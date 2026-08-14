---
title: REST API & RPC Endpoints in Frappe v15
description: Definitive guide to Frappe v15 REST Resource API, RPC Method API, Authentication headers, JSON payloads, and multi-language client examples.
version: v15
category: Web, Integrations & APIs
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> REST API & RPC Endpoints

Frappe Framework v15 automatically generates a standard **RESTful API** for every DocType and exposes custom **RPC endpoints** for Python functions decorated with `@frappe.whitelist()`.

---

## 1. Authentication Mechanisms

Frappe supports two primary HTTP authentication header formats:

### 1. Token-Based Authentication (API Key & Secret)

Generate `api_key` and `api_secret` under User record -> API Access in Desk.

```http
Authorization: token api_key:api_secret
```

### 2. Cookie / Session Authentication

Log in via `/api/method/login` to obtain session cookies (`sid`). Subsequent requests automatically authenticate via cookie headers.

---

## 2. Resource REST API (`/api/resource/:doctype`)

### `GET /api/resource/:doctype` (List Records)

Fetches matching records for a DocType.

#### Query Parameters

| Parameter | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `fields` | `JSON array` | Array of field names to retrieve | `["name", "subject", "status"]` |
| `filters` | `JSON array` | Array of filter tuples | `[["status", "=", "Open"]]` |
| `order_by` | `string` | Sort column and direction | `creation desc` |
| `limit_start` | `integer` | Pagination offset | `0` |
| `limit_page_length` | `integer` | Page length limit | `20` |

```bash
curl -X GET "https://site1.localhost/api/resource/Task?fields=\[\"name\",\"subject\"\]&filters=\[\[\"status\",\"=\",\"Open\"\]\]" \
  -H "Authorization: token 4c89a0b12e:9f2d1847c0"
```

---

### `GET /api/resource/:doctype/:name` (Fetch Record)

```bash
curl -X GET "https://site1.localhost/api/resource/Task/TASK-2026-00001" \
  -H "Authorization: token 4c89a0b12e:9f2d1847c0"
```

---

### `POST /api/resource/:doctype` (Create Record)

```bash
curl -X POST "https://site1.localhost/api/resource/Task" \
  -H "Authorization: token 4c89a0b12e:9f2d1847c0" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Integration Test Task",
    "priority": "High",
    "status": "Open"
  }'
```

---

### `PUT /api/resource/:doctype/:name` (Update Record)

```bash
curl -X PUT "https://site1.localhost/api/resource/Task/TASK-2026-00001" \
  -H "Authorization: token 4c89a0b12e:9f2d1847c0" \
  -H "Content-Type: application/json" \
  -d '{"status": "Completed"}'
```

---

### `DELETE /api/resource/:doctype/:name` (Delete Record)

```bash
curl -X DELETE "https://site1.localhost/api/resource/Task/TASK-2026-00001" \
  -H "Authorization: token 4c89a0b12e:9f2d1847c0"
```

---

## 3. RPC Method API (`/api/method/:method_path`)

Triggers whitelisted Python server functions.

### Server Definition

```python
# my_custom_app/api.py
import frappe

@frappe.whitelist(allow_guest=False)
def get_user_dashboard(user_id):
    return {
        "open_tasks": frappe.db.count("Task", {"allocated_to": user_id, "status": "Open"}),
        "roles": frappe.get_roles(user_id)
    }
```

### Python Client Code Example (`requests`)

```python
import requests

url = "https://site1.localhost/api/method/my_custom_app.api.get_user_dashboard"
headers = {
    "Authorization": "token 4c89a0b12e:9f2d1847c0",
    "Content-Type": "application/json"
}
payload = {"user_id": "developer@example.com"}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

---

## 4. File Upload via REST API (`upload_file`)

Uploading attachment files via REST API is executed by invoking the whitelisted endpoint `/api/method/upload_file` using `multipart/form-data`.

### Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | `binary` | Yes | Binary file content stream |
| `filename` | `string` | Yes | Target file name (e.g. `'receipt.pdf'`) |
| `doctype` | `string` | Optional | Target DocType name to attach file to |
| `docname` | `string` | Optional | Target document primary key |
| `is_private` | `integer` | Optional | Set `1` for private storage, `0` for public |

### Python Client Code Example

```python
import requests

url = "https://site1.localhost/api/method/upload_file"
headers = {
    "Authorization": "token 4c89a0b12e:9f2d1847c0"
}
files = {
    "file": ("spec.pdf", open("/path/to/spec.pdf", "rb"), "application/pdf")
}
data = {
    "doctype": "Task",
    "docname": "TASK-2026-00001",
    "is_private": "1"
}

response = requests.post(url, headers=headers, files=files, data=data)
print("Upload Response:", response.json())
# Output:
# Upload Response: {
#     "message": {
#         "name": "09a1f28b7e",
#         "file_name": "spec.pdf",
#         "file_url": "/private/files/spec.pdf",
#         "is_private": 1
#     }
# }
```

---

## 5. REST Error Response Payload Structure

When an exception occurs during REST execution, Frappe returns appropriate HTTP status codes alongside a structured JSON error body containing exception tracebacks (`exc`) and translated user messages (`_server_messages`).

### HTTP Status Codes

- `200 OK`: Successful request.
- `401 Unauthorized`: Missing or invalid `Authorization: token` / session cookie.
- `403 Forbidden`: User lacks permission (`read`/`write`/`create`) for the target DocType.
- `404 Not Found`: Target DocType or document primary key does not exist.
- `409 Conflict`: Duplicate entry or conflicting primary key insertion error.
- `500 Internal Server Error`: Unhandled server-side Python exception.

### Sample Error JSON Payload (`403 Forbidden`)

```json
{
  "exc": "[\"Traceback (most recent call last):\\n  File \\\"/apps/frappe/frappe/app.py\\\", line 69, in application\\n    frappe.permissions.check_doctype_permission(doctype, 'read')\\nfrappe.exceptions.PermissionError: User john@company.com lacks Read permission for Task\"]",
  "_server_messages": "[\"{\\\"message\\\": \\\"No permission for Task\\\", \\\"title\\\": \\\"Permission Error\\\"}\"]"
}
```

---

## Related Topics

- [09. Server API](/09-server-api/)
- [14. Authentication & Permissions](/14-authentication-permissions/)

