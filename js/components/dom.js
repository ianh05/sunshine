// Tiny DOM helpers. Screen modules build trusted HTML strings (our own copy +
// i18n) and bind events after mount. User-entered values must be escaped before
// interpolation (see escAttr/escText in screens/reserve.js).

// Parse an HTML string into a single root element.
export function node(htmlString) {
  const tpl = document.createElement('template');
  tpl.innerHTML = htmlString.trim();
  return tpl.content.firstElementChild;
}
