import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProjectDetail from '@/app/components/ProjectDetail';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import type { IProject } from '@/models/Project';
import { generateMetadata as generateSEOMetadata, generateStructuredData, generateBreadcrumbStructuredData, type ArticleStructuredData } from '@/lib/seo';
import StructuredData from '@/app/components/StructuredData';

interface ProjectDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  try {
    // Next.js 15.5.4 requires params to be awaited for dynamic routes
    const awaitedParams = await Promise.resolve(params);
    await dbConnect();
    const project = await Project.findOne({ slug: awaitedParams.slug }).lean();
    if (!project || Array.isArray(project)) throw new Error('Not found');
    
    // Extract plain text description from rich content
    const plainDescription = (project.richDescription || project.description || '')
      .replace(/<[^>]*>/g, '')
      .slice(0, 200);
    
    return generateSEOMetadata({
      title: project.title,
      description: plainDescription,
      keywords: [
        ...project.tags,
        'cybersecurity project',
        'ethical hacking tool',
        'security software',
        'open source security',
        'penetration testing tool',
        'cybersecurity research'
      ],
      canonical: `/projects/${project.slug}`,
      type: 'article',
      tags: project.tags,
      publishedAt: project.createdAt?.toISOString(),
      modifiedAt: project.updatedAt?.toISOString(),
    });
  } catch (error: any) {
    // Build-time fallback handling
    if (error?.name === 'BuildTimeError' || error?.message === 'BUILD_TIME_API_UNAVAILABLE') {
      const awaitedParams = await Promise.resolve(params);
      const projectTitle = awaitedParams.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return generateSEOMetadata({
        title: projectTitle,
        description: `Explore ${projectTitle} by Aman Anil (SpyberPolymath): Cybersecurity project focusing on ethical hacking, penetration testing, and security research.`,
        keywords: [
          'cybersecurity project',
          'ethical hacking tool',
          'security software',
          awaitedParams.slug,
          'spyberpolymath',
          'Aman Anil'
        ],
        canonical: `/projects/${awaitedParams.slug}`,
        type: 'article'
      });
    }
    return generateSEOMetadata({
      title: 'Project Not Found',
      description: 'The requested cybersecurity project could not be found.',
      canonical: '/projects',
      noIndex: true
    });
  }
}

async function getProjectData(slug: string): Promise<{ project: any; relatedProjects: any[] } | null> {
  try {
    await dbConnect();
    const project = (await Project.findOne({ slug }).lean()) as unknown as IProject | null;
    if (!project) return null;

    // Serialize the project object
    const serializedProject: any = {
      ...project,
      _id: (project._id as import('mongodb').ObjectId).toString(),
      created_at: new Date(project.created_at),
      updated_at: new Date(project.updated_at),
    };

    const related = (await Project.find({ category: project.category, slug: { $ne: slug } })
      .sort({ created_at: -1 })
      .limit(3)
      .lean()) as unknown as IProject[];

    // Serialize related projects
    const serializedRelatedProjects: any[] = related.map((rel) => ({
      ...rel,
      _id: (rel._id as import('mongodb').ObjectId).toString(),
      created_at: new Date(rel.created_at),
      updated_at: new Date(rel.updated_at),
    }));

    return { project: serializedProject, relatedProjects: serializedRelatedProjects };
  } catch (error: any) {
    console.error('Error fetching project data from database:', error?.message || error);
    return null;
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  // Next.js 15.5.4 requires params to be awaited for dynamic routes
  const awaitedParams = await Promise.resolve(params);
  const projectData = await getProjectData(awaitedParams.slug);

  if (!projectData) {
    notFound();
  }

  const { project, relatedProjects } = projectData;

  // Generate structured data for the project
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: 'https://spyberpolymath.com/' },
    { name: 'Projects', url: 'https://spyberpolymath.com/projects' },
    { name: project.title || '', url: `https://spyberpolymath.com/projects/${project.slug}` }
  ]);

  const articleData = generateStructuredData('Article', {
    headline: project.title || '',
    description: project.richDescription || project.description || '',
    image: project.image || 'https://spyberpolymath.com/og-image.jpg',
    datePublished: project.created_at?.toISOString() || new Date().toISOString(),
    dateModified: project.updated_at?.toISOString(),
    mainEntityOfPage: `https://spyberpolymath.com/projects/${project.slug}`,
    articleSection: project.category,
    keywords: project.tags,
    publisher: {
      name: 'SpyberPolymath | Aman Anil',
      logo: {
        url: 'https://spyberpolymath.com/logo.jpg',
        width: 400,
        height: 400,
      },
    },
  });

  return (
    <>
      <StructuredData data={[breadcrumbData, articleData]} />
      <ProjectDetail
        project={project as any}
        relatedProjects={relatedProjects as any}
      />
    </>
  );
}