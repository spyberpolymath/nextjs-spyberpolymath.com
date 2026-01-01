import Contact from "../components/Contact";
import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, generateBreadcrumbStructuredData } from '@/lib/seo';
import StructuredData from '@/app/components/StructuredData';

export const metadata: Metadata = generateSEOMetadata({
    title: 'Contact Me',
    description: 'Get in touch with Aman Anil (SpyberPolymath) for cybersecurity consulting, ethical hacking services, penetration testing, API security audits, and security research collaborations.',
    keywords: [
        'cybersecurity consulting contact',
        'ethical hacking services',
        'penetration testing consultant',
        'security audit services',
        'API security expert contact',
        'vulnerability assessment services',
        'cybersecurity researcher contact',
        'security consulting inquiries',
        'digital privacy consultation',
        'information security expert'
    ],
    canonical: '/contact',
    type: 'website',
    tags: ['contact', 'consulting', 'services']
});

const Page = () => {
    // Generate structured data for the contact page
    const breadcrumbData = generateBreadcrumbStructuredData([
        { name: 'Home', url: 'https://spyberpolymath.com/' },
        { name: 'Contact', url: 'https://spyberpolymath.com/contact' }
    ]);

    return (
        <>
            <StructuredData data={breadcrumbData} />
            <Contact />
        </>
    );
};

export default Page;