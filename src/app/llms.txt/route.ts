import { getLlmsTxt } from "@/lib/listing-export";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(await getLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=60",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
