"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** The site's own error screen, used when rendering a route throws. `reset` re-renders the route segment. */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20 text-center"
    >
      <TriangleAlert className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 text-muted-foreground">
        This page hit an unexpected error. Trying again often fixes it.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Error reference: {error.digest}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
