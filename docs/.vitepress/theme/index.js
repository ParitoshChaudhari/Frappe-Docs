import DefaultTheme from 'vitepress/theme';
import './custom.css';
import TerminalDemo from './components/TerminalDemo.vue';
import InteractiveArch from './components/InteractiveArch.vue';
import InteractiveApiSearch from './components/InteractiveApiSearch.vue';
import HeroQuickNav from './components/HeroQuickNav.vue';
import DeveloperPathways from './components/DeveloperPathways.vue';
import EcosystemApps from './components/EcosystemApps.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('TerminalDemo', TerminalDemo);
    app.component('InteractiveArch', InteractiveArch);
    app.component('InteractiveApiSearch', InteractiveApiSearch);
    app.component('HeroQuickNav', HeroQuickNav);
    app.component('DeveloperPathways', DeveloperPathways);
    app.component('EcosystemApps', EcosystemApps);
  }
};
