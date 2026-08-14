---
title: Production - Frappe Docker & Containerization Guide
description: Complete guide to containerizing Frappe v15 with Frappe Docker - Docker Compose setup, compose.yaml, custom app images, site creation, and Kubernetes.
version: v15
category: DevOps, Production & Docker
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Production: Frappe Docker Containerization

**Frappe Docker** is the official containerized deployment method for Frappe Framework v15, providing production-ready OCI images for Docker Compose, Swarm, and Kubernetes deployments.

---

## 1. Frappe Docker Architecture

A production Frappe Docker stack decomposes Bench processes into isolated containers:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              TRAEFIK / NGINX                           │
│                      (Reverse Proxy & SSL Termination)                 │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌───────────────────────────────┐   ┌────────────────────────────────────┐
│      FRONTEND (Nginx)         │   │         WEBSOCKET (Node)           │
│  - Serves compiled static assets│   │       - Realtime Socket.IO         │
└───────────────┬───────────────┘   └────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Gunicorn / Python)                     │
│               - Executes API requests & Document Controllers           │
└──────┬────────────────────┬────────────────────┬───────────────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐    ┌───────────────────────────────┐
│   MARIADB    │     │ REDIS CACHE  │    │     WORKER CONTAINERS         │
│ (Container)  │     │ (Container)  │    │ - Default Worker              │
│ Persistent DB│     │ In-Memory    │    │ - Short Worker                │
└──────────────┘     └──────────────┘    │ - Long Worker / Scheduler     │
                                         └───────────────────────────────┘
```

---

## 2. Quickstart Deployment with Docker Compose

### Step 1: Clone Official `frappe_docker` Repository

```bash
git clone https://github.com/frappe/frappe_docker.git
cd frappe_docker
```

---

### Step 2: Configure Environment File (`.env`)

Copy sample environment settings:

```bash
cp example.env .env
```

#### Important `.env` Parameters

```ini
# Target Frappe Framework Version
FRAPPE_VERSION=v15.20.0

# Database Root Password
DB_ROOT_USER=root
MYSQL_ROOT_PASSWORD=secure_admin_password

# Public Domain Name
SITES=frontend.localhost

# Default Site Admin Password
ADMIN_PASSWORD=admin
```

---

### Step 3: Launch Containers with Docker Compose

::: code-group

```bash [Production Setup (compose.yaml)]
# Launch production containers using Traefik reverse proxy
docker compose -f compose.yaml -f overrides/compose.noproxy.yaml up -d
```

```bash [Minimal Setup (pwd.yml)]
# Launch minimal single-host setup (Ideal for quick evaluation)
docker compose -f pwd.yml up -d
```

```bash [Development Container]
# Launch interactive development container
docker compose -f compose.yaml -f overrides/compose.dev.yaml up -d
```

:::

---

## 3. Site Operations via Docker CLI

Once container stack is running:

### Create a New Site inside Container

```bash
docker compose exec backend bench new-site frontend.localhost \
  --admin-password admin \
  --db-root-password secure_admin_password \
  --install-app erpnext
```

---

### Run Database Migrations in Docker

```bash
docker compose exec backend bench --site frontend.localhost migrate
```

---

### Access Interactive Bench Console in Docker

```bash
docker compose exec backend bench --site frontend.localhost console
```

---

## 4. Building Custom Frappe App Docker Images

To deploy custom Frappe applications in Docker, build a custom container image bundling your apps into `apps.json`:

### Step 1: Create `apps.json`

```json
[
  {
    "url": "https://github.com/frappe/erpnext",
    "branch": "version-15"
  },
  {
    "url": "https://github.com/myorg/my_custom_app",
    "branch": "main"
  }
]
```

---

### Step 2: Build Image using `Containerfile`

```bash
export APPS_JSON_BASE64=$(base64 -w 0 apps.json)

docker build \
  --build-arg=FRAPPE_PATH=https://github.com/frappe/frappe \
  --build-arg=FRAPPE_BRANCH=version-15 \
  --build-arg=APPS_JSON_BASE64=$APPS_JSON_BASE64 \
  --tag myregistry.com/myorg/custom-frappe:v15.0.0 \
  -f images/custom/Containerfile .
```

---

### Step 3: Push and Deploy Image

```bash
# Push to container registry
docker push myregistry.com/myorg/custom-frappe:v15.0.0
```

Update `FRAPPE_IMAGE` in your production `.env`:

```ini
FRAPPE_IMAGE=myregistry.com/myorg/custom-frappe:v15.0.0
```

---

## 5. Kubernetes Deployment (Helm Chart)

For high-availability enterprise environments, deploy Frappe using the official Helm chart:

```bash
# Add Frappe Helm repository
helm repo add frappe https://helm.frappe.io
helm repo update

# Install Frappe release on Kubernetes cluster
helm install frappe-release frappe/frappe-bench \
  --set siteName=erp.mycompany.com \
  --set adminPassword=secure_password
```

---

## Related Topics

- [03. Bench CLI Reference](/03-bench-cli/)
- [25. DevOps: Dependency Installation](/25-devops-installation/)
- [26. Operations: Services & Performance Monitoring](/26-devops-operations/)
