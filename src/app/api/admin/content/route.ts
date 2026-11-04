import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createSessionToken,
  getAdminPassword,
  getAdminUser,
  isAdminAuthenticated,
} from "@/lib/auth";
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
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nejste přihlášeni." }, { status: 401 });
  }
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
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nejste přihlášeni." }, { status: 401 });
  }

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

export async function POST(request: Request) {
  let body: { email?: string; user?: string; password?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatné JSON." }, { status: 400 });
  }

  if (body.action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  }

  const expectedUser = getAdminUser();
  const expectedPass = getAdminPassword();
  if (!expectedPass) {
    return NextResponse.json(
      { error: "Administrace není nastavená (chybí heslo)." },
      { status: 503 },
    );
  }

  const email = String(body.email || body.user || "")
    .trim()
    .toLowerCase();
  if (email !== expectedUser || body.password !== expectedPass) {
    return NextResponse.json(
      { error: "Špatný e-mail nebo heslo." },
      { status: 401 },
    );
  }

  const token = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
