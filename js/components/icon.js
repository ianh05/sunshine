// Material Symbols Outlined helper. Returns an HTML string.
export function icon(name, opts = {}) {
  const { size, fill, cls = '', color } = opts;
  const styles = [];
  if (size) styles.push(`font-size:${size}px`);
  if (fill) styles.push("font-variation-settings:'FILL' 1");
  if (color) styles.push(`color:${color}`);
  const style = styles.length ? ` style="${styles.join(';')}"` : '';
  return `<span class="msi ${cls}" aria-hidden="true"${style}>${name}</span>`;
}
