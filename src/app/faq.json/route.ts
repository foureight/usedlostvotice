import { getFaqJson } from "@/lib/listing-export";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getFaqJson(), {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=60",
      "Access-Control-Allow-Origin": "*",
      "X-Robots-Tag": "index, follow",
    },
  });
}
