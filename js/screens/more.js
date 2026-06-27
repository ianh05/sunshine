// More: hub, About, Contact (+form), Hiring, Role detail (+apply).
import { node } from '../components/dom.js';
import { icon } from '../components/icon.js';
import { t, langMeta } from '../i18n/index.js';
import { openLangSheet } from '../components/shell.js';
import { JOBS, jobById, INSTRUCTORS } from '../data/jobs.js';
import { validateName, validateEmail } from '../components/forms.js';
import { setContactPrefill, takeContactPrefill } from '../state.js';

export function render(view, ctx) {
  switch (view) {
    case 'hub': return renderHub(ctx);
    case 'about': return renderAbout(ctx);
    case 'contact': return renderContact(ctx);
    case 'hiring': return renderHiring(ctx);
    case 'role': return renderRole(ctx);
  }
}

// ---- hub -----------------------------------------------------------------
function renderHub(ctx) {
  const el = node(`
    <section class="screen screen--list">
      <h1 class="h-display h-screen">${t('more.title')}</h1>

      <span class="section-label">${t('more.section.about')}</span>
      <div class="rows">
        <a class="row" href="#/more/about">
          <span class="row__icon">${icon('apartment', { size: 21 })}</span>
          <span class="row__body"><span class="row__title">${t('more.about')}</span></span>
          <span class="row__chev">${icon('chevron_right', { size: 22 })}</span>
        </a>
        <a class="row" href="#/more/contact">
          <span class="row__icon">${icon('mail', { size: 21 })}</span>
          <span class="row__body"><span class="row__title">${t('more.contact')}</span></span>
          <span class="row__chev">${icon('chevron_right', { size: 22 })}</span>
        </a>
        <a class="row" href="#/more/hiring">
          <span class="row__icon">${icon('work', { size: 21 })}</span>
          <span class="row__body"><span class="row__title">${t('more.hiring')}</span></span>
          <span class="chip chip--accent">${t('more.hiring.badge')}</span>
          <span class="row__chev">${icon('chevron_right', { size: 22 })}</span>
        </a>
      </div>

      <span class="section-label">${t('more.section.settings')}</span>
      <div class="rows">
        <button class="row" data-lang type="button">
          <span class="row__icon">${icon('language', { size: 21 })}</span>
          <span class="row__body"><span class="row__title">${t('common.langLabel')}</span></span>
          <span class="row__value">${langMeta().native}</span>
          <span class="row__chev">${icon('chevron_right', { size: 22 })}</span>
        </button>
      </div>

      <div class="info-card">
        <div class="row__title">${t('more.school.name')}</div>
        <div class="info-card__row">${icon('location_on', { size: 19 })} ${t('more.school.address')}</div>
        <div class="info-card__row">${icon('call', { size: 19 })} ${t('more.school.phone')}</div>
        <div class="info-card__row">${icon('schedule', { size: 19 })} ${t('more.school.hours')}</div>
      </div>
    </section>`);

  function onMount(root) {
    root.querySelector('[data-lang]').addEventListener('click', openLangSheet);
  }
  return { node: el, onMount };
}

// ---- about ---------------------------------------------------------------
function renderAbout() {
  const el = node(`
    <section class="screen screen--list">
      <div class="banner-ph">${t('about.banner')}</div>
      <h1 class="h-display">${t('about.h')}</h1>
      <p class="subnote body-rich" style="font-size:14px;line-height:1.6;">${t('about.body')}</p>
      <div class="about-stats">
        <div class="about-stat"><div class="about-stat__num">${t('about.stat1.n')}</div><div class="about-stat__label">${t('about.stat1.l')}</div></div>
        <div class="about-stat"><div class="about-stat__num">${t('about.stat2.n')}</div><div class="about-stat__label">${t('about.stat2.l')}</div></div>
      </div>
      <span class="section-label">${t('about.instructors')}</span>
      <div class="instructors">
        ${INSTRUCTORS.map((p) => `
          <div class="instructor">
            <div class="instructor__avatar"></div>
            <span class="instructor__name">${p.name}</span>
            <span class="instructor__langs">${p.langs}</span>
          </div>`).join('')}
      </div>
    </section>`);
  return { node: el };
}

// ---- contact -------------------------------------------------------------
function renderContact(ctx) {
  const prefill = takeContactPrefill();
  const el = node(`
    <section class="screen screen--list">
      <div class="map-ph">${icon('map', { size: 20 })} ${t('contact.mapEmbed')}</div>
      <div class="info-card">
        <div class="info-card__row">${icon('location_on', { size: 19 })} ${t('more.school.address')}</div>
        <div class="info-card__row">${icon('call', { size: 19 })} ${t('more.school.phone')}</div>
        <div class="info-card__row">${icon('mail', { size: 19 })} ${t('contact.email')}</div>
      </div>
      <span class="section-label">${t('contact.formTitle')}</span>
      ${prefill ? `<div class="chip chip--accent-soft" style="align-self:flex-start;">${t('contact.prefillNote', { role: prefill.role })}</div>` : ''}
      <div data-form>
        <div class="list-stack" style="gap:12px;">
          <div class="field">
            <input class="input" name="name" type="text" placeholder="${t('contact.name')}">
            <span class="field__error" data-err="name"></span>
          </div>
          <div class="field">
            <input class="input" name="email" type="email" placeholder="${t('contact.emailPlaceholder')}">
            <span class="field__error" data-err="email"></span>
          </div>
          <div class="field">
            <textarea class="textarea" name="message" placeholder="${t('contact.message')}"></textarea>
            <span class="field__error" data-err="message"></span>
          </div>
          <button class="btn btn--primary" data-send type="button">${icon('send', { size: 19 })} ${t('contact.send')}</button>
        </div>
      </div>
    </section>`);

  function onMount(root) {
    const form = root.querySelector('[data-form]');
    root.querySelector('[data-send]').addEventListener('click', () => {
      const name = root.querySelector('[name="name"]').value;
      const email = root.querySelector('[name="email"]').value;
      const message = root.querySelector('[name="message"]').value;
      const errors = {};
      if (!validateName(name)) errors.name = 'contact.err.name';
      if (!validateEmail(email)) errors.email = 'contact.err.email';
      if (!message.trim()) errors.message = 'contact.err.message';
      ['name', 'email', 'message'].forEach((f) => {
        const input = root.querySelector(`[name="${f}"]`);
        const errEl = root.querySelector(`[data-err="${f}"]`);
        if (errors[f]) { input.classList.add('input--error'); errEl.innerHTML = `${icon('error', { size: 15 })} ${t(errors[f])}`; }
        else { input.classList.remove('input--error'); errEl.innerHTML = ''; }
      });
      if (Object.keys(errors).length) return;
      form.innerHTML = `
        <div class="card" style="display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;padding:28px 20px;">
          <div class="success-icon">${icon('check_circle', { size: 42, fill: true })}</div>
          <h2 class="center-screen__h">${t('contact.sent.h')}</h2>
          <p class="subnote">${t('contact.sent.body')}</p>
        </div>`;
    });
  }
  return { node: el, onMount };
}

// ---- hiring --------------------------------------------------------------
function renderHiring(ctx) {
  const jobCard = (job) => {
    const typeCls = job.type === 'fulltime' ? 'chip--green' : 'chip--info';
    return `
      <a class="job-card" href="#/more/hiring/${job.id}">
        <div class="job-card__head">
          <span class="job-card__title">${t(job.titleKey)}</span>
          <span class="chip ${typeCls}">${t('job.type.' + job.type)}</span>
        </div>
        <div class="job-card__tags">${job.langKeys.map((k) => `<span class="chip">${t(k)}</span>`).join('')}</div>
        <div class="job-card__meta">${t(job.salaryKey)}</div>
        <div class="job-card__foot">${t('hiring.viewRole')} ${icon('arrow_forward', { size: 18 })}</div>
      </a>`;
  };

  const el = node(`
    <section class="screen screen--list">
      <p class="subnote body-rich">${t('hiring.intro')}</p>
      ${JOBS.map(jobCard).join('')}
      <div class="card job-cta">
        ${icon('drafts', { size: 26, cls: 'lead' })}
        <span class="row__title">${t('hiring.cta.h')}</span>
        <p class="subnote">${t('hiring.cta.body')}</p>
        <a class="btn btn--ghost" href="#/more/contact">${icon('mail', { size: 18 })} ${t('hiring.cta.btn')} ${icon('arrow_forward', { size: 18 })}</a>
      </div>
    </section>`);
  return { node: el };
}

// ---- role detail ---------------------------------------------------------
function renderRole(ctx) {
  const job = jobById(ctx.role);
  if (!job) { ctx.navigate('#/more/hiring', { replace: true }); return { node: node('<div></div>') }; }
  const typeCls = job.type === 'fulltime' ? 'chip--green' : 'chip--info';
  const chrome = { title: t(job.titleKey) };

  const el = node(`
    <section class="screen screen--list">
      <h1 class="h-display">${t(job.titleKey)}</h1>
      <div class="role-tags">
        <span class="chip ${typeCls}">${t('job.type.' + job.type)}</span>
        <span class="chip">Omiya</span>
        <span class="chip">${t(job.salaryShortKey)}</span>
      </div>
      <div>
        <h2 class="role-section__h">${t('job.detail.do')}</h2>
        <p class="role-section__b body-rich">${t(job.doKey)}</p>
      </div>
      <div>
        <h2 class="role-section__h">${t('job.detail.need')}</h2>
        <p class="role-section__b body-rich">${t(job.needKey)}</p>
      </div>
      <div class="card">
        <span class="eyebrow" style="display:block;margin-bottom:10px;">${t('job.detail.languages')}</span>
        <div class="role-langs">${job.langKeys.map((k) => `<span class="chip chip--accent">${t(k)}</span>`).join('')}</div>
      </div>
      <button class="btn btn--primary" data-apply type="button">${icon('send', { size: 19 })} ${t('job.detail.apply')}</button>
      <p class="role-footnote">${t('job.detail.footnote')}</p>
    </section>`);

  function onMount(root) {
    root.querySelector('[data-apply]').addEventListener('click', () => {
      setContactPrefill({ role: t(job.titleKey) });
      ctx.navigate('#/more/contact');
    });
  }
  return { node: el, onMount, chrome };
}
