import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { VerifiedBadge } from "@/components/pins/verified-badge";
import type { Place } from "@/lib/types";

afterEach(cleanup);

const base: Place = {
  id: "mum-library-07",
  name: "City Library",
  type: "library",
  city: "mumbai",
  lat: 19.0176,
  lng: 72.8562,
  gmaps_link: "https://maps.google.com/?q=19.0176,72.8562",
  added_by: "someone",
};

const now = new Date("2026-10-21T12:00:00Z");

describe("VerifiedBadge", () => {
  it("shows the badge for a recent verification", () => {
    render(
      <VerifiedBadge
        place={{ ...base, verified: { by: "verifier", on: "2026-08-01" } }}
        now={now}
      />,
    );
    expect(screen.getByText("Verified")).toBeTruthy();
    expect(screen.getByText("Aug 2026")).toBeTruthy();
  });

  it("shows nothing once a library's verification is older than 12 months", () => {
    const { container } = render(
      <VerifiedBadge
        place={{ ...base, verified: { by: "verifier", on: "2025-10-01" } }}
        now={now}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows nothing once an exam centre's verification is older than 6 months", () => {
    const place: Place = {
      ...base,
      type: "sat_centre",
      verified: { by: "verifier", on: "2026-03-01" },
    };
    const { container } = render(<VerifiedBadge place={place} now={now} />);
    expect(container.firstChild).toBeNull();
    cleanup();
    render(
      <VerifiedBadge
        place={{ ...place, verified: { by: "verifier", on: "2026-06-01" } }}
        now={now}
      />,
    );
    expect(screen.getByText("Verified")).toBeTruthy();
  });

  it("shows nothing for an unverified place", () => {
    const { container } = render(<VerifiedBadge place={base} now={now} />);
    expect(container.firstChild).toBeNull();
  });
});
