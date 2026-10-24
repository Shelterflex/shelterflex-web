/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";
import { performanceConfig } from "./next.config.performance.mjs";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const withNextIntl = createNextIntlPlugin("./i18n.ts");

// CSP directives are set dynamically in middleware.ts at runtime so that
// the backend origin is derived from runtime configuration instead of a
// build-time environment variable.

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emits .next/standalone with a self-contained server.js and only the traced
  // runtime dependencies. Required by the production Dockerfile.
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  // The agent role was replaced by whistleblowers; send old links somewhere useful.
  async redirects() {
    return [
      { source: "/dashboard/agent/:path*", destination: "/whistleblower/signup", permanent: true },
      { source: "/dashboard/landlord/agents", destination: "/dashboard/landlord", permanent: true },
    ];
  },
  ...performanceConfig,
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
