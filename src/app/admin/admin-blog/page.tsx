import AdminBlog  from "@/app/components/admin_blog";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Blog Management | SpyberPolymath | Aman Anil",
  description: "Admin interface for managing blog posts on SpyberPolymath.",
};

export default function AdminPage() {
  return <AdminBlog />;
}