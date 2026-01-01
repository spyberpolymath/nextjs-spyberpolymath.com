import AdminAuth from "@/app/components/admin_auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Auth | SpyberPolymath | Aman Anil",
  description: "Admin interface for managing authentication",
};

export default function AdminAuthPage() {
  return <AdminAuth />;
}