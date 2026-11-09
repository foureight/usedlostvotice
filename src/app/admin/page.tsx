import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if ((process.env.KEYSTATIC_STORAGE || "").trim() === "github") {
    redirect("/keystatic");
  }
  if (await isAdminAuthenticated()) {
    redirect("/keystatic");
  }
  return <LoginForm />;
}
