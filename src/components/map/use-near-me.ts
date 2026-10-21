"use client";

import * as React from "react";

import type { LatLng } from "@/lib/geo";

/** The message shown when the browser has no Geolocation API at all. */
export const GEOLOCATION_UNAVAILABLE_MESSAGE =
  "Geolocation is not available in this browser.";

/** Maps a `GeolocationPositionError` to the message shown to the visitor. */
export function geolocationErrorMessage(
  error: Pick<GeolocationPositionError, "code" | "PERMISSION_DENIED" | "TIMEOUT">,
): string {
  if (error.code === error.PERMISSION_DENIED) {
    return "Allow location access in your browser settings.";
  }
  if (error.code === error.TIMEOUT) {
    return "Location request timed out. Try again.";
  }
  return "Your location could not be determined. Try again.";
}

/**
 * The geolocation logic behind both "Near me" triggers (the desktop button and
 * the mobile floating button): asks the browser for the position once, tracks
 * `busy` while it waits, and turns a failure into a readable `error`. A
 * component calls `locate()` from its own click handler and decides how to show
 * `busy` and `error`.
 */
export function useNearMe(onLocated: (location: LatLng) => void) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const locate = React.useCallback(() => {
    if (!navigator.geolocation) {
      setError(GEOLOCATION_UNAVAILABLE_MESSAGE);
      return;
    }
    setBusy(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        onLocated({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setBusy(false);
        setError(geolocationErrorMessage(err));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [onLocated]);

  return { busy, error, locate };
}
