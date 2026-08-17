<template>
  <div class="pathways-container">
    <div class="pathways-header">
      <div class="pathways-title-wrap">
        <span class="pathways-icon">🎯</span>
        <h3 class="pathways-heading">Developer Focus Pathways</h3>
      </div>
      <p class="pathways-sub">Select your primary development role to jump directly to relevant APIs, architecture, and guides</p>
    </div>

    <div class="pathways-grid">
      <div 
        v-for="path in pathways" 
        :key="path.id" 
        class="path-card"
        :style="{ '--path-accent': path.color }"
      >
        <div class="path-accent-top"></div>
        
        <div class="path-card-head">
          <div class="path-title-group">
            <span class="path-icon">{{ path.icon }}</span>
            <h4 class="path-title">{{ path.title }}</h4>
          </div>
          <span class="path-badge" :style="{ background: path.color }">{{ path.badge }}</span>
        </div>

        <p class="path-desc" v-html="path.descHtml"></p>

        <div class="path-card-foot">
          <a :href="path.link" class="path-cta-btn">
            <span>{{ path.ctaText }}</span>
            <span class="cta-arrow">→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeveloperPathways',
  data() {
    return {
      pathways: [
        {
          id: 'backend',
          icon: '🐍',
          title: 'Backend & ORM',
          badge: 'SERVER',
          color: '#3b82f6',
          descHtml: 'Master <code class="chip">frappe.get_doc</code>, PyPika QueryBuilder, parameterized SQL, controller hooks &amp; Redis cache.',
          link: '/10-database/',
          ctaText: 'Explore ORM Guide'
        },
        {
          id: 'client',
          icon: '🌐',
          title: 'Client Scripting',
          badge: 'CLIENT',
          color: '#f59e0b',
          descHtml: 'Build Desk form events with <code class="chip">frm</code> handlers, dynamic inputs, <code class="chip">frm.page</code> toolbar &amp; WebSockets.',
          link: '/11-client-api/',
          ctaText: 'Explore Client SDK'
        },
        {
          id: 'devops',
          icon: '⚙️',
          title: 'Bench CLI & DevOps',
          badge: 'DEVOPS',
          color: '#10b981',
          descHtml: 'Manage Bench sites, run migrations, execute database CLI, configure Docker compose &amp; Helm deployment.',
          link: '/03-bench-cli/',
          ctaText: 'Explore Bench CLI'
        },
        {
          id: 'rest',
          icon: '🔌',
          title: 'REST & Integrations',
          badge: 'INTEGRATIONS',
          color: '#8b5cf6',
          descHtml: 'Build token-authenticated REST resource endpoints, file upload APIs &amp; whitelisted <code class="chip">@frappe.whitelist()</code> RPC calls.',
          link: '/13-rest-api/',
          ctaText: 'Explore REST API'
        }
      ]
    };
  }
};
</script>

<style scoped>
.pathways-container {
  margin: 2.5rem 0 3rem;
  font-family: var(--vp-font-family-base);
}

.pathways-header {
  margin-bottom: 1.5rem;
}

.pathways-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pathways-icon {
  font-size: 1.25rem;
}

.pathways-heading {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.pathways-sub {
  margin: 0.35rem 0 0;
  font-size: 0.86rem;
  color: var(--vp-c-text-2);
}

.pathways-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.path-card {
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

.path-accent-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--path-accent);
  opacity: 0.9;
}

.path-card:hover {
  transform: translateY(-5px);
  border-color: var(--path-accent);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1), 0 0 20px rgba(56, 189, 248, 0.08);
}

.path-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 0.85rem;
}

.path-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.path-icon {
  font-size: 1.1rem;
}

.path-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.path-badge {
  font-size: 0.64rem;
  font-weight: 800;
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 10px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.path-desc {
  font-size: 0.86rem;
  color: var(--vp-c-text-2);
  margin: 0 0 1.35rem;
  line-height: 1.55;
}

:deep(.chip) {
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
  background: rgba(0, 82, 204, 0.1);
  color: var(--vp-c-brand-1);
  padding: 2px 6px;
  border-radius: 5px;
  border: 1px solid rgba(0, 82, 204, 0.2);
}

.dark :deep(.chip) {
  background: rgba(76, 154, 255, 0.12);
  border-color: rgba(76, 154, 255, 0.25);
  color: #38bdf8;
}

.path-card-foot {
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 12px;
}

.path-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--path-accent);
  text-decoration: none;
  transition: all 0.2s ease;
}

.cta-arrow {
  transition: transform 0.2s ease;
}

.path-card:hover .cta-arrow {
  transform: translateX(4px);
}
</style>
