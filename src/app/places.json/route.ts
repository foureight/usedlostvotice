import { getPlacesJson } from "@/lib/listing-export";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getPlacesJson(), {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=60",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
