import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['three'],
  allowedDevOrigins: ['91.98.84.0'],
  output: 'standalone',
};

export default nextConfig;
