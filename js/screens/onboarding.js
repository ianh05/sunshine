// Language select (first run). Default selection = English.
import { node } from '../components/dom.js';
import { icon } from '../components/icon.js';
import { t, LANGUAGES, changeLang } from '../i18n/index.js';

export function render(ctx) {
  let selected = 'en';

  const rowHtml = (l) => `
    <button class="langrow ${l.code === selected ? 'langrow--sel' : ''}" data-lang="${l.code}" type="button">
      <span class="langrow__text">
        <span class="langrow__native">${l.native}</span>
        <span class="langrow__en">${l.english}</span>
      </span>
      <span class="langrow__indicator">${
        l.code === selected
          ? icon('check_circle', { size: 22, fill: true, cls: 'langrow__check' })
          : '<span class="radio"></span>'
      }</span>
    </button>`;

  const el = node(`
    <section class="onb">
      <div class="onb__head">
        <span class="onb__logo"></span>
        <span class="onb__mark">New Sunshine</span>
        <span class="onb__sub">${t('onb.subtitle')}</span>
      </div>
      <div class="onb__prompt">
        <div class="onb__prompt-en">${t('onb.choose')}</div>
        <div class="onb__prompt-jp">言語を選択してください</div>
      </div>
      <div class="onb__list">${LANGUAGES.map(rowHtml).join('')}</div>
      <div class="onb__spacer"></div>
      <button class="btn btn--primary onb__continue" data-continue type="button">
        ${t('common.continue')} ${icon('arrow_forward', { size: 19 })}
      </button>
      <p class="onb__footnote">${t('onb.footnote')}</p>
    </section>`);

  function onMount(root) {
    const list = root.querySelector('.onb__list');
    // One delegated listener survives the innerHTML re-renders below.
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lang]');
      if (!btn) return;
      selected = btn.dataset.lang;
      list.innerHTML = LANGUAGES.map(rowHtml).join('');
    });
    root.querySelector('[data-continue]').addEventListener('click', () => {
      changeLang(selected);
      ctx.navigate('#/home', { replace: true, force: true });
    });
  }

  return { node: el, onMount };
}
