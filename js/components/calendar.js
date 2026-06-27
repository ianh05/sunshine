// Build and download a minimal .ics for the confirmed booking.
// The mock uses June 2026 dates (Tue 17 … Sat 21). We map the chosen day.

function pad(n) { return String(n).padStart(2, '0'); }

// Compose a local-time .ics DTSTART/DTEND from { day, time } (June 2026).
function icsDate(day, hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return `202606${pad(day)}T${pad(h)}${pad(m)}00`;
}

function addMinutes(hhmm, mins) {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

export function downloadIcs(draft, summaryTitle) {
  const day = draft.date ? draft.date.day : 18;
  const start = draft.time || '11:00';
  const end = addMinutes(start, draft.lesson ? draft.lesson.duration : 50);
  const uid = (draft.code || 'TQ-XXXX') + '@newsunshine.jp';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//New Sunshine//Booking//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${icsDate(day, start)}`,
    `DTSTART:${icsDate(day, start)}`,
    `DTEND:${icsDate(day, end)}`,
    `SUMMARY:${escapeText('New Sunshine — ' + summaryTitle)}`,
    `DESCRIPTION:${escapeText('Booking reference ' + (draft.code || ''))}`,
    'LOCATION:1-7-5 Sakuragicho\\, Omiya-ku\\, Saitama',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `newsunshine-${(draft.code || 'booking').toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeText(s) {
  return String(s).replace(/[\\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
}
