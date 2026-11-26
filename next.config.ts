import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/api/demo/*": ["./travel-lab/recordings/*.json", "./travel-lab/src/**/*.ts", "./travel-lab/package.json"],
  },
};
export default nextConfig;
