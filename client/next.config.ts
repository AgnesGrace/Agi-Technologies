import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Prevent Turbopack from bundling a broken/empty OpenTelemetry stub into
  // proxy/middleware (causes: api.createContextKey is not a function).
  serverExternalPackages: ["@opentelemetry/api"],
  transpilePackages: ["tldraw"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
