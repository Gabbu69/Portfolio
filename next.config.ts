import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The local sequential runner sets this only after route generation and a
  // successful standalone tsc check. Standard builds still check inside Next.
  typescript: {
    ignoreBuildErrors: process.env.PORTFOLIO_LOW_MEMORY === "1" && process.env.PORTFOLIO_TYPES_PRECHECKED === "1",
  },
  // Opt in locally on constrained machines; normal builds keep Next defaults.
  ...(process.env.PORTFOLIO_LOW_MEMORY === "1" ? {
    experimental: {
      cpus: 1,
      webpackMemoryOptimizations: true,
      preloadEntriesOnStart: false,
    },
  } : {}),
};

export default nextConfig;
