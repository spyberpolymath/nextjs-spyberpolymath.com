import AdminContact  from "@/app/components/admin_contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Contacts Management | SpyberPolymath | Aman Anil",
  description: "Admin interface for managing contacts",
};

export default function AdminPage() {
  return <AdminContact />;
}