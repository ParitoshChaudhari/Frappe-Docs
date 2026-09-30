---
layout: home

hero:
  name: "Frappe Framework v15"
  text: "The Complete Developer Handbook"
  tagline: "Definitive technical reference for Frappe v15 — APIs, DocTypes, Hooks, Query Builder, JS SDK, REST, Realtime, Security & DevOps."
  actions:
    - theme: brand
      text: 🚀 Get Started (v15)
      link: /01-getting-started/
    - theme: brand
      text: 🔍 Searchable API Index
      link: /24-api-index/
    - theme: alt
      text: ⚡ v16 Differences
      link: /32-frappe-v16-differences/
---

<div class="landing-wrapper">

<!-- Release Pill Banner -->
<div style="text-align: center; margin-bottom: 1.25rem; position: relative; z-index: 1;">
  <a href="/29-version-history/" class="hero-pill" style="text-decoration: none;">
    <span class="hero-pill-badge">NEW v1.11.0</span>
    <span>Frappe Framework v16 Differences, Breaking Changes &amp; Migration Guide</span>
    <span style="opacity: 0.7;">→</span>
  </a>
</div>

<!-- v16 Spotlight Banner -->
<div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 2rem; position: relative; z-index: 1;">
  <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
    <div style="max-width: 680px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.35rem;">
        <span style="background: #ec4899; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">v16 Spotlight</span>
        <span style="font-size: 0.85rem; font-weight: 600; color: var(--vp-c-text-2);">What's New, Deprecations &amp; Migration</span>
      </div>
      <h3 style="margin: 0 0 0.4rem; font-size: 1.15rem; font-weight: 700; color: var(--vp-c-text-1);">Frappe Framework v16: Breaking Changes &amp; Paradigm Shifts</h3>
      <p style="margin: 0; font-size: 0.88rem; color: var(--vp-c-text-2); line-height: 1.45;">
        Discover key differences from v15: default sorting shifted to <code>creation desc</code>, <code>frappe.db.commit()</code> banned in hooks, Python 3.14+ runtime, sandboxed IIFE client scripts, and decoupled core modules.
      </p>
    </div>
    <div>
      <a href="/32-frappe-v16-differences/" style="display: inline-flex; align-items: center; gap: 6px; background: #ec4899; color: #fff; font-weight: 600; font-size: 0.88rem; padding: 0.55rem 1.1rem; border-radius: 8px; text-decoration: none; transition: opacity 0.2s;">
        <span>Explore v16 Differences</span>
        <span>→</span>
      </a>
    </div>
  </div>
</div>

<!-- Interactive Hero Quick Code & API Switcher -->
<ClientOnly>
  <HeroQuickNav />
</ClientOnly>

<!-- Key Performance Stats Banner -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 2rem 0 2.5rem; position: relative; z-index: 1;">
  <div class="stat-box">
    <div class="stat-num blue">32</div>
    <div style="font-size: 0.84rem; font-weight: 600; color: var(--vp-c-text-2); margin-top: 0.25rem;">Technical Chapters</div>
  </div>
  <div class="stat-box">
    <div class="stat-num green">120+</div>
    <div style="font-size: 0.84rem; font-weight: 600; color: var(--vp-c-text-2); margin-top: 0.25rem;">Cataloged APIs</div>
  </div>
  <div class="stat-box">
    <div class="stat-num orange">13</div>
    <div style="font-size: 0.84rem; font-weight: 600; color: var(--vp-c-text-2); margin-top: 0.25rem;">Production Recipes</div>
  </div>
  <div class="stat-box">
    <div class="stat-num cyan">v15</div>
    <div style="font-size: 0.84rem; font-weight: 600; color: var(--vp-c-text-2); margin-top: 0.25rem;">Frappe Version</div>
  </div>
</div>

<!-- Developer Focus Pathways -->
<ClientOnly>
  <DeveloperPathways />
</ClientOnly>

<!-- Live Interactive Terminal Component -->
<ClientOnly>
  <TerminalDemo />
</ClientOnly>

<!-- Live Quick API Explorer Component -->
<ClientOnly>
  <InteractiveApiSearch />
</ClientOnly>

<!-- Official Ecosystem Applications Component -->
<ClientOnly>
  <EcosystemApps />
</ClientOnly>

</div>
