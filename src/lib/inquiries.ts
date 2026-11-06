import { copyFile, mkdir, readFile, unlink, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export type InquiryRecord = {
  name: string;
  email: string;
  phone: string;
  note: string;
  mailed: boolean;
};

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function flushInquiryToVolume(slug: string) {
  const cms = process.env.CMS_DATA_DIR;
  if (!cms) return;
  const from = path.join(process.cwd(), "content", "inquiries", `${slug}.json`);
  const to = path.join(cms, "content", "inquiries", `${slug}.json`);
  await mkdir(path.dirname(to), { recursive: true });
  await copyFile(from, to);
}

/** Save a contact-form lead into content/inquiries (Keystatic-compatible JSON). */
export async function saveInquiry(record: InquiryRecord): Promise<{ slug: string }> {
  const createdAt = new Date().toISOString();
  const stamp = createdAt.replace(/[:.]/g, "-");
  const base = slugify(record.name) || "poptavka";
  const slug = `${stamp}-${base}`;

  const titleName = `${record.name} · ${createdAt.slice(0, 16).replace("T", " ")} UTC`;
  const dir = path.join(process.cwd(), "content", "inquiries");
  await mkdir(dir, { recursive: true });

  // Keystatic `fields.slug` expects { name, slug } — plain string breaks the collection UI.
  const payload = {
    title: { name: titleName, slug },
    name: record.name,
    email: record.email,
    phone: record.phone,
    note: record.note.slice(0, 5000),
    createdAt,
    status: "new",
    mailed: record.mailed,
  };

  await writeFile(path.join(dir, `${slug}.json`), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await flushInquiryToVolume(slug);
  return { slug };
}

export async function markInquiryMailed(slug: string): Promise<void> {
  const file = path.join(process.cwd(), "content", "inquiries", `${slug}.json`);
  const raw = await readFile(file, "utf8");
  const data = JSON.parse(raw) as Record<string, unknown>;
  data.mailed = true;
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await flushInquiryToVolume(slug);
}

export async function deleteInquiry(slug: string): Promise<boolean> {
  const safe = String(slug || "").replace(/[^a-zA-Z0-9._-]/g, "");
  if (!safe || safe !== slug) return false;

  const file = path.join(process.cwd(), "content", "inquiries", `${safe}.json`);
  if (!existsSync(file)) return false;
  await unlink(file);

  const cms = process.env.CMS_DATA_DIR;
  if (cms) {
    const vol = path.join(cms, "content", "inquiries", `${safe}.json`);
    if (existsSync(vol)) await unlink(vol);
  }
  return true;
}
