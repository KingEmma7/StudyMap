import type { Metadata } from "next";

import { fetchAwesomeList, type AwesomeSection } from "@/lib/awesome-list";
import { AwesomeListUnavailable } from "@/components/docs/awesome-list-unavailable";
import { AwesomeListBrowser } from "@/components/docs/awesome-list-browser";

export const metadata: Metadata = {
  title: "Awesome Skills & Plugins for Students",
  description:
    "Curated AI coding agent skills and plugins built for students, synced from the awesome-skills-plugins-for-students list.",
};

export const revalidate = 86400;

export default async function AwesomeSkillsPluginsPage() {
  let sections: AwesomeSection[];
  try {
    sections = await fetchAwesomeList("awesome-skills-plugins-for-students");
  } catch {
    // GitHub rate limits, a renamed repo or an outage shouldn't crash the page.
    return (
      <AwesomeListUnavailable
        repoName="awesome-skills-plugins-for-students"
        repoUrl="https://github.com/StudentSuite/awesome-skills-plugins-for-students"
      />
    );
  }

  return (
    <AwesomeListBrowser
      sections={sections}
      repoName="awesome-skills-plugins-for-students"
      repoUrl="https://github.com/StudentSuite/awesome-skills-plugins-for-students"
    />
  );
}
