// Booking code generator: TQ- + 4 base32-ish chars (no ambiguous 0/1/O/I).
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateBookingCode() {
  let out = '';
  const arr = new Uint32Array(4);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(arr);
    for (let i = 0; i < 4; i++) out += ALPHABET[arr[i] % ALPHABET.length];
  } else {
    for (let i = 0; i < 4; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return 'TQ-' + out;
}
