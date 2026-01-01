'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    FolderOpen,
    MessageSquare,
    Users,
    User,
    LogOut,
    Menu,
    X,
    Home,
    Loader,
    AlertCircle,
    CreditCard,
    Newspaper,
    FileText
} from 'lucide-react';
import { validateTokenStructure, clearInvalidToken } from '@/lib/tokenUtils';

interface SidebarItem {
    id: string;
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
    children?: SidebarItem[];
}

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [contactBadge, setContactBadge] = useState<number>(0);
    const [isClient, setIsClient] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isTablet, setIsTablet] = useState(false);
    const [newsletterBadge, setNewsletterBadge] = useState<number>(0);
    const [usersBadge, setUsersBadge] = useState<number>(0);
    const [paymentBadge, setPaymentBadge] = useState<number>(0);

    // Set isClient to true when component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Detect tablet screen size
    useEffect(() => {
        const checkTablet = () => {
            setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
        };

        checkTablet();
        window.addEventListener('resize', checkTablet);
        return () => window.removeEventListener('resize', checkTablet);
    }, []);

    const validateToken = useCallback(async (token: string) => {
        try {
            const response = await fetch('/api/validate-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.ok;
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    }, []);

    const waitForRoleAndToken = useCallback(async (timeoutMs = 1500) => {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const role = window.localStorage.getItem('role');
            const token = window.localStorage.getItem('token');
            if (role === 'admin' && token) return { role, token };
            if (token) return { role, token };
            await new Promise(r => setTimeout(r, 100));
        }
        return null;
    }, []);

    const checkAdminAccess = useCallback(async () => {
        // Don't run on server
        if (!isClient) return;

        // allow a short grace period for login flow to populate localStorage
        let userRole = window.localStorage.getItem('role');
        let token = window.localStorage.getItem('token');

        if (!token || userRole !== 'admin') {
            const waited = await waitForRoleAndToken(1500);
            if (waited) {
                userRole = waited.role;
                token = waited.token;
            }
        }

        if (token) {
            // Use the new token validation utility
            if (validateTokenStructure(token)) {
                // Fallback to server validation
                const isValidToken = await validateToken(token);
                if (isValidToken) {
                    setIsAdmin(true);
                    return;
                }
            }
            // Clear invalid token
            clearInvalidToken();
        }

        // Only redirect if we're certain there's no valid token
        // Add a small delay to prevent immediate redirect during navigation
        setTimeout(() => {
            setIsAdmin(false);
            // Store current URL for redirect after login
            if (typeof window !== 'undefined') {
                localStorage.setItem('redirectAfterLogin', pathname);
            }
            router.replace('/admin-auth');
        }, 200);
    }, [isClient, validateToken, waitForRoleAndToken, router]);

    useEffect(() => {
        checkAdminAccess();
    }, [checkAdminAccess]);

    // Fetch badge counts from backend
    const fetchBadges = useCallback(async () => {
        if (!isClient) return;

        try {
            // Build headers with token when available
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
            
            // Don't fetch if we don't have a token yet
            if (!token) {
                console.warn('No token available for fetching badges');
                return;
            }
            
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };

            // Contact messages
            const contactRes = await fetch('/api/contact', { headers });
            if (contactRes.ok) {
                const contactData = await contactRes.json();
                setContactBadge(Array.isArray(contactData) ? contactData.length : 0);
            } else {
                setContactBadge(0);
            }
        } catch (err) {
            console.error('Error fetching badge counts:', err);
            setContactBadge(0);
        }
    }, [isClient]);

    useEffect(() => {
        if (!isClient || !isAdmin) return;

        fetchBadges();

        // Real-time updates every 30 seconds
        const interval = setInterval(fetchBadges, 30000);
        return () => clearInterval(interval);
    }, [isClient, isAdmin, fetchBadges]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Prevent background scrolling when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
        // ensure restored when closed
        document.body.style.overflow = '';
        return () => { };
    }, [isMobileMenuOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMobileMenuOpen(false);
                setShowSearch(false);
                setShowNotifications(false);
            }
        };

        if (isMobileMenuOpen || showSearch || showNotifications) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isMobileMenuOpen, showSearch, showNotifications]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
                setIsSidebarOpen(true);
            } else if (window.innerWidth >= 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sidebarItems: SidebarItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            href: '/admin',
            icon: <LayoutDashboard className="w-5 h-5" />
        },
        {
            id: 'projects',
            label: 'Projects',
            href: '/admin/admin-project',
            icon: <FolderOpen className="w-5 h-5" />
        },
        {
            id: 'contacts',
            label: 'Contact',
            href: '/admin/admin-contact',
            icon: <MessageSquare className="w-5 h-5" />,
            badge: contactBadge
        },
        {
            id: 'newsletter',
            label: 'Newsletter',
            href: '/admin/admin-newsletter',
            icon: <Newspaper className="w-5 h-5" />,
            badge: newsletterBadge
        },
        {
            id: 'blog',
            label: 'Blog',
            href: '/admin/admin-blog',
            icon: <FileText className="w-5 h-5" />,
        },
        {
            id: 'users',
            label: 'Users',
            href: '/admin/admin-users',
            icon: <Users className="w-5 h-5" />,
            badge: usersBadge
        },
        {
            id: 'payments',
            label: 'Payments',
            href: '/admin/admin-payments',
            icon: <CreditCard className="w-5 h-5" />,
            badge: paymentBadge
        },
        {
            id: 'profile',
            label: 'Profile',
            href: '/admin/admin-profile',
            icon: <User className="w-5 h-5" />
        }
    ];

    const isActiveRoute = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        if (pathname === href) return true;
        if (pathname.startsWith(href + '/')) return true;
        return false;
    };

    // Stable logout: clear localStorage/session and redirect
    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem('role');
                window.localStorage.removeItem('token');
            }
            router.push('/');
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Don't render until client-side hydration is complete
    if (!isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121212' }}>
                <div className="flex flex-col items-center">
                    <Loader className="w-12 h-12 mb-4 text-[#00FFC6] animate-spin" />
                    <div style={{ color: '#E0E0E0' }}>Loading...</div>
                </div>
            </div>
        );
    }

    if (isAdmin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121212' }}>
                <div className="flex flex-col items-center">
                    <Loader className="w-12 h-12 mb-4 text-[#00FFC6] animate-spin" />
                    <div style={{ color: '#E0E0E0' }}>Checking admin access...</div>
                </div>
            </div>
        );
    }

    if (isAdmin === false) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121212' }}>
                <div className="flex flex-col items-center p-6 rounded-lg border" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                    <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#E0E0E0' }}>Access Denied</h2>
                    <p style={{ color: '#b0f5e6' }}>You are not authorized to access the admin panel. Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style jsx global>{`
                /* Custom Scrollbar Styles */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #0a0a0a;
                    border-radius: 10px;
                    margin: 4px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #00FFC6 0%, #00ccaa 100%);
                    border-radius: 10px;
                    border: 2px solid #0a0a0a;
                    transition: all 0.3s ease;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #00ffdd 0%, #00e6bb 100%);
                    border: 2px solid #121212;
                    box-shadow: 0 0 10px rgba(0, 255, 198, 0.5);
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:active {
                    background: linear-gradient(180deg, #00cc99 0%, #00aa88 100%);
                }

                /* Firefox Scrollbar */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #00FFC6 #0a0a0a;
                }

                /* Smooth scrolling */
                .custom-scrollbar {
                    scroll-behavior: smooth;
                }

                /* Prevent text selection on buttons */
                .no-select {
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                }

                /* Touch-friendly interactions */
                @media (hover: none) and (pointer: coarse) {
                    .touch-target {
                        min-height: 44px;
                        min-width: 44px;
                    }
                }

                /* Better mobile typography */
                @media (max-width: 640px) {
                    .mobile-text-sm {
                        font-size: 0.875rem;
                        line-height: 1.25rem;
                    }
                    .mobile-text-base {
                        font-size: 1rem;
                        line-height: 1.5rem;
                    }
                }

                /* Tablet optimizations */
                @media (min-width: 768px) and (max-width: 1023px) {
                    .tablet-sidebar {
                        width: 240px;
                    }
                    .tablet-margin {
                        margin-left: 240px;
                    }
                }

                /* High contrast mode support */
                @media (prefers-contrast: high) {
                    .high-contrast-border {
                        border-width: 2px;
                    }
                }

                /* Reduced motion support */
                @media (prefers-reduced-motion: reduce) {
                    .transition-all {
                        transition: none;
                    }
                    .animate-spin {
                        animation: none;
                    }
                }
            `}</style>

            <div className={`min-h-screen flex ${isMobileMenuOpen ? 'overflow-hidden' : ''}`} style={{ backgroundColor: '#121212' }}>
                {/* Sidebar - Desktop and Tablet */}
                <aside
                    className={`hidden md:flex flex-col transition-all duration-300 border-r fixed left-0 top-0 h-full z-30 ${isSidebarOpen ? (isTablet ? 'tablet-sidebar' : 'w-64') : 'w-16'
                        }`}
                    style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}
                >
                    {/* Sidebar Header */}
                    <div className="p-4 md:p-6 border-b high-contrast-border" style={{ borderColor: '#232323' }}>
                        <div className="flex items-center justify-between">
                            {isSidebarOpen && (
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-lg md:text-xl font-bold truncate mobile-text-base" style={{ color: '#E0E0E0' }}>
                                        Admin Panel
                                    </h1>
                                    <p className="text-xs mt-1 truncate mobile-text-sm" style={{ color: '#b0f5e6' }}>
                                        Portfolio Management
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-lg border transition-all duration-300 hover:scale-105 no-select touch-target flex-shrink-0 ml-2"
                                style={{ backgroundColor: '#121212', borderColor: '#232323' }}
                                aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                            >
                                {isSidebarOpen ? (
                                    <X className="w-4 h-4" style={{ color: '#00FFC6' }} />
                                ) : (
                                    <Menu className="w-4 h-4" style={{ color: '#00FFC6' }} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                        {sidebarItems.map((item) => (
                            <a
                                key={item.id}
                                href={item.href}
                                className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:scale-105 group no-select touch-target ${isActiveRoute(item.href) ? 'border high-contrast-border' : 'hover:border'
                                    }`}
                                style={{
                                    backgroundColor: isActiveRoute(item.href) ? 'rgba(0, 255, 198, 0.1)' : 'transparent',
                                    borderColor: isActiveRoute(item.href) ? 'rgba(0, 255, 198, 0.3)' : 'transparent',
                                    color: isActiveRoute(item.href) ? '#00FFC6' : '#E0E0E0'
                                }}
                            >
                                <div className="flex-shrink-0">
                                    {item.icon}
                                </div>
                                {isSidebarOpen && (
                                    <>
                                        <span className="ml-3 font-medium truncate mobile-text-sm">{item.label}</span>
                                        {item.badge && item.badge > 0 && (
                                            <span
                                                className="ml-auto px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0"
                                                style={{ backgroundColor: '#ff4444', color: '#fff' }}
                                            >
                                                {item.badge > 99 ? '99+' : item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </a>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t space-y-2 high-contrast-border" style={{ borderColor: '#232323' }}>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full flex items-center p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:border no-select touch-target"
                            style={{
                                color: '#757575',
                                borderColor: 'transparent'
                            }}
                            aria-label="Back to site"
                        >
                            <Home className="w-5 h-5 flex-shrink-0" />
                            {isSidebarOpen && <span className="ml-3 font-medium truncate mobile-text-sm">Back to Site</span>}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:border no-select touch-target"
                            style={{
                                color: '#ff4444',
                                borderColor: 'transparent'
                            }}
                            aria-label="Logout"
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {isSidebarOpen && <span className="ml-3 font-medium truncate mobile-text-sm">Logout</span>}
                        </button>
                    </div>
                </aside>

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-60"
                        onClick={toggleMobileMenu}
                        aria-label="Close mobile menu"
                    />
                )}

                {/* Mobile Sidebar */}
                <aside
                    className={`md:hidden fixed top-0 left-0 z-50 w-full h-full transform transition-transform duration-300 border-r ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}
                >
                    {/* Mobile Sidebar Header */}
                    <div className="p-4 md:p-6 border-b high-contrast-border" style={{ borderColor: '#232323' }}>
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg md:text-xl font-bold truncate mobile-text-base" style={{ color: '#E0E0E0' }}>
                                    Admin Panel
                                </h1>
                                <p className="text-xs mt-1 truncate mobile-text-sm" style={{ color: '#b0f5e6' }}>
                                    Portfolio Management
                                </p>
                            </div>
                            <button
                                onClick={toggleMobileMenu}
                                className="p-2 rounded-lg border transition-all duration-300 hover:scale-105 no-select touch-target flex-shrink-0 ml-2"
                                style={{ backgroundColor: '#121212', borderColor: '#232323' }}
                                aria-label="Close mobile menu"
                            >
                                <X className="w-4 h-4" style={{ color: '#00FFC6' }} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                        {sidebarItems.map((item) => (
                            <a
                                key={item.id}
                                href={item.href}
                                className={`flex items-center p-3 rounded-lg transition-all duration-300 hover:scale-105 group no-select touch-target ${isActiveRoute(item.href) ? 'border high-contrast-border' : 'hover:border'
                                    }`}
                                style={{
                                    backgroundColor: isActiveRoute(item.href) ? 'rgba(0, 255, 198, 0.1)' : 'transparent',
                                    borderColor: isActiveRoute(item.href) ? 'rgba(0, 255, 198, 0.3)' : 'transparent',
                                    color: isActiveRoute(item.href) ? '#00FFC6' : '#E0E0E0'
                                }}
                            >
                                <div className="flex-shrink-0">
                                    {item.icon}
                                </div>
                                <span className="ml-3 font-medium truncate mobile-text-sm">{item.label}</span>
                                {item.badge && item.badge > 0 && (
                                    <span
                                        className="ml-auto px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0"
                                        style={{ backgroundColor: '#ff4444', color: '#fff' }}
                                    >
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </a>
                        ))}
                    </nav>

                    {/* Mobile Sidebar Footer */}
                    <div className="p-4 border-t space-y-2 high-contrast-border" style={{ borderColor: '#232323' }}>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full flex items-center p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:border no-select touch-target"
                            style={{
                                color: '#757575',
                                borderColor: 'transparent'
                            }}
                            aria-label="Back to site"
                        >
                            <Home className="w-5 h-5 flex-shrink-0" />
                            <span className="ml-3 font-medium truncate mobile-text-sm">Back to Site</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:border no-select touch-target"
                            style={{
                                color: '#ff4444',
                                borderColor: 'transparent'
                            }}
                            aria-label="Logout"
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            <span className="ml-3 font-medium truncate mobile-text-sm">Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? (isTablet ? 'tablet-margin' : 'md:ml-64') : 'md:ml-16'
                    } ${isMobileMenuOpen ? 'pointer-events-none' : ''}`}>
                    {/* Top Header Bar */}
                    <header
                        className="sticky top-0 z-40 backdrop-blur-md border-b high-contrast-border"
                        style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)', borderColor: '#232323' }}
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-1">
                                    <button
                                        onClick={toggleMobileMenu}
                                        className="md:hidden p-2 rounded-lg border transition-all duration-300 hover:scale-105 no-select touch-target"
                                        style={{ backgroundColor: '#121212', borderColor: '#232323' }}
                                        aria-label="Open mobile menu"
                                    >
                                        <Menu className="w-5 h-5" style={{ color: '#00FFC6' }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto custom-scrollbar">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
};

export default AdminLayout;