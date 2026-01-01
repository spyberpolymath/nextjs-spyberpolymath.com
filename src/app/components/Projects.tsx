'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Folder, Code, Github, X, Layers, Filter, Grid, List, Share } from 'lucide-react';
import Link from 'next/link';
import { FaKaggle, FaLinkedin } from 'react-icons/fa';

interface Project {
    id?: string | number;
    _id?: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    tags: string[];
    image?: string;
    github?: string;
    demo?: string;
    kaggle?: string;
    linkedin?: string;
    demo2?: string;
    published: boolean;
    created_at?: string;
    updated_at?: string;
}

interface ProjectsProps {
    initialProjects?: Project[];
    categories?: Record<string, string>;
}

export default function Projects({ initialProjects = [], categories = {} }: ProjectsProps) {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedTechnology, setSelectedTechnology] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasInitialized, setHasInitialized] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Fetch projects from /api/projects on mount if initialProjects is empty
    useEffect(() => {
        if (!hasInitialized && initialProjects.length === 0) {
            setHasInitialized(true);
            setIsLoading(true);

            const fetchWithTimeout = async () => {
                try {
                    const apiUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/projects` : '/api/projects';

                    const timeoutId = setTimeout(() => {
                        if (hasInitialized) {
                            setError('Request timed out');
                            setIsLoading(false);
                        }
                    }, 10000);

                    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                    const response = await fetch(apiUrl, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Cache-Control': 'max-age=3600',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        },
                        cache: 'force-cache',
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new Error(`Failed to fetch projects: ${response.status}`);
                    }

                    const data = await response.json();

                    let projectsData: Project[] = [];
                    try {
                        if (Array.isArray(data)) {
                            projectsData = data;
                        } else if (Array.isArray(data.results)) {
                            projectsData = data.results;
                        } else if (Array.isArray(data.projects)) {
                            projectsData = data.projects;
                        } else if (data && typeof data === 'object') {
                            const maybeProject = (data as any);
                            if (maybeProject.title && maybeProject.slug) projectsData = [maybeProject];
                        }
                    } catch (e) {
                        console.error('Error normalizing projects response', e, data);
                    }

                    console.debug('Projects fetch result shape:', {
                        raw: data,
                        normalizedCount: projectsData.length
                    });

                    setProjects(projectsData);
                    setIsLoading(false);
                } catch (err) {
                    console.error('Error fetching projects:', err);
                    setError('Failed to load projects');
                    setIsLoading(false);
                }
            };

            fetchWithTimeout();
        } else if (initialProjects.length > 0) {
            setHasInitialized(true);
        }
    }, [initialProjects, hasInitialized]);

    const allTechnologies = useMemo(() => {
        const techSet = new Set<string>();
        projects.forEach(project => {
            project.tags?.forEach((tech: string) => techSet.add(tech));
        });
        return Array.from(techSet).sort();
    }, [projects]);

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = !searchTerm ||
                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = !selectedCategory || project.category === selectedCategory;

            const matchesTechnology = !selectedTechnology ||
                project.tags?.includes(selectedTechnology);

            return matchesSearch && matchesCategory && matchesTechnology;
        });
    }, [projects, searchTerm, selectedCategory, selectedTechnology]);

    const stats = useMemo(() => {
        return {
            total: projects.length,
            published: projects.length,
            categories: Object.keys(categories).length || new Set(projects.map(p => p.category)).size,
            openSource: projects.filter(p => p.github).length,
            kaggle: projects.filter(p => p.kaggle).length,
            tags: Array.from(new Set(projects.flatMap(p => p.tags ?? []))).length
        };
    }, [projects, categories]);

    const clearAllFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedTechnology('');
    }, []);

    const getCategoryName = useCallback((categoryKey: string) => {
        return categories[categoryKey] || categoryKey.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }, [categories]);

    const handleLinkClick = useCallback((e: React.MouseEvent, url: string) => {
        e.preventDefault();
        window.open(url, '_blank', 'noopener,noreferrer');
    }, []);

    // Open external URL programmatically (keyboard-safe)
    const openExternal = useCallback((url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    }, []);

    const handleActionKeyDown = useCallback((e: React.KeyboardEvent, url: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openExternal(url);
        }
    }, [openExternal]);

    // Keyboard handler to open internal project page
    const handleKeyOpen = useCallback((e: React.KeyboardEvent, slug: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = `/projects/${slug}`;
        }
    }, []);

    return (
        <div className="min-h-screen pt-20 md:pt-24 lg:pt-28" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
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
                                <Code className="w-4 h-4" style={{ color: '#00FFC6' }} />
                                <span className="text-sm font-semibold" style={{ color: '#00FFC6' }}>Portfolio Showcase</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r bg-clip-text text-transparent leading-tight"
                                style={{ backgroundImage: 'linear-gradient(to right, #00FFC6, #E0E0E0)' }}>
                                Projects
                            </h1>
                            <p className="text-lg md:text-xl max-w-2xl" style={{ color: '#b0f5e6' }}>
                                Building the future of privacy-first, ethical technology through innovative solutions
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            {[
                                { icon: Layers, value: stats.categories, label: 'Categories', color: '#00FFC6' },
                                { icon: Code, value: stats.tags, label: 'Tags', color: '#00FFC6' },
                                { icon: Folder, value: stats.total, label: 'Projects', color: '#00FFC6' },
                                { icon: Github, value: stats.openSource, label: 'Open Source', color: '#00FFC6' },
                                { icon: FaKaggle, value: stats.kaggle, label: 'Kaggle', color: '#00FFC6' },
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
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#00FFC6' }} />
                                <label className="sr-only" htmlFor="projects-search">Search projects</label>
                                <input
                                    id="projects-search"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search projects, technologies, or keywords..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 transition-all"
                                    style={{
                                        backgroundColor: '#121212',
                                        borderColor: '#232323',
                                        color: '#E0E0E0'
                                    }}
                                />
                            </div>

                            {/* Filter Toggle & View Mode */}
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
                                    <Filter className="w-5 h-5" />
                                    <span className="hidden sm:inline">Filters</span>
                                    {(selectedCategory || selectedTechnology) && (
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: showFilters ? '#121212' : '#00FFC6' }}></span>
                                    )}
                                </button>

                                <div className="flex border rounded-xl overflow-hidden" style={{ borderColor: '#232323' }}>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className="px-4 py-3 transition-all"
                                        aria-pressed={viewMode === 'grid'}
                                        style={{
                                            backgroundColor: viewMode === 'grid' ? '#00FFC6' : '#121212',
                                            color: viewMode === 'grid' ? '#121212' : '#E0E0E0'
                                        }}
                                    >
                                        <Grid className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className="px-4 py-3 transition-all"
                                        aria-pressed={viewMode === 'list'}
                                        style={{
                                            backgroundColor: viewMode === 'list' ? '#00FFC6' : '#121212',
                                            color: viewMode === 'list' ? '#121212' : '#E0E0E0'
                                        }}
                                    >
                                        <List className="w-5 h-5" />
                                    </button>
                                </div>
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
                                        {Object.entries(categories).map(([key, name]) => (
                                            <option key={key} value={key}>{name}</option>
                                        ))}
                                        {Object.keys(categories).length === 0 &&
                                            Array.from(new Set(projects.map(p => p.category))).map(category => (
                                                <option key={category} value={category}>
                                                    {getCategoryName(category)}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                        Technology Filter
                                    </label>
                                    <select
                                        value={selectedTechnology}
                                        onChange={(e) => setSelectedTechnology(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 transition-all"
                                        style={{
                                            backgroundColor: '#121212',
                                            borderColor: '#232323',
                                            color: '#E0E0E0'
                                        }}
                                    >
                                        <option value="">All Technologies</option>
                                        {allTechnologies.map(tech => (
                                            <option key={tech} value={tech}>{tech}</option>
                                        ))}
                                    </select>
                                </div>

                                {(searchTerm || selectedCategory || selectedTechnology) && (
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
                                            <X className="w-4 h-4" />
                                            <span className="font-semibold">Clear All</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Active Filters Display */}
                        {(searchTerm || selectedCategory || selectedTechnology) && !showFilters && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {searchTerm && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#232323', color: '#00FFC6' }}>
                                        Search: {searchTerm}
                                        <button aria-label="Clear search" onClick={() => setSearchTerm('')}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {selectedCategory && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#232323', color: '#00FFC6' }}>
                                        {getCategoryName(selectedCategory)}
                                        <button aria-label="Clear category filter" onClick={() => setSelectedCategory('')}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {selectedTechnology && (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#232323', color: '#00FFC6' }}>
                                        {selectedTechnology}
                                        <button aria-label="Clear technology filter" onClick={() => setSelectedTechnology('')}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Projects Display */}
                <div>
                    {error ? (
                        <div className="text-center py-20 backdrop-blur-sm border rounded-2xl" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)' }}>
                                <X className="w-10 h-10" style={{ color: '#ff4444' }} />
                            </div>
                            <h3 className="text-3xl font-bold mb-3" style={{ color: '#ff4444' }}>Error Loading Projects</h3>
                            <p className="text-lg mb-6" style={{ color: '#b0f5e6' }}>{error}</p>
                            <button
                                onClick={() => {
                                    setError(null);
                                    setHasInitialized(false);
                                }}
                                className="px-6 py-3 rounded-lg border hover:border-[#00FFC6] transition-all font-semibold"
                                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#00FFC6' }}
                            >
                                Try Again
                            </button>
                        </div>
                    ) : isLoading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin w-16 h-16 mb-6 rounded-full" style={{ border: '4px solid #232323', borderTopColor: '#00FFC6' }}></div>
                            <p className="text-xl font-semibold" style={{ color: '#b0f5e6' }}>Loading projects from backend...</p>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        projects.length === 0 ? (
                            <div className="text-center py-20 backdrop-blur-sm border rounded-2xl" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                                    <Folder className="w-10 h-10" style={{ color: '#00FFC6' }} />
                                </div>
                                <h3 className="text-3xl font-bold mb-3" style={{ color: '#E0E0E0' }}>No Projects Available</h3>
                                <p className="text-lg" style={{ color: '#b0f5e6' }}>Projects will be displayed here once they are added to the backend.</p>
                            </div>
                        ) : (
                            <div className="text-center py-20 backdrop-blur-sm border rounded-2xl" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                                    <Search className="w-10 h-10" style={{ color: '#00FFC6' }} />
                                </div>
                                <h3 className="text-3xl font-bold mb-3" style={{ color: '#E0E0E0' }}>No projects found</h3>
                                <p className="text-lg mb-6" style={{ color: '#b0f5e6' }}>Try adjusting your search terms or filters</p>
                                <button
                                    onClick={clearAllFilters}
                                    className="px-6 py-3 rounded-lg border hover:border-[#00FFC6] transition-all font-semibold"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#00FFC6' }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )
                    ) : (
                        <>
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-sm font-semibold" style={{ color: '#b0f5e6' }}>
                                    Showing {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                                </p>
                            </div>

                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredProjects.map((project, index) => {
                                        return (
                                        <Link key={project._id || project.id || index} href={`/projects/${project.slug}`}>
                                            <div
                                                role="link"
                                                tabIndex={0}
                                                onKeyDown={(e) => handleKeyOpen(e, project.slug)}
                                                className="group relative h-full backdrop-blur-sm border rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                                                style={{
                                                    backgroundColor: '#181A1B',
                                                    borderColor: '#232323',
                                                    boxShadow: '0 4px 16px rgba(0, 255, 198, 0.05)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    (e.currentTarget as HTMLElement).style.borderColor = '#00FFC6';
                                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(0, 255, 198, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    (e.currentTarget as HTMLElement).style.borderColor = '#232323';
                                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0, 255, 198, 0.05)';
                                                }}>
                                                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                                                        style={{ backgroundColor: 'rgba(0, 255, 198, 0.9)', color: '#121212' }}>
                                                        {getCategoryName(project.category)}
                                                    </span>
                                                </div>

                                                <div className="relative w-full" style={{ backgroundColor: '#121212' }}>
                                                    {project.image ? (
                                                        <img
                                                            src={project.image.startsWith('data:image/') || project.image.startsWith('https://')
                                                                ? project.image
                                                                : `data:image/jpeg;base64,${project.image}`}
                                                            alt={project.title}
                                                            className="w-full group-hover:scale-105 transition-transform duration-500"
                                                            loading="lazy"
                                                            decoding="async"
                                                            style={{
                                                                display: 'block',
                                                                width: '100%',
                                                                height: 'auto',
                                                                maxHeight: '420px',
                                                                objectFit: 'contain'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-48 flex items-center justify-center">
                                                            <Code className="w-16 h-16 opacity-20" style={{ color: '#00FFC6' }} />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#181A1B] via-transparent to-transparent"></div>
                                                </div>

                                                <div className="p-6">
                                                    <h3 className="text-2xl font-bold mb-3 group-hover:text-[#00FFC6] transition-colors line-clamp-2"
                                                        style={{ color: '#E0E0E0' }}>
                                                        {project.title}
                                                    </h3>

                                                    {project.tags && project.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {project.tags.slice(0, 4).map((tag, idx) => (
                                                                <span key={idx} className="px-3 py-1 rounded-lg text-xs font-semibold border"
                                                                    style={{ backgroundColor: '#121212', color: '#00FFC6', borderColor: '#232323' }}>
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {project.tags.length > 4 && (
                                                                <span className="px-3 py-1 rounded-lg text-xs font-semibold"
                                                                    style={{ backgroundColor: '#232323', color: '#b0f5e6' }}>
                                                                    +{project.tags.length - 4}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap gap-2 mt-4">
                                                        {project.demo && (
                                                            <div
                                                                role="button"
                                                                tabIndex={0}
                                                                onKeyDown={(e) => handleActionKeyDown(e, project.demo!)}
                                                                onClick={(e) => handleLinkClick(e, project.demo!)}
                                                                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border hover:border-[#00FFC6] transition-all cursor-pointer"
                                                                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#b0f5e6' }}>
                                                                <Share className="w-4 h-4" />
                                                                <span>Demo</span>
                                                            </div>
                                                        )}
                                                        {project.demo2 && (
                                                            <div
                                                                role="button"
                                                                tabIndex={0}
                                                                onKeyDown={(e) => handleActionKeyDown(e, project.demo2!)}
                                                                onClick={(e) => handleLinkClick(e, project.demo2!)}
                                                                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border hover:border-[#00FFC6] transition-all cursor-pointer"
                                                                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#b0f5e6' }}>
                                                                <Share className="w-4 h-4" />
                                                                <span>Demo 2</span>
                                                            </div>
                                                        )}
                                                        {project.kaggle && (
                                                            <div
                                                                role="button"
                                                                tabIndex={0}
                                                                onKeyDown={(e) => handleActionKeyDown(e, project.kaggle!)}
                                                                onClick={(e) => handleLinkClick(e, project.kaggle!)}
                                                                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border hover:border-[#00FFC6] transition-all cursor-pointer"
                                                                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#b0f5e6' }}>
                                                                <FaKaggle className="w-4 h-4" />
                                                                <span>Kaggle</span>
                                                            </div>
                                                        )}
                                                        {project.linkedin && (
                                                            <div
                                                                role="button"
                                                                tabIndex={0}
                                                                onKeyDown={(e) => handleActionKeyDown(e, project.linkedin!)}
                                                                onClick={(e) => handleLinkClick(e, project.linkedin!)}
                                                                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border hover:border-[#00FFC6] transition-all cursor-pointer"
                                                                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#b0f5e6' }}>
                                                                <FaLinkedin className="w-4 h-4" />
                                                                <span>LinkedIn</span>
                                                            </div>
                                                        )}
                                                        {project.github && (
                                                            <div
                                                                role="button"
                                                                tabIndex={0}
                                                                onKeyDown={(e) => handleActionKeyDown(e, project.github!)}
                                                                onClick={(e) => handleLinkClick(e, project.github!)}
                                                                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border hover:border-[#00FFC6] transition-all cursor-pointer"
                                                                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#b0f5e6' }}>
                                                                <Github className="w-4 h-4" />
                                                                <span>GitHub</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {filteredProjects.map((project, index) => (
                                        <Link key={project._id || project.id || index} href={`/projects/${project.slug}`}>
                                            <div className="group backdrop-blur-sm border rounded-2xl overflow-hidden hover:border-[#00FFC6] transition-all duration-300 cursor-pointer"
                                                style={{
                                                    backgroundColor: '#181A1B',
                                                    borderColor: '#232323'
                                                }}>
                                                <div className="flex flex-col md:flex-row">
                                                    <div className="md:w-72 flex-shrink-0 relative" style={{ backgroundColor: '#121212' }}>
                                                        {project.image ? (
                                                            <img
                                                                src={project.image.startsWith('data:image/') || project.image.startsWith('https://')
                                                                    ? project.image
                                                                    : `data:image/jpeg;base64,${project.image}`}
                                                                alt={project.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                loading="lazy"
                                                                decoding="async"
                                                                style={{ minHeight: '200px' }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full min-h-[200px] flex items-center justify-center">
                                                                <Code className="w-16 h-16 opacity-20" style={{ color: '#00FFC6' }} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 p-6">
                                                        <div className="flex items-start justify-between gap-4 mb-3">
                                                            <h3 className="text-2xl font-bold group-hover:text-[#00FFC6] transition-colors flex-1"
                                                                style={{ color: '#E0E0E0' }}>
                                                                {project.title}
                                                            </h3>
                                                            <div className="flex flex-col gap-2 items-end">
                                                                <span className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                                                                    style={{ backgroundColor: '#00FFC6', color: '#121212' }}>
                                                                    {getCategoryName(project.category)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <p className="text-sm mb-4 line-clamp-2" style={{ color: '#b0f5e6' }}>
                                                            {project.description}
                                                        </p>

                                                        {project.tags && project.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-4">
                                                                {project.tags.map((tag, idx) => (
                                                                    <span key={idx} className="px-3 py-1 rounded-lg text-xs font-semibold border"
                                                                        style={{ backgroundColor: '#121212', color: '#00FFC6', borderColor: '#232323' }}>
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap gap-3">
                                                            {project.github && (
                                                                <div
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    onKeyDown={(e) => handleActionKeyDown(e, project.github!)}
                                                                    onClick={(e) => handleLinkClick(e, project.github!)}
                                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border hover:border-[#00FFC6] transition-all cursor-pointer"
                                                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#b0f5e6' }}>
                                                                    <Github className="w-4 h-4" />
                                                                    <span>GitHub</span>
                                                                </div>
                                                            )}
                                                            {project.demo && (
                                                                <div
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    onKeyDown={(e) => handleActionKeyDown(e, project.demo!)}
                                                                    onClick={(e) => handleLinkClick(e, project.demo!)}
                                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border hover:border-[#00FFC6] transition-all cursor-pointer"
                                                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#b0f5e6' }}>
                                                                    <Share className="w-4 h-4" />
                                                                    <span>Live Demo</span>
                                                                </div>
                                                            )}
                                                            {project.kaggle && (
                                                                <div
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    onKeyDown={(e) => handleActionKeyDown(e, project.kaggle!)}
                                                                    onClick={(e) => handleLinkClick(e, project.kaggle!)}
                                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border hover:border-[#00FFC6] transition-all cursor-pointer"
                                                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#b0f5e6' }}>
                                                                    <FaKaggle className="w-4 h-4" />
                                                                    <span>Kaggle</span>
                                                                </div>
                                                            )}
                                                            {project.linkedin && (
                                                                <div
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    onKeyDown={(e) => handleActionKeyDown(e, project.linkedin!)}
                                                                    onClick={(e) => handleLinkClick(e, project.linkedin!)}
                                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border hover:border-[#00FFC6] transition-all cursor-pointer"
                                                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#b0f5e6' }}>
                                                                    <FaLinkedin className="w-4 h-4" />
                                                                    <span>LinkedIn</span>
                                                                </div>
                                                            )}
                                                            {project.demo2 && (
                                                                <div
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    onKeyDown={(e) => handleActionKeyDown(e, project.demo2!)}
                                                                    onClick={(e) => handleLinkClick(e, project.demo2!)}
                                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border hover:border-[#00FFC6] transition-all cursor-pointer"
                                                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#b0f5e6' }}>
                                                                    <Share className="w-4 h-4" />
                                                                    <span>Demo 2</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}