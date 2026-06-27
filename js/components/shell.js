// App shell: top bar (home/back/none), bottom tab bar, language switcher sheet.
// Mirrors design-reference/Phone.dc.html.
import { icon } from './icon.js';
import { t, getCurrentLang, langMeta, LANGUAGES, changeLang } from '../i18n/index.js';
import { navigate } from '../router.js';

const TABS = [
  { key: 'home', icon: 'home', labelKey: 'tab.home', route: '#/home' },
  { key: 'study', icon: 'quiz', labelKey: 'tab.study', route: '#/study' },
  { key: 'reserve', icon: 'event', labelKey: 'tab.reserve', route: '#/reserve' },
  { key: 'license', icon: 'badge', labelKey: 'tab.license', route: '#/license' },
  { key: 'more', icon: 'apps', labelKey: 'tab.more', route: '#/more' },
];

// ---- top bar -------------------------------------------------------------
export function renderTopbar(mode, opts = {}) {
  const bar = document.getElementById('topbar');
  if (mode === 'none') {
    bar.hidden = true;
    bar.innerHTML = '';
    return;
  }
  bar.hidden = false;
  const code = langMeta().short;

  if (mode === 'home') {
    bar.className = 'topbar topbar--home';
    bar.innerHTML = `
      <div class="brand">
        <span class="brand__logo" aria-hidden="true"></span>
        <span class="brand__text">
          <span class="brand__mark">New Sunshine</span>
          <span class="brand__sub jp">${t('app.subtitle')}</span>
        </span>
      </div>
      <button class="langpill" data-lang-open type="button" aria-label="${t('common.langLabel')}">
        ${icon('language', { size: 17 })}
        <span class="langpill__code">${code}</span>
        ${icon('expand_more', { size: 16 })}
      </button>`;
  } else { // back
    bar.className = 'topbar topbar--back';
    bar.innerHTML = `
      <div class="backbar__left">
        <button class="iconbtn" data-back type="button" aria-label="Back">${icon('chevron_left', { size: 26 })}</button>
        <span class="backbar__title">${opts.title || ''}</span>
      </div>
      <button class="langpill" data-lang-open type="button" aria-label="${t('common.langLabel')}">
        ${icon('language', { size: 17 })}
        <span class="langpill__code">${code}</span>
        ${icon('expand_more', { size: 16 })}
      </button>`;
  }

  bar.querySelector('[data-lang-open]')?.addEventListener('click', openLangSheet);
  bar.querySelector('[data-back]')?.addEventListener('click', () => history.back());
}

// ---- tab bar -------------------------------------------------------------
export function renderTabbar(active) {
  const bar = document.getElementById('tabbar');
  if (!active) { bar.hidden = true; bar.innerHTML = ''; return; }
  bar.hidden = false;
  bar.innerHTML = TABS.map((tab) => {
    const on = tab.key === active;
    return `
      <a class="tab ${on ? 'tab--active' : ''}" href="${tab.route}" aria-current="${on ? 'page' : 'false'}">
        ${icon(tab.icon, { size: 23, fill: on })}
        <span class="tab__label">${t(tab.labelKey)}</span>
      </a>`;
  }).join('');
}

// ---- language switcher sheet --------------------------------------------
export function openLangSheet() {
  const sheet = document.getElementById('lang-sheet');
  const cur = getCurrentLang();
  sheet.hidden = false;
  sheet.innerHTML = `
    <div class="sheet__scrim" data-lang-close></div>
    <div class="sheet__panel" role="dialog" aria-modal="true" aria-label="${t('lang.choose')}">
      <div class="sheet__handle"></div>
      <h2 class="sheet__title">${t('lang.choose')}</h2>
      <div class="sheet__list">
        ${LANGUAGES.map((l) => `
          <button class="langrow ${l.code === cur ? 'langrow--sel' : ''}" data-lang="${l.code}" type="button">
            <span class="langrow__text">
              <span class="langrow__native">${l.native}</span>
              <span class="langrow__en">${l.english}</span>
            </span>
            ${l.code === cur
              ? icon('check_circle', { size: 22, fill: true, cls: 'langrow__check' })
              : '<span class="radio" aria-hidden="true"></span>'}
          </button>`).join('')}
      </div>
    </div>`;

  const close = () => { sheet.hidden = true; sheet.innerHTML = ''; };
  sheet.querySelector('[data-lang-close]').addEventListener('click', close);
  sheet.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      changeLang(btn.dataset.lang);
      close();
      // Re-render chrome + current screen in the new language.
      navigate(location.hash || '#/home', { replace: true, force: true });
    });
  });
}
