// License: segmented New/Convert + accordion sections + warning callout.
import { node } from '../components/dom.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';
import { LICENSE } from '../data/license.js';

export function render(ctx) {
  let mode = 'new';        // 'new' | 'convert'
  let open = 0;            // index of open accordion

  const el = node(`
    <section class="screen screen--list">
      <h1 class="h-display h-screen">${t('license.title')}</h1>
      <p class="subnote body-rich" data-intro></p>
      <div class="segmented" role="tablist">
        <button class="segmented__btn" data-mode="new" role="tab" type="button">${t('license.seg.new')}</button>
        <button class="segmented__btn" data-mode="convert" role="tab" type="button">${t('license.seg.convert')}</button>
      </div>
      <div class="list-stack" data-accordions></div>
      <div class="placeholder-note" data-placeholder hidden>${icon('translate', { size: 15 })} ${t('license.placeholder')}</div>
      <div class="callout callout--amber" data-warn>${icon('warning', { size: 19 })}<div class="body-rich" data-warn-body></div></div>
    </section>`);

  function paint(root) {
    const set = LICENSE[mode];
    root.querySelector('[data-intro]').innerHTML = t(set.introKey);
    root.querySelectorAll('[data-mode]').forEach((b) =>
      b.classList.toggle('segmented__btn--active', b.dataset.mode === mode));

    const acc = root.querySelector('[data-accordions]');
    acc.innerHTML = set.sections.map((s, i) => `
      <div class="acc ${i === open ? 'acc--open' : ''}">
        <button class="acc__head" data-acc="${i}" type="button" aria-expanded="${i === open}">
          <span class="acc__title">${t(s.hKey)}</span>
          ${icon(i === open ? 'expand_less' : 'expand_more', { size: 22 })}
        </button>
        ${i === open ? `<div class="acc__body body-rich">${t(s.bKey)}</div>` : ''}
      </div>`).join('');
    acc.querySelectorAll('[data-acc]').forEach((b) =>
      b.addEventListener('click', () => { const i = Number(b.dataset.acc); open = (open === i ? -1 : i); paint(root); }));

    root.querySelector('[data-placeholder]').hidden = !set.placeholder;
    root.querySelector('[data-warn-body]').innerHTML = t(set.warnKey);
  }

  function onMount(root) {
    root.querySelectorAll('[data-mode]').forEach((b) =>
      b.addEventListener('click', () => { mode = b.dataset.mode; open = 0; paint(root); }));
    paint(root);
  }
  return { node: el, onMount };
}
