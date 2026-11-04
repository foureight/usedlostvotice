import { NextResponse } from "next/server";
import { repairSiteJson } from "@/lib/repair-site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/admin/repair — drop missing media + normalize fields that break Keystatic Save. */
export async function POST() {
  try {
    const result = await repairSiteJson();
    return NextResponse.json({ ok: true, ...result, removedCount: result.removed.length });
  } catch (err) {
    console.error("[repair]", err);
    return NextResponse.json({ error: "repair failed" }, { status: 500 });
  }
}
