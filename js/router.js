// Hash router + shell orchestration.
import { renderTopbar, renderTabbar } from './components/shell.js';
import { t } from './i18n/index.js';
import { getLang } from './state.js';

import * as onboarding from './screens/onboarding.js';
import * as home from './screens/home.js';
import * as reserve from './screens/reserve.js';
import * as study from './screens/study.js';
import * as license from './screens/license.js';
import * as more from './screens/more.js';

// Route table. chrome = { topbar:'home'|'back'|'none', tab:<key>|null, titleKey? }
// handler returns { node, onMount?, chrome? } — screen may override chrome (e.g. titles).
const ROUTES = [
  { re: /^\/?$/,                      chrome: { topbar: 'home', tab: 'home' },  h: home.render },
  { re: /^\/home$/,                   chrome: { topbar: 'home', tab: 'home' },  h: home.render },
  { re: /^\/onboarding\/language$/,   chrome: { topbar: 'none', tab: null },    h: onboarding.render },

  { re: /^\/reserve$/,                chrome: { topbar: 'back', tab: null, titleKey: 'reserve.title' }, h: (c) => reserve.render('lesson', c) },
  { re: /^\/reserve\/transmission$/,  chrome: { topbar: 'back', tab: null, titleKey: 'reserve.title' }, h: (c) => reserve.render('transmission', c) },
  { re: /^\/reserve\/datetime$/,      chrome: { topbar: 'back', tab: null, titleKey: 'reserve.title' }, h: (c) => reserve.render('datetime', c) },
  { re: /^\/reserve\/details$/,       chrome: { topbar: 'back', tab: null, titleKey: 'reserve.title' }, h: (c) => reserve.render('details', c) },
  { re: /^\/reserve\/review$/,        chrome: { topbar: 'back', tab: null, titleKey: 'reserve.title' }, h: (c) => reserve.render('review', c) },
  { re: /^\/reserve\/submitting$/,    chrome: { topbar: 'none', tab: null }, h: (c) => reserve.render('submitting', c) },
  { re: /^\/reserve\/confirmed$/,     chrome: { topbar: 'none', tab: null }, h: (c) => reserve.render('confirmed', c) },

  { re: /^\/study$/,                  chrome: { topbar: 'home', tab: 'study' }, h: (c) => study.render('home', c) },
  { re: /^\/study\/quiz$/,            chrome: { topbar: 'none', tab: null },    h: (c) => study.render('quiz', c) },
  { re: /^\/study\/summary$/,         chrome: { topbar: 'none', tab: null },    h: (c) => study.render('summary', c) },
  { re: /^\/study\/notes$/,           chrome: { topbar: 'back', tab: 'study' }, h: (c) => study.render('notes', c) },

  { re: /^\/license$/,                chrome: { topbar: 'home', tab: 'license' }, h: license.render },

  { re: /^\/more$/,                   chrome: { topbar: 'home', tab: 'more' },  h: (c) => more.render('hub', c) },
  { re: /^\/more\/about$/,            chrome: { topbar: 'back', tab: 'more', titleKey: 'about.title' },   h: (c) => more.render('about', c) },
  { re: /^\/more\/contact$/,         chrome: { topbar: 'back', tab: 'more', titleKey: 'contact.title' }, h: (c) => more.render('contact', c) },
  { re: /^\/more\/hiring$/,           chrome: { topbar: 'back', tab: 'more', titleKey: 'hiring.title' },  h: (c) => more.render('hiring', c) },
  { re: /^\/more\/hiring\/([^/]+)$/,  chrome: { topbar: 'back', tab: 'more' }, h: (c, m) => more.render('role', { ...c, role: m[1] }) },
];

let lastPath = null;

export function navigate(hash, { replace = false, force = false } = {}) {
  if (replace) {
    history.replaceState(null, '', hash);
    render(force);
  } else {
    location.hash = hash;          // triggers hashchange → render
  }
}

function parseHash() {
  let h = location.hash || '';
  if (h.startsWith('#')) h = h.slice(1);
  return h || '/';
}

export function render(force = false) {
  const path = parseHash();

  // Onboarding guard: first run (no stored lang) must pick a language first.
  if (!getLang() && path !== '/onboarding/language') {
    navigate('#/onboarding/language', { replace: true, force: true });
    return;
  }

  let matched = null, m = null;
  for (const r of ROUTES) {
    const mm = path.match(r.re);
    if (mm) { matched = r; m = mm; break; }
  }
  if (!matched) { navigate('#/home', { replace: true, force: true }); return; }

  const ctx = { path, navigate };
  const result = matched.h(ctx, m) || {};

  // A render-time guard may have redirected (replaceState + re-render already
  // painted the target). If the path changed underneath us, abort so we don't
  // clobber the redirect's output.
  if (parseHash() !== path) return;

  const chrome = { ...matched.chrome, ...(result.chrome || {}) };

  // Chrome
  const title = chrome.title || (chrome.titleKey ? t(chrome.titleKey) : '');
  renderTopbar(chrome.topbar, { title });
  renderTabbar(chrome.tab);

  // Content
  const content = document.getElementById('content');
  content.innerHTML = '';
  if (result.node) content.appendChild(result.node);
  content.classList.toggle('content--no-tabbar', !chrome.tab);

  // Reset scroll + entrance animation on real navigation
  content.scrollTop = 0;
  if (path !== lastPath || force) {
    content.classList.remove('content--in');
    void content.offsetWidth;       // reflow to restart animation
    content.classList.add('content--in');
  }
  lastPath = path;

  if (result.onMount) result.onMount(content);
}

export function startRouter() {
  window.addEventListener('hashchange', () => render());
  render();
}
