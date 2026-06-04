import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/certificates/export": ["./certificate-templates/**/*"],
    "/api/ai/event-report": ["./document-templates/**/*"],
    "/api/ai/mom": ["./document-templates/**/*"]
  }
};

export default nextConfig;
