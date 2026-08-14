---
title: DevOps - Installing Frappe v15 Dependencies
description: Step-by-step installation commands for Node.js, Python, MariaDB, Redis, wkhtmltopdf, Git, and Bench across macOS, Linux, Windows WSL2, Package Managers, and Docker.
version: v15
category: DevOps, Production & Docker
status: Stable
---

# <span class="badge v15">v15</span> <span class="badge stable">Stable</span> DevOps: Installing Frappe v15 Dependencies

Before creating sites or installing Frappe v15 apps, your host environment must have the required core dependencies configured.

---

## 1. System Dependencies Overview

Frappe Framework v15 requires:

- **Python**: `3.10`, `3.11`, or `3.12`
- **Node.js**: `18.x` or `20.x` & `yarn`
- **Database**: MariaDB `10.6+` (or PostgreSQL `14+`)
- **Cache & Queue**: Redis `6.x` or `7.x`
- **PDF Renderer**: `wkhtmltopdf` (0.12.6 with patched qt)
- **Git**: `2.30+`

---

## 2. Step-by-Step Dependency Installation

Select your platform below to view exact terminal installation commands:

### Step 1: Install Git & Build Tools

::: code-group

```bash [macOS & Linux]
# Ubuntu / Debian
sudo apt update && sudo apt install -y git build-essential python3-dev libffi-dev libssl-dev

# macOS (Homebrew)
brew install git
```

```powershell [Windows (WSL2)]
# Open Ubuntu terminal in WSL2:
wsl --install -d Ubuntu-22.04
sudo apt update && sudo apt install -y git build-essential python3-dev libffi-dev libssl-dev
```

```bash [Package Managers]
# Arch Linux / Manjaro
sudo pacman -S git base-devel python

# Fedora / RHEL
sudo dnf install -y git gcc python3-devel libffi-devel openssl-devel
```

```bash [Docker]
# Run official Ubuntu container for clean build testing
docker run -it --name frappe-dev ubuntu:22.04 bash
apt update && apt install -y git build-essential python3-dev
```

:::

---

### Step 2: Install Python & Virtual Environment

::: code-group

```bash [macOS & Linux]
# Ubuntu 22.04 / 24.04
sudo apt install -y python3-pip python3-venv python3-dev

# macOS via Homebrew
brew install python@3.11
```

```powershell [Windows (WSL2)]
sudo apt install -y python3-pip python3-venv python3-dev
python3 --version
```

```bash [Package Managers]
# pyenv (Cross-platform Python version manager)
curl https://pyenv.run | bash
pyenv install 3.11.9
pyenv global 3.11.9
```

```bash [Docker]
apt install -y python3-pip python3-venv python3-dev
```

:::

---

### Step 3: Install Node.js (18 / 20) & Yarn

::: code-group

```bash [macOS & Linux]
# Install Node.js 20 LTS via NVM (Recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
npm install -g yarn
```

```powershell [Windows (WSL2)]
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
npm install -g yarn
```

```bash [Package Managers]
# macOS Homebrew
brew install node@20
brew install yarn
```

```bash [Docker]
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g yarn
```

:::

---

### Step 4: Install & Configure MariaDB / MySQL

Frappe requires specific MariaDB configuration settings (`barracuda` format and `utf8mb4` character set).

::: code-group

```bash [macOS & Linux]
# Install MariaDB Server
sudo apt install -y mariadb-server mariadb-client

# Configure MariaDB My.cnf for Frappe
sudo bash -c 'cat <<EOF > /etc/mysql/mariadb.conf.d/50-frappe.cnf
[mysqld]
innodb-file-format = Barracuda
innodb-file-per-table = 1
innodb-large-prefix = 1
character-set-client-handshake = FALSE
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

[mysql]
default-character-set = utf8mb4
EOF'

sudo systemctl restart mariadb
sudo mysql_secure_installation
```

```powershell [Windows (WSL2)]
sudo apt install -y mariadb-server mariadb-client
sudo service mariadb start
sudo mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'admin';"
```

```bash [Package Managers]
# macOS Homebrew
brew install mariadb
brew services start mariadb
sudo mariadb-secure-installation
```

```bash [Docker]
# Run isolated MariaDB container for Frappe
docker run -d --name frappe-mariadb \
  -e MYSQL_ROOT_PASSWORD=admin \
  -p 3306:3306 \
  mariadb:10.6 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci
```

:::

---

### Step 5: Install Redis (Cache & Queue)

::: code-group

```bash [macOS & Linux]
# Ubuntu
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

```powershell [Windows (WSL2)]
sudo apt install -y redis-server
sudo service redis-server start
redis-cli ping  # Should return PONG
```

```bash [Package Managers]
# macOS Homebrew
brew install redis
brew services start redis
```

```bash [Docker]
docker run -d --name frappe-redis -p 6379:6379 redis:7-alpine
```

:::

---

### Step 6: Install wkhtmltopdf & Bench CLI

::: code-group

```bash [macOS & Linux]
# Install wkhtmltopdf
sudo apt install -y xvfb libfontconfig wkhtmltopdf

# Install Bench CLI globally via pip
pip3 install bench
bench --version
```

```powershell [Windows (WSL2)]
sudo apt install -y xvfb libfontconfig wkhtmltopdf
pip3 install bench
```

```bash [Package Managers]
# macOS Homebrew
brew install caskroom/cask/wkhtmltopdf
pip3 install bench
```

```bash [Docker]
apt install -y wkhtmltopdf
pip3 install bench
```

:::

---

## 3. Initializing Bench & First Site Setup

Once all dependencies are installed:

```bash
# 1. Initialize Bench
bench init --frappe-branch version-15 frappe-bench
cd frappe-bench

# 2. Create new site
bench new-site site1.localhost --admin-password admin

# 3. Start development stack
bench start
```

---

## Related Topics

- [01. Getting Started](/01-getting-started/)
- [26. Operations: Services & Performance Monitoring](/26-devops-operations/)
- [27. Production: Frappe Docker & Containers](/27-frappe-docker/)
