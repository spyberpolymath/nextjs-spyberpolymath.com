import { Metadata } from 'next';
import { generateOGImageUrl, type OGImageParams } from './ogImage';

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  siteName?: string;
  siteUrl?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  publishedAt?: string;
  modifiedAt?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  canonical?: string;
}

export const defaultSEO: SEOConfig = {
  siteName: 'SpyberPolymath | Aman Anil',
  siteUrl: 'https://spyberpolymath.com',
  author: 'Aman Anil',
  type: 'website',
  image: 'https://spyberpolymath.com/og-image.jpg',
  keywords: [
    'spyberpolymath',
    'aman anil',
    'cybersecurity',
    'ethical hacking',
    'penetration testing',
    'AI security',
    'machine learning security',
    'API security',
    'digital privacy',
    'security research',
    'vulnerability assessment',
    'cyber security consultant',
    'information security',
    'security auditing'
  ]
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    author = defaultSEO.author,
    siteName = defaultSEO.siteName,
    siteUrl = defaultSEO.siteUrl,
    image = defaultSEO.image,
    type = 'website',
    publishedAt,
    modifiedAt,
    noIndex = false,
    canonical,
    tags = [],
  } = config;

  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const metadataBase = new URL(siteUrl!);
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : undefined;
  
  // Generate dynamic OG image URL
  const ogImageUrl = image?.startsWith('http') 
    ? image 
    : generateOGImageUrl({
        title: fullTitle,
        description,
        type: type as OGImageParams['type'],
        tags: tags.length > 0 ? tags : keywords.slice(0, 4),
        baseUrl: siteUrl
      });

  const metadata: Metadata = {
    metadataBase,
    title: fullTitle,
    description,
    keywords: [...(defaultSEO.keywords || []), ...keywords].join(', '),
    authors: [{ name: author }],
    creator: author,
    publisher: siteName,
    applicationName: siteName,
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    icons: {
      icon: [
        { url: '/favicon/favicon.ico', sizes: 'any' },
        { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { url: '/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    manifest: '/favicon/site.webmanifest',
    openGraph: {
      type,
      siteName,
      title: fullTitle,
      description,
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_US',
      ...(publishedAt && { publishedTime: publishedAt }),
      ...(modifiedAt && { modifiedTime: modifiedAt }),
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    category: 'Technology',
    classification: 'Cybersecurity, Ethical Hacking, Technology',
  };

  return metadata;
}

export interface PersonStructuredData {
  name: string;
  jobTitle: string[];
  url: string;
  sameAs: string[];
  image: string;
  description: string;
  knowsAbout: string[];
  worksFor?: {
    name: string;
    url?: string;
  };
}

export interface WebsiteStructuredData {
  name: string;
  url: string;
  description: string;
  author: PersonStructuredData;
  inLanguage: string;
  copyrightYear: number;
  genre: string[];
}

export interface ArticleStructuredData {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: PersonStructuredData;
  publisher: {
    name: string;
    logo: {
      url: string;
      width: number;
      height: number;
    };
  };
  mainEntityOfPage: string;
  articleSection?: string;
  keywords?: string[];
}

export function generatePersonStructuredData(): PersonStructuredData {
  return {
    name: 'Aman Anil',
    jobTitle: [
      'Cybersecurity Researcher',
      'Ethical Hacker',
      'Penetration Tester',
      'AI Security Specialist',
      'Security Consultant'
    ],
    url: 'https://spyberpolymath.com',
    sameAs: [
      'https://github.com/spyberpolymath',
      'https://linkedin.com/in/spyberpolymath'
    ],
    image: 'https://spyberpolymath.com/profile-image.jpg',
    description: 'Cybersecurity researcher and ethical hacker with expertise in API security, AI systems, and digital privacy. Specializes in penetration testing, vulnerability assessment, and security auditing.',
    knowsAbout: [
      'Cybersecurity',
      'Ethical Hacking',
      'Penetration Testing',
      'API Security',
      'AI Security',
      'Machine Learning Security',
      'Digital Privacy',
      'Vulnerability Assessment',
      'Security Auditing',
      'Information Security',
      'Network Security',
      'Web Application Security'
    ],
    worksFor: {
      name: 'SpyberPolymath',
      url: 'https://spyberpolymath.com'
    }
  };
}

export function generateWebsiteStructuredData(): WebsiteStructuredData {
  return {
    name: 'SpyberPolymath | Aman Anil',
    url: 'https://spyberpolymath.com',
    description: 'Professional portfolio and blog of Aman Anil (SpyberPolymath), a cybersecurity researcher and ethical hacker specializing in API security, AI systems, and digital privacy.',
    author: generatePersonStructuredData(),
    inLanguage: 'en-US',
    copyrightYear: new Date().getFullYear(),
    genre: [
      'Technology',
      'Cybersecurity',
      'Ethical Hacking',
      'Security Research',
      'Professional Portfolio'
    ]
  };
}

export function generateStructuredData(
  type: 'Person' | 'Website' | 'Article',
  data?: Partial<ArticleStructuredData>
): object {
  const baseUrl = 'https://spyberpolymath.com';
  const person = generatePersonStructuredData();
  const website = generateWebsiteStructuredData();

  switch (type) {
    case 'Person':
      return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        ...person,
        '@id': `${baseUrl}#person`,
      };

    case 'Website':
      return {
        '@context': 'https://schema.org',
        '@type': 'Website',
        ...website,
        '@id': `${baseUrl}#website`,
        author: {
          '@type': 'Person',
          ...person,
          '@id': `${baseUrl}#person`,
        },
      };

    case 'Article':
      if (!data) throw new Error('Article data is required');
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': data.mainEntityOfPage,
        headline: data.headline,
        description: data.description,
        image: {
          '@type': 'ImageObject',
          url: data.image,
          width: 1200,
          height: 630,
        },
        datePublished: data.datePublished,
        dateModified: data.dateModified || data.datePublished,
        author: {
          '@type': 'Person',
          ...person,
          '@id': `${baseUrl}#person`,
        },
        publisher: {
          '@type': 'Organization',
          name: data.publisher!.name,
          logo: {
            '@type': 'ImageObject',
            url: data.publisher!.logo.url,
            width: data.publisher!.logo.width,
            height: data.publisher!.logo.height,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.mainEntityOfPage,
        },
        ...(data.articleSection && { articleSection: data.articleSection }),
        ...(data.keywords && { keywords: data.keywords }),
      };

    default:
      throw new Error(`Unsupported structured data type: ${type}`);
  }
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}