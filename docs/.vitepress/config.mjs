import { defineConfig } from 'vitepress';

export default defineConfig({
  title: "Frappe v15 Developer Reference",
  description: "Complete, deep-dive technical documentation, API reference, architecture guide, DevOps handbook, and cookbook for Frappe Framework v15.",
  lang: 'en-US',
  lastUpdated: true,
  cleanUrls: true,
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'canonical', href: 'https://frappe-docs.paritoshchaudhari.in/' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['meta', { name: 'theme-color', content: '#0052CC' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Frappe v15 Reference' }],
    ['meta', { property: 'og:title', content: 'Frappe Framework v15 Complete Developer Documentation' }],
    ['meta', { property: 'og:description', content: 'Definitive technical reference for Frappe v15 — APIs, DocTypes, Hooks, Query Builder, JS SDK, REST, Realtime, Security & DevOps.' }],
    ['meta', { property: 'og:url', content: 'https://frappe-docs.paritoshchaudhari.in/' }],
    ['meta', { property: 'og:image', content: 'https://frappe-docs.paritoshchaudhari.in/og-image.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Frappe Framework v15 Complete Developer Documentation' }],
    ['meta', { name: 'twitter:description', content: 'Definitive technical reference for Frappe v15 — APIs, DocTypes, Hooks, Query Builder, JS SDK, REST, Realtime, Security & DevOps.' }],
    ['meta', { name: 'twitter:image', content: 'https://frappe-docs.paritoshchaudhari.in/og-image.png' }],
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Frappe v15 Reference',
        'url': 'https://frappe-docs.paritoshchaudhari.in/',
        'description': 'Definitive technical reference for Frappe v15 — APIs, DocTypes, Hooks, Query Builder, JS SDK, REST, Realtime, Security & DevOps.'
      })
    ]
  ],

  themeConfig: {
    siteTitle: 'Frappe v15 Reference',
    logo: '/logo.svg',
    
    outline: {
      level: [2, 6],
      label: 'On this page'
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ParitoshChaudhari/Frappe-Docs' }
    ],

    search: {
      provider: 'local',
      options: {
        detailedView: true
      }
    },

    // Empty nav so header contains ONLY Search + Theme Switcher
    nav: [],

    sidebar: [
      {
        text: 'Overview & Basics',
        collapsible: true,
        items: [
          { text: '01. Getting Started', link: '/01-getting-started/' },
          { text: '02. Frappe Architecture', link: '/02-architecture/' },
          { text: '03. Bench CLI Reference', link: '/03-bench-cli/' },
          { text: '04. Apps & Sites Structure', link: '/04-apps-and-sites/' },
          { text: '29. Version History & Changelog', link: '/29-version-history/' }
        ]
      },
      {
        text: 'DocTypes & Data Modeling',
        collapsible: true,
        items: [
          { text: '05. DocTypes & Fields', link: '/05-doctypes/' },
          { text: '06. Document API & Lifecycle', link: '/06-documents/' },
          { text: '07. Controllers & Events', link: '/07-controllers/' },
          { text: '08. Hooks (hooks.py)', link: '/08-hooks/' }
        ]
      },
      {
        text: 'Server-Side Python APIs & ORM',
        collapsible: true,
        items: [
          { text: '09. Server API (frappe.*)', link: '/09-server-api/' },
          { text: '10. Database, ORM & Query Builder', link: '/10-database/' },
          { text: '30. Frappe ORM Masterclass', link: '/30-frappe-orm/' },
          { text: '31. Frappe Data Types & Containers', link: '/31-frappe-types/' },
          { text: '15. Background Jobs & Scheduler', link: '/15-background-jobs-scheduler/' },
          { text: '16. Cache, Realtime, Notifications, Email & Files', link: '/16-cache-realtime-email-files/' },
          { text: '19. Utilities Reference (frappe.utils)', link: '/19-utils/' }
        ]
      },
      {
        text: 'Client-Side JavaScript APIs',
        collapsible: true,
        items: [
          { text: '11. Client API (frappe.ui.form & JS)', link: '/11-client-api/' },
          { text: '12. Child Tables (Python & JS)', link: '/12-child-tables/' },
          { text: '23. Client vs Server API Matrix', link: '/23-client-vs-server/' },
          { text: '28. Desk Views & Customization', link: '/28-views-desk-customization/' }
        ]
      },
      {
        text: 'Web, Analytics & Integrations',
        collapsible: true,
        items: [
          { text: '13. REST API & RPC Endpoints', link: '/13-rest-api/' },
          { text: '14. Authentication, Session & Roles', link: '/14-authentication-permissions/' },
          { text: '17. Web Pages, Jinja & Print Formats', link: '/17-web-jinja-print-reports/' },
          { text: '18. Complete Reports Guide', link: '/18-reports/' }
        ]
      },
      {
        text: 'Quality, Operations & Best Practices',
        collapsible: true,
        items: [
          { text: '20. Testing & Debugging', link: '/20-testing-debugging/' },
          { text: '21. Security, Performance & Anti-Patterns', link: '/21-security-performance/' },
          { text: '22. Cookbook & Recipes', link: '/22-cookbook/' },
          { text: '24. Searchable API Index', link: '/24-api-index/' }
        ]
      },
      {
        text: 'DevOps, Operations & Docker',
        collapsible: true,
        items: [
          { text: '25. DevOps: Dependency Installation', link: '/25-devops-installation/' },
          { text: '26. Operations: Services & Performance', link: '/26-devops-operations/' },
          { text: '27. Production: Frappe Docker', link: '/27-frappe-docker/' }
        ]
      },
      {
        text: 'Ecosystem & Open Source',
        collapsible: true,
        items: [
          { text: 'Open Source Projects', link: '/opensource-projects/' }
        ]
      }
    ],

    footer: {
      message: 'Frappe Framework v15 Complete Technical Reference & Handbook.',
      copyright: 'Built for Frappe Developers. Community Powered.'
    }
  }
});
