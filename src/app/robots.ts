import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/** Explicitně povolit běžné AI / search boty (indexace + odpovědi). */
const aiAgents = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Googlebot",
  "Applebot",
  "Applebot-Extended",
  "Bingbot",
  "DuckAssistBot",
  "meta-externalagent",
  "FacebookBot",
  "Bytespider",
  "CCBot",
  "anthropic-ai",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/keystatic", "/zmensito", "/api/admin", "/api/keystatic", "/api/inquiry"],
      },
      ...aiAgents.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/admin", "/keystatic", "/zmensito", "/api/admin", "/api/keystatic", "/api/inquiry"],
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
