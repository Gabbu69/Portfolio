// Use the production origin for canonical URLs, including on preview builds.
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

export const siteUrl = new URL(
  configuredUrl ||
    (productionHost ? `https://${productionHost}` : "https://portfolio-eta-inky-60.vercel.app"),
).origin;
