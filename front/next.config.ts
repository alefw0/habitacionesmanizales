import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {\n        source: \"/listings/:path*\",\n        destination: `${backendUrl}/listings/:path*`,\n      },\n      {\n        source: \"/admin-api/:path*\",\n        destination: `${backendUrl}/admin/:path*`,\n      },\n    ];\n  },
};

export default nextConfig;
