import { getListingJson } from "@/lib/listing-export";

export const dynamic = "force-static";

export function GET() {
  return Response.json(getListingJson(), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
