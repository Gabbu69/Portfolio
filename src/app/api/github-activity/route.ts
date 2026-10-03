import { getContributionCalendar } from "@/lib/github-calendar-server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const calendar = await getContributionCalendar();
    return Response.json(calendar, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      { error: "GitHub activity is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
