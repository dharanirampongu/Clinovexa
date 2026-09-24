// Shared mobile-number helpers for registration.
// Normalization ensures equivalent formats (spaces, dashes, parentheses,
// leading `00` vs `+`) map to one canonical value so duplicates are caught.

const normalizePhone = (input) => {
  if (input === undefined || input === null) return '';
  let value = String(input).trim();
  if (!value) return '';
  if (value.startsWith('00')) {
    value = value.slice(2);
  }
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return `+${digits}`;
};

const getPhoneDigits = (normalized) => String(normalized || '').replace(/\D/g, '');

// E.164 allows up to 15 digits; require at least 7 so short/incomplete
// numbers (and the seeded `+1-555-0100` style values) validate sensibly.
const isValidPhone = (input) => {
  const normalized = normalizePhone(input);
  const digits = getPhoneDigits(normalized);
  return digits.length >= 7 && digits.length <= 15;
};

module.exports = { normalizePhone, getPhoneDigits, isValidPhone };
