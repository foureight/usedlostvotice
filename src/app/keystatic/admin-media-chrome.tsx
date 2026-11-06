"use client";

import { usePathname } from "next/navigation";
import { AdminListThumbs, type AdminThumb } from "./admin-list-thumbs";
import { AdminPhotoStrip } from "./admin-photo-strip";
import { MultiUpload } from "./multi-upload";

/**
 * - Celý web: thumbnails in Keystatic gallery rows (as before)
 * - Fotky: multi-upload + full photo strip
 */
export function AdminMediaChrome({ thumbs }: { thumbs: AdminThumb[] }) {
  const pathname = usePathname() || "";
  const onSite = pathname.includes("/singleton/site");
  const onPhotos = pathname.includes("/singleton/photos");

  if (onPhotos) {
    return (
      <>
        <MultiUpload />
        <AdminPhotoStrip thumbs={thumbs} />
        <AdminListThumbs thumbs={thumbs} />
      </>
    );
  }

  if (onSite) {
    return <AdminListThumbs thumbs={thumbs} />;
  }

  return null;
}
