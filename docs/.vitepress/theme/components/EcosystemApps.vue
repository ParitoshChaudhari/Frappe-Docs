<template>
  <div class="ecosystem-section">
    <div class="ecosystem-header">
      <div class="title-row">
        <span class="header-icon">🌟</span>
        <h3 class="ecosystem-title">Official Ecosystem Applications</h3>
      </div>
      <p class="ecosystem-sub">Production-grade open-source applications built on Frappe Framework v15</p>
    </div>

    <div class="ecosystem-grid">
      <div 
        v-for="app in apps" 
        :key="app.name" 
        class="app-card"
        :style="{ '--app-color': app.color }"
      >
        <div class="app-accent-top"></div>

        <div class="app-head">
          <div class="app-title-group">
            <span class="app-icon">{{ app.icon }}</span>
            <strong class="app-name">{{ app.name }}</strong>
          </div>
          <span class="app-badge" :style="{ background: app.color }">{{ app.category }}</span>
        </div>

        <p class="app-desc">{{ app.desc }}</p>

        <div class="app-copy-box" @click="copyCommand(app.command, app.name)">
          <code class="cmd-text">{{ app.command }}</code>
          <span class="copy-btn">
            <template v-if="copiedApp === app.name">✓ Copied</template>
            <template v-else>📋 Copy</template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EcosystemApps',
  data() {
    return {
      copiedApp: null,
      apps: [
        {
          name: 'ERPNext',
          icon: '📦',
          category: 'ERP & FINANCES',
          color: '#10b981',
          desc: 'Comprehensive ERP suite covering Accounting, Inventory, Sales, HR, Purchasing & Manufacturing.',
          command: 'bench get-app erpnext'
        },
        {
          name: 'Frappe HR',
          icon: '👥',
          category: 'HRMS & PAYROLL',
          color: '#3b82f6',
          desc: 'Modern Human Resource Management System for Employee Lifecycle, Attendance & Payroll.',
          command: 'bench get-app hrms'
        },
        {
          name: 'India Compliance',
          icon: '⚖️',
          category: 'STATUTORY & GST',
          color: '#f59e0b',
          desc: 'Official tax compliance app for Indian businesses — GST Returns, E-Way Bills & Audit Trails.',
          command: 'bench get-app india_compliance'
        }
      ]
    };
  },
  methods: {
    copyCommand(cmd, name) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(cmd);
        this.copiedApp = name;
        setTimeout(() => {
          this.copiedApp = null;
        }, 2000);
      }
    }
  }
};
</script>

<style scoped>
.ecosystem-section {
  margin: 3rem 0;
  font-family: var(--vp-font-family-base);
}

.ecosystem-header {
  margin-bottom: 1.5rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 1.25rem;
}

.ecosystem-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.ecosystem-sub {
  margin: 0.35rem 0 0;
  font-size: 0.86rem;
  color: var(--vp-c-text-2);
}

.ecosystem-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.app-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 1.35rem;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.app-accent-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--app-color);
  opacity: 0.9;
}

.app-card:hover {
  transform: translateY(-5px);
  border-color: var(--app-color);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1), 0 0 20px rgba(56, 189, 248, 0.08);
}

.app-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 0.85rem;
}

.app-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-icon {
  font-size: 1.1rem;
}

.app-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.app-badge {
  font-size: 0.62rem;
  font-weight: 800;
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 10px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.app-desc {
  font-size: 0.86rem;
  color: var(--vp-c-text-2);
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

.app-copy-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-copy-box:hover {
  border-color: var(--app-color);
  background: #1e293b;
}

.cmd-text {
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
  color: #38bdf8;
  background: transparent;
  padding: 0;
}

.copy-btn {
  font-size: 0.74rem;
  font-weight: 700;
  color: #94a3b8;
  transition: color 0.15s ease;
}

.app-copy-box:hover .copy-btn {
  color: #ffffff;
}
</style>
