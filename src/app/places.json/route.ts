import { getPlacesJson } from "@/lib/listing-export";

export const dynamic = "force-static";

export function GET() {
  return Response.json(getPlacesJson(), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
      "X-Robots-Tag": "index, follow",
    },
  });
}
