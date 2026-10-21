import { describe, expect, it } from "vitest";

import {
  hasCurrentVerification,
  verifiedUntil,
  windowMonthsFor,
} from "@/lib/verification";
import {
  isVerificationExpired,
  verificationExpiry,
  verificationWindowMonths,
} from "../../scripts/lib/verification-window.mjs";
import type { Competition, Place } from "@/lib/types";

function place(overrides: Partial<Place> = {}): Place {
  return {
    id: "mum-library-01",
    name: "City Library",
    type: "library",
    city: "mumbai",
    lat: 19.0176,
    lng: 72.8562,
    gmaps_link: "https://maps.google.com/?q=19.0176,72.8562",
    added_by: "test",
    ...overrides,
  };
}

function competition(overrides: Partial<Competition> = {}): Competition {
  return {
    id: "regeneron-isef",
    name: "Regeneron ISEF",
    organizer: "Society for Science",
    organizer_url: "https://www.societyforscience.org",
    category: "stem",
    subjects: [],
    description: "A science fair.",
    format: "in_person",
    age_min: 14,
    age_max: 18,
    participation: "individual",
    region: "international",
    fee: { amount: 0, currency: "USD" },
    prize: "Awards",
    official_url: "https://www.societyforscience.org/isef/",
    cycle_year: 2027,
    dates: [],
    added_by: "test",
    ...overrides,
  };
}

describe("verification window", () => {
  it("is 6 months for exam centres and competitions and 12 for everything else", () => {
    expect(verificationWindowMonths({ type: "sat_centre" })).toBe(6);
    expect(verificationWindowMonths({ type: "foreign_lang_exam_centre" })).toBe(6);
    expect(verificationWindowMonths({ competition: true })).toBe(6);
    for (const type of ["library", "other_places", "airport", "gov_offices"]) {
      expect(verificationWindowMonths({ type })).toBe(12);
    }
    expect(windowMonthsFor(place({ type: "sat_centre" }))).toBe(6);
    expect(windowMonthsFor(place({ type: "library" }))).toBe(12);
    expect(windowMonthsFor(competition())).toBe(6);
  });
});

describe("verificationExpiry", () => {
  it("is the same day the window later", () => {
    expect(verificationExpiry("2026-01-15", 12)).toBe("2027-01-15");
    expect(verificationExpiry("2026-01-15", 6)).toBe("2026-07-15");
    expect(verificationExpiry("2026-08-22", 6)).toBe("2027-02-22");
  });

  it("clamps to the end of a shorter month", () => {
    expect(verificationExpiry("2026-08-31", 6)).toBe("2027-02-28");
    expect(verificationExpiry("2023-08-31", 6)).toBe("2024-02-29");
    expect(verificationExpiry("2024-02-29", 12)).toBe("2025-02-28");
  });

  it("returns null for something that is not a real date", () => {
    expect(verificationExpiry("2026-02-30", 6)).toBeNull();
    expect(verificationExpiry("last week", 6)).toBeNull();
    expect(verificationExpiry("", 6)).toBeNull();
  });
});

describe("isVerificationExpired", () => {
  it("is still valid on the expiry day and expired the day after", () => {
    expect(isVerificationExpired("2026-01-15", 12, "2027-01-15")).toBe(false);
    expect(isVerificationExpired("2026-01-15", 12, "2027-01-16")).toBe(true);
    expect(isVerificationExpired("2026-01-15", 6, "2026-07-15")).toBe(false);
    expect(isVerificationExpired("2026-01-15", 6, "2026-07-16")).toBe(true);
  });

  it("treats an unreadable date as expired", () => {
    expect(isVerificationExpired("not-a-date", 12, "2026-01-01")).toBe(true);
  });
});

describe("hasCurrentVerification", () => {
  const verified = (on: string) => ({ by: "someone", on });
  const now = new Date("2026-10-21T12:00:00Z");

  it("is false for a record with no verified block", () => {
    expect(hasCurrentVerification(place(), now)).toBe(false);
    expect(hasCurrentVerification(competition(), now)).toBe(false);
  });

  it("keeps a library verified for 12 months", () => {
    expect(hasCurrentVerification(place({ verified: verified("2025-10-21") }), now)).toBe(
      true,
    );
    expect(hasCurrentVerification(place({ verified: verified("2025-10-20") }), now)).toBe(
      false,
    );
  });

  it("expires an exam centre after 6 months, not 12", () => {
    const centre = (on: string) => place({ type: "sat_centre", verified: verified(on) });
    expect(hasCurrentVerification(centre("2026-04-21"), now)).toBe(true);
    expect(hasCurrentVerification(centre("2026-04-20"), now)).toBe(false);
    // The same date is still fine for a library.
    expect(hasCurrentVerification(place({ verified: verified("2026-04-20") }), now)).toBe(
      true,
    );
  });

  it("expires a competition after 6 months", () => {
    expect(
      hasCurrentVerification(competition({ verified: verified("2026-04-21") }), now),
    ).toBe(true);
    expect(
      hasCurrentVerification(competition({ verified: verified("2026-04-20") }), now),
    ).toBe(false);
  });

  it("reports when the verification runs out", () => {
    expect(verifiedUntil(place({ verified: verified("2026-01-15") }))).toBe("2027-01-15");
    expect(
      verifiedUntil(place({ type: "sat_centre", verified: verified("2026-01-15") })),
    ).toBe("2026-07-15");
    expect(verifiedUntil(place())).toBeNull();
  });
});
