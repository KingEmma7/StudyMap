import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ErrorPage from "@/app/error";
import NotFound from "@/app/not-found";

afterEach(cleanup);

describe("not-found page", () => {
  it("is a themed 404 with a way back", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Back to the map" }).getAttribute("href"),
    ).toBe("/map");
    expect(
      screen.getByRole("link", { name: "Browse competitions" }).getAttribute("href"),
    ).toBe("/competitions");
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
  });
});

describe("error page", () => {
  it("announces the problem and retries on request", () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error("boom")} reset={reset} />);
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeTruthy();
    // The message of the error is not shown to visitors.
    expect(screen.queryByText("boom")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("shows the digest as a reference when there is one", () => {
    const error = Object.assign(new Error("boom"), { digest: "abc123" });
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(screen.getByText("Error reference: abc123")).toBeTruthy();
  });
});
