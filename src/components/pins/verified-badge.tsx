import { BadgeCheck } from "lucide-react";

import { hasCurrentVerification } from "@/lib/verification";
import type { Place } from "@/lib/types";

/** Human-readable form of the verification date, e.g. "Jun 2026". */
export function formatVerifiedOn(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

/**
 * Subtle badge for places a contributor re-checked. Absent for unverified places and
 * once the verification is older than its window (12 months, or 6 for exam centres), so
 * an old check never reads as current. `now` is for tests.
 */
export function VerifiedBadge({ place, now }: { place: Place; now?: Date }) {
  if (!place.verified || !hasCurrentVerification(place, now)) return null;
  return (
    <span
      title={`Verified by ${place.verified.by} · ${place.verified.on}`}
      className="inline-flex items-center gap-1 rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success"
    >
      <BadgeCheck className="size-3" aria-hidden />
      Verified
      {place.verified.on && (
        <span className="font-normal text-success/70">
          {formatVerifiedOn(place.verified.on)}
        </span>
      )}
    </span>
  );
}
