import Accounts from '@/app/components/Accounts';
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'My Account',
  description: 'Manage your account settings, view payment history, and access your purchased projects.',
  keywords: [
    'account management',
    'user profile',
    'payment history',
    'project downloads',
    'account settings'
  ],
  canonical: '/accounts',
  type: 'website',
  tags: ['account', 'profile', 'management']
});

export const dynamic = 'force-dynamic';

export default function AccountsPage() {
    return <Accounts />;
}
