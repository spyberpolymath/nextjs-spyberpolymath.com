import AdminPayments from '@/app/components/admin_payments';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin - Payments | SpyberPolymath | Aman Anil',
    description: 'Manage your payments and transactions',
};

export default function AdminPage() {
    return <AdminPayments />;
}