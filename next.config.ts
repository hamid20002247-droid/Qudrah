import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // PostHog capture uses trailing slashes (`/e/`, `/i/v0/e/`). Without this,
  // Next redirects them and breaks ingestion.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
