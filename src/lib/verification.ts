import {
  isVerificationExpired,
  verificationExpiry,
  verificationWindowMonths,
} from "../../scripts/lib/verification-window.mjs";
import type { Competition, Place } from "@/lib/types";

/** Today's date as YYYY-MM-DD in UTC, the same form the data's `verified.on` uses. */
function isoDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** Months a place's or competition's `verified` block stays valid (6 for exam centres and competitions, 12 otherwise). */
export function windowMonthsFor(record: Place | Competition): number {
  return "type" in record
    ? verificationWindowMonths({ type: record.type })
    : verificationWindowMonths({ competition: true });
}

/** The last day the record's verification is still valid, or null when it has none or the date is invalid. */
export function verifiedUntil(record: Place | Competition): string | null {
  return record.verified
    ? verificationExpiry(record.verified.on, windowMonthsFor(record))
    : null;
}

/**
 * Whether the record has a verification that is still inside its window.
 * An old verification no longer counts, so the badge disappears until the
 * place is checked again (see data/CONTRIBUTING.md).
 */
export function hasCurrentVerification(
  record: Place | Competition,
  now: Date = new Date(),
): boolean {
  if (!record.verified) return false;
  return !isVerificationExpired(record.verified.on, windowMonthsFor(record), isoDay(now));
}
