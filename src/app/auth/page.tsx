import Auth from "@/app/components/Auth";
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Login',
  description: 'Login to your account to access exclusive cybersecurity projects, tools, and resources.',
  keywords: [
    'login',
    'authentication',
    'account access',
    'cybersecurity resources'
  ],
  canonical: '/auth',
  type: 'website',
  tags: ['login', 'auth', 'account']
});

export default function AuthPage() {
    return <Auth />;
}