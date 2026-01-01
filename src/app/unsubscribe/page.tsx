import UnsubscribePage from "../components/Unsubscribe";
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Unsubscribe',
  description: 'Unsubscribe from the SpyberPolymath newsletter.',
  keywords: [
    'unsubscribe',
    'newsletter unsubscribe',
    'email preferences'
  ],
  canonical: '/unsubscribe',
  type: 'website',
  tags: ['unsubscribe', 'newsletter']
});

export default function Page() {
  return <UnsubscribePage />;
}