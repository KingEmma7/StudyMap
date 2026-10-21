import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SiteSearchDialog } from "@/components/layout/site-search";
import type { Competition, Place } from "@/lib/types";

const { push, places, competitions, docs } = vi.hoisted(() => {
  const place = (n: number, extra: Record<string, unknown> = {}) => ({
    id: `mum-library-0${n}`,
    name: `Reading Room ${n}`,
    type: "library",
    city: "mumbai",
    lat: 19.0,
    lng: 72.8,
    gmaps_link: "https://maps.google.com/?q=19,72.8",
    added_by: "test",
    ...extra,
  });
  return {
    push: vi.fn(),
    // Seven matches for "reading", so the five-result cap and "See all" kick in.
    places: [
      ...Array.from({ length: 7 }, (_, i) => place(i + 1)),
      place(8, {
        id: "pune-airport-01",
        name: "Pune Airport",
        type: "airport",
        city: "pune",
      }),
    ],
    competitions: [
      {
        id: "reading-olympiad",
        name: "Reading Olympiad",
        organizer: "Literacy Foundation",
        category: "humanities",
        subjects: ["literature"],
      },
      {
        id: "math-cup",
        name: "Math Cup",
        organizer: "Maths Society",
        category: "mathematics",
        subjects: ["algebra"],
      },
    ],
    docs: [
      {
        href: "/docs/faq",
        title: "FAQ",
        description: "Answers to common questions about reading the map.",
      },
    ],
  };
});

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/places", () => ({ getPlaces: () => places as unknown as Place[] }));
vi.mock("@/lib/competitions", () => ({
  getCompetitions: () => competitions as unknown as Competition[],
}));
vi.mock("@/lib/docs-nav", () => ({ docsPages: docs }));

beforeEach(() => push.mockReset());
afterEach(cleanup);

function open(onOpenChange = vi.fn()) {
  render(<SiteSearchDialog open onOpenChange={onOpenChange} />);
  return {
    onOpenChange,
    input: screen.getByRole("searchbox", { name: "Search StudyMap" }),
  };
}

const type = (input: HTMLElement, value: string) =>
  fireEvent.change(input, { target: { value } });

describe("SiteSearchDialog", () => {
  it("renders nothing when closed", () => {
    render(<SiteSearchDialog open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("focuses the search box and shows a hint before anything is typed", () => {
    const { input } = open();
    expect(document.activeElement).toBe(input);
    expect(screen.getByText("Search places, competitions, and docs.")).toBeTruthy();
  });

  it("groups matches under Places, Competitions and Docs", () => {
    const { input } = open();
    type(input, "reading");
    for (const heading of ["Places", "Competitions", "Docs"]) {
      expect(screen.getByText(heading)).toBeTruthy();
    }
    expect(screen.getByText("Reading Olympiad")).toBeTruthy();
    expect(screen.getByText("Literacy Foundation")).toBeTruthy();
    expect(screen.getByText("FAQ")).toBeTruthy();
    // A place shows its city and type under its name.
    expect(screen.getAllByText("Mumbai · Library").length).toBeGreaterThan(0);
  });

  it("leaves out a group that has no matches", () => {
    const { input } = open();
    type(input, "algebra");
    expect(screen.getByText("Competitions")).toBeTruthy();
    expect(screen.queryByText("Places")).toBeNull();
    expect(screen.queryByText("Docs")).toBeNull();
  });

  it("says when nothing matches, quoting the query without its padding", () => {
    const { input } = open();
    type(input, "  zzzzz  ");
    expect(screen.getByText(/No results for/).textContent).toBe("No results for “zzzzz”");
  });

  it("caps a group at five results and offers a See all link for places and competitions", () => {
    const { input } = open();
    type(input, "reading");
    const links = screen.getAllByRole("link");
    // 5 places + 1 competition + 1 doc, plus the See all link for places.
    expect(
      links.filter((link) => link.getAttribute("href")?.startsWith("/map?place=")),
    ).toHaveLength(5);
    const seeAll = screen.getByRole("link", { name: "See all 7 results" });
    expect(seeAll.getAttribute("href")).toBe("/map?q=reading");
  });

  it("encodes the query in the See all link", () => {
    const { input } = open();
    type(input, "reading room");
    expect(
      screen.getByRole("link", { name: "See all 7 results" }).getAttribute("href"),
    ).toBe("/map?q=reading%20room");
  });

  it("opens the matching place, competition and doc pages", () => {
    const { input } = open();
    type(input, "reading");
    expect(screen.getByText("Reading Olympiad").closest("a")?.getAttribute("href")).toBe(
      "/competitions/reading-olympiad",
    );
    expect(screen.getByText("FAQ").closest("a")?.getAttribute("href")).toBe("/docs/faq");
    expect(screen.getByText("Reading Room 1").closest("a")?.getAttribute("href")).toBe(
      "/map?place=mum-library-01",
    );
  });

  it("closes when a result is clicked", () => {
    const { input, onOpenChange } = open();
    type(input, "reading");
    fireEvent.click(screen.getByText("Reading Olympiad"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  describe("keyboard", () => {
    const activeRow = () =>
      screen
        .getAllByRole("link")
        .filter((link) => link.classList.contains("bg-muted"))
        .map((link) => within(link).getAllByText(/./)[0]?.textContent);

    it("starts on the first result and moves with the arrow keys, wrapping at both ends", () => {
      const { input } = open();
      type(input, "reading");
      expect(activeRow()).toEqual(["Reading Room 1"]);
      fireEvent.keyDown(input, { key: "ArrowDown" });
      expect(activeRow()).toEqual(["Reading Room 2"]);
      fireEvent.keyDown(input, { key: "ArrowUp" });
      fireEvent.keyDown(input, { key: "ArrowUp" });
      // Up from the first row wraps to the last: the doc.
      expect(activeRow()).toEqual(["FAQ"]);
      fireEvent.keyDown(input, { key: "ArrowDown" });
      expect(activeRow()).toEqual(["Reading Room 1"]);
    });

    it("Enter opens the active result and closes the dialog", () => {
      const { input, onOpenChange } = open();
      type(input, "reading");
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(push).toHaveBeenCalledWith("/map?place=mum-library-02");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("Enter does nothing with no results, and the arrow keys don't throw", () => {
      const { input, onOpenChange } = open();
      type(input, "zzzzz");
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(push).not.toHaveBeenCalled();
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it("changing the query puts the highlight back on the first result", () => {
      const { input } = open();
      type(input, "reading");
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      type(input, "reading r");
      expect(activeRow()).toEqual(["Reading Room 1"]);
    });

    it("hovering a row makes it the active one", () => {
      const { input } = open();
      type(input, "reading");
      fireEvent.mouseEnter(
        screen.getByText("Reading Room 3").closest("a") as HTMLElement,
      );
      expect(activeRow()).toEqual(["Reading Room 3"]);
    });
  });

  it("starts empty each time it is reopened", () => {
    const { rerender } = render(<SiteSearchDialog open onOpenChange={vi.fn()} />);
    type(screen.getByRole("searchbox"), "reading");
    expect(screen.getByText("Reading Olympiad")).toBeTruthy();
    rerender(<SiteSearchDialog open={false} onOpenChange={vi.fn()} />);
    rerender(<SiteSearchDialog open onOpenChange={vi.fn()} />);
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
    expect(screen.queryByText("Reading Olympiad")).toBeNull();
  });
});
