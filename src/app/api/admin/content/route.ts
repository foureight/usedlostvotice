import { NextResponse } from "next/server";
import {
  listInquiries,
  readSeoJson,
  readSiteJson,
  readSmtpJson,
  writeJsonFile,
} from "@/lib/cms-files";
import { repairSiteJson } from "@/lib/repair-site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await repairSiteJson().catch(() => null);
  const [site, seo, smtp, inquiries] = await Promise.all([
    readSiteJson(),
    readSeoJson(),
    readSmtpJson(),
    listInquiries(),
  ]);
  return NextResponse.json({ site, seo, smtp, inquiries });
}

export async function PUT(request: Request) {
  let body: {
    site?: Record<string, unknown>;
    seo?: Record<string, unknown>;
    smtp?: Record<string, unknown>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatné JSON." }, { status: 400 });
  }

  if (body.site && typeof body.site === "object") {
    await writeJsonFile("site.json", body.site);
  }
  if (body.seo && typeof body.seo === "object") {
    await writeJsonFile("seo.json", body.seo);
  }
  if (body.smtp && typeof body.smtp === "object") {
    await writeJsonFile("smtp.json", body.smtp);
  }

  await repairSiteJson().catch(() => null);

  return NextResponse.json({
    ok: true,
    site: await readSiteJson(),
    seo: await readSeoJson(),
    smtp: await readSmtpJson(),
  });
}
