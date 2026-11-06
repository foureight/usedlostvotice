"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminListThumbs, type AdminThumb } from "./admin-list-thumbs";
import { AdminPhotosManager, type PhotoAlbum } from "./admin-photos-manager";
import { AdminSeoEditor } from "./admin-seo-editor";

const NAV = [
  { href: "/keystatic", label: "Dashboard" },
  { href: "/keystatic/collection/inquiries", label: "Poptávky" },
  { href: "/keystatic/singleton/site", label: "Celý web" },
  { href: "/keystatic/singleton/photos", label: "Fotky" },
  { href: "/keystatic/singleton/seo", label: "SEO" },
  { href: "/keystatic/singleton/smtp", label: "E-mail / SMTP" },
] as const;

function SideNav({ current }: { current: string }) {
  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: "1px solid #e5e5e5",
        background: "#fafafa",
        padding: "16px 12px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 14 }}>Usedlost Vodice</p>
      <nav style={{ display: "grid", gap: 4 }}>
        {NAV.map((item) => {
          const active =
            current === item.href ||
            (item.href !== "/keystatic" && current.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "8px 10px",
                borderRadius: 6,
                textDecoration: "none",
                color: "#111",
                background: active ? "#e8eefc" : "transparent",
                fontWeight: active ? 700 : 500,
                fontSize: 14,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

/**
 * Fotky + SEO = naše admin stránky (spolehlivé online CMS).
 * Celý web / SMTP / Poptávky = Keystatic.
 */
export function AdminShell({
  thumbs,
  albums,
  children,
}: {
  thumbs: AdminThumb[];
  albums: PhotoAlbum[];
  children: ReactNode;
}) {
  const pathname = usePathname() || "";
  const onPhotos = pathname.includes("/singleton/photos");
  const onSeo = pathname.includes("/singleton/seo");
  const onSite = pathname.includes("/singleton/site");

  if (onPhotos || onSeo) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#fff" }}>
        <SideNav current={pathname} />
        <main style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
          {onPhotos ? <AdminPhotosManager albums={albums} /> : <AdminSeoEditor />}
        </main>
      </div>
    );
  }

  return (
    <>
      {onSite ? <AdminListThumbs thumbs={thumbs} /> : null}
      {children}
    </>
  );
}
