import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Zerops + CMS uploads: /_next/image often 400s (disallowed quality, cold
    // missing files cached as errors). Serve originals directly.
    unoptimized: true,
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
