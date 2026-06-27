// Reserve: 4-step flow + no-slots / errors / submitting / confirmed states.
import { node } from '../components/dom.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';
import {
  LESSONS, lessonById, lessonShortName, formatYen,
  TRANSMISSIONS, transmissionById, transmissionPrice,
  RESERVE_DATES, SLOTS_BY_DAY, dayHasOpenSlot,
} from '../data/lessons.js';
import { getDraft, setDraft, clearDraft } from '../state.js';
import { validateReserveDetails, bannerText } from '../components/forms.js';
import { generateBookingCode } from '../components/code.js';
import { downloadIcs } from '../components/calendar.js';

const STEP_NUM = { lesson: 1, transmission: 2, datetime: 3, details: 4, review: 5 };
const STEP_KEY = { lesson: 'reserve.stepName.lesson', transmission: 'reserve.stepName.transmission', datetime: 'reserve.stepName.datetime', details: 'reserve.stepName.details', review: 'reserve.stepName.review' };

function stepperHtml(step) {
  const n = STEP_NUM[step];
  const segs = [1, 2, 3, 4, 5].map((i) =>
    `<span class="stepper__seg ${i <= n ? 'stepper__seg--on' : ''}"></span>`).join('');
  return `
    <div class="stepper">
      <span class="stepper__label">${t('reserve.step', { n, name: t(STEP_KEY[step]) })}</span>
      <div class="stepper__bars">${segs}</div>
    </div>`;
}

function dateLabel(d) { return `${d.dow} ${d.day}`; }

export function render(step, ctx) {
  switch (step) {
    case 'lesson': return renderLesson(ctx);
    case 'transmission': return renderTransmission(ctx);
    case 'datetime': return renderDatetime(ctx);
    case 'details': return renderDetails(ctx);
    case 'review': return renderReview(ctx);
    case 'submitting': return renderSubmitting(ctx);
    case 'confirmed': return renderConfirmed(ctx);
  }
}

// ---- step 1: lesson type -------------------------------------------------
function renderLesson(ctx) {
  const draft = getDraft();
  let selectedId = draft.lesson ? draft.lesson.id : 'program4w';
  if (!lessonById(selectedId)) selectedId = LESSONS[0].id; // stale draft → fall back

  const cardHtml = (l) => `
    <button class="option ${l.id === selectedId ? 'option--selected' : ''}" data-lesson="${l.id}" type="button">
      <span class="option__icon">${icon(l.icon, { size: 22, fill: l.id === selectedId })}</span>
      <span class="option__body">
        <span class="option__title">${t(l.titleKey)}</span>
      </span>
    </button>`;

  const el = node(`
    <section class="screen">
      ${stepperHtml('lesson')}
      <h1 class="h-display">${t('reserve.s1.h')}</h1>
      <div class="list-stack" data-lessons>${LESSONS.map(cardHtml).join('')}</div>
      <button class="btn btn--primary" data-continue type="button">${t('reserve.s1.continue')} ${icon('arrow_forward', { size: 19 })}</button>
    </section>`);

  function onMount(root) {
    const wrap = root.querySelector('[data-lessons]');
    // One delegated listener survives the innerHTML re-renders below.
    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lesson]');
      if (!b) return;
      selectedId = b.dataset.lesson;
      wrap.innerHTML = LESSONS.map(cardHtml).join('');
    });
    root.querySelector('[data-continue]').addEventListener('click', () => {
      const l = lessonById(selectedId);
      setDraft({ lesson: { id: l.id, duration: l.duration } });
      ctx.navigate('#/reserve/transmission');
    });
  }
  return { node: el, onMount };
}

// ---- step 2: transmission ------------------------------------------------
function renderTransmission(ctx) {
  const draft = getDraft();
  if (!draft.lesson) { ctx.navigate('#/reserve', { replace: true }); return { node: node('<div></div>') }; }
  const lessonId = draft.lesson.id;
  const lesson = lessonById(lessonId);
  let selTrans = draft.transmission ? draft.transmission.id : null;

  const transCardHtml = (x) => `
    <button class="option ${x.id === selTrans ? 'option--selected' : ''}" data-trans-id="${x.id}" type="button">
      <span class="option__icon">${icon(x.icon, { size: 22, fill: x.id === selTrans })}</span>
      <span class="option__body">
        <span class="option__title">${t(x.titleKey)}</span>
      </span>
      <span class="option__price">${formatYen(transmissionPrice(lessonId, x.id))}</span>
    </button>`;

  const el = node(`
    <section class="screen">
      ${stepperHtml('transmission')}
      <div class="summary-chip">${icon(lesson.icon, { size: 19 })} ${lessonShortName(t, lessonId)}</div>
      <h1 class="h-display">${t('reserve.s2.transmission')}</h1>
      <div class="list-stack" data-trans>${TRANSMISSIONS.map(transCardHtml).join('')}</div>
      <button class="btn btn--primary" data-continue type="button" disabled>${t('reserve.s2.continue')} ${icon('arrow_forward', { size: 19 })}</button>
    </section>`);

  function refresh(root) {
    const cont = root.querySelector('[data-continue]');
    const ok = !!selTrans;
    cont.disabled = !ok;
    cont.classList.toggle('btn--disabled', !ok);
  }

  function onMount(root) {
    const transWrap = root.querySelector('[data-trans]');
    // One delegated listener survives the innerHTML re-render that toggles selection.
    transWrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-trans-id]');
      if (!b) return;
      selTrans = b.dataset.transId;
      transWrap.innerHTML = TRANSMISSIONS.map(transCardHtml).join('');
      refresh(root);
    });
    refresh(root);
    root.querySelector('[data-continue]').addEventListener('click', () => {
      setDraft({ transmission: { id: selTrans, price: transmissionPrice(lessonId, selTrans) } });
      ctx.navigate('#/reserve/datetime');
    });
  }
  return { node: el, onMount };
}

// ---- step 3: date & time -------------------------------------------------
function renderDatetime(ctx) {
  const draft = getDraft();
  if (!draft.lesson || !draft.transmission) { ctx.navigate('#/reserve', { replace: true }); return { node: node('<div></div>') }; }
  const lesson = lessonById(draft.lesson.id);
  const trans = transmissionById(draft.transmission.id);
  const total = transmissionPrice(draft.lesson.id, draft.transmission.id);

  let selDay = draft.date ? draft.date.day : 18;
  let selTime = draft.time || null;

  const el = node(`
    <section class="screen">
      ${stepperHtml('datetime')}
      <div class="summary-chip">${icon(lesson.icon, { size: 19 })} ${lessonShortName(t, lesson.id)} · ${t(trans.titleKey)} · ${formatYen(total)}</div>
      <span class="section-label">${t('reserve.s2.chooseDate')}</span>
      <div class="daterow" data-dates></div>
      <div data-times></div>
      <button class="btn btn--primary" data-continue type="button" disabled>${t('reserve.s2.continue')} ${icon('arrow_forward', { size: 19 })}</button>
    </section>`);

  function renderDates(root) {
    root.querySelector('[data-dates]').innerHTML = RESERVE_DATES.map((d) => `
      <button class="datepill ${d.day === selDay ? 'datepill--sel' : ''}" data-day="${d.day}" type="button">
        <span class="datepill__dow">${d.dow}</span>
        <span class="datepill__day">${d.day}</span>
      </button>`).join('');
    root.querySelectorAll('[data-day]').forEach((b) =>
      b.addEventListener('click', () => { selDay = Number(b.dataset.day); selTime = null; refresh(root); }));
  }

  function renderTimes(root) {
    const dateObj = RESERVE_DATES.find((d) => d.day === selDay);
    const wrap = root.querySelector('[data-times]');
    if (!dayHasOpenSlot(selDay)) {
      wrap.innerHTML = `
        <div class="card" style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;padding:30px 20px;">
          <span class="empty-card__icon" style="background:var(--bg-inset);color:var(--text-tertiary);">${icon('event_busy', { size: 30 })}</span>
          <h2 class="h-display" style="font-size:19px;">${t('reserve.s2.noslots.h', { date: dateLabel(dateObj) })}</h2>
          <p class="subnote" style="max-width:240px;">${t('reserve.s2.noslots.body')}</p>
          <button class="btn btn--secondary" data-next-avail type="button" style="width:auto;padding:0 18px;color:var(--accent);border-color:var(--primary-border);">${t('reserve.s2.noslots.next')}</button>
        </div>`;
      wrap.querySelector('[data-next-avail]').addEventListener('click', () => {
        selDay = nextOpenDay(selDay); selTime = null; refresh(root);
      });
      return;
    }
    const slots = SLOTS_BY_DAY[selDay] || [];
    wrap.innerHTML = `
      <span class="section-label" style="display:block;margin-bottom:8px;">${t('reserve.s2.times', { date: dateLabel(dateObj) })}</span>
      <div class="slotrow">${slots.map(([time, booked]) => `
        <button class="slot ${booked ? 'slot--booked' : ''} ${(!booked && time === selTime) ? 'slot--sel' : ''}"
          ${booked ? 'disabled' : `data-time="${time}"`} type="button">${time}</button>`).join('')}
      </div>
      <p class="legend" style="margin-top:10px;">${t('reserve.s2.legend')}</p>`;
    wrap.querySelectorAll('[data-time]').forEach((b) =>
      b.addEventListener('click', () => { selTime = b.dataset.time; refresh(root); }));
  }

  function refresh(root) {
    renderDates(root);
    renderTimes(root);
    const cont = root.querySelector('[data-continue]');
    const ok = !!selTime && dayHasOpenSlot(selDay);
    cont.disabled = !ok;
    cont.classList.toggle('btn--disabled', !ok);
  }

  function onMount(root) {
    refresh(root);
    root.querySelector('[data-continue]').addEventListener('click', () => {
      const dateObj = RESERVE_DATES.find((d) => d.day === selDay);
      setDraft({ date: { dow: dateObj.dow, day: dateObj.day }, time: selTime });
      ctx.navigate('#/reserve/details');
    });
  }
  return { node: el, onMount };
}

function nextOpenDay(day) {
  const idx = RESERVE_DATES.findIndex((d) => d.day === day);
  for (let i = 1; i <= RESERVE_DATES.length; i++) {
    const cand = RESERVE_DATES[(idx + i) % RESERVE_DATES.length];
    if (dayHasOpenSlot(cand.day)) return cand.day;
  }
  return day;
}

// ---- step 3: details -----------------------------------------------------
function renderDetails(ctx) {
  const draft = getDraft();
  if (!draft.lesson) { ctx.navigate('#/reserve', { replace: true }); return { node: node('<div></div>') }; }

  const el = node(`
    <section class="screen">
      ${stepperHtml('details')}
      <div data-banner></div>
      <h1 class="h-display">${t('reserve.s3.h')}</h1>
      <p class="subnote">${t('reserve.s3.sub')}</p>
      <div class="list-stack" style="gap:15px;">
        ${fieldHtml('name', t('reserve.s3.name'), 'text', draft.name, t('reserve.s3.namePlaceholder'))}
        ${fieldHtml('phone', t('reserve.s3.phone'), 'tel', draft.phone, '080-1234-5678')}
        ${fieldHtml('email', t('reserve.s3.email'), 'email', draft.email, 'name@email.com')}
        ${textareaHtml('note', `${t('reserve.s3.note')} <span class="opt">${t('reserve.s3.optional')}</span>`, draft.note, t('reserve.s3.notePlaceholder'))}
      </div>
      <button class="btn btn--primary" data-continue type="button">${t('reserve.s3.continue')} ${icon('arrow_forward', { size: 19 })}</button>
    </section>`);

  function getData(root) {
    return {
      name: root.querySelector('[name="name"]').value,
      phone: root.querySelector('[name="phone"]').value,
      email: root.querySelector('[name="email"]').value,
      note: root.querySelector('[name="note"]').value,
    };
  }

  function showErrors(root, errors) {
    const banner = root.querySelector('[data-banner]');
    const count = Object.keys(errors).length;
    banner.innerHTML = count
      ? `<div class="banner">${icon('error', { size: 19 })} ${bannerText(count)}</div>` : '';
    ['name', 'phone', 'email'].forEach((f) => {
      const input = root.querySelector(`[name="${f}"]`);
      const errEl = root.querySelector(`[data-err="${f}"]`);
      if (errors[f]) {
        input.classList.add('input--error');
        errEl.innerHTML = `${icon('error', { size: 15 })} ${t(errors[f])}`;
      } else {
        input.classList.remove('input--error');
        errEl.innerHTML = '';
      }
    });
  }

  function onMount(root) {
    // clear an individual error live once the field becomes valid
    ['name', 'phone', 'email'].forEach((f) => {
      root.querySelector(`[name="${f}"]`).addEventListener('input', () => {
        const { errors } = validateReserveDetails(getData(root));
        if (!errors[f]) {
          root.querySelector(`[name="${f}"]`).classList.remove('input--error');
          root.querySelector(`[data-err="${f}"]`).innerHTML = '';
        }
      });
    });
    root.querySelector('[data-continue]').addEventListener('click', () => {
      const data = getData(root);
      const { errors, count } = validateReserveDetails(data);
      if (count) { showErrors(root, errors); root.querySelector('[data-banner]').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
      setDraft(data);
      ctx.navigate('#/reserve/review');
    });
  }
  return { node: el, onMount };
}

function fieldHtml(name, label, type, value, placeholder) {
  return `
    <div class="field">
      <label class="field__label" for="f-${name}">${label}</label>
      <input class="input" id="f-${name}" name="${name}" type="${type}" value="${escAttr(value)}" placeholder="${escAttr(placeholder)}" autocomplete="off">
      <span class="field__error" data-err="${name}"></span>
    </div>`;
}
function textareaHtml(name, label, value, placeholder) {
  return `
    <div class="field">
      <label class="field__label" for="f-${name}">${label}</label>
      <textarea class="textarea" id="f-${name}" name="${name}" placeholder="${escAttr(placeholder)}">${escText(value)}</textarea>
    </div>`;
}
function escAttr(s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function escText(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// ---- step 4: review ------------------------------------------------------
function renderReview(ctx) {
  const draft = getDraft();
  if (!draft.lesson || !draft.transmission || !draft.date || !draft.time) { ctx.navigate('#/reserve', { replace: true }); return { node: node('<div></div>') }; }
  const lesson = lessonById(draft.lesson.id);
  const trans = transmissionById(draft.transmission.id);
  const totalYen = draft.transmission.price != null ? draft.transmission.price : transmissionPrice(draft.lesson.id, draft.transmission.id);
  const when = `${draft.date.dow} ${draft.date.day} Jun · ${draft.time}`;

  const rowHtml = (label, value, total) => `
    <div class="rev-row ${total ? 'rev-row--total' : ''}">
      <span class="rev-row__k">${label}</span>
      <span class="rev-row__v">${value}</span>
    </div>`;

  const el = node(`
    <section class="screen">
      ${stepperHtml('review')}
      <h1 class="h-display">${t('reserve.s4.h')}</h1>
      <div class="rev-table">
        ${rowHtml(t('reserve.s4.lesson'), lessonShortName(t, lesson.id))}
        ${rowHtml(t('reserve.s4.transmission'), t(trans.titleKey))}
        ${rowHtml(t('reserve.s4.when'), escText(when))}
        ${rowHtml(t('reserve.s4.name'), escText(draft.name))}
        ${rowHtml(t('reserve.s4.contact'), escText(draft.phone))}
        ${rowHtml(t('reserve.s4.total'), formatYen(totalYen), true)}
      </div>
      <div class="callout callout--info">${icon('info', { size: 19 })}<div class="body-rich">${t('reserve.s4.note')}</div></div>
      <button class="btn btn--primary" data-submit type="button">${icon('send', { size: 19 })} ${t('reserve.s4.submit')}</button>
    </section>`);

  function onMount(root) {
    root.querySelector('[data-submit]').addEventListener('click', () => {
      setDraft({ code: generateBookingCode() });
      ctx.navigate('#/reserve/submitting', { replace: true });
    });
  }
  return { node: el, onMount };
}

// ---- submitting (transient) ---------------------------------------------
function renderSubmitting(ctx) {
  const draft = getDraft();
  if (!draft.code) { ctx.navigate('#/reserve', { replace: true }); return { node: node('<div></div>') }; }
  const el = node(`
    <section class="center-screen">
      <div class="spinner"></div>
      <h1 class="center-screen__h">${t('reserve.submitting.h')}</h1>
      <p class="center-screen__body">${t('reserve.submitting.body')}</p>
    </section>`);
  function onMount() {
    setTimeout(() => ctx.navigate('#/reserve/confirmed', { replace: true }), 1600);
  }
  return { node: el, onMount };
}

// ---- confirmed -----------------------------------------------------------
function renderConfirmed(ctx) {
  const draft = getDraft();
  if (!draft.code) { ctx.navigate('#/home', { replace: true }); return { node: node('<div></div>') }; }
  const lesson = lessonById(draft.lesson.id);
  const trans = draft.transmission ? transmissionById(draft.transmission.id) : null;
  const when = `${draft.date.dow} ${draft.date.day} Jun · ${draft.time}`;

  const el = node(`
    <section class="confirmed-screen">
      <div class="confirmed-top">
        <div class="success-icon">${icon('check_circle', { size: 42, fill: true })}</div>
        <h1 class="center-screen__h">${t('reserve.confirmed.h')}</h1>
        <p class="center-screen__body">${t('reserve.confirmed.body')}</p>
        <div class="code-card">
          <span class="eyebrow">${t('reserve.confirmed.refEyebrow')}</span>
          <span class="code">${draft.code}</span>
          <span class="code-card__hint">${icon('screenshot', { size: 15 })} ${t('reserve.confirmed.screenshot')}</span>
        </div>
        <div class="whatsnext">
          <span class="eyebrow">${t('reserve.confirmed.whatsNext')}</span>
          <div class="whatsnext__row">${icon(lesson.icon, { size: 18 })} ${lessonShortName(t, lesson.id)}</div>
          ${trans ? `<div class="whatsnext__row">${icon(trans.icon, { size: 18 })} ${t(trans.titleKey)}</div>` : ''}
          <div class="whatsnext__row">${icon('event', { size: 18 })} ${escText(when)}</div>
        </div>
      </div>
      <div class="confirmed-actions">
        <button class="btn btn--primary" data-done type="button">${t('reserve.confirmed.done')}</button>
        <button class="btn btn--secondary" data-cal type="button">${icon('event', { size: 19 })} ${t('reserve.confirmed.calendar')}</button>
      </div>
    </section>`);

  function onMount(root) {
    root.querySelector('[data-cal]').addEventListener('click', () =>
      downloadIcs(getDraft(), `${lessonShortName(t, lesson.id)} lesson${trans ? ` · ${t(trans.titleKey)}` : ''}`));
    root.querySelector('[data-done]').addEventListener('click', () => {
      clearDraft();
      ctx.navigate('#/home', { replace: true, force: true });
    });
  }
  return { node: el, onMount };
}
