import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  output: process.env.E2E_BUILD ? undefined : 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
  /*typescript: {
    ignoreBuildErrors: true,
  },*/
  rewrites: async () => {
    return isDev ? [
      {
        source: '/api/:path*',
        destination: `http://localhost:3333/:path*`,
      },
    ] : [];
  },
};

export default nextConfig;
