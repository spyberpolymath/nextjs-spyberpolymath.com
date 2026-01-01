import Journey from "../components/Journey";
import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateBreadcrumbStructuredData } from '@/lib/seo';
import StructuredData from '@/app/components/StructuredData';

export const metadata: Metadata = generateSEOMetadata({
    title: 'My Journey',
    description: 'Explore the professional journey of Aman Anil (SpyberPolymath) from cybersecurity enthusiast to expert ethical hacker and security researcher. Learn about key milestones, achievements, and expertise development.',
    keywords: [
        'cybersecurity career journey',
        'ethical hacker background',
        'security researcher experience',
        'professional development cybersecurity',
        'penetration testing journey',
        'cybersecurity expertise development',
        'security consultant background',
        'ethical hacking career path',
        'cybersecurity professional story',
        'information security journey'
    ],
    canonical: '/journey',
    type: 'website',
    tags: ['journey', 'career', 'experience', 'growth']
});

const Page = () => {
    // Generate structured data for the journey page
    const breadcrumbData = generateBreadcrumbStructuredData([
        { name: 'Home', url: 'https://spyberpolymath.com/' },
        { name: 'Journey', url: 'https://spyberpolymath.com/journey' }
    ]);

    return (
        <>
            <StructuredData data={breadcrumbData} />
            <Journey />
        </>
    );
};

export default Page;