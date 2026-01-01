import BlogPage from "../components/Blog";
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateBreadcrumbStructuredData } from '@/lib/seo';
import StructuredData from '@/app/components/StructuredData';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Blog',
  description: 'Read the latest cybersecurity blog posts by Aman Anil (SpyberPolymath) covering ethical hacking, penetration testing, API security, AI security, and digital privacy topics.',
  keywords: [
    'cybersecurity blog',
    'ethical hacking articles',
    'penetration testing guides',
    'API security blog',
    'AI security insights',
    'digital privacy articles',
    'security research blog',
    'vulnerability assessment posts',
    'information security blog',
    'cybersecurity news'
  ],
  canonical: '/blog',
  type: 'website',
  tags: ['blog', 'articles', 'cybersecurity', 'research']
});

const Page = () => {
  // Generate structured data for the blog page
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: 'https://spyberpolymath.com/' },
    { name: 'Blog', url: 'https://spyberpolymath.com/blog' }
  ]);

  return (
    <>
      <StructuredData data={breadcrumbData} />
      <BlogPage />
    </>
  );
};

export default Page;