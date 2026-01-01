import { Metadata } from 'next';
import Home from "./components/Home";
import { generateMetadata as generateSEOMetadata, generateBreadcrumbStructuredData } from '@/lib/seo';
import StructuredData from '@/app/components/StructuredData';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Home',
  description: 'Welcome to SpyberPolymath - Professional portfolio of Aman Anil, a cybersecurity researcher and ethical hacker specializing in API security, AI systems, penetration testing, and digital privacy solutions.',
  keywords: [
    'cybersecurity expert',
    'ethical hacking services',
    'penetration testing consultant',
    'API security specialist',
    'AI security researcher',
    'digital privacy expert',
    'vulnerability assessment',
    'security auditing',
    'cybersecurity portfolio',
    'information security consultant'
  ],
  canonical: '/',
  type: 'website',
  tags: ['cybersecurity', 'ethical-hacking', 'research', 'portfolio']
});

const Page = () => {
    // Generate structured data for the homepage
    const breadcrumbData = generateBreadcrumbStructuredData([
        { name: 'Home', url: 'https://spyberpolymath.com/' }
    ]);
    
    return (
        <>
            <StructuredData data={breadcrumbData} />
            <Home />
        </>
    );
};

export default Page;
