"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AdminListThumbs, type AdminThumb } from "./admin-list-thumbs";
import { AdminPhotosManager, type PhotoAlbum } from "./admin-photos-manager";
import { AdminSeoEditor } from "./admin-seo-editor";
import { AdminSmtpEditor } from "./admin-smtp-editor";

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
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        maxHeight: "100vh",
        overflowY: "auto",
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
  const onSmtp = pathname.includes("/singleton/smtp");
  const onSite = pathname.includes("/singleton/site");
  const customPage = onPhotos || onSeo || onSmtp;

  // Unlock any Keystatic body scroll lock so the document can scroll.
  useEffect(() => {
    if (!customPage) return;
    const html = document.documentElement;
    const body = document.body;
    html.style.setProperty("overflow", "auto", "important");
    body.style.setProperty("overflow", "auto", "important");
    body.style.setProperty("height", "auto", "important");
    html.style.setProperty("height", "auto", "important");
    return () => {
      html.style.removeProperty("overflow");
      body.style.removeProperty("overflow");
      body.style.removeProperty("height");
      html.style.removeProperty("height");
    };
  }, [customPage]);

  // Keystatic toolbar: Save → Uložit, Saved → zelené Uloženo
  useEffect(() => {
    if (customPage) return;

    const paint = (btn: HTMLElement, mode: "idle" | "saved") => {
      if (mode === "saved") {
        btn.style.background = "#2f7d4a";
        btn.style.color = "#fff";
        btn.style.borderColor = "#2f7d4a";
      } else {
        btn.style.removeProperty("background");
        btn.style.removeProperty("color");
        btn.style.removeProperty("border-color");
      }
    };

    const rename = () => {
      document.querySelectorAll("button").forEach((btn) => {
        const raw = (btn.textContent || "").replace(/\s+/g, " ").trim();
        if (raw === "Save" || raw === "Saving…" || raw === "Saving...") {
          btn.textContent = raw.startsWith("Saving") ? "Ukládám…" : "Uložit";
          paint(btn, "idle");
        } else if (raw === "Saved" || raw === "Uloženo") {
          btn.textContent = "Uloženo";
          paint(btn, "saved");
        } else if (raw === "Uložit") {
          paint(btn, "idle");
        }
      });
    };

    rename();
    const mo = new MutationObserver(rename);
    mo.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    return () => mo.disconnect();
  }, [customPage, pathname]);

  if (customPage) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          minHeight: "100vh",
          background: "#fff",
        }}
      >
        <SideNav current={pathname} />
        <main style={{ flex: 1, minWidth: 0 }}>
          {onPhotos ? (
            <AdminPhotosManager albums={albums} />
          ) : onSeo ? (
            <AdminSeoEditor />
          ) : (
            <AdminSmtpEditor />
          )}
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
