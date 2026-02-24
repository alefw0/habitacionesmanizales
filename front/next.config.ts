import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/listings/:path*",
        destination: `${backendUrl}/listings/:path*`,
      },
      {
        source: "/admin-api/:path*",
        destination: `${backendUrl}/admin/:path*`,
      },
    ];
  },
};

export default nextConfig;
