import { Metadata } from 'next';
import Projects from '@/app/components/Projects';
import { generateMetadata as generateSEOMetadata, generateBreadcrumbStructuredData } from '@/lib/seo';
import StructuredData from '@/app/components/StructuredData';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Cybersecurity Projects',
  description: 'Explore cybersecurity projects by Aman Anil (SpyberPolymath): Ethical hacking tools, penetration testing scripts, API security solutions, AI/ML security models, privacy tools, and open source security contributions.',
  keywords: [
    'cybersecurity projects',
    'ethical hacking tools',
    'penetration testing tools',
    'API security projects',
    'AI security tools',
    'privacy protection tools',
    'vulnerability assessment tools',
    'security automation scripts',
    'open source security tools',
    'cybersecurity portfolio',
    'security research projects',
    'information security tools'
  ],
  canonical: '/projects',
  type: 'website',
  tags: ['projects', 'cybersecurity', 'tools', 'research']
});

const Page = () => {
  // Generate structured data for the projects page
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: 'https://spyberpolymath.com/' },
    { name: 'Projects', url: 'https://spyberpolymath.com/projects' }
  ]);

  return (
    <>
      <StructuredData data={breadcrumbData} />
      <Projects />
    </>
  );
};

export default Page;