import AdminNewsletter from '@/app/components/admin_newsletter';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin - Newsletter | SpyberPolymath | Aman Anil',
    description: 'Manage your Newsletter and transactions',
};

export default function AdminPage() {
    return <AdminNewsletter />;
}