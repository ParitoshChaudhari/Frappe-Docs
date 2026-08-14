---
title: Operations - Services, Monitoring & Load Relief in Frappe v15
description: Guide to monitoring Supervisor status, restarting services, MariaDB database inspection, killing long queries, releasing Redis load, and performance recovery.
version: v15
category: DevOps, Production & Docker
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> Operations: Services, Monitoring & Load Relief

In production Frappe v15 environments, maintaining uptime requires active process monitoring, database health management, and Redis memory load relief.

---

## 1. Supervisor Process Management

In production, **Supervisor** monitors and manages Gunicorn web processes, Redis servers, and background RQ worker queues.

### Checking Supervisor Process Status

```bash
# Check status of all managed Frappe processes
sudo supervisorctl status
```

#### Example Output

```text
frappe-bench-workers:frappe-bench-default-worker-0       RUNNING   pid 14201, uptime 3 days, 4:12:00
frappe-bench-workers:frappe-bench-short-worker-0         RUNNING   pid 14202, uptime 3 days, 4:12:00
frappe-bench-workers:frappe-bench-long-worker-0          RUNNING   pid 14203, uptime 3 days, 4:12:00
frappe-bench-web:frappe-bench-gunicorn                    RUNNING   pid 14190, uptime 3 days, 4:12:00
frappe-bench-redis:frappe-bench-redis-cache               RUNNING   pid 14180, uptime 3 days, 4:12:00
frappe-bench-redis:frappe-bench-redis-queue               RUNNING   pid 14181, uptime 3 days, 4:12:00
```

### Restarting Supervisor Services

```bash
# 1. Restart all Frappe processes
sudo supervisorctl restart all

# 2. Restart ONLY web Gunicorn workers (zero downtime deployment)
sudo supervisorctl restart frappe-bench-web:frappe-bench-gunicorn

# 3. Restart background RQ workers
sudo supervisorctl restart frappe-bench-workers:*

# 4. Reload Supervisor configuration after bench setup changes
sudo supervisorctl reread
sudo supervisorctl update
```

---

## 2. Nginx Web Server Management

Nginx acts as reverse proxy, terminating SSL/TLS and routing static asset requests directly from disk (`sites/assets`).

```bash
# 1. Test Nginx syntax prior to reload
sudo nginx -t

# 2. Reload Nginx configuration without dropping active connections
sudo systemctl reload nginx

# 3. Hard restart Nginx service
sudo systemctl restart nginx

# 4. View real-time Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 3. Database Monitoring & Service Management (MariaDB)

### Service Status & Restart

```bash
# Check MariaDB status
sudo systemctl status mariadb

# Restart MariaDB database service
sudo systemctl restart mariadb
```

---

### Inspecting Running Database Queries & Locks

Login to MariaDB terminal:

```bash
sudo mysql -u root -p
```

```sql
-- 1. View all active running queries and thread states
SHOW FULL PROCESSLIST;

-- 2. Find queries running for more than 10 seconds
SELECT id, user, host, db, command, time, state, info
FROM information_schema.processlist
WHERE command != 'Sleep' AND time > 10
ORDER BY time DESC;

-- 3. Check for active InnoDB row locks & transactions
SELECT * FROM information_schema.innodb_trx;
```

---

### Killing Slow / Unresponsive Database Queries

If a stuck report or un-indexed query is consuming 100% DB CPU load:

```sql
-- Kill process by ID (obtained from SHOW PROCESSLIST)
KILL 14205;
```

---

## 4. Releasing Memory & Load from Redis & MariaDB

When production servers experience memory bloat, high CPU usage, or stuck queues, use these step-by-step procedures to release load safely:

### Step 1: Clear Frappe Redis Cache

```bash
# 1. Clear site Redis cache via Bench CLI (Safe for production)
bench --site site1.localhost clear-cache

# 2. Clear Jinja website cache
bench --site site1.localhost clear-website-cache
```

---

### Step 2: Flush Redis Cache Keys Directly (`redis-cli`)

```bash
# Connect to site Redis Cache instance (default port 13000 in dev / 6379 in prod)
redis-cli -p 13000 FLUSHDB

# Check memory fragmentation & key count
redis-cli -p 13000 INFO memory
```

> [!WARNING]
> Flush only the **Redis Cache** instance (`13000` / cache DB). Do NOT flush the **Redis Queue** instance (`11000`) unless you intend to purge queued background jobs!

---

### Step 3: Purge Failed Background RQ Jobs

```bash
# Inspect doctor status for dead workers or failed jobs
bench doctor

# Purge failed background RQ jobs
bench purge-jobs
```

---

### Step 4: Releasing MariaDB Memory & Buffer Pool Tuning

If MariaDB memory usage is leaking, adjust InnoDB buffer pool settings in `/etc/mysql/mariadb.conf.d/50-frappe.cnf`:

```ini
[mysqld]
# Set buffer pool to 50-70% of total system RAM for dedicated DB servers
innodb_buffer_pool_size = 4G
innodb_log_file_size = 512M
max_connections = 250
```

Restart MariaDB to apply memory release:

```bash
sudo systemctl restart mariadb
```

---

## Related Topics

- [03. Bench CLI Reference](/03-bench-cli/)
- [15. Background Jobs](/15-background-jobs-scheduler/)
- [25. DevOps: Dependency Installation](/25-devops-installation/)
- [27. Production: Frappe Docker & Containers](/27-frappe-docker/)
