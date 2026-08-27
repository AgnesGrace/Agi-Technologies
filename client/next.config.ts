import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Prevent Turbopack from bundling a broken/empty OpenTelemetry stub into
  // proxy/middleware (causes: api.createContextKey is not a function).
  serverExternalPackages: ["@opentelemetry/api"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
