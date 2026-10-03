import { unstable_cache } from "next/cache";
import { fetchContributionCalendar } from "./github-calendar";

// Cache the parsed and validated result, never an unchecked HTTP 200 page.
// Throwing during revalidation preserves the previous successful cache entry.
export const getContributionCalendar = unstable_cache(
  async () => fetchContributionCalendar(),
  ["github-contribution-calendar-v1", "Gabbu69"],
  { revalidate: 3600 },
);
