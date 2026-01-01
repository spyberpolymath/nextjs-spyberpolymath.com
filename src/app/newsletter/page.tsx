import Newsletter from '../components/Newsletter';
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Newsletter',
  description: 'Subscribe to the SpyberPolymath newsletter for the latest cybersecurity insights, ethical hacking tips, and security research updates.',
  keywords: [
    'cybersecurity newsletter',
    'ethical hacking updates',
    'security research newsletter',
    'penetration testing tips',
    'API security insights'
  ],
  canonical: '/newsletter',
  type: 'website',
  tags: ['newsletter', 'subscribe', 'updates']
});

export default function NewsletterPage() {
    return <Newsletter />;
}
