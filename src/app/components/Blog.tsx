'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { FaSearch, FaShieldAlt, FaNewspaper, FaTag, FaUser, FaRobot, FaBuilding, FaCloud, FaHome, FaArrowRight, FaFilter, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

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
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  count: number;
  description?: string;
}

// Fetch blog posts from API
async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch('/api/blog/posts');
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Fetch categories from API
async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch('/api/blog/categories');
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Fetched categories:', data); // Debug log
    return data.map((cat: any) => ({
      id: cat.slug || cat._id,
      _id: cat._id,
      name: cat.name,
      slug: cat.slug || cat._id,
      count: cat.count || 0,
      description: cat.description
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Get category icon helper function
const getCategoryIcon = (categorySlug: string) => {
  switch (categorySlug) {
    case 'ai-security':
      return <FaRobot className="w-4 h-4" />;
    case 'threats':
      return <FaShieldAlt className="w-4 h-4" />;
    case 'architecture':
      return <FaBuilding className="w-4 h-4" />;
    case 'cloud-security':
      return <FaCloud className="w-4 h-4" />;
    case 'remote-work':
      return <FaHome className="w-4 h-4" />;
    default:
      return <FaTag className="w-4 h-4" />;
  }
};

export default function BlogPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Fetch data
    const loadData = async () => {
      try {
        const [fetchedPosts, fetchedCategories] = await Promise.all([
          fetchBlogPosts(),
          fetchCategories()
        ]);
        setPosts(fetchedPosts);
        setCategories(fetchedCategories);
        console.log('Categories set in state:', fetchedCategories); // Debug log

        // Check for URL parameters after data is loaded
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
          setSelectedCategory(categoryParam);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedAuthor('');
    setSelectedTag('');
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = selectedCategory === '' || post.categorySlug === selectedCategory;
      const matchesAuthor = selectedAuthor === '' || post.author === selectedAuthor;
      const matchesTag = selectedTag === '' || (post.tags && post.tags.includes(selectedTag));
      const matchesSearch = searchTerm === '' ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

      return matchesCategory && matchesAuthor && matchesTag && matchesSearch;
    });
  }, [posts, searchTerm, selectedCategory, selectedAuthor, selectedTag]);

  return (
    <div className="min-h-screen pt-20" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
      {/* Hero Section with Stats Overlay */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#181A1B' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #00FFC6 0%, transparent 50%), radial-gradient(circle at 80% 80%, #00FFC6 0%, transparent 50%)',
            filter: 'blur(100px)'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: '#232323', border: '1px solid #00FFC6' }}>
                <FaNewspaper className="w-4 h-4" style={{ color: '#00FFC6' }} />
                <span className="text-sm font-semibold" style={{ color: '#00FFC6' }}>Knowledge Hub</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r bg-clip-text text-transparent leading-tight"
                style={{ backgroundImage: 'linear-gradient(to right, #00FFC6, #E0E0E0)' }}>
                Blog
              </h1>
              <p className="text-lg md:text-xl max-w-2xl" style={{ color: '#b0f5e6' }}>
                Exploring cybersecurity insights, AI breakthroughs, and emerging technology trends
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: FaNewspaper, value: posts.length, label: 'Articles', color: '#00FFC6' },
                { icon: FaTag, value: categories.length, label: 'Categories', color: '#00FFC6' },
                { icon: FaUser, value: new Set(posts.map(p => p.author)).size, label: 'Authors', color: '#00FFC6' },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="relative group">
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                      style={{ backgroundColor: stat.color }}></div>
                    <div className="relative backdrop-blur-sm border rounded-2xl p-6 w-36 text-center transition-all duration-300 group-hover:-translate-y-1"
                      style={{ backgroundColor: '#121212', borderColor: '#232323' }}>
                      <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: stat.color }} />
                      <div className="text-3xl font-black mb-1" style={{ color: stat.color }}>
                        {stat.value}
                      </div>
                      <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#b0f5e6' }}>
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search and Filter Bar */}
        <div className="sticky top-4 z-40 mb-12">
          <div className="backdrop-blur-xl border rounded-2xl p-4 shadow-2xl"
            style={{ backgroundColor: 'rgba(24, 26, 27, 0.95)', borderColor: '#232323' }}>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#00FFC6' }} />
                <label className="sr-only" htmlFor="blog-search">Search blog posts</label>
                <input
                  id="blog-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search articles, topics, or keywords..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 transition-all"
                  style={{
                    backgroundColor: '#121212',
                    borderColor: '#232323',
                    color: '#E0E0E0'
                  }}
                />
              </div>

              {/* Filter Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border hover:border-[#00FFC6] transition-all"
                  style={{
                    backgroundColor: showFilters ? '#00FFC6' : '#121212',
                    borderColor: showFilters ? '#00FFC6' : '#232323',
                    color: showFilters ? '#121212' : '#00FFC6'
                  }}
                >
                  <FaFilter className="w-5 h-5" />
                  <span className="hidden sm:inline">Filters</span>
                  {(selectedCategory || selectedAuthor || selectedTag) && (
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: showFilters ? '#121212' : '#00FFC6' }}></span>
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t flex flex-wrap gap-4" style={{ borderColor: '#232323' }}>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                    Category Filter
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 transition-all"
                    style={{
                      backgroundColor: '#121212',
                      borderColor: '#232323',
                      color: '#E0E0E0'
                    }}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name} ({posts.filter(p => p.categorySlug === category.slug).length})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                    Author Filter
                  </label>
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 transition-all"
                    style={{
                      backgroundColor: '#121212',
                      borderColor: '#232323',
                      color: '#E0E0E0'
                    }}
                  >
                    <option value="">All Authors</option>
                    {Array.from(new Set(posts.map(p => p.author))).map((author) => {
                      const count = posts.filter(p => p.author === author).length;
                      return (
                        <option key={author} value={author}>
                          {author} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                    Tag Filter
                  </label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 transition-all"
                    style={{
                      backgroundColor: '#121212',
                      borderColor: '#232323',
                      color: '#E0E0E0'
                    }}
                  >
                    <option value="">All Tags</option>
                    {Array.from(new Set(posts.flatMap(p => p.tags || []))).filter(Boolean).map((tag) => {
                      const count = posts.filter(p => p.tags?.includes(tag)).length;
                      return (
                        <option key={tag} value={tag}>
                          {tag} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {(searchTerm || selectedCategory || selectedAuthor || selectedTag) && (
                  <div className="flex items-end">
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-red-500 transition-all"
                      style={{
                        backgroundColor: '#121212',
                        borderColor: '#232323',
                        color: '#ff4444'
                      }}
                    >
                      <FaTimes className="w-4 h-4" />
                      <span className="font-semibold">Clear All</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Active Filters Display */}
            {(searchTerm || selectedCategory || selectedAuthor || selectedTag) && !showFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#232323', color: '#00FFC6' }}>
                    Search: {searchTerm}
                    <button aria-label="Clear search" onClick={() => setSearchTerm('')}>
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#232323', color: '#00FFC6' }}>
                    {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                    <button aria-label="Clear category filter" onClick={() => setSelectedCategory('')}>
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedAuthor && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#232323', color: '#00FFC6' }}>
                    {selectedAuthor}
                    <button aria-label="Clear author filter" onClick={() => setSelectedAuthor('')}>
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedTag && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#232323', color: '#00FFC6' }}>
                    {selectedTag}
                    <button aria-label="Clear tag filter" onClick={() => setSelectedTag('')}>
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Blog Posts Display */}
        <div>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin w-16 h-16 mb-6 rounded-full" style={{ border: '4px solid #232323', borderTopColor: '#00FFC6' }}></div>
              <p className="text-xl font-semibold" style={{ color: '#b0f5e6' }}>Loading blog posts...</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: '#b0f5e6' }}>
                  Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                </p>
              </div>
              <BlogComponent
                posts={filteredPosts}
                selectedCategory={selectedCategory}
                selectedAuthor={selectedAuthor}
                selectedTag={selectedTag}
                searchTerm={searchTerm}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Blog Component (previously in separate file)
interface BlogProps {
  posts: BlogPost[];
  selectedCategory?: string;
  selectedAuthor?: string;
  selectedTag?: string;
  searchTerm?: string;
}

function BlogComponent({ posts, selectedCategory = '', selectedAuthor = '', selectedTag = '', searchTerm = '' }: BlogProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sort posts with featured posts first
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin w-16 h-16 mb-6 rounded-full" style={{ border: '4px solid #232323', borderTopColor: '#00FFC6' }}></div>
        <p className="text-xl font-semibold" style={{ color: '#b0f5e6' }}>Loading blog posts...</p>
      </div>
    );
  }

  return (
    <div>
      {sortedPosts.length === 0 ? (
        <div className="text-center py-20 backdrop-blur-sm border rounded-2xl" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
            <FaSearch className="w-10 h-10" style={{ color: '#00FFC6' }} />
          </div>
          <h3 className="text-3xl font-bold mb-3" style={{ color: '#E0E0E0' }}>No Blog Posts Available</h3>
          <p className="text-lg" style={{ color: '#b0f5e6' }}>Blog posts will be displayed here once they are published.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedPosts.map((post, index) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <div className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer">
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ backgroundColor: '#00FFC6' }}></div>

                {/* Card Content */}
                <div className="relative backdrop-blur-sm border rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(24, 26, 27, 0.95)', borderColor: '#232323' }}>
                  {/* Featured Badge */}
                  {post.featured && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#00FFC6', color: '#121212' }}>
                        FEATURED
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category & Date */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)', color: '#00FFC6' }}>
                        {post.category}
                      </span>
                      <span className="text-xs" style={{ color: '#757575' }}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-[#00FFC6] transition-colors duration-300" style={{ color: '#E0E0E0' }}>
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm mb-4 line-clamp-3" style={{ color: '#b0f5e6' }}>
                      {post.excerpt}
                    </p>

                    {/* Author & Read More */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#232323' }}>
                          <FaUser className="w-3 h-3" style={{ color: '#00FFC6' }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: '#b0f5e6' }}>
                          {post.author}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-300"
                        style={{ color: '#00FFC6' }}>
                        Read More
                        <FaArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}