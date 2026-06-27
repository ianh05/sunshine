// Hiring roles. langKeys → i18n language names rendered as chips/tags.
export const JOBS = [
  {
    id: 'instructor',
    titleKey: 'job.instructor.title',
    type: 'fulltime',          // -> job.type.fulltime, green badge
    langKeys: ['lang.name.english', 'lang.name.vietnamese'],
    salaryKey: 'job.instructor.salary',
    salaryShortKey: 'job.instructor.salaryShort',
    doKey: 'job.instructor.do',
    needKey: 'job.instructor.need',
  },
  {
    id: 'reception',
    titleKey: 'job.reception.title',
    type: 'parttime',          // -> job.type.parttime, info badge
    langKeys: ['lang.name.mandarin', 'lang.name.japanese'],
    salaryKey: 'job.reception.salary',
    salaryShortKey: 'job.reception.salaryShort',
    doKey: 'job.reception.do',
    needKey: 'job.reception.need',
  },
];

export const jobById = (id) => JOBS.find((j) => j.id === id);

// Instructor team shown on the About page (striped avatar placeholders).
export const INSTRUCTORS = [
  { name: 'Kenji', langs: 'JP · EN' },
  { name: 'Linh', langs: 'VI · EN' },
  { name: 'Wei', langs: 'ZH · JP' },
];
