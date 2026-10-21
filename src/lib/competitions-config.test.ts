import { describe, expect, it, vi } from "vitest";

import { getCategories, getCompetitions } from "@/lib/competitions";
import studyMapConfig from "../../studymap.config";
import example from "../../studymap.config.example";
import type { Competition } from "@/lib/types";

const custom = vi.hoisted(() => ({ competitions: [] as unknown[] }));

vi.mock("../../studymap.config", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../studymap.config")>();
  return {
    default: {
      ...original.default,
      get competitions() {
        return custom.competitions.length
          ? custom.competitions
          : original.default.competitions;
      },
    },
  };
});

function competition(id: string, category: Competition["category"]): Competition {
  return {
    id,
    name: id,
    organizer: "Test Org",
    organizer_url: "https://example.com",
    category,
    subjects: [],
    description: "A test competition.",
    format: "online",
    age_min: 13,
    age_max: 18,
    participation: "individual",
    region: "international",
    fee: { amount: 0, currency: "USD" },
    prize: "A prize",
    official_url: "https://example.com",
    cycle_year: 2026,
    dates: [],
    added_by: "test",
  };
}

describe("competitions come from studymap.config.ts", () => {
  it("getCompetitions() returns the config's competitions, as getPlaces() returns its places", () => {
    expect(getCompetitions()).toBe(studyMapConfig.competitions);
    expect(getCompetitions().length).toBeGreaterThan(0);
  });

  it("a fork that sets its own competitions gets exactly those", () => {
    custom.competitions = [competition("only-one", "coding")];
    try {
      expect(getCompetitions().map((item) => item.id)).toEqual(["only-one"]);
      expect(getCategories()).toEqual(["coding"]);
    } finally {
      custom.competitions = [];
    }
  });

  it("the example config has an empty competitions list, so it type-checks as a StudyMapConfig", () => {
    expect(example.competitions).toEqual([]);
  });
});
