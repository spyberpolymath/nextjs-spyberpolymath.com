import AdminProfile from "@/app/components/admin_profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Profile Management | SpyberPolymath | Aman Anil",
  description: "Admin interface for managing user profiles",
};

export default function AdminPage() {
  return <AdminProfile />;
}