<template>
  <div class="hero-quicknav-container">
    <div class="quicknav-tabs" role="tablist" aria-label="Hero Code Examples">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['quick-tab', { active: activeTab.id === tab.id }]"
        @click="activeTab = tab"
        role="tab"
        :aria-selected="activeTab.id === tab.id"
        :aria-label="'View ' + tab.label + ' example'"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <div class="quicknav-content" :style="{ borderColor: activeTab.color }">
      <div class="quicknav-header">
        <div class="quicknav-title-group">
          <span class="badge" :style="{ background: activeTab.color, color: '#fff' }">{{ activeTab.badge }}</span>
          <span class="quicknav-summary">{{ activeTab.summary }}</span>
        </div>
        <a :href="activeTab.link" class="quicknav-link" :style="{ color: activeTab.color }">
          Explore Chapter →
        </a>
      </div>

      <div class="quicknav-code-wrap">
        <pre class="quicknav-code"><code>{{ activeTab.code }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeroQuickNav',
  data() {
    return {
      activeTab: null,
      tabs: [
        {
          id: 'orm',
          label: 'Python ORM',
          badge: 'SERVER',
          icon: '🐍',
          color: '#36b37e',
          summary: 'High-performance ORM methods for fetching, editing & persisting documents.',
          link: '/10-database/',
          code: `doc = frappe.get_doc("Task", "TASK-00001")\ndoc.priority = "High"\ndoc.save()\n# Returns updated Document ORM instance`
        },
        {
          id: 'js',
          label: 'Client JS SDK',
          badge: 'CLIENT',
          icon: '🌐',
          color: '#ffab00',
          summary: 'Form event handlers, field updates, toolbar buttons & Desk JS proxies.',
          link: '/11-client-api/',
          code: `frappe.ui.form.on("Task", {\n  refresh(frm) {\n    frm.add_custom_button(__("Approve"), () => frm.set_value("status", "Approved"));\n  }\n});`
        },
        {
          id: 'cli',
          label: 'Bench CLI',
          badge: 'CLI & DEVOPS',
          icon: '💻',
          color: '#0052cc',
          summary: 'CLI commands for site creation, app management, migrations & services.',
          link: '/03-bench-cli/',
          code: `# List installed apps on target site\nbench --site site1.localhost list-apps\n# Run pending migrations & patches\nbench --site site1.localhost migrate`
        },
        {
          id: 'rest',
          label: 'REST & RPC API',
          badge: 'INTEGRATIONS',
          icon: '🔌',
          color: '#904ee2',
          summary: 'Token-authenticated REST resource endpoints & whitelisted RPC functions.',
          link: '/13-rest-api/',
          code: `curl -X GET "https://site1.localhost/api/resource/Task/TASK-00001" \\\n  -H "Authorization: token api_key:api_secret"`
        },
        {
          id: 'jobs',
          label: 'Async RQ Jobs',
          badge: 'BACKGROUND',
          icon: '⏱️',
          color: '#00b8d9',
          summary: 'Asynchronous background task queuing with configurable Redis RQ timeouts.',
          link: '/15-background-jobs-scheduler/',
          code: `frappe.enqueue("my_app.tasks.generate_pdf", queue="long", timeout=1800)`
        }
      ]
    };
  },
  created() {
    this.activeTab = this.tabs[0];
  }
};
</script>

<style scoped>
.hero-quicknav-container {
  margin: 1.5rem 0 2.5rem;
  position: relative;
  z-index: 1;
}

.quicknav-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-bottom: 12px;
  padding-bottom: 4px;
}

.quick-tab {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  display: flex;
  align-items: center;
  gap: 6px;
}

.quick-tab:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}

.quick-tab.active {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.quicknav-content {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-left-width: 4px;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.quicknav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.quicknav-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quicknav-summary {
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.quicknav-link {
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
}

.quicknav-code-wrap {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #333;
}

.quicknav-code {
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 0.84rem;
  line-height: 1.5;
  color: #e2e8f0;
  overflow-x: auto;
}
</style>
