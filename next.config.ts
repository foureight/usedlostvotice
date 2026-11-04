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
      // Keystatic hardcodes basePath "/keystatic" — keep that as the real admin UI.
      // /zmensito stays as a short bookmark that lands on the same admin.
      {
        source: "/zmensito",
        destination: "/keystatic",
        permanent: false,
      },
      {
        source: "/zmensito/:path*",
        destination: "/keystatic/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
