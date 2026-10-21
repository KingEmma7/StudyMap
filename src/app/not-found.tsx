import type { Metadata } from "next";
import Link from "next/link";
import { MapPinOff } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/** The site's own 404, used for unknown routes and for `notFound()` calls such as an unknown city or competition. */
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20 text-center">
      <MapPinOff className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight">
        Page not found
      </h1>
      <p className="mt-2 text-muted-foreground">
        We couldn&apos;t find that page. The link may be old, or the place or competition
        may have been renamed or removed.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/map">Back to the map</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/competitions">Browse competitions</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
