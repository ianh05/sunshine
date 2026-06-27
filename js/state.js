// localStorage-backed store, namespaced under `torque.*`.
// Never touches keys we didn't write.

const NS = 'torque.';
const key = (k) => NS + k;

function read(k, fallback) {
  try {
    const raw = localStorage.getItem(key(k));
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(k, value) {
  try {
    localStorage.setItem(key(k), JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode / file://) — degrade gracefully */
  }
}

function remove(k) {
  try { localStorage.removeItem(key(k)); } catch {}
}

// ---- Language ------------------------------------------------------------
export function getLang() { return read('lang', null); }
export function setLang(code) { write('lang', code); }

// ---- Quiz progress -------------------------------------------------------
// Seeded lazily. `null` xp means "brand new user" (drives the empty-state home).
const DEFAULT_QUIZ = {
  xp: null,            // null => new user; number once they've played
  streak: 0,
  level: 1,
  topicProgress: {},   // topicId -> answeredCount
  unlockedNotes: [],   // [{ id, topicId, term, learned }]
  missed: [],          // [noteId]
};

export function getQuiz() {
  return { ...DEFAULT_QUIZ, ...read('quiz', {}) };
}

export function setQuiz(patch) {
  const next = { ...getQuiz(), ...patch };
  write('quiz', next);
  return next;
}

export function isNewUser() {
  const q = getQuiz();
  return q.xp == null;
}

// ---- Reserve draft -------------------------------------------------------
const DEFAULT_DRAFT = {
  lesson: null,        // { id, duration }
  transmission: null,  // { id, price }  e.g. { id:'MT', price:250000 } — drives the total (price is program-dependent)
  date: null,          // { dow, day }  e.g. { dow:'Wed', day:18 }
  time: null,          // '11:00'
  name: '', phone: '', email: '', note: '',
  code: null,          // generated on submit
};

export function getDraft() {
  return { ...DEFAULT_DRAFT, ...read('reserveDraft', {}) };
}

export function setDraft(patch) {
  const next = { ...getDraft(), ...patch };
  write('reserveDraft', next);
  return next;
}

export function clearDraft() {
  remove('reserveDraft');
}

// ---- Contact prefill (role-detail → contact deep link) -------------------
export function setContactPrefill(obj) { write('contactPrefill', obj); }
export function takeContactPrefill() {
  const v = read('contactPrefill', null);
  remove('contactPrefill');
  return v;
}
