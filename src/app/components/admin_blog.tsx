'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
    FaNewspaper,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSave,
    FaTimes,
    FaSearch,
    FaFilter,
    FaStar,
    FaImage,
    FaUpload,
    FaCheck,
    FaExclamationTriangle,
    FaChevronDown,
    FaChevronUp,
    FaTh,
    FaList,
    FaArchive,
    FaClock,
    FaChartBar,
    FaExclamationCircle,
    FaCheckCircle,
    FaSpinner
} from 'react-icons/fa';
import RichTextEditor from './RichTextEditor';

// API functions
const API_BASE_URL = '/api/admin/blog';

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

interface BlogPost {
    _id: any;
    id: string;
    title: string;
    excerpt: string;
    content: string;
    richDescription?: string;
    author: string;
    date: string;
    category: string;
    categorySlug: string;
    image: string;
    slug: string;
    featured?: boolean;
    status: 'draft' | 'published' | 'archived';
    tags?: string[];
    views?: number;
    readTime?: number;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
}

interface BlogFormData {
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    tags: string;
    image: string;
    author: string;
    date: string;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    richDescription: string;
}

interface ImageUpload {
    file: File | null;
    preview: string;
}

interface FormErrors {
    title?: string;
    slug?: string;
    excerpt?: string;
    category?: string;
    richDescription?: string;
    author?: string;
}

interface Notification {
    message: string;
    type: 'success' | 'error';
}

// Static category data
const defaultCategories: Category[] = [
    { id: '1', name: 'AI Security', slug: 'ai-security', count: 0 },
    { id: '2', name: 'Threats', slug: 'threats', count: 0 },
    { id: '3', name: 'Architecture', slug: 'architecture', count: 0 },
    { id: '4', name: 'Cloud Security', slug: 'cloud-security', count: 0 },
    { id: '5', name: 'Remote Work', slug: 'remote-work', count: 0 },
];

export default function AdminBlog() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [notification, setNotification] = useState<Notification | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [expandedFilters, setExpandedFilters] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');
    const [isClient, setIsClient] = useState(false);

    const [formData, setFormData] = useState<BlogFormData>({
        title: '',
        slug: '',
        excerpt: '',
        category: '',
        tags: '',
        image: '',
        author: '',
        date: new Date().toISOString().split('T')[0],
        status: 'draft',
        featured: false,
        richDescription: '',
    });

    const [imageUpload, setImageUpload] = useState<ImageUpload>({
        file: null,
        preview: ''
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [editorHtml, setEditorHtml] = useState<string>('');
    const [showTagsGrid, setShowTagsGrid] = useState(false);
    const [tagsGridRows, setTagsGridRows] = useState<Array<{ tag: string }>>([]);
    const isMountedRef = useRef(false);

    // Set isClient to true after component mounts
    useEffect(() => {
        setIsClient(true);
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (isClient) {
            fetchPostsData();
            setCategories(defaultCategories);
        }
    }, [isClient]);

    useEffect(() => {
        if (isClient) {
            filterPosts();
        }
    }, [posts, searchTerm, selectedCategory, activeTab, isClient]);

    // Sync editor HTML to formData.richDescription
    useEffect(() => {
        if (isClient && isMountedRef.current) {
            setFormData(prev => ({ ...prev, richDescription: editorHtml || '' }));
        }
    }, [editorHtml, isClient]);

    // Sync tagsGridRows to formData.tags
    useEffect(() => {
        if (isClient && showTagsGrid) {
            const tagsString = tagsGridRows
                .map(row => row.tag.trim())
                .filter(Boolean)
                .join(', ');
            setFormData(prev => ({ ...prev, tags: tagsString }));
        }
    }, [tagsGridRows, showTagsGrid, isClient]);

    const fetchPostsData = async () => {
        if (!isMountedRef.current) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    const allPosts = data.map(post => ({
                        ...post,
                        id: post._id || post.id
                    }));
                    if (isMountedRef.current) {
                        setPosts(allPosts);
                    }
                }
            } else {
                throw new Error('Failed to fetch posts');
            }
        } catch (error) {
            if (isMountedRef.current) {
                showNotification('Failed to fetch posts', 'error');
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    };

    const filterPosts = useCallback(() => {
        if (!isMountedRef.current) return;

        let filtered = [...posts];

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.author.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(p => p.categorySlug === selectedCategory);
        }

        if (activeTab === 'published') {
            filtered = filtered.filter(p => p.status === 'published');
        } else if (activeTab === 'draft') {
            filtered = filtered.filter(p => p.status === 'draft');
        }

        if (isMountedRef.current) {
            setFilteredPosts(filtered);
        }
    }, [posts, searchTerm, selectedCategory, activeTab]);

    const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        if (!isMountedRef.current) return;

        setNotification({ message, type });
        setTimeout(() => {
            if (isMountedRef.current) {
                setNotification(null);
            }
        }, 3000);
    }, []);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .trim(); // Remove leading/trailing spaces
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!isMountedRef.current) return;

        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;
        const checked = target.checked;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue,
            ...(name === 'title' && !editingPost ? { slug: generateSlug(value) } : {})
        }));

        if (formErrors[name as keyof FormErrors]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isMountedRef.current) return;

        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select a valid image file', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image size should be less than 5MB', 'error');
            return;
        }

        // Create preview only, don't convert to base64
        const reader = new FileReader();
        reader.onload = () => {
            if (isMountedRef.current && typeof reader.result === 'string') {
                setImageUpload({
                    file,
                    preview: reader.result
                });
                // Don't set formData.image here - we'll upload to Cloudinary later
            }
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        if (!isMountedRef.current) return;

        setImageUpload({
            file: null,
            preview: ''
        });
        setFormData(prev => ({ ...prev, image: '' }));
    };

    const validateForm = () => {
        const errors: FormErrors = {};

        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.slug.trim()) errors.slug = 'Slug is required';
        if (!formData.excerpt.trim()) errors.excerpt = 'Excerpt is required';
        if (!formData.category) errors.category = 'Category is required';
        if (!formData.richDescription.trim() || formData.richDescription === '<p></p>\n') {
            errors.richDescription = 'Rich Description is required';
        }
        if (!formData.author.trim()) errors.author = 'Author is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isMountedRef.current) return;

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Remove image from postData since we'll handle it separately
            const { image, ...postDataWithoutImage } = {
                ...formData,
                richDescription: formData.richDescription,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            let postId: string;
            let updatedPost: any;

            if (editingPost) {
                postId = editingPost._id ? String(editingPost._id) : editingPost.id ? String(editingPost.id) : '';
                const response = await fetch(`${API_BASE_URL}/${postId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(postDataWithoutImage)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Failed to update post' }));
                    throw new Error(errorData.error || 'Failed to update post');
                }
                updatedPost = await response.json();
                showNotification('Post updated successfully');
            } else {
                const response = await fetch(`${API_BASE_URL}`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(postDataWithoutImage)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Failed to create post' }));
                    throw new Error(errorData.error || 'Failed to create post');
                }
                updatedPost = await response.json();
                postId = updatedPost._id || updatedPost.id;
                showNotification('Post created successfully');
            }

            // Upload image if one was selected
            if (imageUpload.file && postId) {
                try {
                    const formData = new FormData();
                    formData.append('file', imageUpload.file);
                    formData.append('id', postId);

                    const imageResponse = await fetch('/api/blog/image', {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: formData
                    });

                    if (!imageResponse.ok) {
                        console.warn('Failed to upload image, but post was saved');
                    }
                } catch (imageError) {
                    console.warn('Image upload failed:', imageError);
                }
            }

            if (isMountedRef.current) {
                setShowModal(false);
                resetForm();
                fetchPostsData();
            }
        } catch (error) {
            showNotification('Operation failed. Please try again.', 'error');
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    };

    const handleEdit = (post: BlogPost) => {
        if (!isMountedRef.current) return;

        setEditingPost(post);
        setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            category: post.categorySlug,
            tags: post.tags?.join(', ') || '',
            image: post.image || '',
            author: post.author,
            date: post.date,
            status: post.status,
            featured: post.featured || false,
            richDescription: post.richDescription || post.content || '',
        });

        // Initialize rich editor from richDescription or content
        try {
            const html = post.richDescription || post.content || '';
            setEditorHtml(html);
        } catch (err) {
            setEditorHtml('');
        }

        // Initialize tags grid rows
        setTagsGridRows((post.tags || []).map(t => ({ tag: t })));

        // Set image preview if post has image
        if (post.image) {
            setImageUpload({
                file: null,
                preview: post.image.startsWith('data:image/') || post.image.startsWith('https://')
                    ? post.image
                    : `data:image/jpeg;base64,${post.image}`
            });
        } else {
            setImageUpload({
                file: null,
                preview: ''
            });
        }

        setShowModal(true);
    };

    const handleDelete = (id: string) => {
        if (!id || !isMountedRef.current) return;
        if (!confirm('Are you sure you want to delete this post?')) return;

        setIsLoading(true);
        (async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/${id}`, { 
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });

                if (!response.ok) throw new Error('Failed to delete post');
                if (isMountedRef.current) {
                    showNotification('Post deleted successfully');
                    fetchPostsData();
                }
            } catch {
                if (isMountedRef.current) {
                    showNotification('Failed to delete post', 'error');
                }
            } finally {
                if (isMountedRef.current) {
                    setIsLoading(false);
                }
            }
        })();
    };

    const resetForm = () => {
        if (!isMountedRef.current) return;

        setFormData({
            title: '',
            slug: '',
            excerpt: '',
            category: '',
            tags: '',
            image: '',
            author: '',
            date: new Date().toISOString().split('T')[0],
            status: 'draft',
            featured: false,
            richDescription: '',
        });
        setImageUpload({
            file: null,
            preview: ''
        });
        setFormErrors({});
        setEditingPost(null);
        setEditorHtml('');
        setShowTagsGrid(false);
        setTagsGridRows([]);
    };

    const handleCloseModal = () => {
        if (!isMountedRef.current) return;

        setShowModal(false);
        resetForm();
    };

    // Safe wrapper for editor HTML change
    const handleEditorHtmlChange = (html: string) => {
        if (isMountedRef.current) {
            setEditorHtml(html);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryColor = (categorySlug: string) => {
        switch (categorySlug) {
            case 'ai-security': return 'bg-blue-100 text-blue-800';
            case 'threats': return 'bg-red-100 text-red-800';
            case 'architecture': return 'bg-purple-100 text-purple-800';
            case 'cloud-security': return 'bg-green-100 text-green-800';
            case 'remote-work': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Don't render anything until client-side hydration is complete
    if (!isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
                <FaSpinner className="w-8 h-8 animate-spin" style={{ color: '#00FFC6' }} />
            </div>
        );
    }

    const publishedPosts = posts.filter(p => p.status === 'published').length;
    const draftPosts = posts.filter(p => p.status === 'draft').length;

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)', borderColor: '#232323' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <FaNewspaper className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#00FFC6' }} />
                            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#E0E0E0' }}>Blog Management</h1>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="p-2 rounded-lg transition-colors"
                                style={{ backgroundColor: '#121212', color: '#757575' }}
                                title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
                            >
                                {viewMode === 'grid' ? <FaList className="w-4 h-4" /> : <FaTh className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 touch-manipulation text-sm sm:text-base"
                                style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                            >
                                <FaPlus className="w-4 h-4 inline mr-2" />
                                Create Post
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 left-4 sm:left-auto sm:right-6 z-50 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg border ${notification.type === 'error' ? 'border-red-500' : 'border-[#00FFC6]'}`} style={{
                    backgroundColor: '#181A1B',
                    color: notification.type === 'error' ? '#ff4444' : '#00FFC6'
                }}>
                    {notification.type === 'error' ? <FaExclamationCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> : <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
                    <span className="text-sm sm:text-base flex-1 min-w-0">{notification.message}</span>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="flex items-center justify-between mb-2">
                            <FaChartBar className="w-3 h-3 sm:w-5 sm:h-5" style={{ color: '#7ED321' }} />
                        </div>
                        <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ color: '#E0E0E0' }}>{posts.length}</h3>
                        <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Total Posts</p>
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="flex items-center justify-between mb-2">
                            <FaCheck className="w-3 h-3 sm:w-5 sm:h-5" style={{ color: '#00FFC6' }} />
                        </div>
                        <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ color: '#E0E0E0' }}>{publishedPosts}</h3>
                        <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Published</p>
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="flex items-center justify-between mb-2">
                            <FaExclamationTriangle className="w-3 h-3 sm:w-5 sm:h-5" style={{ color: '#757575' }} />
                        </div>
                        <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ color: '#E0E0E0' }}>{draftPosts}</h3>
                        <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Draft</p>
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl border col-span-2 lg:col-span-1" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="flex items-center justify-between mb-2">
                            <FaClock className="w-3 h-3 sm:w-5 sm:h-5" style={{ color: '#00FFC6' }} />
                        </div>
                        <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ color: '#E0E0E0' }}>{filteredPosts.length}</h3>
                        <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Filtered Results</p>
                    </div>
                </div>

                {/* Tabs and Filters */}
                <div className="p-3 sm:p-4 rounded-xl border mb-4 sm:mb-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                    <div className="flex flex-col space-y-4">
                        <div className="flex space-x-1 p-1 rounded-lg overflow-x-auto" style={{ backgroundColor: '#121212' }}>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'all' ? 'bg-[#00FFC6] text-[#121212]' : 'text-[#757575] hover:text-[#E0E0E0]'}`}
                            >
                                All Posts
                            </button>
                            <button
                                onClick={() => setActiveTab('published')}
                                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'published' ? 'bg-[#00FFC6] text-[#121212]' : 'text-[#757575] hover:text-[#E0E0E0]'}`}
                            >
                                Published
                            </button>
                            <button
                                onClick={() => setActiveTab('draft')}
                                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'draft' ? 'bg-[#00FFC6] text-[#121212]' : 'text-[#757575] hover:text-[#E0E0E0]'}`}
                            >
                                Draft
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-3 text-[#757575]" />
                                    <input
                                        type="text"
                                        placeholder="Search posts..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#00FFC6] focus:border-[#00FFC6] text-sm"
                                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setExpandedFilters(!expandedFilters)}
                                    className="px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                >
                                    <FaFilter className="w-4 h-4 inline mr-2" />
                                    Filters
                                    {expandedFilters ? <FaChevronUp className="w-4 h-4 inline ml-2" /> : <FaChevronDown className="w-4 h-4 inline ml-2" />}
                                </button>
                            </div>
                        </div>

                        {expandedFilters && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: '#232323' }}>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#E0E0E0' }}>Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-[#00FFC6] focus:border-[#00FFC6] text-sm"
                                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.slug}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Posts Display */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-12 sm:py-20">
                        <FaSpinner className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" style={{ color: '#00FFC6' }} />
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-20 rounded-xl border" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <FaArchive className="w-12 h-12 sm:w-16 sm:h-16 mb-4 opacity-30" style={{ color: '#00FFC6' }} />
                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-center" style={{ color: '#E0E0E0' }}>No posts found</h3>
                        <p className="text-xs sm:text-sm mb-4 sm:mb-6 text-center max-w-md px-4" style={{ color: '#757575' }}>
                            {posts.length === 0 ? 'Get started by creating your first blog post.' : 'Try adjusting your search or filters.'}
                        </p>
                        {posts.length === 0 && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 touch-manipulation text-sm sm:text-base"
                                style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                            >
                                <FaPlus className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                                Create Post
                            </button>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredPosts.map((post) => (
                            <div
                                key={post.id}
                                className="rounded-xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                                style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}
                            >
                                <div className="aspect-video relative overflow-hidden">
                                    <Image
                                        src={post.image || '/placeholder-image.jpg'}
                                        alt={post.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                                            {post.status}
                                        </span>
                                    </div>
                                    {post.featured && (
                                        <div className="absolute top-2 left-2">
                                            <FaStar className="w-5 h-5 text-yellow-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-2 line-clamp-2" style={{ color: '#E0E0E0' }}>{post.title}</h3>
                                    <p className="text-sm mb-3 line-clamp-3" style={{ color: '#757575' }}>{post.excerpt}</p>
                                    <div className="flex items-center justify-between text-xs mb-3" style={{ color: '#757575' }}>
                                        <span>{post.author}</span>
                                        <span>{formatDate(post.date)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(post.categorySlug)}`}>
                                            {post.category}
                                        </span>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(post)}
                                                className="p-2 rounded-lg transition-colors"
                                                style={{ backgroundColor: '#121212', color: '#757575' }}
                                                title="Edit"
                                            >
                                                <FaEdit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 rounded-lg transition-colors"
                                                style={{ backgroundColor: '#121212', color: '#757575' }}
                                                title="Delete"
                                            >
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y" style={{ borderColor: '#232323' }}>
                                <thead style={{ backgroundColor: '#121212' }}>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#757575' }}>Post</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#757575' }}>Author</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#757575' }}>Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#757575' }}>Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#757575' }}>Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#757575' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: '#232323' }}>
                                    {filteredPosts.map((post) => (
                                        <tr key={post.id} className="hover" style={{ backgroundColor: '#181A1B' }}>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        <Image
                                                            className="h-12 w-12 rounded-lg object-cover"
                                                            src={post.image || '/placeholder-image.jpg'}
                                                            alt={post.title}
                                                            width={48}
                                                            height={48}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium" style={{ color: '#E0E0E0' }}>{post.title}</div>
                                                        <div className="text-sm" style={{ color: '#757575' }}>{post.views || 0} views</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: '#E0E0E0' }}>{post.author}</td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(post.categorySlug)}`}>
                                                    {post.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(post.status)}`}>
                                                    {post.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: '#757575' }}>{formatDate(post.date)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(post)}
                                                        className="p-2 rounded-lg transition-colors"
                                                        style={{ backgroundColor: '#121212', color: '#757575' }}
                                                        title="Edit"
                                                    >
                                                        <FaEdit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="p-2 rounded-lg transition-colors"
                                                        style={{ backgroundColor: '#121212', color: '#757575' }}
                                                        title="Delete"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b backdrop-blur-sm" style={{ backgroundColor: 'rgba(24, 26, 27, 0.95)', borderColor: '#232323' }}>
                            <h2 className="text-lg sm:text-xl font-bold pr-4" style={{ color: '#E0E0E0' }}>
                                {editingPost ? 'Edit Post' : 'Create New Post'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 rounded-lg transition-colors touch-manipulation flex-shrink-0"
                                style={{ backgroundColor: '#121212', color: '#757575' }}
                            >
                                <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#E0E0E0' }}>Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#00FFC6] focus:border-[#00FFC6] text-sm ${formErrors.title ? 'border-red-500' : ''}`}
                                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                        placeholder="Enter post title"
                                    />
                                    {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#E0E0E0' }}>Slug *</label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#00FFC6] focus:border-[#00FFC6] text-sm ${formErrors.slug ? 'border-red-500' : ''}`}
                                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                        placeholder="post-slug"
                                    />
                                    {formErrors.slug && <p className="text-red-500 text-xs mt-1">{formErrors.slug}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#E0E0E0' }}>Excerpt *</label>
                                <textarea
                                    name="excerpt"
                                    value={formData.excerpt}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#00FFC6] focus:border-[#00FFC6] text-sm ${formErrors.excerpt ? 'border-red-500' : ''}`}
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                    placeholder="Brief description of the post"
                                />
                                {formErrors.excerpt && <p className="text-red-500 text-xs mt-1">{formErrors.excerpt}</p>}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#E0E0E0' }}>Category *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#00FFC6] focus:border-[#00FFC6] text-sm ${formErrors.category ? 'border-red-500' : ''}`}
                                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.slug}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#E0E0E0' }}>Author *</label>
                                    <input
                                        type="text"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#00FFC6] focus:border-[#00FFC6] text-sm ${formErrors.author ? 'border-red-500' : ''}`}
                                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                        placeholder="Author name"
                                    />
                                    {formErrors.author && <p className="text-red-500 text-xs mt-1">{formErrors.author}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#E0E0E0' }}>Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#00FFC6] focus:border-[#00FFC6] text-sm"
                                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#E0E0E0' }}>Publication Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#00FFC6] focus:border-[#00FFC6] text-sm"
                                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#E0E0E0' }}>Tags</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#00FFC6] focus:border-[#00FFC6] text-sm"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                    placeholder="tag1, tag2, tag3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#E0E0E0' }}>Featured Image</label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-24 h-24 bg-[#121212] rounded-lg overflow-hidden flex items-center justify-center border" style={{ borderColor: '#232323' }}>
                                        {imageUpload.preview ? (
                                            <Image
                                                src={imageUpload.preview}
                                                alt="Preview"
                                                width={96}
                                                height={96}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <FaImage className="text-[#757575] text-2xl" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="px-4 py-2 bg-[#121212] border border-[#232323] rounded-lg cursor-pointer hover:bg-[#232323] flex items-center justify-center transition-colors text-sm" style={{ color: '#E0E0E0' }}>
                                            <FaUpload className="mr-2" />
                                            Upload Image
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                        {imageUpload.preview && (
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="mt-2 text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove Image
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#E0E0E0' }}>Rich Description *</label>
                                <RichTextEditor
                                    value={editorHtml}
                                    onChange={handleEditorHtmlChange}
                                    placeholder="Write your blog post content here..."
                                />
                                {formErrors.richDescription && <p className="text-red-500 text-xs mt-1">{formErrors.richDescription}</p>}
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                <label htmlFor="featured" className="text-sm" style={{ color: '#E0E0E0' }}>
                                    Mark as featured post
                                </label>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4 border-t" style={{ borderColor: '#232323' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-[#232323] rounded-lg transition-colors text-sm"
                                    style={{ backgroundColor: '#121212', color: '#E0E0E0' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm disabled:opacity-50"
                                    style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                                >
                                    {isLoading ? <FaSpinner className="w-4 h-4 animate-spin inline mr-2" /> : <FaSave className="w-4 h-4 inline mr-2" />}
                                    {editingPost ? 'Update Post' : 'Create Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}