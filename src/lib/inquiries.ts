import { mkdir, writeFile } from "fs/promises";
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

/** Save a contact-form lead into Keystatic collection `inquiries`. */
export async function saveInquiry(record: InquiryRecord): Promise<{ slug: string }> {
  const createdAt = new Date().toISOString();
  const stamp = createdAt.replace(/[:.]/g, "-");
  const base = slugify(record.name) || "poptavka";
  const slug = `${stamp}-${base}`;

  const title = `${record.name} · ${createdAt.slice(0, 16).replace("T", " ")} UTC`;
  const dir = path.join(process.cwd(), "content", "inquiries");
  await mkdir(dir, { recursive: true });

  const payload = {
    title,
    name: record.name,
    email: record.email,
    phone: record.phone,
    note: record.note.slice(0, 5000),
    createdAt,
    status: "new",
    mailed: record.mailed,
  };

  await writeFile(path.join(dir, `${slug}.json`), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return { slug };
}
