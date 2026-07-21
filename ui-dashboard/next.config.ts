import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["three"],
  // Allow HMR / assets from HQ public IP during dev
  allowedDevOrigins: ["91.98.84.0", "localhost", "127.0.0.1"],
};

export default nextConfig;
