import AdminDashboard from '../components/admin_dashbaord';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin - Dashboard | SpyberPolymath | Aman Anil',
    description: 'Manage your projects and contacts',
};

export default function AdminPage() {
    return <AdminDashboard />;
}