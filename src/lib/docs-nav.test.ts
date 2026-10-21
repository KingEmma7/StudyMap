import { FileText } from "lucide-react";
import { describe, expect, it } from "vitest";

import {
  DOCS_GROUPS,
  docsPages,
  groupDocsByTopic,
  type DocsNavEntry,
} from "@/lib/docs-nav";

const entry = (href: string, group?: DocsNavEntry["group"]): DocsNavEntry => ({
  href,
  title: href,
  description: "",
  icon: FileText,
  group,
});

describe("groupDocsByTopic", () => {
  it("returns the groups in DOCS_GROUPS order, each with its own pages", () => {
    const groups = groupDocsByTopic();
    expect(groups.map(({ group }) => group)).toEqual(
      DOCS_GROUPS.filter((group) => docsPages.some((page) => page.group === group)),
    );
    for (const { group, entries } of groups) {
      expect(entries.length).toBeGreaterThan(0);
      expect(entries.every((page) => page.group === group)).toBe(true);
    }
  });

  it("places every docs page in exactly one group", () => {
    const grouped = groupDocsByTopic().flatMap(({ entries }) => entries);
    expect(grouped).toHaveLength(docsPages.length);
    expect(new Set(grouped.map((page) => page.href)).size).toBe(docsPages.length);
  });

  it("leaves a group out when it has no pages", () => {
    const groups = groupDocsByTopic([
      entry("/docs/a", "Guides"),
      entry("/docs/b", "Developers"),
    ]);
    expect(groups.map(({ group }) => group)).toEqual(["Guides", "Developers"]);
  });

  it("keeps the order of pages within a group", () => {
    const groups = groupDocsByTopic([
      entry("/docs/second", "Guides"),
      entry("/docs/other", "Developers"),
      entry("/docs/first", "Guides"),
    ]);
    expect(groups[0]!.entries.map((page) => page.href)).toEqual([
      "/docs/second",
      "/docs/first",
    ]);
  });

  it("drops a page that has no group", () => {
    expect(groupDocsByTopic([entry("/docs/loose")])).toEqual([]);
  });

  it("returns nothing for no pages", () => {
    expect(groupDocsByTopic([])).toEqual([]);
  });
});
