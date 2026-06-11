import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    redirect("/nimda");
  }

  return <AdminDashboardClient />;
}
