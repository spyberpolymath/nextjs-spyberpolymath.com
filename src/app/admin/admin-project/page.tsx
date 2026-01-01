import AdminProjects from "@/app/components/admin_projects";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Project Management | SpyberPolymath | Aman Anil",
  description: "Admin interface for managing projects",
};

export default function AdminPage() {
  return <AdminProjects />;
}