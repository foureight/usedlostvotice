import type { Metadata } from "next";
import "./admin.css";
import { AdminApp } from "./admin-app";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administrace | Usedlost Vodice",
  robots: { index: false, follow: false },
};

export default function Layout() {
  return <AdminApp />;
}
