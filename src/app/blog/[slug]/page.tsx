import type { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';
import { fetchBlogPostBySlug } from '@/lib/blogUtils';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await fetchBlogPostBySlug(slug);

    if (!post) {
        return {
            title: 'Blog Post Not Found | SpyberPolymath',
            description: 'The blog post you are looking for does not exist.',
        };
    }

    return {
        title: `${post.title} | SpyberPolymath`,
        description: post.excerpt || post.richDescription?.replace(/<[^>]*>/g, '').slice(0, 200) || 'Cybersecurity blog post',
        keywords: post.tags?.join(', ') || 'cybersecurity, blog',
        openGraph: {
            title: post.title,
            description: post.excerpt || post.richDescription?.replace(/<[^>]*>/g, '').slice(0, 200) || 'Cybersecurity blog post',
            type: 'article',
            url: `https://spyberpolymath.com/blog/${post.slug}`,
            images: post.image ? [post.image] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || post.richDescription?.replace(/<[^>]*>/g, '').slice(0, 200) || 'Cybersecurity blog post',
            images: post.image ? [post.image] : [],
        },
        alternates: {
            canonical: `https://spyberpolymath.com/blog/${post.slug}`,
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <BlogPostClient slug={slug} />;
}