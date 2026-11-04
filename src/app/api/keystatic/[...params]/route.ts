import { mkdir, writeFile, rm } from "fs/promises";
import path from "path";
import { makeRouteHandler } from "@keystatic/next/route-handler";
import { isAdminAuthenticated } from "@/lib/auth";
import config from "../../../../../keystatic.config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = makeRouteHandler({ config });

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return new Response("Nejste přihlášeni.", { status: 401 });
  }
  return null;
}

const ALLOWED_PREFIXES = [
  "content/",
  "public/galerie/",
  "public/vizualizace-foto/",
  "public/vizualizace-dokonceno/",
  "public/vizualizace/",
  "public/pudorysy/",
  "public/stav/",
  "public/docs/",
];

type Addition = { path: string; contents: string };
type Deletion = { path: string };
type UpdateBody = { additions?: Addition[]; deletions?: Deletion[] };

function normalizePosixPath(input: string): string {
  const parts = input.replace(/\\/g, "/").split("/");
  const out: string[] = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (out.length) out.pop();
      continue;
    }
    out.push(part);
  }
  return out.join("/");
}

function isAllowed(filepath: string): boolean {
  return (
    !filepath.includes("\\") &&
    !filepath.split("/").some((p) => p === "." || p === "..") &&
    ALLOWED_PREFIXES.some((prefix) => filepath.startsWith(prefix))
  );
}

function base64UrlToBuffer(value: string): Buffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64");
}

async function applyUpdateDirectly(body: UpdateBody): Promise<Response> {
  const additions = (body.additions ?? [])
    .map((item) => ({ ...item, path: normalizePosixPath(item.path) }))
    .filter((item) => isAllowed(item.path) && typeof item.contents === "string");
  const deletions = (body.deletions ?? [])
    .map((item) => ({ path: normalizePosixPath(item.path) }))
    .filter((item) => isAllowed(item.path));

  const root = process.cwd();
  for (const addition of additions) {
    const abs = path.join(root, addition.path);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, base64UrlToBuffer(addition.contents));
  }
  for (const deletion of deletions) {
    await rm(path.join(root, deletion.path), { force: true });
  }

  // Flush content to CMS volume so the next boot keeps the save.
  const cms = process.env.CMS_DATA_DIR;
  if (cms) {
    for (const addition of additions) {
      if (!addition.path.startsWith("content/") && !addition.path.startsWith("public/")) {
        continue;
      }
      const abs = path.join(cms, addition.path);
      await mkdir(path.dirname(abs), { recursive: true });
      await writeFile(abs, base64UrlToBuffer(addition.contents));
    }
    for (const deletion of deletions) {
      if (!deletion.path.startsWith("content/") && !deletion.path.startsWith("public/")) {
        continue;
      }
      await rm(path.join(cms, deletion.path), { force: true });
    }
  }

  return Response.json({
    ok: true,
    wrote: additions.length,
    deleted: deletions.length,
  });
}

async function handleUpdate(request: Request): Promise<Response> {
  const headers = new Headers(request.headers);
  headers.set("no-cors", "1");
  headers.set("content-type", "application/json");

  let raw: UpdateBody;
  try {
    raw = (await request.json()) as UpdateBody;
  } catch {
    return new Response("Bad data", { status: 400 });
  }

  const sanitized: UpdateBody = {
    additions: (raw.additions ?? [])
      .map((item) => ({ ...item, path: normalizePosixPath(String(item.path || "")) }))
      .filter((item) => isAllowed(item.path)),
    deletions: (raw.deletions ?? [])
      .map((item) => ({ path: normalizePosixPath(String(item.path || "")) }))
      .filter((item) => isAllowed(item.path)),
  };

  const proxied = new Request(request.url, {
    method: "POST",
    headers,
    body: JSON.stringify(sanitized),
  });

  const res = await handler.POST(proxied);
  if (res.status !== 400) return res;

  const detail = await res.text();
  console.error("[keystatic] update Bad data — falling back to direct write", {
    detail,
    inAdd: (raw.additions ?? []).map((a) => a.path),
    inDel: (raw.deletions ?? []).map((d) => d.path),
    outAdd: (sanitized.additions ?? []).map((a) => a.path),
    outDel: (sanitized.deletions ?? []).map((d) => d.path),
  });

  try {
    return await applyUpdateDirectly(sanitized);
  } catch (err) {
    console.error("[keystatic] direct write failed", err);
    return Response.json(
      {
        error: "Bad data",
        detail,
        attemptedAdditions: (raw.additions ?? []).map((a) => a.path),
        attemptedDeletions: (raw.deletions ?? []).map((d) => d.path),
      },
      { status: 400 },
    );
  }
}

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  return handler.GET(request);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { pathname } = new URL(request.url);
  if (pathname.endsWith("/update") || pathname.includes("/api/keystatic/update")) {
    return handleUpdate(request);
  }
  return handler.POST(request);
}
