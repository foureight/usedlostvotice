"use client";

import { usePathname } from "next/navigation";
import { AdminListThumbs, type AdminThumb } from "./admin-list-thumbs";
import { AdminPhotosManager, type PhotoAlbum } from "./admin-photos-manager";

/**
 * Celý web — náhledy u editovaných řádků galerie.
 * Fotky — kategorie + náhledy + mazání + hromadný upload.
 */
export function AdminMediaChrome({
  thumbs,
  albums,
}: {
  thumbs: AdminThumb[];
  albums: PhotoAlbum[];
}) {
  const pathname = usePathname() || "";
  const onSite = pathname.includes("/singleton/site");
  const onPhotos = pathname.includes("/singleton/photos");

  if (onPhotos) {
    return <AdminPhotosManager albums={albums} />;
  }

  if (onSite) {
    return <AdminListThumbs thumbs={thumbs} />;
  }

  return null;
}
