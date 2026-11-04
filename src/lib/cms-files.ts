import { copyFile, mkdir, readdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const CONTENT = path.join(process.cwd(), "content");

async function flushFile(relFromContent: string) {
  const cms = process.env.CMS_DATA_DIR;
  if (!cms) return;
  const from = path.join(CONTENT, relFromContent);
  const to = path.join(cms, "content", relFromContent);
  await mkdir(path.dirname(to), { recursive: true });
  await copyFile(from, to);
}

export async function readJsonFile<T>(relFromContent: string, fallback: T): Promise<T> {
  const abs = path.join(CONTENT, relFromContent);
  try {
    return JSON.parse(await readFile(abs, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(relFromContent: string, data: unknown) {
  const abs = path.join(CONTENT, relFromContent);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await flushFile(relFromContent);
}

export async function readSiteJson(): Promise<Record<string, unknown>> {
  return readJsonFile("site.json", {});
}

export async function readSeoJson(): Promise<Record<string, unknown>> {
  return readJsonFile("seo.json", {});
}

export async function readSmtpJson(): Promise<Record<string, unknown>> {
  return readJsonFile("smtp.json", {
    enabled: false,
    host: "",
    port: 587,
    secure: false,
    user: "",
    password: "",
    fromEmail: "",
    fromName: "Usedlost Vodice",
    toEmail: "",
    ccEmail: "",
    subjectPrefix: "[Usedlost Vodice]",
  });
}

export type InquiryRow = {
  slug: string;
  title?: string;
  name?: string;
  email?: string;
  phone?: string;
  note?: string;
  createdAt?: string;
  status?: string;
  mailed?: boolean;
};

export async function listInquiries(): Promise<InquiryRow[]> {
  const dir = path.join(CONTENT, "inquiries");
  if (!existsSync(dir)) return [];
  const names = await readdir(dir);
  const rows: InquiryRow[] = [];
  for (const name of names) {
    if (!name.endsWith(".json")) continue;
    const slug = name.replace(/\.json$/, "");
    try {
      const data = JSON.parse(await readFile(path.join(dir, name), "utf8")) as Record<
        string,
        unknown
      >;
      rows.push({
        slug,
        title: typeof data.title === "string" ? data.title : slug,
        name: typeof data.name === "string" ? data.name : "",
        email: typeof data.email === "string" ? data.email : "",
        phone: typeof data.phone === "string" ? data.phone : "",
        note: typeof data.note === "string" ? data.note : "",
        createdAt: typeof data.createdAt === "string" ? data.createdAt : "",
        status: typeof data.status === "string" ? data.status : "new",
        mailed: Boolean(data.mailed),
      });
    } catch {
      /* skip */
    }
  }
  rows.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return rows;
}
