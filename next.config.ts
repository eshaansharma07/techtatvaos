import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/certificates/export": ["./certificate-templates/**/*"]
  }
};

export default nextConfig;
