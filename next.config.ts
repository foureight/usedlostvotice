import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    qualities: [50, 55, 60, 65, 70, 75, 80],
    // Cap at 1536 — full-bleed hero doesn't need 1920px sources on most screens.
    deviceSizes: [640, 750, 828, 1080, 1280, 1536],
    imageSizes: [96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Keep CSP light — Keystatic/admin + maps iframes need room to breathe.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob:",
              "font-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline' https:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
              "connect-src 'self' https:",
              "frame-src 'self' https://www.openstreetmap.org https://openstreetmap.org",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/prodej-domu-vodice",
        destination: "/",
        permanent: true,
      },
      // Keystatic hardcodes basePath "/keystatic"
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
  // Runtime uploads live on the Zerops volume; serve them through a Node
  // handler so missing/stale Next static maps cannot 404 a file that exists.
  async rewrites() {
    const folders = [
      "galerie",
      "vizualizace-foto",
      "vizualizace-dokonceno",
      "vizualizace",
      "pudorysy",
      "stav",
      "docs",
    ];
    return {
      beforeFiles: folders.map((folder) => ({
        source: `/${folder}/:path*`,
        destination: `/api/cms-file/${folder}/:path*`,
      })),
    };
  },
};

export default nextConfig;
