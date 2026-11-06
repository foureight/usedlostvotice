"use client";

import { usePathname } from "next/navigation";
import { AdminListThumbs, type AdminThumb } from "./admin-list-thumbs";
import { AdminPhotoStrip } from "./admin-photo-strip";
import { MultiUpload } from "./multi-upload";

/** Photo upload + strip only on the Fotky singleton tab. */
export function AdminMediaChrome({ thumbs }: { thumbs: AdminThumb[] }) {
  const pathname = usePathname() || "";
  const onPhotos = pathname.includes("/singleton/photos");

  if (!onPhotos) return null;

  return (
    <>
      <MultiUpload />
      <AdminPhotoStrip thumbs={thumbs} />
      <AdminListThumbs thumbs={thumbs} />
    </>
  );
}
