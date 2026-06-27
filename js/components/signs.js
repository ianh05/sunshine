// Per-question illustrations — inline SVG of the actual Japanese road sign or
// road marking each question is about. No external assets; valid, scalable SVG.
// Keyed by question id; signFor() falls back to a generic warning diamond.

const NS = 'xmlns="http://www.w3.org/2000/svg"';
const wrap = (inner, label) =>
  `<svg viewBox="0 0 120 120" width="132" height="132" role="img" aria-label="${label}" ${NS}>${inner}</svg>`;

// reusable bits ------------------------------------------------------------
const car = (x, y, s = 1, fill = '#1a1a1a') =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}">
     <rect x="0" y="10" width="52" height="16" rx="5"/>
     <path d="M8 10 L16 1 L40 1 L48 10 Z"/>
     <circle cx="13" cy="27" r="5.5"/><circle cx="39" cy="27" r="5.5"/>
   </g>`;
const ped = (x, y, c = '#1a1a1a') =>
  `<g transform="translate(${x} ${y})" fill="${c}">
     <circle cx="0" cy="0" r="6"/>
     <path d="M-6 26 L-3 9 Q0 6 3 9 L6 26 L1 26 L0 16 L-1 26 Z"/>
   </g>`;
const road = (extra = '') =>
  `<rect x="32" y="4" width="56" height="112" rx="5" fill="#363b42"/>
   <rect x="32" y="4" width="3" height="112" fill="#4b525b"/>
   <rect x="85" y="4" width="3" height="112" fill="#4b525b"/>${extra}`;

// per-question SVG ---------------------------------------------------------
const SIGNS = {
  // ---------- traffic signs ----------
  // Japanese stop sign: inverted red triangle, white border, 止まれ
  signs1: () => wrap(
    `<polygon points="60,110 9,22 111,22" fill="#E8352B" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>
     <text x="60" y="62" text-anchor="middle" font-size="21" font-weight="700" fill="#fff" font-family="'Noto Sans JP',sans-serif">止まれ</text>`,
    'Stop sign'),

  // no entry: red disc, white bar
  signs2: () => wrap(
    `<circle cx="60" cy="60" r="48" fill="#E8352B" stroke="#fff" stroke-width="5"/>
     <rect x="28" y="52" width="64" height="16" rx="2" fill="#fff"/>`,
    'No entry'),

  // mandatory direction: blue disc, white up arrow
  signs3: () => wrap(
    `<circle cx="60" cy="60" r="50" fill="#1565C0"/>
     <path d="M60 32 L60 88" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
     <path d="M44 50 L60 32 L76 50" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
    'Mandatory direction'),

  // warning: yellow diamond, two pedestrians (school zone)
  signs4: () => wrap(
    `<rect x="20" y="20" width="80" height="80" rx="7" transform="rotate(45 60 60)" fill="#F4C400" stroke="#1a1a1a" stroke-width="5"/>
     ${ped(50, 50)}${ped(68, 52)}`,
    'School zone warning'),

  // speed limit 30
  signs5: () => wrap(
    `<circle cx="60" cy="60" r="50" fill="#fff" stroke="#E8352B" stroke-width="10"/>
     <text x="60" y="78" text-anchor="middle" font-size="46" font-weight="800" fill="#1a1a1a" font-family="Arial,sans-serif">30</text>`,
    'Speed limit 30'),

  // vehicles prohibited: red ring, car, slash
  signs6: () => wrap(
    `<circle cx="60" cy="60" r="50" fill="#fff" stroke="#E8352B" stroke-width="9"/>
     ${car(34, 48, 1)}
     <line x1="26" y1="94" x2="94" y2="26" stroke="#E8352B" stroke-width="9" stroke-linecap="round"/>`,
    'Vehicles prohibited'),

  // ---------- right of way ----------
  // left priority: crossroads, yellow car from left with arrow
  row1: () => wrap(
    `<rect x="0" y="48" width="120" height="24" fill="#363b42"/>
     <rect x="48" y="0" width="24" height="120" fill="#363b42"/>
     ${car(8, 47, 0.62, '#FFC400')}
     <path d="M70 60 L96 60 M88 53 L96 60 L88 67" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
    'Vehicle on left has priority'),

  // turning yields: straight arrow (priority) + turning arrow
  row2: () => wrap(
    `<rect x="0" y="48" width="120" height="24" fill="#363b42"/>
     <rect x="48" y="48" width="24" height="72" fill="#363b42"/>
     <path d="M60 116 L60 64 M52 74 L60 64 L68 74" fill="none" stroke="#36D17C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M104 60 L70 60 L70 40 M78 52 L70 60 L78 68" fill="none" stroke="#FFC400" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>`,
    'Turning vehicle yields'),

  // emergency vehicle with beacon
  row3: () => wrap(
    `<rect x="0" y="70" width="120" height="22" fill="#363b42"/>
     ${car(34, 56, 1)}
     <rect x="54" y="50" width="12" height="8" rx="2" fill="#E8352B"/>
     <path d="M60 50 L60 40 M50 44 L48 40 M70 44 L72 40" stroke="#FF5A4D" stroke-width="3" stroke-linecap="round"/>`,
    'Emergency vehicle'),

  // crosswalk: zebra + pedestrian
  row4: () => wrap(
    `<rect x="0" y="40" width="120" height="48" fill="#363b42"/>
     ${[44, 56, 68].map((x) => `<rect x="6" y="${x}" width="76" height="7" fill="#e9e9e4"/>`).join('')}
     ${ped(98, 52)}`,
    'Crosswalk — pedestrians have priority'),

  // priority road sign: yellow diamond + inner diamond
  row5: () => wrap(
    `<rect x="20" y="20" width="80" height="80" rx="6" transform="rotate(45 60 60)" fill="#F4C400" stroke="#1a1a1a" stroke-width="4"/>
     <rect x="40" y="40" width="40" height="40" transform="rotate(45 60 60)" fill="none" stroke="#1a1a1a" stroke-width="3"/>`,
    'Priority road'),

  // narrow road: two cars facing, obstacle
  row6: () => wrap(
    `<rect x="22" y="44" width="76" height="32" rx="3" fill="#363b42"/>
     ${car(26, 46, 0.6, '#FFC400')}
     <g transform="scale(-1,1) translate(-94 0)">${car(0, 46, 0.6, '#a6adb6')}</g>
     <rect x="44" y="40" width="14" height="10" rx="2" fill="#FF5A4D"/>`,
    'Narrow road yielding'),

  // ---------- highway ----------
  // minimum speed 50 (blue, underlined)
  hw1: () => wrap(
    `<circle cx="60" cy="60" r="50" fill="#1565C0"/>
     <text x="60" y="70" text-anchor="middle" font-size="42" font-weight="800" fill="#fff" font-family="Arial,sans-serif">50</text>
     <line x1="40" y1="80" x2="80" y2="80" stroke="#fff" stroke-width="5"/>`,
    'Minimum speed 50'),

  // lane discipline: two lanes, left highlighted
  hw2: () => wrap(
    `<rect x="24" y="6" width="72" height="108" rx="5" fill="#363b42"/>
     <rect x="24" y="6" width="36" height="108" fill="#FFC400" opacity="0.16"/>
     ${[18, 42, 66, 90].map((y) => `<rect x="58" y="${y}" width="4" height="14" fill="#e9e9e4"/>`).join('')}
     <path d="M42 96 L42 30 M35 42 L42 30 L49 42" fill="none" stroke="#36D17C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
    'Keep to the left lane'),

  // merging: main road + ramp arrow
  hw3: () => wrap(
    `<rect x="60" y="6" width="34" height="108" fill="#363b42"/>
     <path d="M18 110 Q40 80 62 64" fill="none" stroke="#363b42" stroke-width="22" stroke-linecap="round"/>
     <path d="M30 96 Q48 78 70 70 M62 64 L70 70 L62 78" fill="none" stroke="#FFC400" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
    'Merge smoothly'),

  // breakdown: hazard warning triangle
  hw4: () => wrap(
    `<polygon points="60,16 104,98 16,98" fill="none" stroke="#E8352B" stroke-width="9" stroke-linejoin="round"/>
     <polygon points="60,40 86,86 34,86" fill="#E8352B" opacity="0.25"/>`,
    'Place a warning triangle'),

  // following distance: two cars side view + gap
  hw5: () => wrap(
    `<rect x="0" y="74" width="120" height="14" fill="#363b42"/>
     ${car(4, 52, 0.85)}${car(70, 52, 0.85)}
     <path d="M52 60 L66 60 M58 56 L52 60 L58 64 M60 56 L66 60 L60 64" fill="none" stroke="#FFC400" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    'Keep a safe following distance'),

  // no stopping (blue, red ring, red X)
  hw6: () => wrap(
    `<circle cx="60" cy="60" r="48" fill="#1565C0" stroke="#E8352B" stroke-width="9"/>
     <line x1="30" y1="30" x2="90" y2="90" stroke="#E8352B" stroke-width="9" stroke-linecap="round"/>
     <line x1="90" y1="30" x2="30" y2="90" stroke="#E8352B" stroke-width="9" stroke-linecap="round"/>`,
    'No stopping'),

  // ---------- road markings ----------
  // solid yellow centre line
  mk1: () => wrap(road(`<rect x="58" y="4" width="4" height="112" fill="#F4C400"/>`), 'Yellow centre line'),

  // white dashed lane line
  mk2: () => wrap(road(
    `${[10, 34, 58, 82].map((y) => `<rect x="58" y="${y}" width="4" height="14" fill="#e9e9e4"/>`).join('')}`),
    'Dashed lane line'),

  // painted diamond (crossing ahead)
  mk3: () => wrap(road(
    `<rect x="48" y="46" width="24" height="24" transform="rotate(45 60 58)" fill="none" stroke="#e9e9e4" stroke-width="4"/>`),
    'Diamond marking'),

  // stop line (thick transverse bar)
  mk4: () => wrap(road(`<rect x="36" y="78" width="48" height="10" fill="#e9e9e4"/>`), 'Stop line'),

  // keep crossing clear: zebra
  mk5: () => wrap(road(
    `${[34, 46, 58, 70].map((y) => `<rect x="36" y="${y}" width="48" height="7" fill="#e9e9e4"/>`).join('')}`),
    'Keep the crossing clear'),

  // lane arrow (left turn)
  mk6: () => wrap(road(
    `<path d="M60 96 L60 52 L42 52 M52 44 L42 52 L52 60" fill="none" stroke="#e9e9e4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`),
    'Lane direction arrow'),
};

// generic fallback (the stylised warning diamond from the mock)
const fallback = () => wrap(
  `<rect x="22" y="22" width="76" height="76" rx="8" transform="rotate(45 60 60)" fill="#FFC400" stroke="#1a1a1a" stroke-width="6"/>
   <text x="60" y="74" text-anchor="middle" font-size="46" font-weight="800" fill="#1a1a1a" font-family="'Archivo',sans-serif">!</text>`,
  'Road sign');

export function signFor(id) {
  return (SIGNS[id] || fallback)();
}
