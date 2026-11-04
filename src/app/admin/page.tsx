import { isAdminAuthenticated } from "@/lib/auth";
import { AdminApp } from "./admin-app";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  return <AdminApp authenticated={authenticated} />;
}
