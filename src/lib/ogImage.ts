/**
 * Utility functions for generating Open Graph (OG) images
 */

export interface OGImageParams {
  title?: string;
  description?: string;
  type?: 'website' | 'project' | 'article';
  tags?: string[];
  baseUrl?: string;
}

/**
 * Generates a URL for the dynamic OG image API endpoint
 */
export function generateOGImageUrl(params: OGImageParams = {}): string {
  const {
    title,
    description,
    type = 'website',
    tags = [],
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spyberpolymath.com'
  } = params;

  const searchParams = new URLSearchParams();
  
  if (title) {
    searchParams.set('title', title);
  }
  
  if (description) {
    searchParams.set('description', description);
  }
  
  searchParams.set('type', type);
  
  if (tags.length > 0) {
    searchParams.set('tags', tags.join(','));
  }

  return `${baseUrl}/api/og?${searchParams.toString()}`;
}

/**
 * Helper function to extract relevant tags from project or content
 */
export function extractRelevantTags(allTags: string[], maxTags: number = 4): string[] {
  // Prioritize certain keywords that work well in OG images
  const priorityKeywords = [
    'cybersecurity', 
    'ethical-hacking', 
    'penetration-testing', 
    'api-security', 
    'ai-security', 
    'vulnerability', 
    'privacy',
    'automation', 
    'python', 
    'javascript', 
    'react', 
    'nextjs'
  ];
  
  const priority: string[] = [];
  const regular: string[] = [];
  
  allTags.forEach(tag => {
    if (priorityKeywords.some(keyword => 
      tag.toLowerCase().includes(keyword) || keyword.includes(tag.toLowerCase())
    )) {
      priority.push(tag);
    } else {
      regular.push(tag);
    }
  });
  
  // Return priority tags first, then regular tags, up to maxTags
  return [...priority, ...regular].slice(0, maxTags);
}

/**
 * Validates and sanitizes OG image parameters
 */
export function sanitizeOGParams(params: OGImageParams): OGImageParams {
  return {
    title: params.title?.slice(0, 100), // Limit title length
    description: params.description?.slice(0, 200), // Limit description length
    type: ['website', 'project', 'article'].includes(params.type || '') 
      ? params.type as 'website' | 'project' | 'article'
      : 'website',
    tags: extractRelevantTags(params.tags || []),
    baseUrl: params.baseUrl
  };
}

/**
 * Pre-defined OG image configurations for common pages
 */
export const ogImageConfigs = {
  homepage: {
    title: 'SpyberPolymath | Aman Anil',
    description: 'Cybersecurity Researcher & Ethical Hacker',
    type: 'website' as const,
    tags: ['cybersecurity', 'ethical-hacking', 'research']
  },
  projects: {
    title: 'Cybersecurity Projects',
    description: 'Explore cutting-edge security tools and research',
    type: 'website' as const,
    tags: ['projects', 'cybersecurity', 'tools', 'research']
  },
  expertise: {
    title: 'Cybersecurity Expertise',
    description: 'Professional skills in security and ethical hacking',
    type: 'website' as const,
    tags: ['expertise', 'skills', 'cybersecurity', 'professional']
  },
  contact: {
    title: 'Contact Me',
    description: 'Get in touch for cybersecurity consulting',
    type: 'website' as const,
    tags: ['contact', 'consulting', 'services']
  },
  journey: {
    title: 'My Journey',
    description: 'Professional development in cybersecurity',
    type: 'website' as const,
    tags: ['journey', 'career', 'experience', 'growth']
  }
};

/**
 * Generates OG image URL for a specific page type
 */
export function getPageOGImage(pageType: keyof typeof ogImageConfigs): string {
  const config = ogImageConfigs[pageType];
  return generateOGImageUrl(config);
}

/**
 * Generates project-specific OG image URL
 */
export function getProjectOGImage(project: {
  title: string;
  description?: string;
  richDescription?: string;
  tags?: string[];
}): string {
  const description = project.richDescription || project.description || 'Cybersecurity project';
  
  // Extract text from HTML if richDescription contains HTML
  const plainTextDescription = description.replace(/<[^>]*>/g, '').slice(0, 200);
  
  return generateOGImageUrl({
    title: project.title,
    description: plainTextDescription,
    type: 'project',
    tags: project.tags || []
  });
}