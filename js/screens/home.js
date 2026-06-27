// Home hub: hero, primary actions, quick-action grid, safety tip.
import { node } from '../components/dom.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';

export function render(ctx) {
  const qa = (route, iconName, tint, titleKey, subKey) => `
    <a class="qa" href="${route}">
      <span class="qa__icon qa__icon--${tint}">${icon(iconName, { size: 21 })}</span>
      <span class="qa__spacer"></span>
      <span class="qa__title">${t(titleKey)}</span>
      <span class="qa__sub">${t(subKey)}</span>
    </a>`;

  const el = node(`
    <section class="screen">
      <div class="hero">
        <div class="hero__top">
          <span class="hero__eyebrow">${t('home.eyebrow')}</span>
          <span class="hero__pill">${icon('language', { size: 15 })} 5</span>
        </div>
        <h1 class="hero__h1">${t('home.h1l1')}<br>${t('home.h1l2')}</h1>
        <div class="hero__greets">
          <span class="greet-chip">Hello</span>
          <span class="greet-chip jp">こんにちは</span>
          <span class="greet-chip jp">你好</span>
          <span class="greet-chip">Xin chào</span>
          <span class="greet-chip jp">안녕하세요</span>
        </div>
      </div>

      <a class="btn btn--primary" href="#/reserve">${icon('event_available', { size: 19 })} ${t('home.reserve')}</a>
      <a class="btn btn--secondary" href="#/study">${icon('quiz', { size: 19 })} ${t('home.practice')}</a>

      <div class="qa-grid">
        ${qa('#/license', 'badge', 'accent', 'home.qa.license.title', 'home.qa.license.sub')}
        ${qa('#/study', 'quiz', 'info', 'home.qa.quiz.title', 'home.qa.quiz.sub')}
        ${qa('#/reserve', 'directions_car', 'green', 'home.qa.book.title', 'home.qa.book.sub')}
        ${qa('#/more/contact', 'call', 'neutral', 'home.qa.contact.title', 'home.qa.contact.sub')}
      </div>

      <div class="callout callout--left">
        <span class="eyebrow callout__eyebrow">${t('home.tip.eyebrow')}</span>
        <div class="callout__body body-rich">${t('home.tip.body')}</div>
      </div>
    </section>`);

  return { node: el };
}
