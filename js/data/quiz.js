// Quiz bank. Question text/options/explanations live in i18n under `q.<id>.*`.
// Each question: id, correct (index), opts (option count).
// `displayTotal` = denominator shown on the home topic cards (sample data).
// `notesTotal`   = denominator on the Review-notes screen.
export const TOPICS = [
  {
    id: 'signs', nameKey: 'topic.signs.name', jpKey: 'topic.signs.jp',
    icon: 'signpost', tint: 'info', displayTotal: 15, notesTotal: 12,
    questions: [
      { id: 'signs1', correct: 1, opts: 4 },
      { id: 'signs2', correct: 0, opts: 3 },
      { id: 'signs3', correct: 1, opts: 3 },
      { id: 'signs4', correct: 0, opts: 3 },
      { id: 'signs5', correct: 1, opts: 3 },
      { id: 'signs6', correct: 0, opts: 3 },
    ],
  },
  {
    id: 'row', nameKey: 'topic.row.name', jpKey: 'topic.row.jp',
    icon: 'fork_right', tint: 'accent', displayTotal: 10, notesTotal: 10,
    questions: [
      { id: 'row1', correct: 0, opts: 3 },
      { id: 'row2', correct: 1, opts: 3 },
      { id: 'row3', correct: 1, opts: 3 },
      { id: 'row4', correct: 0, opts: 3 },
      { id: 'row5', correct: 1, opts: 3 },
      { id: 'row6', correct: 0, opts: 3 },
    ],
  },
  {
    id: 'highway', nameKey: 'topic.highway.name', jpKey: 'topic.highway.jp',
    icon: 'road', tint: 'inset', displayTotal: 8, notesTotal: 8,
    questions: [
      { id: 'hw1', correct: 1, opts: 3 },
      { id: 'hw2', correct: 1, opts: 3 },
      { id: 'hw3', correct: 1, opts: 3 },
      { id: 'hw4', correct: 1, opts: 3 },
      { id: 'hw5', correct: 1, opts: 3 },
      { id: 'hw6', correct: 1, opts: 3 },
    ],
  },
  {
    id: 'markings', nameKey: 'topic.markings.name', jpKey: 'topic.markings.jp',
    icon: 'road', tint: 'info', displayTotal: 12, notesTotal: 12,
    questions: [
      { id: 'mk1', correct: 0, opts: 3 },
      { id: 'mk2', correct: 0, opts: 3 },
      { id: 'mk3', correct: 0, opts: 3 },
      { id: 'mk4', correct: 0, opts: 3 },
      { id: 'mk5', correct: 0, opts: 3 },
      { id: 'mk6', correct: 0, opts: 3 },
    ],
  },
];

export const topicById = (id) => TOPICS.find((t) => t.id === id);

// Per quiz set: 10 distinct questions. Seeded by the tapped topic, then filled
// from the other banks so a set never repeats a question.
export const SET_LENGTH = 10;

export function buildSet(topicId) {
  const seen = new Set();
  const set = [];
  const banks = [topicById(topicId), ...TOPICS.filter((tp) => tp.id !== topicId)]
    .map((tp) => tp.questions);
  for (const bank of banks) {
    for (const q of bank) {
      if (set.length >= SET_LENGTH) break;
      if (!seen.has(q.id)) { seen.add(q.id); set.push(q); }
    }
  }
  return set.slice(0, SET_LENGTH);
}
