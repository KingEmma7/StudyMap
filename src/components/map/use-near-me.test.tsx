import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NearMeButton } from "@/components/map/near-me-button";
import { NearMeFab } from "@/components/map/near-me-fab";
import {
  GEOLOCATION_UNAVAILABLE_MESSAGE,
  geolocationErrorMessage,
  useNearMe,
} from "@/components/map/use-near-me";

const { toastError } = vi.hoisted(() => ({ toastError: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: toastError } }));

type Success = (position: GeolocationPosition) => void;
type Failure = (error: GeolocationPositionError) => void;

/** A stand-in for navigator.geolocation that lets each test answer the request. */
function mockGeolocation() {
  const calls: { success: Success; failure: Failure; options?: PositionOptions }[] = [];
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (
        success: Success,
        failure: Failure,
        options?: PositionOptions,
      ) => calls.push({ success, failure, options }),
    },
  });
  return calls;
}

const position = (lat: number, lng: number) =>
  ({ coords: { latitude: lat, longitude: lng } }) as GeolocationPosition;

const positionError = (code: number) =>
  ({
    code,
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  }) as GeolocationPositionError;

beforeEach(() => toastError.mockReset());

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(navigator, "geolocation");
});

describe("geolocationErrorMessage", () => {
  it("tells people to allow access when permission is denied", () => {
    expect(geolocationErrorMessage(positionError(1))).toBe(
      "Allow location access in your browser settings.",
    );
  });

  it("says when the request timed out", () => {
    expect(geolocationErrorMessage(positionError(3))).toBe(
      "Location request timed out. Try again.",
    );
  });

  it("falls back to a general message for anything else", () => {
    expect(geolocationErrorMessage(positionError(2))).toBe(
      "Your location could not be determined. Try again.",
    );
    expect(geolocationErrorMessage(positionError(99))).toBe(
      "Your location could not be determined. Try again.",
    );
  });
});

describe("useNearMe", () => {
  it("starts idle", () => {
    mockGeolocation();
    const { result } = renderHook(() => useNearMe(vi.fn()));
    expect(result.current.busy).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("asks for a high-accuracy position with a 10 second timeout and is busy until it answers", () => {
    const calls = mockGeolocation();
    const { result } = renderHook(() => useNearMe(vi.fn()));
    act(() => result.current.locate());
    expect(calls).toHaveLength(1);
    expect(calls[0]!.options).toEqual({ enableHighAccuracy: true, timeout: 10000 });
    expect(result.current.busy).toBe(true);
  });

  it("passes the position on as lat and lng and stops being busy", () => {
    const calls = mockGeolocation();
    const onLocated = vi.fn();
    const { result } = renderHook(() => useNearMe(onLocated));
    act(() => result.current.locate());
    act(() => calls[0]!.success(position(19.07, 72.87)));
    expect(onLocated).toHaveBeenCalledWith({ lat: 19.07, lng: 72.87 });
    expect(result.current.busy).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("turns a failure into a message and stops being busy", () => {
    const calls = mockGeolocation();
    const onLocated = vi.fn();
    const { result } = renderHook(() => useNearMe(onLocated));
    act(() => result.current.locate());
    act(() => calls[0]!.failure(positionError(1)));
    expect(onLocated).not.toHaveBeenCalled();
    expect(result.current.busy).toBe(false);
    expect(result.current.error).toBe("Allow location access in your browser settings.");
  });

  it("clears the old error when it tries again", () => {
    const calls = mockGeolocation();
    const { result } = renderHook(() => useNearMe(vi.fn()));
    act(() => result.current.locate());
    act(() => calls[0]!.failure(positionError(3)));
    expect(result.current.error).toBe("Location request timed out. Try again.");
    act(() => result.current.locate());
    expect(result.current.error).toBeNull();
    expect(result.current.busy).toBe(true);
  });

  it("reports a browser with no geolocation without asking for anything", () => {
    const { result } = renderHook(() => useNearMe(vi.fn()));
    act(() => result.current.locate());
    expect(result.current.error).toBe(GEOLOCATION_UNAVAILABLE_MESSAGE);
    expect(result.current.busy).toBe(false);
  });
});

describe("the two Near me triggers share the hook", () => {
  it("NearMeButton shows Locating..., then the message inline", () => {
    const calls = mockGeolocation();
    render(<NearMeButton onLocated={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Near me" }));
    expect(screen.getByRole("button", { name: "Locating..." })).toHaveProperty(
      "disabled",
      true,
    );
    act(() => calls[0]!.failure(positionError(3)));
    expect(screen.getByRole("alert").textContent).toBe(
      "Location request timed out. Try again.",
    );
    expect(screen.getByRole("button", { name: "Near me" })).toHaveProperty(
      "disabled",
      false,
    );
  });

  it("NearMeFab announces the message to screen readers and toasts it", () => {
    const calls = mockGeolocation();
    render(<NearMeFab onLocated={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Find places near me" }));
    act(() => calls[0]!.failure(positionError(1)));
    const message = "Allow location access in your browser settings.";
    expect(screen.getByRole("alert").textContent).toBe(message);
    expect(screen.getByRole("alert").className).toContain("sr-only");
    expect(toastError).toHaveBeenCalledWith(message);
  });

  it("NearMeFab toasts again when the same error happens a second time", () => {
    const calls = mockGeolocation();
    render(<NearMeFab onLocated={vi.fn()} />);
    const button = screen.getByRole("button", { name: "Find places near me" });
    fireEvent.click(button);
    act(() => calls[0]!.failure(positionError(3)));
    fireEvent.click(button);
    act(() => calls[1]!.failure(positionError(3)));
    expect(toastError).toHaveBeenCalledTimes(2);
  });

  it("both pass the located position to their callback", () => {
    const calls = mockGeolocation();
    const first = vi.fn();
    const second = vi.fn();
    render(
      <>
        <NearMeButton onLocated={first} />
        <NearMeFab onLocated={second} />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Near me" }));
    fireEvent.click(screen.getByRole("button", { name: "Find places near me" }));
    act(() => calls[0]!.success(position(1, 2)));
    act(() => calls[1]!.success(position(3, 4)));
    expect(first).toHaveBeenCalledWith({ lat: 1, lng: 2 });
    expect(second).toHaveBeenCalledWith({ lat: 3, lng: 4 });
  });
});
