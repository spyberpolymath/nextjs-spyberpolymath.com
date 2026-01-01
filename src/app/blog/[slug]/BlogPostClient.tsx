'use client';

import { useState, useEffect } from 'react';
import BlogDetails from '@/app/components/BlogDetails';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { BlogPost, fetchBlogPostBySlug, fetchRelatedPosts } from '@/lib/blogUtils';

export default function BlogPostClient({ slug }: { slug: string }) {
    const [isMounted, setIsMounted] = useState(false);
    const [post, setPost] = useState<BlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setIsMounted(true);

        const loadPost = async () => {
            try {
                const foundPost = await fetchBlogPostBySlug(slug);
                if (foundPost) {
                    setPost(foundPost);
                    const related = await fetchRelatedPosts(foundPost.id, foundPost.categorySlug);
                    setRelatedPosts(related);

                    // Log blog visit if user is authenticated
                    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
                    if (token && foundPost.id) {
                        try {
                            await fetch('/api/blog/visits', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ blogId: foundPost.id })
                            });
                        } catch (visitError) {
                            console.error('Error logging blog visit:', visitError);
                            // Don't show error to user, just log it
                        }
                    }
                } else {
                    setError('Blog post not found');
                }
            } catch (err) {
                console.error('Error loading post:', err);
                setError('Failed to load blog post');
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [slug]);

    if (!isMounted || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#00FFC6' }}></div>
                    <p className="mt-4" style={{ color: '#b0f5e6' }}>Loading blog post...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
                <div className="text-center max-w-md">
                    <div className="mb-6">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)' }}>
                            <span className="text-2xl">😞</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-4" style={{ color: '#ff4444' }}>Blog Post Not Found</h1>
                    <p className="mb-6" style={{ color: '#b0f5e6' }}>The blog post you're looking for doesn't exist or has been removed.</p>
                    <Link
                        href="/blog"
                        className="inline-flex items-center px-6 py-3 font-medium rounded-lg hover:scale-105 transition-all"
                        style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
            {post && (
                <>
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "Article",
                                "headline": post.title,
                                "description": post.excerpt || post.richDescription?.replace(/<[^>]*>/g, '').slice(0, 200),
                                ...(post.image && { "image": post.image }),
                                "author": {
                                    "@type": "Person",
                                    "name": post.author
                                },
                                "publisher": {
                                    "@type": "Organization",
                                    "name": "SpyberPolymath",
                                    "logo": {
                                        "@type": "ImageObject",
                                        "url": "https://spyberpolymath.com/logo.png"
                                    }
                                },
                                "datePublished": new Date(post.date).toISOString(),
                                "dateModified": new Date(post.date).toISOString(),
                                "mainEntityOfPage": {
                                    "@type": "WebPage",
                                    "@id": `https://spyberpolymath.com/blog/${post.slug}`
                                },
                                "keywords": post.tags?.join(', ') || 'cybersecurity, blog'
                            })
                        }}
                    />
                </>
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {post && <BlogDetails post={post} relatedPosts={relatedPosts} />}
            </div>
        </div>
    );
}