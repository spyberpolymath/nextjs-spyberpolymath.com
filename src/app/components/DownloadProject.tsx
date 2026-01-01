'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaDownload, FaEnvelope, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';

interface Project {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    isPaid: boolean;
    zipUrl?: string;
}

export default function DownloadProjectPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get('projectId');

    const [email, setEmail] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (projectId) {
            // If projectId is provided, pre-select it
            fetchProjectDetails(projectId);
        }
    }, [projectId]);

    const fetchProjectDetails = async (id: string) => {
        try {
            const response = await fetch(`/api/projects/${id}`);
            if (response.ok) {
                const project = await response.json();
                setSelectedProject(project);
            }
        } catch (error) {
            console.error('Failed to fetch project details:', error);
        }
    };

    const handleEmailVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsVerifying(true);
        setError('');

        try {
            const response = await fetch('/api/user/projects-by-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim() }),
            });

            if (response.ok) {
                const data = await response.json();
                setProjects(data.projects || []);
                setIsVerified(true);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to verify email');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDownload = async (project: Project) => {
        setIsDownloading(true);
        setError('');

        try {
            const response = await fetch(`/api/projects/download-zip?projectId=${project._id}&email=${encodeURIComponent(email)}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-project.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to download project');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    const resetVerification = () => {
        setIsVerified(false);
        setProjects([]);
        setSelectedProject(null);
        setEmail('');
        setError('');
    };

    return (
        <div className="min-h-screen pt-20 md:pt-24 lg:pt-28" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
            <div className="max-w-2xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border hover:border-[#00FFC6] transition-all mb-6"
                        style={{ backgroundColor: 'rgba(18, 18, 18, 0.8)', borderColor: '#232323', color: '#b0f5e6' }}
                    >
                        <FaArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Blog</span>
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r bg-clip-text text-transparent"
                        style={{ backgroundImage: 'linear-gradient(to right, #00FFC6, #E0E0E0)' }}>
                        Download Project
                    </h1>
                    <p className="text-lg" style={{ color: '#b0f5e6' }}>
                        Enter your email to access your purchased projects
                    </p>
                </div>

                {/* Email Verification Form */}
                {!isVerified && (
                    <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border p-8 mb-8"
                        style={{ borderColor: '#232323' }}>
                        <form onSubmit={handleEmailVerification} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#E0E0E0' }}>
                                    Email Address
                                </label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#00FFC6' }} />
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border focus:border-[#00FFC6] focus:ring-1 focus:ring-[#00FFC6] transition-all"
                                        style={{
                                            backgroundColor: '#121212',
                                            borderColor: '#232323',
                                            color: '#E0E0E0'
                                        }}
                                        placeholder="Enter your email address"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-sm">
                                    <FaTimes className="w-4 h-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isVerifying}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                                style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                            >
                                {isVerifying ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#121212]"></div>
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaCheck className="w-5 h-5" />
                                        <span>Verify Email</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Projects List */}
                {isVerified && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold" style={{ color: '#00FFC6' }}>
                                Your Projects ({projects.length})
                            </h2>
                            <button
                                onClick={resetVerification}
                                className="text-sm px-3 py-1 rounded-full border hover:border-[#00FFC6] transition-all"
                                style={{ borderColor: '#232323', color: '#b0f5e6' }}
                            >
                                Change Email
                            </button>
                        </div>

                        {projects.length === 0 ? (
                            <div className="text-center py-12">
                                <FaDownload className="w-16 h-16 mx-auto mb-4" style={{ color: '#232323' }} />
                                <h3 className="text-xl font-semibold mb-2" style={{ color: '#E0E0E0' }}>No Projects Found</h3>
                                <p className="mb-6" style={{ color: '#b0f5e6' }}>
                                    No projects were found for {email}
                                </p>
                                <Link
                                    href="/projects"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium hover:scale-105 transition-all"
                                    style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                                >
                                    <FaDownload className="w-4 h-4" />
                                    <span>Browse Projects</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {projects.map((project) => (
                                    <div
                                        key={project._id}
                                        className="bg-gray-900/50 backdrop-blur-md rounded-xl border p-6 hover:border-[#00FFC6] transition-all"
                                        style={{ borderColor: '#232323' }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold mb-2" style={{ color: '#E0E0E0' }}>
                                                    {project.title}
                                                </h3>
                                                <p className="text-sm mb-4" style={{ color: '#b0f5e6' }}>
                                                    {project.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span style={{ color: '#00FFC6' }}>
                                                        ₹{project.price}
                                                    </span>
                                                    {project.isPaid && (
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium"
                                                            style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)', color: '#00FFC6' }}>
                                                            Purchased
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(project)}
                                                disabled={isDownloading}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ml-4"
                                                style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                                            >
                                                {isDownloading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#121212]"></div>
                                                        <span>Downloading...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaDownload className="w-4 h-4" />
                                                        <span>Download</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
                                <FaTimes className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Pre-selected Project Info */}
                {selectedProject && !isVerified && (
                    <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border p-6"
                        style={{ borderColor: '#232323' }}>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#00FFC6' }}>
                            Requested Project
                        </h3>
                        <p className="text-sm" style={{ color: '#E0E0E0' }}>
                            {selectedProject.title}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#b0f5e6' }}>
                            Please verify your email above to download this project
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}