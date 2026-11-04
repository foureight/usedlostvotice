import { NextResponse, type NextRequest } from "next/server";

const ADMIN_REALM = 'Usedlost Vodice Admin';

function unauthorized(): NextResponse {
  return new NextResponse("Vyžadováno přihlášení do administrace.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${ADMIN_REALM}", charset="UTF-8"`,
      "Cache-Control": "no-store",
    },
  });
}

function parseBasicAuth(header: string | null): { user: string; pass: string } | null {
  if (!header?.startsWith("Basic ")) return null;
  try {
    const decoded = atob(header.slice(6).trim());
    const sep = decoded.indexOf(":");
    if (sep < 0) return null;
    return { user: decoded.slice(0, sep), pass: decoded.slice(sep + 1) };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const expectedUser = (
    process.env.ADMIN_USER ||
    "michal@tribo.cz"
  ).trim();
  // Prefer Zerops secret; fall back to ADMIN_PASSWORD if set separately.
  const expectedPass = (
    process.env.KEYSTATIC_ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    ""
  ).trim();

  // Bez hesla v env je admin zamčený — ať se omylem neotevře veřejně.
  if (!expectedPass) {
    return new NextResponse(
      "Administrace není nastavená (chybí KEYSTATIC_ADMIN_PASSWORD).",
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const creds = parseBasicAuth(request.headers.get("authorization"));
  if (!creds || creds.user !== expectedUser || creds.pass !== expectedPass) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/keystatic",
    "/keystatic/:path*",
    "/zmensito",
    "/zmensito/:path*",
    "/api/keystatic/:path*",
    "/api/admin/:path*",
  ],
};
