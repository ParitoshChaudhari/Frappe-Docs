<template>
  <div class="explorer-section">
    <!-- Explorer Main Header / Command Bar -->
    <div class="command-bar">
      <div class="search-field-container">
        <span class="search-lens">🔍</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          ref="searchInput"
          placeholder="Search APIs, CLI commands, ORM methods, hooks..."
          aria-label="Search entire documentation for APIs, CLI commands, ORM methods, and hooks"
          class="command-input"
        />
        <div class="search-actions">
          <span v-if="searchQuery" @click="searchQuery = ''" class="clear-chip" title="Clear query" aria-label="Clear search input">Clear ✕</span>
          <span class="shortcut-chip">⌘K</span>
        </div>
      </div>

      <!-- Segmented Category Filter Tabs -->
      <div class="segmented-control" role="tablist" aria-label="Documentation Categories">
        <button 
          v-for="cat in categories" 
          :key="cat.id" 
          :class="['segmented-btn', { active: activeCat === cat.id }]"
          @click="selectCategory(cat.id)"
          role="tab"
          :aria-selected="activeCat === cat.id"
          :aria-label="'Filter by ' + cat.name"
        >
          <span class="tab-dot" :style="{ background: cat.color }"></span>
          <span>{{ cat.name }}</span>
        </button>
      </div>

      <!-- Layout View Switcher Buttons -->
      <div class="view-toggle" role="group" aria-label="Layout view options">
        <button 
          :class="['view-btn', { active: viewMode === 'grid' }]" 
          @click="viewMode = 'grid'" 
          title="Grid View"
          aria-label="Switch to Grid View"
        >
          <span>田 Grid</span>
        </button>
        <button 
          :class="['view-btn', { active: viewMode === 'list' }]" 
          @click="viewMode = 'list'" 
          title="Compact List View"
          aria-label="Switch to Compact List View"
        >
          <span>≡ List</span>
        </button>
      </div>
    </div>

    <!-- Active Results Counter Bar -->
    <div class="results-meta-bar" v-if="searchQuery || activeCat !== 'all'">
      <span class="results-count">
        Showing <strong>{{ displayedApis.length }}</strong> of {{ filteredApis.length }} items
        <span v-if="searchQuery"> for "<strong>{{ searchQuery }}</strong>"</span>
      </span>
      <button v-if="searchQuery || activeCat !== 'all'" @click="resetFilters" class="reset-link">
        Reset filters
      </button>
    </div>

    <!-- GRID VIEW LAYOUT (Capped to 6-8 default cards) -->
    <TransitionGroup 
      v-if="viewMode === 'grid'" 
      name="card-anim" 
      tag="div" 
      class="explorer-grid"
    >
      <div 
        v-for="item in displayedApis" 
        :key="item.name + item.link" 
        class="card-item"
        :style="{ '--accent': getCatColor(item.cat) }"
      >
        <div class="card-accent-bar"></div>

        <div class="card-head">
          <div class="code-signature">
            <span class="prefix">{{ parseCode(item.name).prefix }}</span>
            <span class="method">{{ parseCode(item.name).method }}</span>
            <span class="args">{{ parseCode(item.name).args }}</span>
          </div>
          <span class="type-badge" :style="{ background: getCatColor(item.cat) }">
            {{ item.cat.toUpperCase() }}
          </span>
        </div>

        <p class="card-desc">{{ item.desc }}</p>

        <div class="card-foot">
          <span class="chapter-tag">{{ item.chapter }}</span>
          <a :href="item.link" class="link-btn">
            View Docs <span class="arrow">→</span>
          </a>
        </div>
      </div>
    </TransitionGroup>

    <!-- COMPACT LIST VIEW LAYOUT -->
    <div v-else class="explorer-list">
      <div 
        v-for="item in displayedApis" 
        :key="item.name + item.link" 
        class="list-item"
        :style="{ '--accent': getCatColor(item.cat) }"
      >
        <div class="list-left">
          <span class="list-cat-dot" :style="{ background: getCatColor(item.cat) }"></span>
          <div class="code-signature">
            <span class="prefix">{{ parseCode(item.name).prefix }}</span>
            <span class="method">{{ parseCode(item.name).method }}</span>
            <span class="args">{{ parseCode(item.name).args }}</span>
          </div>
          <span class="list-desc">{{ item.desc }}</span>
        </div>
        <div class="list-right">
          <span class="chapter-tag">{{ item.chapter }}</span>
          <a :href="item.link" class="link-btn">Docs →</a>
        </div>
      </div>
    </div>

    <!-- SHOW MORE / SHOW LESS TOGGLE BUTTON -->
    <div v-if="hasMore || isExpanded" class="expand-bar">
      <button class="expand-btn" @click="isExpanded = !isExpanded">
        <span v-if="!isExpanded">Show All Topics ({{ filteredApis.length }} items) ↓</span>
        <span v-else>Show Less (6 items) ↑</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="filteredApis.length === 0" class="empty-state">
      <span class="empty-icon">🔎</span>
      <h4>No documentation matches found</h4>
      <p>Try searching for <code>get_doc</code>, <code>db</code>, <code>bench</code>, <code>hooks</code>, <code>docker</code>, or <code>enqueue</code>.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InteractiveApiSearch',
  data() {
    return {
      searchQuery: '',
      activeCat: 'all',
      viewMode: 'grid',
      isExpanded: false,
      limitCount: 6,
      categories: [
        { id: 'all', name: 'All', color: '#38bdf8' },
        { id: 'server', name: 'Server', color: '#10b981' },
        { id: 'client', name: 'Client', color: '#f59e0b' },
        { id: 'db', name: 'ORM', color: '#3b82f6' },
        { id: 'cli', name: 'CLI', color: '#8b5cf6' },
        { id: 'devops', name: 'DevOps', color: '#ec4899' }
      ],
      apiList: [
        // Document ORM
        { name: 'frappe.get_doc(dt, name)', type: 'server', cat: 'db', tags: 'orm document load fetch get_doc', desc: 'Instantiate Document ORM instance from database or dictionary', chapter: '06. Document ORM', link: '/06-documents/#frappe-get-doc' },
        { name: 'frappe.new_doc(dt)', type: 'server', cat: 'db', tags: 'new doc create document', desc: 'Initialize new Document ORM instance with default field values', chapter: '06. Document ORM', link: '/06-documents/#frappe-new-doc' },
        { name: 'frappe.copy_doc(doc)', type: 'server', cat: 'db', tags: 'copy duplicate doc document', desc: 'Duplicates existing document object in memory without saving', chapter: '06. Document ORM', link: '/06-documents/#frappe-copy_doc' },
        { name: 'doc.save()', type: 'server', cat: 'db', tags: 'save update persist document', desc: 'Saves edits on existing document to MariaDB/PostgreSQL database', chapter: '06. Document ORM', link: '/06-documents/#doc-save' },
        { name: 'doc.submit()', type: 'server', cat: 'db', tags: 'submit docstatus 1 document', desc: 'Submits draft document (sets docstatus: 1)', chapter: '06. Document ORM', link: '/06-documents/#doc-submit-doc-cancel' },
        { name: 'doc.cancel()', type: 'server', cat: 'db', tags: 'cancel docstatus 2 document', desc: 'Cancels submitted document (sets docstatus: 2)', chapter: '06. Document ORM', link: '/06-documents/#doc-submit-doc-cancel' },
        { name: 'frappe.rename_doc(dt, old, new)', type: 'server', cat: 'db', tags: 'rename doc primary key key', desc: 'Renames document primary key and updates all foreign references', chapter: '06. Document ORM', link: '/06-documents/#frappe-model-rename_doc' },
        { name: 'frappe.delete_doc(dt, name)', type: 'server', cat: 'db', tags: 'delete doc remove record', desc: 'Programmatically deletes document record and linked child rows', chapter: '06. Document ORM', link: '/06-documents/#frappe-model-delete_doc' },

        // Database API & ORM Masterclass
        { name: 'frappe.db.get_value(dt, filters, field)', type: 'server', cat: 'db', tags: 'db get_value sql select reader', desc: 'Fast single or multi-field reader directly from SQL database', chapter: '10. Database API', link: '/10-database/#1-frappe-db-api-reference' },
        { name: 'frappe.db.get_values(dt, filters, fields)', type: 'server', cat: 'db', tags: 'db get_values sql select multiple', desc: 'Queries field values across multiple records efficiently', chapter: '10. Database API', link: '/10-database/#frappedbget_values-frappedbget_single_value' },
        { name: 'frappe.db.set_value(dt, name, field, val)', type: 'both', cat: 'db', tags: 'db set_value update direct sql', desc: 'Direct SQL field update bypassing validation lifecycle hooks', chapter: '10. Database API', link: '/10-database/#5-client-side-database-proxy-frappe-db-in-javascript' },
        { name: 'frappe.db.sql(query, values)', type: 'server', cat: 'db', tags: 'db sql raw query mariadb postgres', desc: 'Executes raw SQL query string with parameter binding', chapter: '10. Database API', link: '/10-database/#frappe-db-sql-raw-sql-execution' },
        { name: 'frappe.qb.from_(DocType)', type: 'server', cat: 'db', tags: 'query builder pypika qb joins select', desc: 'PyPika SQL QueryBuilder interface for complex type-safe SQL queries', chapter: '30. ORM Masterclass', link: '/30-frappe-orm/' },
        { name: 'frappe.db.commit()', type: 'server', cat: 'db', tags: 'transaction commit db', desc: 'Explicitly commits current database transaction', chapter: '10. Database API', link: '/10-database/#database-transactions-commit-rollback-savepoint' },
        { name: 'frappe.db.rollback()', type: 'server', cat: 'db', tags: 'transaction rollback revert db', desc: 'Reverts pending database transaction or rolls back to savepoint', chapter: '10. Database API', link: '/10-database/#transaction-controls-frappedbsavepoint-frappedbrollback' },

        // Server APIs & Background Jobs
        { name: 'frappe.get_all(dt, filters)', type: 'server', cat: 'server', tags: 'get_all list bypass permissions', desc: 'Fetches record list bypassing user permission restrictions', chapter: '09. Server API', link: '/09-server-api/#frappe-get-all-frappe-get-list' },
        { name: 'frappe.get_list(dt, filters)', type: 'both', cat: 'server', tags: 'get_list list enforce permissions', desc: 'Fetches record list enforcing active user permissions', chapter: '09. Server API', link: '/09-server-api/#frappe-get-all-frappe-get-list' },
        { name: 'frappe.enqueue(method, queue)', type: 'server', cat: 'server', tags: 'enqueue background rq worker job async', desc: 'Enqueues background RQ worker job with queue timeout options', chapter: '15. Background Jobs', link: '/15-background-jobs-scheduler/#1-asynchronous-execution-frappe-enqueue' },
        { name: 'frappe.msgprint(msg)', type: 'both', cat: 'server', tags: 'msgprint message popup alert dialog', desc: 'Displays message dialog popup to user (Server & Client JS)', chapter: '09. Server API', link: '/09-server-api/#frappe-msgprint' },
        { name: 'frappe.throw(msg)', type: 'both', cat: 'server', tags: 'throw exception validation error', desc: 'Raises ValidationError and displays error alert popup', chapter: '09. Server API', link: '/09-server-api/#frappe-throw' },

        // Client API (JavaScript SDK)
        { name: 'frm.set_value(field, value)', type: 'client', cat: 'client', tags: 'frm set_value input change js', desc: 'Sets field value on client form and triggers UI change events', chapter: '11. Client API', link: '/11-client-api/#4-form-instance-frm-core-methods-matrix' },
        { name: 'frm.add_custom_button(label, fn)', type: 'client', cat: 'client', tags: 'frm add_custom_button button toolbar', desc: 'Adds custom action button or dropdown group button to form header', chapter: '11. Client API', link: '/11-client-api/#2-custom-buttons-api-frm-add_custom_button' },
        { name: 'frm.refresh_field(field)', type: 'client', cat: 'client', tags: 'frm refresh_field render dom field', desc: 'Forces DOM re-render of target docfield element on form', chapter: '11. Client API', link: '/11-client-api/#4-form-instance-frm-core-methods-matrix' },
        { name: 'frm.page.set_title(title)', type: 'client', cat: 'client', tags: 'frm page title set_title header', desc: 'Sets form header title dynamically on client Desk', chapter: '11. Client API', link: '/11-client-api/#4-form-instance-frm-core-methods-matrix' },
        { name: 'frappe.show_alert(options)', type: 'client', cat: 'client', tags: 'show_alert toast notification desk', desc: 'Displays non-blocking temporary toast notification banner', chapter: '11. Client API', link: '/11-client-api/#toast-alerts-frappe-show_alert' },
        { name: 'frappe.confirm(msg, action)', type: 'client', cat: 'client', tags: 'confirm modal confirmation prompt js', desc: 'Displays client confirmation modal dialog before action execution', chapter: '11. Client API', link: '/11-client-api/#8-ui-dialogs-user-prompting-apis' },
        { name: 'frappe.prompt(fields, action)', type: 'client', cat: 'client', tags: 'prompt input modal dialog dynamic', desc: 'Displays interactive multi-field input prompt modal to user', chapter: '11. Client API', link: '/11-client-api/#8-ui-dialogs-user-prompting-apis' },

        // Child Tables
        { name: 'frm.add_child(field, doc)', type: 'client', cat: 'client', tags: 'child table add row add_child', desc: 'Appends new row to child table field on client Desk form', chapter: '12. Child Tables', link: '/12-child-tables/#adding-clearing-editing-child-rows-in-desk-form' },
        { name: 'doc.append(field, dict)', type: 'server', cat: 'db', tags: 'child table append row Python', desc: 'Appends new child table row to document field on server', chapter: '12. Child Tables', link: '/12-child-tables/' },

        // Cache, Realtime & Email
        { name: 'frappe.realtime.on(event, fn)', type: 'client', cat: 'client', tags: 'realtime socketio websocket subscriber', desc: 'Subscribes client-side Socket.IO WebSockets to server push events', chapter: '16. Realtime & Cache', link: '/16-cache-realtime-email-files/#client-side-websockets-subscription-frapperealtime' },
        { name: 'frappe.publish_realtime(event, dict)', type: 'server', cat: 'server', tags: 'publish_realtime socketio push server', desc: 'Publishes WebSocket event to connected client browsers', chapter: '16. Realtime & Cache', link: '/16-cache-realtime-email-files/#2-realtime-websocket-events-frappe-publish_realtime-frappe-publish_progress' },
        { name: 'frappe.sendmail(recipients, subject)', type: 'server', cat: 'server', tags: 'sendmail email transaction mail async', desc: 'Queues transactional email delivery in background with PDF attachments', chapter: '16. Realtime & Cache', link: '/16-cache-realtime-email-files/#3-transactional-email-api-frappe-sendmail' },

        // Bench CLI Reference
        { name: 'bench --site list-apps', type: 'server', cat: 'cli', tags: 'bench list-apps site apps installed', desc: 'Lists all applications installed on target site database', chapter: '03. Bench CLI Reference', link: '/03-bench-cli/#bench-list-apps-bench--site-list-apps' },
        { name: 'bench list-sites', type: 'server', cat: 'cli', tags: 'bench list-sites workspace sites', desc: 'Lists all sites configured in current bench workspace environment', chapter: '03. Bench CLI Reference', link: '/03-bench-cli/#bench-list-sites' },
        { name: 'bench migrate', type: 'server', cat: 'cli', tags: 'bench migrate schema patches doctypes', desc: 'Executes pending database schema modifications, patches.txt, & syncs DocTypes', chapter: '03. Bench CLI Reference', link: '/03-bench-cli/#bench-migrate' },
        { name: 'bench mariadb', type: 'server', cat: 'cli', tags: 'bench mariadb postgres database cli console', desc: 'Opens interactive CLI database prompt pre-authenticated for site', chapter: '03. Bench CLI Reference', link: '/03-bench-cli/#bench-mariadb-bench-postgres' },
        { name: 'bench set-admin-password', type: 'server', cat: 'cli', tags: 'bench set-admin-password administrator password', desc: 'Resets Administrator account password directly on a site', chapter: '03. Bench CLI Reference', link: '/03-bench-cli/#bench-set-admin-password' },
        { name: 'bench reset-perms', type: 'server', cat: 'cli', tags: 'bench reset-perms permissions doctype default', desc: 'Resets user role permissions for all DocTypes on site back to defaults', chapter: '03. Bench CLI Reference', link: '/03-bench-cli/#bench-reset-perms' },
        { name: 'bench scheduler status/enable/disable', type: 'server', cat: 'cli', tags: 'bench scheduler enable disable background jobs', desc: 'Enables, disables, or checks background job scheduler status', chapter: '03. Bench CLI Reference', link: '/03-bench-cli/#bench-scheduler' },
        { name: 'bench update --patch', type: 'server', cat: 'cli', tags: 'bench update patch pull requirements', desc: 'Updates bench environment, runs database migrations & rebuilds assets', chapter: '03. Bench CLI Reference', link: '/03-bench-cli/#bench-update' },
        { name: 'bench restart', type: 'server', cat: 'cli', tags: 'bench restart supervisor gunicorn workers', desc: 'Restarts production background workers, Gunicorn, and supervisor services', chapter: '03. Bench CLI Reference', link: '/03-bench-cli/#bench-restart' },
        { name: 'bench setup production', type: 'server', cat: 'cli', tags: 'bench setup nginx supervisor production domain', desc: 'Configures production web server (Nginx, Supervisor, domain routing)', chapter: '03. Bench CLI Reference', link: '/03-bench-cli/#bench-setup' },
        { name: 'bench doctor', type: 'server', cat: 'cli', tags: 'bench doctor health redis workers stuck jobs', desc: 'Inspects worker connectivity, Redis queue state & stuck background jobs', chapter: '03. Bench CLI Reference', link: '/03-bench-cli/#bench-doctor' },

        // REST API & Auth
        { name: 'REST GET /api/resource/:doctype', type: 'server', cat: 'server', tags: 'rest api resource endpoint get post crud', desc: 'Standard REST resource endpoint for fetching & creating document records', chapter: '13. REST API Reference', link: '/13-rest-api/' },
        { name: 'REST POST /api/method/upload_file', type: 'server', cat: 'server', tags: 'rest upload_file file attachment api', desc: 'REST endpoint for uploading public & private file attachments', chapter: '13. REST API Reference', link: '/13-rest-api/' },
        { name: 'frappe.has_permission(dt, ptype)', type: 'server', cat: 'server', tags: 'permission check has_permission auth role', desc: 'Evaluates document permission for user programmatically in Python', chapter: '14. Auth & Permissions', link: '/14-authentication-permissions/' },

        // Docker & Frappe Types
        { name: 'docker compose exec backend bench', type: 'server', cat: 'devops', tags: 'docker compose frappe-docker container k8s helm', desc: 'Execute bench CLI commands inside containerized Frappe Docker setup', chapter: '27. Production Docker', link: '/27-frappe-docker/' },
        { name: 'frappe._dict', type: 'server', cat: 'server', tags: 'frappe._dict dictionary container dot access keyerror', desc: 'Dot-accessible dictionary returning None for missing keys safely', chapter: '31. Frappe Data Types', link: '/31-frappe-types/' },
        { name: 'frappe.local', type: 'server', cat: 'server', tags: 'frappe.local thread local request context user site', desc: 'Thread-local HTTP request context object (site, user, form_dict)', chapter: '31. Frappe Data Types', link: '/31-frappe-types/' }
      ]
    };
  },
  computed: {
    filteredApis() {
      return this.apiList.filter(item => {
        const matchesCat = this.activeCat === 'all' || 
                           item.cat === this.activeCat || 
                           (this.activeCat === 'server' && item.type === 'both') || 
                           (this.activeCat === 'client' && item.type === 'both');
        
        const q = this.searchQuery.toLowerCase().trim();
        if (!q) return matchesCat;

        const matchesQuery = item.name.toLowerCase().includes(q) || 
                             item.desc.toLowerCase().includes(q) || 
                             item.chapter.toLowerCase().includes(q) ||
                             (item.tags && item.tags.toLowerCase().includes(q));

        return matchesCat && matchesQuery;
      });
    },
    displayedApis() {
      // If user is searching or has expanded, show all filtered items.
      // Otherwise, strictly limit to 6 items to keep landing page short.
      if (this.searchQuery.trim().length > 0 || this.isExpanded) {
        return this.filteredApis;
      }
      return this.filteredApis.slice(0, this.limitCount);
    },
    hasMore() {
      return !this.searchQuery && this.filteredApis.length > this.limitCount;
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    selectCategory(catId) {
      this.activeCat = catId;
      this.isExpanded = false;
    },
    getCatColor(cat) {
      const found = this.categories.find(c => c.id === cat);
      return found ? found.color : '#38bdf8';
    },
    parseCode(sig) {
      if (!sig) return { prefix: '', method: '', args: '' };
      const firstParen = sig.indexOf('(');
      if (firstParen !== -1) {
        const fullMethod = sig.slice(0, firstParen);
        const args = sig.slice(firstParen);
        const dotIdx = fullMethod.lastIndexOf('.');
        if (dotIdx !== -1) {
          return {
            prefix: fullMethod.slice(0, dotIdx + 1),
            method: fullMethod.slice(dotIdx + 1),
            args: args
          };
        }
        return { prefix: '', method: fullMethod, args: args };
      }
      const spaceIdx = sig.indexOf(' ');
      if (spaceIdx !== -1) {
        return { prefix: sig.slice(0, spaceIdx), method: ' ' + sig.slice(spaceIdx), args: '' };
      }
      return { prefix: '', method: sig, args: '' };
    },
    resetFilters() {
      this.searchQuery = '';
      this.activeCat = 'all';
      this.isExpanded = false;
    },
    handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        if (this.$refs.searchInput) {
          e.preventDefault();
          this.$refs.searchInput.focus();
        }
      }
    }
  }
};
</script>

<style scoped>
.explorer-section {
  margin: 2rem 0 3rem;
  font-family: var(--vp-font-family-base);
}

/* Command Bar Container */
.command-bar {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(16px);
}

@media (min-width: 960px) {
  .command-bar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.search-field-container {
  position: relative;
  display: flex;
  align-items: center;
  flex-grow: 1;
  max-width: 480px;
}

.search-lens {
  position: absolute;
  left: 14px;
  font-size: 0.95rem;
  opacity: 0.5;
  pointer-events: none;
}

.command-input {
  width: 100%;
  background: var(--vp-c-bg-soft);
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 10px 80px 10px 40px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  outline: none;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.command-input:focus {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.2);
  background: var(--vp-c-bg);
}

.search-actions {
  position: absolute;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.clear-chip {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  background: var(--vp-c-divider);
  padding: 2px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.clear-chip:hover {
  background: #ef4444;
  color: #ffffff;
}

.shortcut-chip {
  font-size: 0.7rem;
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 2px 6px;
  border-radius: 4px;
  user-select: none;
}

/* Segmented Control Filter Tabs */
.segmented-control {
  display: flex;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
  overflow-x: auto;
}

.segmented-btn {
  background: transparent;
  border: none;
  color: var(--vp-c-text-2);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  display: flex;
  align-items: center;
  gap: 6px;
}

.segmented-btn:hover {
  color: var(--vp-c-text-1);
  background: rgba(255, 255, 255, 0.05);
}

.segmented-btn.active {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.tab-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* View Switcher */
.view-toggle {
  display: flex;
  gap: 4px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  padding: 3px;
  border-radius: 8px;
}

.view-btn {
  background: transparent;
  border: none;
  color: var(--vp-c-text-2);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-btn.active {
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

/* Meta Bar */
.results-meta-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 4px 0.75rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.reset-link {
  background: none;
  border: none;
  color: var(--vp-c-brand-1);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

/* GRID LAYOUT */
.explorer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
  margin-top: 1rem;
}

.card-item {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 1.25rem 1.4rem;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.card-accent-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent);
  opacity: 0.85;
}

.card-item:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 0 20px rgba(56, 189, 248, 0.08);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 0.75rem;
}

.code-signature {
  font-family: var(--vp-font-family-mono);
  font-size: 0.88rem;
  line-height: 1.4;
  word-break: break-all;
}

.code-signature .prefix {
  color: #94a3b8;
}

.code-signature .method {
  color: #38bdf8;
  font-weight: 700;
}

.code-signature .args {
  color: #cbd5e1;
}

.type-badge {
  font-size: 0.62rem;
  font-weight: 800;
  color: #ffffff;
  padding: 2px 7px;
  border-radius: 6px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.card-desc {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 10px;
}

.chapter-tag {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.link-btn {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.link-btn .arrow {
  transition: transform 0.2s ease;
}

.card-item:hover .link-btn .arrow {
  transform: translateX(4px);
}

/* LIST LAYOUT */
.explorer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 1rem;
}

.list-item {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  transition: all 0.2s ease;
}

.list-item:hover {
  border-color: var(--accent);
  transform: translateX(4px);
  background: var(--vp-c-bg-mute);
}

.list-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-grow: 1;
  overflow: hidden;
}

.list-cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.list-desc {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

.list-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

/* EXPAND BAR */
.expand-bar {
  text-align: center;
  margin-top: 1.5rem;
}

.expand-btn {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-brand-1);
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.expand-btn:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-mute);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 82, 204, 0.15);
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 3.5rem 2rem;
  background: var(--vp-c-bg-soft);
  border: 1.5px dashed var(--vp-c-divider);
  border-radius: 16px;
  margin-top: 1rem;
}

.empty-icon {
  font-size: 2.2rem;
  display: block;
  margin-bottom: 0.5rem;
}

.empty-state h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--vp-c-text-1);
}

.empty-state p {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-top: 6px;
}

/* ANIMATIONS */
.card-anim-move,
.card-anim-enter-active,
.card-anim-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.card-anim-enter-from,
.card-anim-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}
</style>
