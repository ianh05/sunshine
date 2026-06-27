// Study: quiz home (new/returning), focused question + reveals, summary, notes.
import { node } from '../components/dom.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';
import { TOPICS, topicById, buildSet } from '../data/quiz.js';
import { getQuiz, setQuiz, isNewUser } from '../state.js';
import { signFor } from '../components/signs.js';

// in-memory session for the active set
let session = null;

const fmt = (n) => Number(n).toLocaleString('en-US');
const levelFromXp = (xp) => 1 + Math.floor((xp || 0) / 200);
const levelFloor = (lvl) => (lvl - 1) * 200;

export function render(view, ctx) {
  switch (view) {
    case 'home': return renderHome(ctx);
    case 'quiz': return renderQuiz(ctx);
    case 'summary': return renderSummary(ctx);
    case 'notes': return renderNotes(ctx);
  }
}

// ---- session lifecycle ---------------------------------------------------
function startSession(topicId) {
  const q = getQuiz();
  session = {
    topicId,
    set: buildSet(topicId),
    index: 0,
    score: 0,
    xpGained: 0,
    streak: q.streak || 0,
    selected: null,
    revealed: false,
    answers: [],
    result: null,
  };
}

function finalize() {
  const q = getQuiz();
  const xpBefore = q.xp || 0;
  const xp = xpBefore + session.xpGained;

  const map = {};
  (q.unlockedNotes || []).forEach((n) => { map[n.id] = { ...n }; });
  session.answers.forEach((a) => {
    const prev = map[a.id];
    map[a.id] = { id: a.id, topicId: session.topicId, learned: a.correct || (prev && prev.learned) || false };
  });
  const unlockedNotes = Object.values(map);
  const missed = unlockedNotes.filter((n) => !n.learned).map((n) => n.id);

  const topicProgress = { ...(q.topicProgress || {}) };
  const topic = topicById(session.topicId);
  topicProgress[session.topicId] = Math.min(
    topic.displayTotal, (topicProgress[session.topicId] || 0) + session.score);

  const level = levelFromXp(xp);
  setQuiz({ xp, streak: session.streak, level, topicProgress, unlockedNotes, missed, lastTopic: session.topicId });

  const topicNotes = unlockedNotes.filter((n) => n.topicId === session.topicId).length;
  session.result = {
    score: session.score, xpGained: session.xpGained, streak: session.streak,
    level, xp, topicNotes,
  };
}

// ---- quiz home -----------------------------------------------------------
function topicRowHtml(topic, answered, statusOverride) {
  const tintCls = topic.tint === 'info' ? 'row__icon--info' : topic.tint === 'accent' ? 'row__icon--accent' : '';
  let status = '';
  if (statusOverride) status = ` · ${statusOverride}`;
  else if (answered === 0) status = ` · ${t('study.new.tag')}`;
  else if (answered >= topic.displayTotal - 3) status = ` <span class="row__sub--green">· ${t('study.doneSoon')}</span>`;
  return `
    <button class="row" data-topic="${topic.id}" type="button">
      <span class="row__icon ${tintCls}">${icon(topic.icon, { size: 21 })}</span>
      <span class="row__body">
        <span class="row__title">${t(topic.nameKey)} <span class="jp muted">(${t(topic.jpKey)})</span></span>
        <span class="row__sub">${answered} / ${topic.displayTotal}${status}</span>
      </span>
      <span class="row__chev">${icon('chevron_right', { size: 22 })}</span>
    </button>`;
}

function renderHome(ctx) {
  const q = getQuiz();
  const newUser = isNewUser();
  let el;

  if (newUser) {
    const rows = [TOPICS[0], TOPICS[1]].map((tp, i) =>
      topicRowHtml(tp, 0, i === 0 ? t('study.startHere') : null)).join('');
    el = node(`
      <section class="screen screen--list">
        <h1 class="h-display h-screen">${t('study.title')}</h1>
        <div class="empty-card">
          <span class="empty-card__icon">${icon('local_fire_department', { size: 30, fill: true })}</span>
          <h2 class="empty-card__h">${t('study.new.h')}</h2>
          <p class="empty-card__body body-rich">${t('study.new.body')}</p>
          <button class="btn btn--primary" data-start="${TOPICS[0].id}" type="button">${icon('play_arrow', { size: 19, fill: true })} ${t('study.new.btn')}</button>
        </div>
        <div class="statgrid">
          ${statHtml('bolt', '0', t('study.stat.xpShort'), true)}
          ${statHtml('local_fire_department', '0', t('study.stat.streakShort'), true)}
          ${statHtml('workspace_premium', '1', t('study.stat.level'), true)}
        </div>
        <span class="section-label">${t('study.pickTopic')}</span>
        <div class="rows">${rows}</div>
      </section>`);
  } else {
    const xp = q.xp || 0;
    const level = levelFromXp(xp);
    const lastTopic = topicById(q.lastTopic || TOPICS[0].id);
    const lastAnswered = (q.topicProgress || {})[lastTopic.id] || 0;
    const lastPct = Math.round((lastAnswered / lastTopic.displayTotal) * 100);
    const rows = TOPICS.map((tp) => topicRowHtml(tp, (q.topicProgress || {})[tp.id] || 0)).join('');
    el = node(`
      <section class="screen screen--list">
        <h1 class="h-display h-screen">${t('study.title')}</h1>
        <div class="statgrid">
          ${statHtml('local_fire_department', fmt(q.streak || 0), t('study.stat.streak'), false, 'var(--accent)')}
          ${statHtml('bolt', fmt(xp), t('study.stat.xp'), false, 'var(--info)')}
          ${statHtml('workspace_premium', fmt(level), t('study.stat.level'), false, 'var(--accent)')}
        </div>
        <div class="continue-card">
          <span class="eyebrow">${t('study.continue.eyebrow')}</span>
          <div class="continue-card__top">
            <span class="continue-card__topic">${t(lastTopic.nameKey)} <span class="jp muted">(${t(lastTopic.jpKey)})</span></span>
            <span class="continue-card__frac">${lastAnswered} / ${lastTopic.displayTotal}</span>
          </div>
          <div class="progress"><div class="progress__fill" style="width:${lastPct}%"></div></div>
          <button class="btn btn--primary btn--small" data-start="${lastTopic.id}" type="button">${t('study.continue.btn')}</button>
        </div>
        <span class="section-label">${t('study.allTopics')}</span>
        <div class="rows">${rows}</div>
      </section>`);
  }

  function onMount(root) {
    root.querySelectorAll('[data-start]').forEach((b) =>
      b.addEventListener('click', () => { startSession(b.dataset.start); ctx.navigate('#/study/quiz'); }));
    root.querySelectorAll('[data-topic]').forEach((b) =>
      b.addEventListener('click', () => { startSession(b.dataset.topic); ctx.navigate('#/study/quiz'); }));
  }
  return { node: el, onMount };
}

function statHtml(iconName, num, label, dashed, color) {
  return `
    <div class="stat ${dashed ? 'stat--dashed' : ''}">
      <span class="stat__icon">${icon(iconName, { size: 20, fill: !dashed, color: color || 'var(--text-tertiary)' })}</span>
      <span class="stat__num">${num}</span>
      <span class="stat__label">${label}</span>
    </div>`;
}

// ---- focused quiz --------------------------------------------------------
function renderQuiz(ctx) {
  // Deep-link / refresh with no active session → start a fresh set for the
  // last-played topic rather than bouncing back to the Study hub.
  if (!session) startSession(getQuiz().lastTopic || TOPICS[0].id);

  const el = node(`<section class="focus-screen" data-quiz></section>`);

  function paint(root) {
    const q = session.set[session.index];
    const total = session.set.length;
    const n = session.index + 1;
    const pct = Math.round((n / total) * 100);
    const optCount = q.opts;

    const answersHtml = Array.from({ length: optCount }, (_, i) => {
      const txt = t(`q.${q.id}.o${i}`);
      let cls = 'answer';
      let lead = '<span class="radio"></span>';
      if (!session.revealed) {
        if (session.selected === i) { cls += ' answer--sel'; }
      } else {
        if (i === q.correct) { cls += ' answer--correct'; lead = `<span class="answer__icon">${icon('check_circle', { size: 22, fill: true })}</span>`; }
        else if (i === session.selected) { cls += ' answer--incorrect'; lead = `<span class="answer__icon">${icon('cancel', { size: 22, fill: true })}</span>`; }
        else { cls += ' answer--dim'; }
      }
      const attr = session.revealed ? '' : `data-opt="${i}"`;
      return `<button class="${cls}" ${attr} type="button">${lead}<span>${txt}</span></button>`;
    }).join('');

    let feedbackHtml = '';
    if (session.revealed) {
      const correct = session.selected === q.correct;
      feedbackHtml = `
        <div class="feedback feedback--${correct ? 'correct' : 'incorrect'}">
          <div class="feedback__head">
            ${icon(correct ? 'check_circle' : 'info', { size: 20, fill: true })}
            <span>${correct ? t('quiz.correct') : t('quiz.notQuite')}</span>
            ${correct ? `<span class="feedback__xp" style="color:var(--green)">${t('quiz.xpPlus')}</span>` : ''}
          </div>
          <div class="feedback__exp body-rich">${t(`q.${q.id}.exp`)}${correct ? '' : ' ' + t('quiz.savedToNotes')}</div>
        </div>`;
    }

    const footer = session.revealed
      ? `<button class="btn btn--primary" data-next type="button">${t('quiz.next')} ${icon('arrow_forward', { size: 19 })}</button>`
      : `<button class="btn ${session.selected == null ? 'btn--disabled' : 'btn--primary'}" data-check type="button" ${session.selected == null ? 'disabled' : ''}>${session.selected == null ? t('quiz.selectAnswer') : t('quiz.check')}</button>`;

    root.innerHTML = `
      <div class="quiz-head">
        <button class="iconbtn" data-exit type="button" aria-label="Close">${icon('close', { size: 24 })}</button>
        <span class="quiz-head__center">${t('quiz.questionOf', { n, total })}</span>
        <span class="quiz-head__streak">${icon('local_fire_department', { size: 19, fill: true })} ${session.streak}</span>
      </div>
      <div class="quiz-progress"><div class="quiz-progress__fill" style="width:${pct}%"></div></div>
      <div class="focus-body">
        <div class="sign-fig">${signFor(q.id)}</div>
        <p class="quiz-q">${t(`q.${q.id}.prompt`)}</p>
        <div class="list-stack">${answersHtml}</div>
        ${feedbackHtml}
      </div>
      <div class="focus-footer">${footer}</div>`;

    root.querySelector('[data-exit]').addEventListener('click', () => {
      if (confirm(t('quiz.leaveConfirm'))) { session = null; ctx.navigate('#/study', { replace: true }); }
    });
    root.querySelectorAll('[data-opt]').forEach((b) =>
      b.addEventListener('click', () => { session.selected = Number(b.dataset.opt); paint(root); }));
    const check = root.querySelector('[data-check]');
    if (check) check.addEventListener('click', () => {
      if (session.selected == null) return;
      session.revealed = true;
      const correct = session.selected === q.correct;
      if (correct) { session.score++; session.xpGained += 10; session.streak++; }
      session.answers.push({ id: q.id, correct });
      paint(root);
    });
    const next = root.querySelector('[data-next]');
    if (next) next.addEventListener('click', () => {
      if (session.index + 1 < total) {
        session.index++; session.selected = null; session.revealed = false; paint(root);
      } else {
        finalize();
        ctx.navigate('#/study/summary', { replace: true });
      }
    });
  }

  return { node: el, onMount: (root) => paint(root.querySelector('[data-quiz]')) };
}

// ---- summary -------------------------------------------------------------
function renderSummary(ctx) {
  if (!session || !session.result) { ctx.navigate('#/study', { replace: true }); return { node: node('<div></div>') }; }
  const r = session.result;
  const topic = topicById(session.topicId);
  const total = session.set.length;
  const pct = Math.round(((r.xp - levelFloor(r.level)) / 200) * 100);

  const el = node(`
    <section class="center-screen" style="justify-content:flex-start;padding-top:40px;gap:16px;">
      <div class="medal">${icon('military_tech', { size: 38, fill: true })}</div>
      <h1 class="center-screen__h">${t('quiz.summary.h')}</h1>
      <p class="subnote">${t(topic.nameKey)} <span class="jp">(${t(topic.jpKey)})</span></p>
      <div class="summary-tiles" style="width:100%;">
        <div class="summary-tile"><span class="summary-tile__num">${r.score}/${total}</span><span class="summary-tile__label">${t('quiz.summary.score')}</span></div>
        <div class="summary-tile"><span class="summary-tile__num summary-tile__num--info">+${r.xpGained}</span><span class="summary-tile__label">${t('quiz.summary.xp')}</span></div>
        <div class="summary-tile"><span class="summary-tile__num flame">🔥${r.streak}</span><span class="summary-tile__label">${t('quiz.summary.streak')}</span></div>
      </div>
      <div class="level-card" style="width:100%;">
        <div class="level-card__top">
          <span class="level-card__title">${t('quiz.summary.level', { a: r.level, b: r.level + 1 })}</span>
          <span class="level-card__xp">${fmt(r.xp)} / ${fmt(levelFloor(r.level) + 200)}</span>
        </div>
        <div class="progress"><div class="progress__fill progress__fill--grad" style="width:${pct}%"></div></div>
      </div>
      <div style="width:100%;display:flex;flex-direction:column;gap:10px;margin-top:6px;">
        <button class="btn btn--primary" data-notes type="button">${icon('menu_book', { size: 19 })} ${t('quiz.summary.reviewNotes', { n: r.topicNotes })}</button>
        <button class="btn btn--secondary" data-back type="button">${t('quiz.summary.backTopics')}</button>
      </div>
    </section>`);

  function onMount(root) {
    root.querySelector('[data-notes]').addEventListener('click', () => ctx.navigate('#/study/notes'));
    root.querySelector('[data-back]').addEventListener('click', () => { session = null; ctx.navigate('#/study'); });
  }
  return { node: el, onMount };
}

// ---- review notes --------------------------------------------------------
function renderNotes(ctx) {
  const q = getQuiz();
  const topicId = (session && session.topicId) || q.lastTopic || TOPICS[0].id;
  const topic = topicById(topicId);
  const all = (q.unlockedNotes || []).filter((n) => n.topicId === topicId);
  const missedCount = all.filter((n) => !n.learned).length;
  let filter = 'all';

  const chrome = { title: t('notes.title', { topic: t(topic.nameKey) }) };

  const el = node(`
    <section class="screen screen--list">
      <p class="subnote">${t('notes.intro')}</p>
      <div class="notes-filters">
        <span class="notes-unlocked">${icon('bookmark_added', { size: 17, fill: true })} ${t('notes.unlocked', { n: all.length, total: topic.notesTotal })}</span>
        <button class="filter-pill filter-pill--active" data-filter="all" type="button">${t('notes.filter.all')}</button>
        <button class="filter-pill" data-filter="missed" type="button">${t('notes.filter.missed')} ${missedCount}</button>
      </div>
      <div class="list-stack" data-notelist></div>
      <button class="btn btn--primary" data-retry type="button">${icon('replay', { size: 19 })} ${t('notes.retry')}</button>
      <div class="btn-row">
        <button class="btn btn--secondary" data-missed type="button">${icon('bookmark', { size: 18 })} ${t('notes.practiceMissed')}</button>
        <button class="btn btn--secondary" data-home type="button">${icon('home', { size: 18 })} ${t('notes.backHome')}</button>
      </div>
    </section>`);

  function noteCard(n) {
    const learned = n.learned;
    return `
      <div class="note-card ${learned ? 'note-card--learned' : 'note-card--missed'}">
        <div class="note-card__head">
          ${icon(learned ? 'check_circle' : 'bookmark', { size: 19, fill: true })}
          <span class="note-card__term">${learned ? t(`q.${n.id}.term`) : t('notes.missedReview')}</span>
        </div>
        <div class="note-card__body body-rich">${t(`q.${n.id}.note`)}</div>
      </div>`;
  }

  function paintList(root) {
    const list = filter === 'missed' ? all.filter((n) => !n.learned) : all;
    const wrap = root.querySelector('[data-notelist]');
    wrap.innerHTML = list.length ? list.map(noteCard).join('')
      : `<p class="subnote">${t('notes.empty')}</p>`;
  }

  function onMount(root) {
    paintList(root);
    root.querySelectorAll('[data-filter]').forEach((b) =>
      b.addEventListener('click', () => {
        filter = b.dataset.filter;
        root.querySelectorAll('[data-filter]').forEach((x) => x.classList.toggle('filter-pill--active', x === b));
        paintList(root);
      }));
    const retry = () => { startSession(topicId); ctx.navigate('#/study/quiz'); };
    root.querySelector('[data-retry]').addEventListener('click', retry);
    root.querySelector('[data-missed]').addEventListener('click', retry);
    root.querySelector('[data-home]').addEventListener('click', () => { session = null; ctx.navigate('#/home'); });
  }
  return { node: el, onMount, chrome };
}
