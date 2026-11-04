import type { Metadata } from "next";
import { AdminListThumbs } from "./admin-list-thumbs";
import KeystaticApp from "./keystatic";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administrace | Usedlost Vodice",
  robots: { index: false, follow: false },
};

export default function Layout() {
  return (
    <>
      <AdminListThumbs />
      <KeystaticApp />
    </>
  );
}
