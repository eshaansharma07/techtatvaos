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
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload"
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://res.cloudinary.com https://*.cdninstagram.com https://*.fbcdn.net https://*.behold.so; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://generativelanguage.googleapis.com https://api.resend.com https://api.behold.so; frame-src 'self' https://challenges.cloudflare.com; object-src 'none';"
          }
        ]
      },
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
