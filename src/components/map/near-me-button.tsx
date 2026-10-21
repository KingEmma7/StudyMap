"use client";

import { LocateFixed } from "lucide-react";

import type { LatLng } from "@/lib/geo";
import { useNearMe } from "@/components/map/use-near-me";
import { Button } from "@/components/ui/button";

interface NearMeButtonProps {
  onLocated: (location: LatLng) => void;
  className?: string;
}

export function NearMeButton({ onLocated, className }: NearMeButtonProps) {
  const { busy, error, locate } = useNearMe(onLocated);

  return (
    <div className={className}>
      <Button
        size="sm"
        variant="secondary"
        className="w-full"
        onClick={locate}
        disabled={busy}
      >
        <LocateFixed className="size-4" />
        {busy ? "Locating..." : "Near me"}
      </Button>
      {error && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
