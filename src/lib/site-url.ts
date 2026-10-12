// Use the production origin for canonical URLs, including on preview builds.
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteUrl = new URL(
  configuredUrl || "https://gabrielpaclibar.vercel.app",
).origin;
