import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AwesomeListUnavailableProps {
  repoName: string;
  repoUrl: string;
}

/**
 * Shown on an awesome-list docs page when the list can't be fetched from
 * GitHub (rate limit, renamed repo, outage). The list itself always stays
 * readable on GitHub, so the page points there instead of crashing.
 */
export function AwesomeListUnavailable({
  repoName,
  repoUrl,
}: AwesomeListUnavailableProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center"
    >
      <h2 className="font-heading text-lg font-semibold">
        We couldn&apos;t load this list right now
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {repoName} is synced from GitHub, and GitHub didn&apos;t answer. Try again in a
        little while, or read the list on GitHub in the meantime.
      </p>
      <Button asChild variant="outline">
        <a href={repoUrl} target="_blank" rel="noopener noreferrer">
          Open {repoName} on GitHub
          <ExternalLink className="size-4" aria-hidden />
        </a>
      </Button>
    </div>
  );
}
