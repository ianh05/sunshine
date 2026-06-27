// Client-side validation helpers shared by Reserve details + Contact form.
import { t } from '../i18n/index.js';

export function validateName(v) {
  return v && v.trim().length > 0;
}

// "looks complete": something@something.tld
export function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim());
}

// required + digits / dashes / spaces / parens / plus only
export function validatePhone(v) {
  const s = (v || '').trim();
  if (!s) return false;
  return /^[0-9+\-\s()]+$/.test(s);
}

// Validate the Reserve details form. Returns { errors: {field: msgKey}, count }.
export function validateReserveDetails(data) {
  const errors = {};
  if (!validateName(data.name)) errors.name = 'reserve.err.nameRequired';
  if (!validatePhone(data.phone)) {
    errors.phone = (data.phone || '').trim()
      ? 'reserve.err.phoneDigits' : 'reserve.err.phoneRequired';
  }
  if (!validateEmail(data.email)) errors.email = 'reserve.err.emailIncomplete';
  return { errors, count: Object.keys(errors).length };
}

export function bannerText(count) {
  return count === 1 ? t('reserve.err.banner', { n: count })
                     : t('reserve.err.banner.plural', { n: count });
}
