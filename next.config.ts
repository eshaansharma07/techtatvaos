import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"]
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000
  },
  async headers() {
    return [
      {
        source: "/:path*\\.(png|jpg|jpeg|gif|webp|avif|ico|svg|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      }
    ];
  },
  outputFileTracingIncludes: {
    "/api/certificates/export": ["./certificate-templates/**/*"],
    "/api/ai/event-report": ["./document-templates/**/*"],
    "/api/ai/mom": ["./document-templates/**/*"]
  }
};

export default nextConfig;
