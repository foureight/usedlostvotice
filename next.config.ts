import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Next 15 rejects any quality not listed here → 400 on /_next/image.
    qualities: [50, 60, 65, 70, 75, 80, 85, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
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
