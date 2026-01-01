import { MetadataRoute } from 'next'
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import BlogPost from '@/models/BlogPost';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://spyberpolymath.com';
  
  try {
    await connectToDatabase();
    const projects = await Project.find({}, 'slug updatedAt');
    const blogPosts = await BlogPost.find({ status: 'published' }, 'slug date');

    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/expertise`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/journey`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/newsletter`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/projects`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ];

    const projectRoutes: MetadataRoute.Sitemap = projects.map((project: { slug: string; updatedAt?: Date }) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      lastModified: project.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post: { slug: string; date?: Date }) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.date || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...projectRoutes, ...blogRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static routes if database connection fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/expertise`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/journey`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/newsletter`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/projects`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ];
  }
}