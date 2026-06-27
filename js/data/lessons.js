// Training programs for the Reserve flow. titleKey is an i18n key; `duration`
// sizes the first session's calendar block in the .ics export. `prices` holds the
// per-transmission price (yen) — the chosen transmission's price is the booking total.
export const LESSONS = [
  { id: 'program4w', icon: 'school', duration: 50,
    titleKey: 'reserve.lesson.program4w.title', prices: { MT: 250000, AT: 200000 } },
  { id: 'program1w', icon: 'bolt', duration: 50,
    titleKey: 'reserve.lesson.program1w.title', prices: { MT: 70000, AT: 70000 } },
];

export const lessonById = (id) => LESSONS.find((l) => l.id === id);

// Transmission types for the Reserve flow. Price is program-dependent (see LESSONS.prices).
export const TRANSMISSIONS = [
  { id: 'MT', icon: 'settings', titleKey: 'reserve.transmission.mt.title' },
  { id: 'AT', icon: 'auto_mode', titleKey: 'reserve.transmission.at.title' },
];

export const transmissionById = (id) => TRANSMISSIONS.find((x) => x.id === id);

// Price (yen) for a transmission within a given program. Drives the booking total.
export function transmissionPrice(lessonId, transId) {
  const l = lessonById(lessonId);
  return l && l.prices ? l.prices[transId] : null;
}

// Plain-text lesson title (strips the inline HTML in some title keys) for summaries.
export function lessonShortName(t, id) {
  const map = {
    program4w: '4-week Driving Course Program', program1w: 'License Conversion',
  };
  // Prefer a clean label: reuse the localized title with tags removed.
  const raw = t(lessonById(id).titleKey) || map[id];
  return raw.replace(/<[^>]+>/g, '').trim();
}

export function formatYen(n) {
  return '¥' + n.toLocaleString('en-US');
}

// Date pills + time slots shown in step 2 (mirrors the mock: June, Tue 17–Sat 21).
export const RESERVE_DATES = [
  { dow: 'Tue', day: 17 },
  { dow: 'Wed', day: 18 },
  { dow: 'Thu', day: 19 },
  { dow: 'Fri', day: 20 },
  { dow: 'Sat', day: 21 },
];

// Slots per day. `booked` = struck-through, unselectable. Sat is fully booked
// to exercise the no-slots empty state.
export const SLOTS_BY_DAY = {
  17: [['09:00', false], ['11:00', false], ['13:00', false], ['15:00', false], ['16:00', false]],
  18: [['09:00', false], ['10:00', true], ['11:00', false], ['13:00', false], ['14:00', true], ['15:00', false], ['16:00', false]],
  19: [['09:00', false], ['10:00', false], ['13:00', false], ['16:00', false]],
  20: [['11:00', false], ['13:00', false], ['14:00', false], ['15:00', false]],
  21: [['09:00', true], ['10:00', true], ['11:00', true], ['13:00', true], ['14:00', true]],
};

export function dayHasOpenSlot(day) {
  return (SLOTS_BY_DAY[day] || []).some(([, booked]) => !booked);
}
