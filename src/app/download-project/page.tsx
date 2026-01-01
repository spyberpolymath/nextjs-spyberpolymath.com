import { Suspense } from 'react';
import DownloadProjectPage from "../components/DownloadProject";
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Download Project',
  description: 'Download exclusive cybersecurity projects, tools, and resources from SpyberPolymath.',
  keywords: [
    'download project',
    'cybersecurity tools',
    'security projects',
    'ethical hacking tools',
    'penetration testing scripts'
  ],
  canonical: '/download-project',
  type: 'website',
  tags: ['download', 'project', 'tools']
});

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>Loading...</div>}>
      <DownloadProjectPage />
    </Suspense>
  );
}