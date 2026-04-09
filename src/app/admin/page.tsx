import type { Metadata } from "next";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin | Fade District",
  description: "Fade District administration dashboard",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
