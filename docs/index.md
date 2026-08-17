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
---

<div class="landing-wrapper">

<!-- Release Pill Banner -->
<div style="text-align: center; margin-bottom: 1.5rem; position: relative; z-index: 1;">
  <a href="/29-version-history/" class="hero-pill" style="text-decoration: none;">
    <span class="hero-pill-badge">NEW v1.7.0</span>
    <span>Bench CLI Reference Expansion &amp; Complete Command Coverage</span>
    <span style="opacity: 0.7;">→</span>
  </a>
</div>

<!-- Interactive Hero Quick Code & API Switcher -->
<ClientOnly>
  <HeroQuickNav />
</ClientOnly>

<!-- Key Performance Stats Banner -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 2rem 0 2.5rem; position: relative; z-index: 1;">
  <div class="stat-box">
    <div class="stat-num blue">31+</div>
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
