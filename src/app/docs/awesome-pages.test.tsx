import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AwesomeSkillsPluginsPage from "@/app/docs/(article)/awesome-skills-plugins/page";
import AwesomeStudentResourcesPage from "@/app/docs/(article)/awesome-student-resources/page";
import AwesomeStudyResourcesPage from "@/app/docs/(article)/awesome-study-resources/page";
import { fetchAwesomeList } from "@/lib/awesome-list";

vi.mock("@/lib/awesome-list", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/awesome-list")>()),
  fetchAwesomeList: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.mocked(fetchAwesomeList).mockReset();
});

const pages = [
  [
    "awesome-skills-plugins",
    AwesomeSkillsPluginsPage,
    "awesome-skills-plugins-for-students",
  ],
  ["awesome-student-resources", AwesomeStudentResourcesPage, "awesome-student-resources"],
  ["awesome-study-resources", AwesomeStudyResourcesPage, "awesome-study-resources"],
] as const;

describe.each(pages)("%s docs page", (_name, Page, repo) => {
  it("asks for its own list", async () => {
    vi.mocked(fetchAwesomeList).mockResolvedValue([
      {
        title: "Maths",
        entries: [{ name: "Khan", url: "https://example.com", description: "Learn." }],
      },
    ]);
    render(await Page());
    expect(fetchAwesomeList).toHaveBeenCalledWith(repo);
    expect(screen.queryByText("We couldn't load this list right now")).toBeNull();
  });

  it("shows a message with a link to GitHub when the list can't be fetched, instead of crashing", async () => {
    vi.mocked(fetchAwesomeList).mockRejectedValue(new Error("Failed to fetch: 403"));
    render(await Page());
    expect(screen.getByText("We couldn't load this list right now")).toBeTruthy();
    const link = screen.getByRole("link", { name: new RegExp(`Open ${repo} on GitHub`) });
    expect(link.getAttribute("href")).toBe(`https://github.com/StudentSuite/${repo}`);
  });
});
