import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/** Povolit běžné search / crawler boty. JSON + llms.txt zůstávají veřejné endpointy. */
const crawlerAgents = [
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

const disallow = [
  "/admin",
  "/keystatic",
  "/zmensito",
  "/api/admin",
  "/api/keystatic",
  "/api/inquiry",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/property.json",
          "/faq.json",
          "/places.json",
          "/llms.txt",
          "/llms-full.txt",
          "/sitemap.xml",
        ],
        disallow,
      },
      ...crawlerAgents.map((userAgent) => ({
        userAgent,
        allow: [
          "/",
          "/property.json",
          "/faq.json",
          "/places.json",
          "/llms.txt",
          "/llms-full.txt",
          "/sitemap.xml",
        ],
        disallow,
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
