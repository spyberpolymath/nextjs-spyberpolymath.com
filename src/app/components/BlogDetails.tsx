'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaCalendar, FaUser, FaTag, FaArrowLeft, FaFacebook, FaLinkedin, FaClock, FaNewspaper, FaDownload } from 'react-icons/fa';
import { FacebookShareButton, LinkedinShareButton } from 'react-share';

export interface BlogPost {
    id: string;
    _id?: string;
    title: string;
    slug: string;
    excerpt: string;
    richDescription?: string;
    author: string;
    date: string;
    category: string;
    categorySlug: string;
    image?: string;
    featured?: boolean;
    tags?: string[];
    views?: number;
    readTime?: number;
    status?: string;
    projectId?: string; // Reference to associated project for download
}

interface BlogDetailsProps {
    post: BlogPost;
    relatedPosts: BlogPost[];
}

export default function BlogDetails({ post, relatedPosts }: BlogDetailsProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [url, setUrl] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
    const [hasProjectAccess, setHasProjectAccess] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setUrl(window.location.href);

        // Check if user has access to download the associated project
        if (post.projectId) {
            checkProjectAccess();
        }
    }, [post.projectId]);

    const checkProjectAccess = async () => {
        if (!post.projectId) return;

        setCheckingAccess(true);
        try {
            const response = await fetch(`/api/projects/download-zip?projectId=${post.projectId}`, {
                method: 'HEAD' // Use HEAD to check access without downloading
            });
            setHasProjectAccess(response.ok);
        } catch (error) {
            setHasProjectAccess(false);
        } finally {
            setCheckingAccess(false);
        }
    };

    // Calculate reading time from richDescription, stripping HTML tags
    const stripHtml = (html: string) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };
    
    const contentText = stripHtml(post.richDescription || '');
    const readingTime = Math.ceil((contentText.trim().split(/\s+/).filter(Boolean).length || 0) / 200);

    const handleShare = (platform: string) => {
        const url = window.location.href;
        const title = post.title;
        let shareUrl = '';

        switch (platform) {
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this blog post: ${url}`)}`;
                break;
            default:
                return;
        }

        if (platform === 'email') {
            window.location.href = shareUrl;
        } else {
            window.open(shareUrl, '_blank', 'noopener,noreferrer');
        }
    };

    // keyboard support for share buttons
    const handleShareKeyDown = (e: React.KeyboardEvent, platform: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleShare(platform);
        }
    };

    return (
        <div className="min-h-screen pt-20 md:pt-24 lg:pt-28" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
            {/* Hero Section with Background Image */}
            <div className="relative h-96 overflow-hidden">
                {post.image ? (
                    <>
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            decoding="async"
                            style={{ filter: 'brightness(0.3)' }}
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, #121212)' }}></div>
                    </>
                ) : (
                    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #232323, #121212)' }}></div>
                )}

                {/* Back Button Overlay */}
                <div className="absolute top-6 left-6">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border hover:border-[#00FFC6] transition-all"
                        style={{ backgroundColor: 'rgba(18, 18, 18, 0.8)', borderColor: '#232323', color: '#b0f5e6' }}
                    >
                        <FaArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back</span>
                    </Link>
                </div>

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 pb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wide"
                            style={{ backgroundColor: '#00FFC6', color: '#121212' }}>
                            {post.category}
                        </span>
                        {post.featured && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border"
                                style={{ backgroundColor: 'rgba(35, 35, 35, 0.6)', borderColor: '#00FFC6', color: '#b0f5e6' }}>
                                Featured
                            </span>
                        )}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r bg-clip-text text-transparent leading-tight"
                        style={{ backgroundImage: 'linear-gradient(to right, #00FFC6, #E0E0E0)' }}>
                        {post.title}
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-12 p-4 rounded-2xl border backdrop-blur-md"
                    style={{ backgroundColor: 'rgba(24, 26, 27, 0.8)', borderColor: '#232323' }}>
                    <div className="flex flex-wrap gap-4 text-sm" style={{ color: '#b0f5e6' }}>
                        <div className="flex items-center gap-2">
                            <FaCalendar className="w-4 h-4" style={{ color: '#00FFC6' }} />
                            <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaUser className="w-4 h-4" style={{ color: '#00FFC6' }} />
                            <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaClock className="w-4 h-4" style={{ color: '#00FFC6' }} />
                            <span>{readingTime} min read</span>
                        </div>
                        {post.projectId && (
                            <div className="flex items-center gap-2">
                                {checkingAccess ? (
                                    <div className="flex items-center gap-2 text-sm" style={{ color: '#b0f5e6' }}>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: '#00FFC6' }}></div>
                                        <span>Checking access...</span>
                                    </div>
                                ) : hasProjectAccess ? (
                                    <Link
                                        href={`/download-project?projectId=${post.projectId}`}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium hover:scale-105 transition-all"
                                        style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                                    >
                                        <FaDownload className="w-4 h-4" />
                                        <span>Download Project</span>
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm" style={{ color: '#b0f5e6' }}>
                                        <FaDownload className="w-4 h-4" style={{ color: '#00FFC6' }} />
                                        <span>Project Available</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => handleShare('linkedin')}
                            onKeyDown={(e) => handleShareKeyDown(e, 'linkedin')}
                            aria-label="Share on LinkedIn"
                            className="p-2.5 rounded-lg border hover:border-[#00FFC6] hover:scale-110 transition-all"
                            style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}>
                            <span className="text-sm font-bold">in</span>
                        </button>
                        <button onClick={() => handleShare('email')}
                            onKeyDown={(e) => handleShareKeyDown(e, 'email')}
                            aria-label="Share via Email"
                            className="p-2.5 rounded-lg border hover:border-[#00FFC6] hover:scale-110 transition-all"
                            style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}>
                            <FaFacebook className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6" style={{ backgroundColor: '#232323' }}></div>
                        <FacebookShareButton url={url} title={post.title}>
                            <FaFacebook className="hover:scale-110 transition-all cursor-pointer" size={20} style={{ color: '#00FFC6' }} />
                        </FacebookShareButton>
                        <LinkedinShareButton url={url} title={post.title}>
                            <FaLinkedin className="hover:scale-110 transition-all cursor-pointer" size={20} style={{ color: '#00FFC6' }} />
                        </LinkedinShareButton>
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pb-20">
                    {/* Related Articles Sidebar */}
                    {relatedPosts.length > 0 && (
                        <div className="lg:col-span-2 space-y-6">
                            <div className="sticky top-6 rounded-2xl border overflow-hidden"
                                style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                                <div className="h-2" style={{ background: 'linear-gradient(to right, #00FFC6, #232323)' }}></div>
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                                            <FaNewspaper className="w-6 h-6" style={{ color: '#00FFC6' }} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg" style={{ color: '#00FFC6' }}>More Articles</h3>
                                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Related content</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {relatedPosts.slice(0, 4).map((relatedPost, index) => (
                                            <Link
                                                key={relatedPost.id}
                                                href={`/blog/${relatedPost.slug}`}
                                                className="block group"
                                            >
                                                <div className="rounded-xl border overflow-hidden hover:border-[#00FFC6] transition-all"
                                                    style={{ backgroundColor: '#121212', borderColor: '#232323' }}>
                                                    <div className="h-32 overflow-hidden relative">
                                                        {relatedPost.image ? (
                                                            <Image
                                                                src={relatedPost.image}
                                                                alt={relatedPost.title}
                                                                fill
                                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                                <span className="text-gray-500 text-xs">No image</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4">
                                                        <div className="flex items-center text-xs mb-2" style={{ color: '#b0f5e6' }}>
                                                            <FaCalendar className="mr-1" style={{ color: '#00FFC6' }} />
                                                            {relatedPost.date}
                                                        </div>
                                                        <h4 className="text-sm font-semibold mb-2 line-clamp-2 group-hover:text-[#00FFC6] transition-colors" style={{ color: '#E0E0E0' }}>
                                                            {relatedPost.title}
                                                        </h4>
                                                        <p className="text-xs line-clamp-2" style={{ color: '#b0f5e6' }}>
                                                            {relatedPost.excerpt}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Article */}
                    <div className={`${relatedPosts.length > 0 ? 'lg:col-span-3' : 'lg:col-span-5'} space-y-8`}>
                        {/* Tab Navigation */}
                        <div className="flex gap-2 p-1 rounded-xl border" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                            <button onClick={() => setActiveTab('overview')}
                                className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${activeTab === 'overview' ? 'scale-105' : ''}`}
                                style={{
                                    backgroundColor: activeTab === 'overview' ? '#00FFC6' : 'transparent',
                                    color: activeTab === 'overview' ? '#121212' : '#b0f5e6'
                                }}>
                                Overview
                            </button>
                            <button onClick={() => setActiveTab('details')}
                                className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${activeTab === 'details' ? 'scale-105' : ''}`}
                                style={{
                                    backgroundColor: activeTab === 'details' ? '#00FFC6' : 'transparent',
                                    color: activeTab === 'details' ? '#121212' : '#b0f5e6'
                                }}>
                                Full Details
                            </button>
                        </div>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Description Card */}
                                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                                    <div className="p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#00FFC6' }}></div>
                                            <h2 className="text-2xl font-black" style={{ color: '#00FFC6' }}>Article Overview</h2>
                                        </div>
                                        <div className="space-y-4 text-base leading-relaxed" style={{ color: '#E0E0E0' }}>
                                            <p>{post.excerpt}</p>
                                            <p>
                                                This article explores {post.category.toLowerCase()} topics and provides valuable insights
                                                into modern cybersecurity practices. Written by {post.author}, this piece offers
                                                practical knowledge and actionable advice for staying secure in today's digital landscape.
                                            </p>
                                            {post.tags && post.tags.length > 0 && (
                                                <p>
                                                    The discussion covers key concepts including {post.tags.slice(0, -1).join(', ')}
                                                    {post.tags.length > 1 && ` and ${post.tags[post.tags.length - 1]}`}
                                                    to deliver comprehensive guidance on cybersecurity best practices.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tags Grid */}
                                {post.tags && post.tags.length > 0 && (
                                    <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                                        <div className="p-8">
                                            <div className="flex items-center gap-3 mb-6">
                                                <FaTag className="w-5 h-5" style={{ color: '#00FFC6' }} />
                                                <h3 className="text-xl font-black" style={{ color: '#00FFC6' }}>Topics Covered</h3>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {post.tags.map((tag: string, index: number) => (
                                                    <div key={index}
                                                        className="px-4 py-3 rounded-xl border text-center font-semibold text-sm hover:border-[#00FFC6] transition-all"
                                                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#b0f5e6' }}>
                                                        #{tag}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Article Stats */}
                                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                                    <div className="p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <FaNewspaper className="w-5 h-5" style={{ color: '#00FFC6' }} />
                                            <h3 className="text-xl font-black" style={{ color: '#00FFC6' }}>Article Information</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-2" style={{ color: '#00FFC6' }}>Category</label>
                                                <p style={{ color: '#E0E0E0' }}>
                                                    {post.category}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-2" style={{ color: '#00FFC6' }}>Reading Time</label>
                                                <p style={{ color: '#E0E0E0' }}>
                                                    {readingTime} minutes
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-2" style={{ color: '#00FFC6' }}>Author</label>
                                                <p style={{ color: '#E0E0E0' }}>
                                                    {post.author}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Details Tab */}
                        {activeTab === 'details' && post.richDescription && (
                            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#00FFC6' }}></div>
                                        <h2 className="text-2xl font-black" style={{ color: '#00FFC6' }}>
                                            Complete Article: {post.title}
                                        </h2>
                                    </div>
                                    <div className="rich-text-content text-base leading-relaxed" style={{ color: '#E0E0E0' }}
                                        dangerouslySetInnerHTML={{ __html: post.richDescription }} />
                                </div>
                            </div>
                        )}

                        {/* About the Author */}
                        <div className="relative rounded-2xl p-8 mb-8 border overflow-hidden" style={{ backgroundColor: '#121212', borderColor: '#232323' }}>
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full translate-y-12 -translate-x-12" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}></div>

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                    {/* Author Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#00FFC6' }}>
                                            <FaUser className="text-2xl" style={{ color: '#121212' }} />
                                        </div>
                                    </div>

                                    {/* Author Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-xl font-bold" style={{ color: '#E0E0E0' }}>About the Author</h3>
                                            <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#00FFC6', color: '#121212' }}>
                                                <FaTag className="mr-1" />
                                                Cybersecurity Expert
                                            </div>
                                        </div>

                                        <h4 className="text-lg font-semibold mb-2" style={{ color: '#E0E0E0' }}>{post.author}</h4>

                                        <p className="leading-relaxed" style={{ color: '#b0f5e6' }}>
                                            {post.author} is a cybersecurity expert with extensive experience in threat detection and response.
                                            Passionate about sharing knowledge to help organizations stay secure in an evolving digital landscape.
                                        </p>

                                        {/* Author stats */}
                                        <div className="flex items-center gap-4 mt-4">
                                            <div className="flex items-center text-sm" style={{ color: '#b0f5e6' }}>
                                                <FaCalendar className="mr-1" style={{ color: '#00FFC6' }} />
                                                {post.date}
                                            </div>
                                            <div className="flex items-center text-sm" style={{ color: '#b0f5e6' }}>
                                                <FaClock className="mr-1" style={{ color: '#00FFC6' }} />
                                                {readingTime} min read
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Post Actions */}
                        <div className="flex flex-wrap items-center justify-between pt-6 border-t" style={{ borderColor: '#232323' }}>
                            <div className="flex space-x-4 mb-4 md:mb-0">
                                <div className="flex items-center space-x-2">
                                    <span style={{ color: '#E0E0E0' }}>Share:</span>
                                    <FacebookShareButton url={url} title={post.title}>
                                        <FaFacebook className="hover:scale-110 transition-all cursor-pointer" size={24} style={{ color: '#00FFC6' }} />
                                    </FacebookShareButton>
                                    <LinkedinShareButton url={url} title={post.title}>
                                        <FaLinkedin className="hover:scale-110 transition-all cursor-pointer" size={24} style={{ color: '#00FFC6' }} />
                                    </LinkedinShareButton>
                                </div>
                            </div>

                            <div className="text-sm" style={{ color: '#b0f5e6' }}>
                                Category: <Link href={`/blog?category=${post.categorySlug}`} className="hover:scale-105 transition-all" style={{ color: '#00FFC6' }}>{post.category}</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}