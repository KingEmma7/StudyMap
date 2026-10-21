import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MyPlacesPanel } from "@/components/map/my-places-panel";
import type { UserHome, UserPlaceRow } from "@/lib/user-places";

afterEach(cleanup);

function row(overrides: Partial<UserPlaceRow> = {}): UserPlaceRow {
  return {
    id: "p1",
    user_id: "u1",
    name: "Quiet Cafe",
    type: "other_places",
    city: "mumbai",
    lat: 19.07,
    lng: 72.87,
    address: null,
    note: null,
    created_at: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

const home: UserHome = {
  user_id: "u1",
  lat: 19.1,
  lng: 72.9,
  label: "My flat",
  updated_at: "2026-09-01T00:00:00Z",
};

function setup(props: Partial<React.ComponentProps<typeof MyPlacesPanel>> = {}) {
  const handlers = {
    onQueryChange: vi.fn(),
    onCityChange: vi.fn(),
    onAddPlace: vi.fn(),
    onEditPlace: vi.fn(),
    onSelectPlace: vi.fn(),
    onDeletePlace: vi.fn(),
    onLocateHome: vi.fn(),
    onEditHome: vi.fn(),
  };
  render(
    <MyPlacesPanel
      savedPlaces={[row(), row({ id: "p2", name: "Study Nook", city: "thane" })]}
      error={null}
      cities={["mumbai", "thane"]}
      query=""
      city={null}
      home={null}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

describe("MyPlacesPanel", () => {
  it("explains that saved places are private and lets you add one", () => {
    const { onAddPlace } = setup();
    expect(screen.getByText(/Private to you/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onAddPlace).toHaveBeenCalledTimes(1);
  });

  describe("home location", () => {
    it("offers to set one when there is none", () => {
      const { onEditHome } = setup({ home: null });
      fireEvent.click(screen.getByRole("button", { name: "Set home location" }));
      expect(onEditHome).toHaveBeenCalledTimes(1);
    });

    it("shows the saved one with shortcuts to find the nearest place and to edit it", () => {
      const { onLocateHome, onEditHome } = setup({ home });
      expect(screen.getByText("My flat")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Nearest to home" }));
      fireEvent.click(screen.getByRole("button", { name: "Edit home location" }));
      expect(onLocateHome).toHaveBeenCalledTimes(1);
      expect(onEditHome).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("button", { name: "Set home location" })).toBeNull();
    });
  });

  describe("list states", () => {
    it("shows an empty state, with no search or city filter, when nothing is saved", () => {
      setup({ savedPlaces: [] });
      expect(screen.getByText("No saved places yet.")).toBeTruthy();
      expect(screen.queryByRole("searchbox")).toBeNull();
    });

    it("shows the error in place of the list", () => {
      setup({ error: "Couldn't load your places." });
      expect(screen.getByText("Couldn't load your places.")).toBeTruthy();
      expect(screen.queryByText("Quiet Cafe")).toBeNull();
      expect(screen.queryByText("No saved places yet.")).toBeNull();
    });

    it("lists each place with its type, city, address and note", () => {
      setup({
        savedPlaces: [
          row({ address: "12 Hill Road", note: "Open late" }),
          row({ id: "p2", name: "Study Nook", type: "library", city: "thane" }),
        ],
      });
      const first = screen.getByText("Quiet Cafe").closest("button") as HTMLElement;
      expect(within(first).getByText("Other places")).toBeTruthy();
      expect(within(first).getByText("Mumbai")).toBeTruthy();
      expect(within(first).getByText("12 Hill Road")).toBeTruthy();
      expect(within(first).getByText("Open late")).toBeTruthy();
      const second = screen.getByText("Study Nook").closest("button") as HTMLElement;
      expect(within(second).getByText("Library")).toBeTruthy();
      expect(within(second).getByText("Thane")).toBeTruthy();
    });

    it("selecting a place calls onSelectPlace with it", () => {
      const { onSelectPlace } = setup();
      fireEvent.click(screen.getByText("Study Nook"));
      expect(onSelectPlace).toHaveBeenCalledWith(expect.objectContaining({ id: "p2" }));
    });
  });

  describe("search and city filter", () => {
    it("reports typing to onQueryChange", () => {
      const { onQueryChange } = setup();
      fireEvent.change(
        screen.getByRole("searchbox", { name: "Search your saved places" }),
        {
          target: { value: "nook" },
        },
      );
      expect(onQueryChange).toHaveBeenCalledWith("nook");
    });

    it("filters by name, ignoring case and padding", () => {
      setup({ query: "  NOOK " });
      expect(screen.getByText("Study Nook")).toBeTruthy();
      expect(screen.queryByText("Quiet Cafe")).toBeNull();
    });

    it("filters by city", () => {
      setup({ city: "thane" });
      expect(screen.getByText("Study Nook")).toBeTruthy();
      expect(screen.queryByText("Quiet Cafe")).toBeNull();
    });

    it("combines the name and city filters", () => {
      setup({ query: "quiet", city: "thane" });
      expect(screen.getByText("No saved places match this search.")).toBeTruthy();
    });

    it("says when the search matches nothing, and still offers the search box", () => {
      setup({ query: "zzz" });
      expect(screen.getByText("No saved places match this search.")).toBeTruthy();
      expect(screen.getByRole("searchbox")).toBeTruthy();
    });

    it("hides the city filter when there is only one city", () => {
      setup({ cities: ["mumbai"] });
      expect(screen.queryByRole("combobox")).toBeNull();
    });

    it("shows the city filter when there are several cities", () => {
      setup();
      expect(screen.getByRole("combobox")).toBeTruthy();
    });
  });

  describe("edit and delete", () => {
    it("editing a place calls onEditPlace without selecting it", () => {
      const { onEditPlace, onSelectPlace } = setup();
      fireEvent.click(screen.getByRole("button", { name: "Edit Quiet Cafe" }));
      expect(onEditPlace).toHaveBeenCalledWith(expect.objectContaining({ id: "p1" }));
      expect(onSelectPlace).not.toHaveBeenCalled();
    });

    it("asks for confirmation before deleting, and Cancel backs out", () => {
      const { onDeletePlace, onSelectPlace } = setup();
      fireEvent.click(screen.getByRole("button", { name: "Delete Quiet Cafe" }));
      expect(onDeletePlace).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onDeletePlace).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Delete Quiet Cafe" })).toBeTruthy();
      expect(onSelectPlace).not.toHaveBeenCalled();
    });

    it("confirming deletes that place only", () => {
      const { onDeletePlace } = setup();
      fireEvent.click(screen.getByRole("button", { name: "Delete Study Nook" }));
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
      expect(onDeletePlace).toHaveBeenCalledTimes(1);
      expect(onDeletePlace).toHaveBeenCalledWith("p2");
      // The other place's controls are untouched.
      expect(screen.getByRole("button", { name: "Delete Quiet Cafe" })).toBeTruthy();
    });

    it("has no delete button when deleting isn't wired up", () => {
      setup({ onDeletePlace: undefined });
      expect(screen.queryByRole("button", { name: /^Delete / })).toBeNull();
      expect(screen.getByRole("button", { name: "Edit Quiet Cafe" })).toBeTruthy();
    });
  });
});
