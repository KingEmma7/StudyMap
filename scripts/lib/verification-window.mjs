// How long a `verified` block stays valid, shared by the verified badge
// (src/lib/verification.ts) and scripts/check-data-freshness.mjs so the two
// can never disagree. The windows are documented in data/CONTRIBUTING.md and
// data/competitions/CONTRIBUTING.md.

/** Exam centres change their dates and addresses often, so they expire sooner. */
const SHORT_WINDOW_PLACE_TYPES = new Set(["sat_centre", "foreign_lang_exam_centre"]);

export const DEFAULT_WINDOW_MONTHS = 12;
export const SHORT_WINDOW_MONTHS = 6;

/**
 * Months a verification stays valid: 6 for exam centres and for competitions,
 * 12 for every other place.
 *
 * @param {{ type?: string, competition?: boolean }} record
 * @returns {number}
 */
export function verificationWindowMonths({ type, competition = false }) {
  if (competition) return SHORT_WINDOW_MONTHS;
  return type !== undefined && SHORT_WINDOW_PLACE_TYPES.has(type)
    ? SHORT_WINDOW_MONTHS
    : DEFAULT_WINDOW_MONTHS;
}

/**
 * The last day a verification made on `onIso` (YYYY-MM-DD) is still valid:
 * the same day `months` later, or the end of that month when it is shorter
 * (31 August plus six months is 28 or 29 February). Returns null for a date
 * that is not a real ISO date.
 *
 * @param {string} onIso
 * @param {number} months
 * @returns {string | null}
 */
export function verificationExpiry(onIso, months) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(onIso);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

/**
 * Whether a verification made on `onIso` has passed its window as of `todayIso`.
 * A date that cannot be read is treated as expired, so a typo never keeps a
 * stale badge alive.
 *
 * @param {string} onIso
 * @param {number} months
 * @param {string} todayIso
 * @returns {boolean}
 */
export function isVerificationExpired(onIso, months, todayIso) {
  const expiry = verificationExpiry(onIso, months);
  if (expiry === null) return true;
  // ISO dates sort in chronological order.
  return todayIso > expiry;
}
