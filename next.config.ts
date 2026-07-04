import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
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
    "/api/certificates/export": ["./templates/certificates/**/*"],
    "/api/ai/event-report": ["./templates/documents/**/*"],
    "/api/ai/mom": ["./templates/documents/**/*"]
  }
};

export default nextConfig;
