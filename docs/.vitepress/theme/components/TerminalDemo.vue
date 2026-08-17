<template>
  <div class="terminal-container">
    <div class="terminal-header">
      <div class="window-controls">
        <span class="control-dot close"></span>
        <span class="control-dot minimize"></span>
        <span class="control-dot expand"></span>
      </div>
      <div class="terminal-title">
        <span class="terminal-icon">⚡</span> bench@frappe-bench: ~/sites
      </div>
      <div class="terminal-badge">
        <span class="pulse-status"></span> LIVE BENCH CLI v15
      </div>
    </div>

    <div class="terminal-presets" role="group" aria-label="Bench CLI Command Presets">
      <button 
        v-for="cmd in presets" 
        :key="cmd.id" 
        :class="['preset-btn', { active: activePreset.id === cmd.id }]"
        @click="runPreset(cmd)"
        :aria-label="'Execute ' + cmd.label + ' bench command'"
      >
        <span class="btn-icon">{{ cmd.icon }}</span> {{ cmd.label }}
      </button>
    </div>

    <div class="terminal-body" ref="terminalBody">
      <div class="terminal-prompt-line">
        <span class="prompt-user">developer@frappe-bench</span>:<span class="prompt-path">~/sites</span>$ 
        <span class="prompt-command">{{ activePreset.command }}</span>
        <span class="cursor"></span>
      </div>

      <div class="terminal-output">
        <div 
          v-for="(line, idx) in currentOutput" 
          :key="idx" 
          :class="['output-line', line.type]"
        >
          <span class="line-time">[{{ line.time }}]</span>
          <span class="line-content">{{ line.text }}</span>
        </div>
      </div>
    </div>

    <div class="terminal-footer">
      <div class="footer-info">
        <span>💡 Click any preset above to test real-world Bench commands</span>
      </div>
      <button class="copy-btn" @click="copyCommand">
        <span>{{ copied ? '✓ Copied' : '📋 Copy Command' }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TerminalDemo',
  data() {
    return {
      copied: false,
      activePreset: null,
      currentOutput: [],
      presets: [
        {
          id: 'list-apps',
          label: 'list-apps',
          icon: '📱',
          command: 'bench --site site1.localhost list-apps',
          output: [
            { type: 'info', text: 'Checking installed applications for site: site1.localhost...' },
            { type: 'success', text: 'frappe            15.42.0 (version-15)' },
            { type: 'success', text: 'erpnext           15.38.1 (version-15)' },
            { type: 'success', text: 'hrms              15.12.0 (version-15)' },
            { type: 'success', text: 'india_compliance  15.9.2  (version-15)' },
            { type: 'highlight', text: 'Total 4 applications installed on site1.localhost' }
          ]
        },
        {
          id: 'new-site',
          label: 'new-site',
          icon: '🌐',
          command: 'bench new-site site1.localhost --admin-password admin --db-name site1_db',
          output: [
            { type: 'info', text: 'Creating database site1_db...' },
            { type: 'info', text: 'Installing MariaDB schema & framework core tables...' },
            { type: 'success', text: 'Setting up Administrator password...' },
            { type: 'success', text: 'Site site1.localhost created successfully!' },
            { type: 'highlight', text: 'Access site at: http://site1.localhost:8000' }
          ]
        },
        {
          id: 'migrate',
          label: 'migrate',
          icon: '🔄',
          command: 'bench --site site1.localhost migrate',
          output: [
            { type: 'info', text: 'Migrating site1.localhost' },
            { type: 'info', text: 'Executing pending patches...' },
            { type: 'success', text: 'Syncing DocTypes for frappe... [DONE]' },
            { type: 'success', text: 'Syncing DocTypes for erpnext... [DONE]' },
            { type: 'info', text: 'Updating database schema & permissions...' },
            { type: 'success', text: 'Migration completed successfully in 2.45s' }
          ]
        },
        {
          id: 'mariadb',
          label: 'mariadb CLI',
          icon: '🗄️',
          command: 'bench --site site1.localhost mariadb',
          output: [
            { type: 'info', text: 'Connecting to MariaDB database site1_db...' },
            { type: 'success', text: 'Reading table information for completion of table and column names...' },
            { type: 'highlight', text: 'Server version: 10.11.6-MariaDB-log Homebrew' },
            { type: 'cmd', text: 'MariaDB [site1_db]> SELECT name, email FROM `tabUser` LIMIT 1;' },
            { type: 'success', text: '+---------------+-------------------+' },
            { type: 'success', text: '| name          | email             |' },
            { type: 'success', text: '+---------------+-------------------+' },
            { type: 'success', text: '| Administrator | admin@example.com |' },
            { type: 'success', text: '+---------------+-------------------+' }
          ]
        },
        {
          id: 'start',
          label: 'start',
          icon: '🚀',
          command: 'bench start',
          output: [
            { type: 'info', text: '16:45:10 web.1            | started with pid 48210' },
            { type: 'info', text: '16:45:10 schedule.1       | started with pid 48211' },
            { type: 'info', text: '16:45:10 worker_short.1   | started with pid 48212' },
            { type: 'info', text: '16:45:10 worker_default.1 | started with pid 48213' },
            { type: 'success', text: '16:45:11 web.1            | * Running on http://127.0.0.1:8000 (Press CTRL+C to quit)' },
            { type: 'highlight', text: 'Development server live on http://localhost:8000' }
          ]
        }
      ]
    };
  },
  created() {
    this.activePreset = this.presets[0];
    this.loadOutput();
  },
  methods: {
    runPreset(preset) {
      this.activePreset = preset;
      this.loadOutput();
    },
    loadOutput() {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      this.currentOutput = this.activePreset.output.map(item => ({
        ...item,
        time: timeStr
      }));
    },
    copyCommand() {
      if (this.activePreset) {
        navigator.clipboard.writeText(this.activePreset.command);
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      }
    }
  }
};
</script>

<style scoped>
.terminal-container {
  background: #0f172a;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 82, 204, 0.15);
  overflow: hidden;
  margin: 2rem 0;
  font-family: var(--vp-font-family-mono, monospace);
  transition: all 0.3s ease;
}

.terminal-container:hover {
  border-color: rgba(76, 154, 255, 0.4);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45), 0 0 40px rgba(76, 154, 255, 0.25);
}

.terminal-header {
  background: #1e293b;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.window-controls {
  display: flex;
  gap: 8px;
}

.control-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.control-dot.close { background-color: #ff5f56; }
.control-dot.minimize { background-color: #ffbd2e; }
.control-dot.expand { background-color: #27c93f; }

.terminal-title {
  font-size: 0.82rem;
  color: #94a3b8;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.terminal-badge {
  font-size: 0.7rem;
  background: rgba(54, 179, 126, 0.15);
  color: #36b37e;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(54, 179, 126, 0.3);
}

.pulse-status {
  width: 6px;
  height: 6px;
  background-color: #36b37e;
  border-radius: 50%;
  box-shadow: 0 0 8px #36b37e;
  animation: pulseGreen 1.5s infinite;
}

@keyframes pulseGreen {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(54, 179, 126, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(54, 179, 126, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(54, 179, 126, 0); }
}

.terminal-presets {
  background: #1e293b;
  padding: 8px 12px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.preset-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.preset-btn:hover {
  background: rgba(76, 154, 255, 0.15);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.4);
}

.preset-btn.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
}

.terminal-body {
  padding: 18px 20px;
  min-height: 220px;
  max-height: 340px;
  overflow-y: auto;
  font-size: 0.88rem;
  line-height: 1.6;
  color: #f1f5f9;
}

.terminal-prompt-line {
  margin-bottom: 12px;
  font-weight: 600;
}

.prompt-user { color: #38bdf8; }
.prompt-path { color: #818cf8; }
.prompt-command { color: #facc15; margin-left: 8px; }

.cursor {
  display: inline-block;
  width: 8px;
  height: 15px;
  background-color: #38bdf8;
  margin-left: 4px;
  vertical-align: middle;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.output-line {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
  font-size: 0.84rem;
}

.line-time {
  color: #64748b;
  font-size: 0.78rem;
  user-select: none;
}

.output-line.info .line-content { color: #94a3b8; }
.output-line.success .line-content { color: #4ade80; }
.output-line.highlight .line-content { color: #38bdf8; font-weight: 700; }
.output-line.cmd .line-content { color: #facc15; }

.terminal-footer {
  background: #1e293b;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-info {
  font-size: 0.78rem;
  color: #94a3b8;
}

.copy-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}
</style>
