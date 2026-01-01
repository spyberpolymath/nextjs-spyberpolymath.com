import AdminUsers from '@/app/components/admin_users';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin - Users | SpyberPolymath | Aman Anil',
    description: 'Manage your users and their roles',
};

export default function AdminPage() {
    return <AdminUsers />;
}