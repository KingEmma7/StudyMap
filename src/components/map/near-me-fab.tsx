"use client";

import * as React from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useNearMe } from "@/components/map/use-near-me";
import type { LatLng } from "@/lib/geo";
import { cn } from "@/lib/utils";

interface NearMeFabProps {
  onLocated: (loc: LatLng) => void;
  className?: string;
}

/** Round floating "near me" button for the mobile map, sized for thumb reach. */
export function NearMeFab({ onLocated, className }: NearMeFabProps) {
  const { busy, error, locate } = useNearMe(onLocated);

  // The floating button has no room for an inline message, so it also toasts.
  React.useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <>
      <button
        type="button"
        onClick={locate}
        disabled={busy}
        aria-label="Find places near me"
        className={cn(
          "flex size-12 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-colors hover:bg-muted active:bg-muted/80 disabled:opacity-70",
          className,
        )}
      >
        {busy ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <LocateFixed className="size-5" />
        )}
      </button>
      {error && (
        <span className="sr-only" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
