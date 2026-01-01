import Expertise from "../components/Expertise";
import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateBreadcrumbStructuredData } from '@/lib/seo';
import StructuredData from '@/app/components/StructuredData';

export const metadata: Metadata = generateSEOMetadata({
    title: 'Expertise',
    description: 'Discover the cybersecurity expertise of Aman Anil (SpyberPolymath) including ethical hacking, penetration testing, API security, AI security, vulnerability assessment, and digital privacy solutions.',
    keywords: [
        'cybersecurity expertise',
        'ethical hacking skills',
        'penetration testing expertise',
        'API security specialist',
        'AI security expertise',
        'vulnerability assessment skills',
        'digital privacy expertise',
        'security auditing capabilities',
        'information security skills',
        'cybersecurity consulting expertise',
        'network security skills',
        'web application security'
    ],
    canonical: '/expertise',
    type: 'website',
    tags: ['expertise', 'skills', 'cybersecurity', 'professional']
});

const Page = () => {
    // Generate structured data for the expertise page
    const breadcrumbData = generateBreadcrumbStructuredData([
        { name: 'Home', url: 'https://spyberpolymath.com/' },
        { name: 'Expertise', url: 'https://spyberpolymath.com/expertise' }
    ]);

    return (
        <>
            <StructuredData data={breadcrumbData} />
            <Expertise />
        </>
    );
};

export default Page;