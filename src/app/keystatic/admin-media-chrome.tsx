"use client";

import { usePathname } from "next/navigation";
import { AdminListThumbs, type AdminThumb } from "./admin-list-thumbs";
import { AdminPhotoStrip } from "./admin-photo-strip";
import { MultiUpload } from "./multi-upload";

/** Photo helpers only on Celý web — SEO / SMTP stay readable. */
export function AdminMediaChrome({ thumbs }: { thumbs: AdminThumb[] }) {
  const pathname = usePathname() || "";
  const onSite =
    pathname.includes("/singleton/site") ||
    pathname === "/keystatic" ||
    pathname === "/keystatic/";

  if (!onSite) return null;

  return (
    <>
      <MultiUpload />
      <AdminPhotoStrip thumbs={thumbs} />
      <AdminListThumbs thumbs={thumbs} />
    </>
  );
}
