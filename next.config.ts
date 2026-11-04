import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 256, 384],
    qualities: [65, 75, 80],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async redirects() {
    return [
      {
        source: "/prodej-domu-vodice",
        destination: "/",
        permanent: true,
      },
      {
        source: "/keystatic",
        destination: "/zmensito",
        permanent: true,
      },
      {
        source: "/keystatic/:path*",
        destination: "/zmensito/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
