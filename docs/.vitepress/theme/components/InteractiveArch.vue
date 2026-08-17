<template>
  <div class="arch-interactive-container">
    <div class="arch-header">
      <div class="arch-title-wrap">
        <h3 class="arch-title">🏛️ Frappe Framework v15 Architecture Visualizer</h3>
        <p class="arch-subtitle">Click on any layer to inspect internal mechanisms, APIs, and data flow</p>
      </div>
      <div class="arch-pulse-badge">
        <span class="live-ring"></span> Dynamic Architecture
      </div>
    </div>

    <!-- Visual Layer Nodes -->
    <div class="arch-grid">
      <div 
        v-for="layer in layers" 
        :key="layer.id"
        :class="['arch-node', { active: activeLayer.id === layer.id }]"
        @click="selectLayer(layer)"
      >
        <div class="node-icon-wrap" :style="{ background: layer.colorSoft, color: layer.color }">
          <span>{{ layer.icon }}</span>
        </div>
        <div class="node-info">
          <div class="node-name-row">
            <span class="node-name">{{ layer.title }}</span>
            <span class="node-badge" :style="{ background: layer.color, color: '#fff' }">{{ layer.badge }}</span>
          </div>
          <p class="node-desc">{{ layer.shortDesc }}</p>
        </div>
        <div class="node-arrow" v-if="activeLayer.id === layer.id">
          <span>⚡</span>
        </div>
      </div>
    </div>

    <!-- Connected Flow Pipeline Indicator -->
    <div class="pipeline-bar">
      <div class="pipeline-step">Browser Client</div>
      <div class="pipeline-connector"><span class="flow-pulse"></span></div>
      <div class="pipeline-step">WSGI / Gunicorn</div>
      <div class="pipeline-connector"><span class="flow-pulse"></span></div>
      <div class="pipeline-step">DocType ORM</div>
      <div class="pipeline-connector"><span class="flow-pulse"></span></div>
      <div class="pipeline-step">MariaDB &amp; Redis</div>
    </div>

    <!-- Selected Layer Details Card -->
    <div class="arch-detail-panel" :style="{ borderColor: activeLayer.color }">
      <div class="detail-header">
        <div class="detail-title-group">
          <span class="detail-icon" :style="{ background: activeLayer.colorSoft, color: activeLayer.color }">{{ activeLayer.icon }}</span>
          <div>
            <h4 class="detail-title">{{ activeLayer.title }}</h4>
            <span class="detail-sub">{{ activeLayer.subTitle }}</span>
          </div>
        </div>
        <a :href="activeLayer.link" class="detail-link-btn" :style="{ background: activeLayer.color }">
          Read Full Chapter →
        </a>
      </div>

      <div class="detail-body">
        <div class="detail-column">
          <h5>🔑 Core Capabilities &amp; APIs</h5>
          <ul class="detail-feature-list">
            <li v-for="(feat, idx) in activeLayer.features" :key="idx">
              <span class="bullet-dot" :style="{ background: activeLayer.color }"></span>
              <span>{{ feat }}</span>
            </li>
          </ul>
        </div>

        <div class="detail-column code-column">
          <h5>💻 Primary Code Interface</h5>
          <pre class="detail-code-block"><code>{{ activeLayer.codeSnippet }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InteractiveArch',
  data() {
    return {
      activeLayer: null,
      layers: [
        {
          id: 'client',
          title: 'Desk UI & Client JS SDK',
          badge: 'CLIENT JS',
          icon: '🖥️',
          color: '#ffab00',
          colorSoft: 'rgba(255, 171, 0, 0.15)',
          shortDesc: 'Form Engine, Desk Views, Client Scripts, Socket.IO & Dialogs',
          subTitle: 'Browser Desk Interface & Form Controls',
          link: '/11-client-api/',
          features: [
            'frappe.ui.form.on() event handlers (refresh, validate, onload)',
            'frm.set_value(), frm.set_df_property() dynamic inputs',
            'frappe.db client proxy for asynchronous server querying',
            'Socket.IO realtime WebSockets listener via frappe.realtime.on()'
          ],
          codeSnippet: `frappe.ui.form.on("Task", {\n  refresh(frm) {\n    if (!frm.is_new()) {\n      frm.add_custom_button(__("Complete"), () => {\n        frm.set_value("status", "Completed");\n        frm.save();\n      });\n    }\n  }\n});`
        },
        {
          id: 'server',
          title: 'Python Web Server & Router',
          badge: 'PYTHON WSGI',
          icon: '⚙️',
          color: '#0052cc',
          colorSoft: 'rgba(0, 82, 204, 0.15)',
          shortDesc: 'Werkzeug WSGI, Gunicorn workers, Jinja2 & REST endpoints',
          subTitle: 'HTTP Request Routing & Session Dispatcher',
          link: '/09-server-api/',
          features: [
            '@frappe.whitelist() REST RPC methods with authority checks',
            'Thread-local context frappe.local (site, user, form_dict)',
            'hooks.py request lifecycle middlewares & doc_events',
            'Jinja2 SSR web page rendering and Print Format engine'
          ],
          codeSnippet: `@frappe.whitelist()\ndef get_task_summary(task_id: str):\n    doc = frappe.get_doc("Task", task_id)\n    return {\n        "name": doc.name,\n        "status": doc.status,\n        "owner": doc.owner\n    }`
        },
        {
          id: 'orm',
          title: 'Document ORM & QueryBuilder',
          badge: 'ORM & QUERY',
          icon: '📦',
          color: '#36b37e',
          colorSoft: 'rgba(54, 179, 126, 0.15)',
          shortDesc: 'Document ORM class, frappe.db, PyPika QueryBuilder & JSON metadata',
          subTitle: 'Data Access Layer & Schema Mapping',
          link: '/30-frappe-orm/',
          features: [
            'frappe.get_doc(), doc.insert(), doc.save(), doc.submit() ORM methods',
            'frappe.db.get_value(), get_list(), set_value() fast SQL readers',
            'PyPika SQL QueryBuilder frappe.qb with joins, unions & subqueries',
            'DocType JSON metadata schemas with automatic DDL sync'
          ],
          codeSnippet: `Task = frappe.qb.DocType("Task")\nhigh_priority = (\n    frappe.qb.from_(Task)\n    .select(Task.name, Task.subject)\n    .where(Task.priority == "High")\n    .run(as_dict=True)\n)`
        },
        {
          id: 'storage',
          title: 'MariaDB, Redis & RQ Workers',
          badge: 'DEVOPS & REDIS',
          icon: '🚀',
          color: '#904ee2',
          colorSoft: 'rgba(144, 78, 226, 0.15)',
          shortDesc: 'MariaDB SQL persistence, Redis Cache/Queue & background RQ workers',
          subTitle: 'Persistence, Caching & Async Execution',
          link: '/15-background-jobs-scheduler/',
          features: [
            'MariaDB InnoDB / Barracuda UTF8MB4 relational database',
            'Redis Cache for site configuration and document caching',
            'Background RQ worker queues (short: 300s, long: 1500s)',
            'Bench periodic task scheduler running background jobs'
          ],
          codeSnippet: `# Offload heavy task to Redis RQ worker queue\nfrappe.enqueue(\n    "my_app.tasks.process_monthly_payroll",\n    queue="long",\n    timeout=1800,\n    enqueue_after_commit=True\n)`
        }
      ]
    };
  },
  created() {
    this.activeLayer = this.layers[0];
  },
  methods: {
    selectLayer(layer) {
      this.activeLayer = layer;
    }
  }
};
</script>

<style scoped>
.arch-interactive-container {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 1.75rem;
  margin: 2.5rem 0;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
}

.arch-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.arch-title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--vp-c-text-1);
}

.arch-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.arch-pulse-badge {
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 4px 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(0, 82, 204, 0.2);
}

.live-ring {
  width: 8px;
  height: 8px;
  background-color: var(--vp-c-brand-1);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--vp-c-brand-1);
  animation: pulseRing 1.8s infinite;
}

@keyframes pulseRing {
  0% { transform: scale(0.9); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.4; }
  100% { transform: scale(0.9); opacity: 1; }
}

.arch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.arch-node {
  background: var(--vp-c-bg-soft);
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.2, 0, 0, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.arch-node:hover {
  transform: translateY(-4px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.arch-node.active {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 8px 24px rgba(0, 82, 204, 0.15);
}

.node-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.node-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.node-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
}

.node-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.4px;
}

.node-desc {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.4;
}

.pipeline-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  padding: 10px 16px;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  overflow-x: auto;
}

.pipeline-connector {
  flex-grow: 1;
  height: 2px;
  background: var(--vp-c-divider);
  margin: 0 12px;
  position: relative;
  min-width: 30px;
}

.flow-pulse {
  position: absolute;
  top: -3px;
  left: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  box-shadow: 0 0 6px var(--vp-c-brand-1);
  animation: flowMove 2s linear infinite;
}

@keyframes flowMove {
  0% { left: 0%; opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
}

.arch-detail-panel {
  background: var(--vp-c-bg-soft);
  border-left: 4px solid var(--vp-c-brand-1);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.detail-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.detail-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
}

.detail-sub {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.detail-link-btn {
  color: #fff;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.detail-link-btn:hover {
  opacity: 0.9;
}

.detail-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.detail-column h5 {
  margin: 0 0 0.75rem;
  font-size: 0.88rem;
  color: var(--vp-c-text-1);
}

.detail-feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-feature-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}

.bullet-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.detail-code-block {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  line-height: 1.5;
  color: #d4d4d4;
  overflow-x: auto;
  border: 1px solid #333;
}
</style>
