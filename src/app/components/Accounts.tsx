'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaCalendar,
    FaMapMarkerAlt,
    FaGlobe,
    FaCity,
    FaBuilding,
    FaSave,
    FaEdit,
    FaLock,
    FaKey,
    FaQrcode,
    FaSignOutAlt,
    FaHistory,
    FaDesktop,
    FaMobile,
    FaTabletAlt,
    FaShieldAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaCopy,
    FaUserCircle,
    FaShieldVirus,
    FaNewspaper,
    FaClock,
    FaCreditCard,
    FaCheck,
    FaSearch,
    FaTags,
    FaTimes,
    FaSpinner,
    FaDownload,
    FaGithub,
    FaExternalLinkAlt,
    FaBan
} from 'react-icons/fa';

interface AccountData {
    name: string;
    email: string;
    phone: string;
    dob: string;
    address: {
        street: string;
        addressLine2: string;
        city: string;
        country: string;
        state: string;
        postalCode: string;
    };
    vatId: string;
}

interface LoginHistoryItem {
    id: string;
    ip: string;
    device: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    location: string;
    date: string;
    currentSession: boolean;
    loggedOut?: boolean;
}

interface PaymentHistoryItem {
    id: string;
    _id: string;
    invoiceId?: string;
    amount: number;
    currency: string;
    description: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
    method: string;
}

interface TwoFASettings {
    email: boolean;
    qrCode: boolean;
}

interface EmailPreferencesType {
    twoFANotifications: { enabled: boolean; frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' };
    accountChanges: { enabled: boolean; frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' };
    loginNotifications: { enabled: boolean; frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' };
    newsletter: { enabled: boolean; frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' };
}

interface BlogItem {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    category: string;
    categorySlug: string;
    slug: string;
    featured?: boolean;
    visitedAt?: string;
}

interface ProjectItem {
    id: string;
    title: string;
    description: string;
    category: string;
    slug: string;
    price?: number;
    isPaid?: boolean;
    zipUrl?: string;
    github?: string;
    demo?: string;
    tags?: string[];
    visitedAt?: string;
    isPurchased?: boolean;
}



const defaultAccountData: AccountData = {
    name: '',
    email: '',
    phone: '',
    dob: '',
    address: {
        street: '',
        addressLine2: '',
        city: '',
        country: '',
        state: '',
        postalCode: ''
    },
    vatId: ''
};

const defaultTwoFASettings: TwoFASettings = {
    email: false,
    qrCode: false
};

const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <FaUserCircle /> },
    { id: 'security', label: 'Security', icon: <FaShieldVirus /> },
    { id: 'emailPreferences', label: 'Email Preferences', icon: <FaEnvelope /> },
    { id: 'pricing', label: 'Pricing & Subscription', icon: <FaCreditCard /> },
    { id: 'loginHistory', label: 'Login History', icon: <FaClock /> }
];

export default function Account() {
    const [isMounted, setIsMounted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [formData, setFormData] = useState<AccountData>(defaultAccountData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [twoFASettings, setTwoFASettings] = useState<TwoFASettings>(defaultTwoFASettings);
    const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
    const [showQrCode, setShowQrCode] = useState(false);

    const [emailVerificationSent, setEmailVerificationSent] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);
    const [blogItems, setBlogItems] = useState<BlogItem[]>([]);
    const [projectItems, setProjectItems] = useState<ProjectItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [projectSearchTerm, setProjectSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedProjectCategory, setSelectedProjectCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>('');
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [downloadingProjectId, setDownloadingProjectId] = useState<string | null>(null);

    // Email Preferences state
    const [emailPreferences, setEmailPreferences] = useState<EmailPreferencesType | null>(null);
    const [isEditingEmailPreferences, setIsEditingEmailPreferences] = useState(false);
    const [loadingEmailPreferences, setLoadingEmailPreferences] = useState(true);

    // Newsletter state
    const [newsletterFormData, setNewsletterFormData] = useState({
        name: '',
        email: '',
        interest: ''
    });
    const [newsletterErrors, setNewsletterErrors] = useState<Record<string, string>>({});
    const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);
    const [newsletterSubmitError, setNewsletterSubmitError] = useState('');
    const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

    // Pricing & Subscription state
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [pricingSubView, setPricingSubView] = useState<'subscription' | 'payments'>('subscription');
    const [subscriptionPayments, setSubscriptionPayments] = useState<any[]>([]);
    const [activeSubscription, setActiveSubscription] = useState<any>(null);
    const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
    const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [subscribingPlan, setSubscribingPlan] = useState<'free' | 'supporter' | 'allAccess' | null>(null);
    const [isCancelingSubscription, setIsCancelingSubscription] = useState(false);
    const [cancelingPaymentId, setCancelingPaymentId] = useState<string | null>(null);
    const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
        loadUserData();
        loadPaymentHistory();
        loadLoginHistory();
        loadBlogPosts();
        loadProjectsPurchased();
        loadEmailPreferences();
        loadSubscriptionData();
    }, []);

    useEffect(() => {
        const section = searchParams.get('section');
        if (section && tabs.some(tab => tab.id === section)) {
            setActiveTab(section);
        }
    }, [searchParams]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            const res = await fetch('/api/user', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (!res.ok) {
                let errorMessage = 'Failed to fetch user data';
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    // If can't parse JSON, use status text
                    errorMessage = res.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            const user = data.user;

            setUserId(user.id || user._id);

            // Set account data
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                dob: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                address: {
                    street: user.address?.street || '',
                    addressLine2: user.address?.addressLine2 || '',
                    city: user.address?.city || '',
                    country: user.address?.country || '',
                    state: user.address?.stateProvince || '',
                    postalCode: user.address?.postalCode || ''
                },
                vatId: '' // Not in model
            });

            // Set 2FA settings
            setTwoFASettings({
                email: user.emailOtpEnabled || false,
                qrCode: user.twoFactorEnabled || false
            });

        } catch (error) {
            console.error('Error loading user data:', error);
            if (error instanceof Error && error.message.includes('User not found')) {
                // User account was deleted or token is invalid, logout
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('token');
                }
                router.push('/auth');
                return;
            }
            setError('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const loadPaymentHistory = async () => {
        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            const res = await fetch('/api/account-payments', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (!res.ok) {
                throw new Error('Failed to fetch payment history');
            }

            const data = await res.json();
            const formattedPayments = data.payments.map((item: any) => ({
                id: item.paymentId,
                _id: item._id,
                invoiceId: item.invoiceId,
                amount: item.amount,
                currency: item.currency,
                description: item.description,
                date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
                status: item.status,
                method: item.method
            }));
            setPaymentHistory(formattedPayments);
        } catch (error) {
            console.error('Error loading payment history:', error);
            // Keep empty array if API fails
        }
    };

    const loadBlogPosts = async () => {
        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            const res = await fetch('/api/user/blog-visits', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (!res.ok) {
                throw new Error('Failed to fetch visited blog posts');
            }

            const data = await res.json();
            const formattedPosts = data.blogs.map((post: any) => ({
                id: post.id,
                title: post.title || '',
                excerpt: post.excerpt || '',
                author: post.author || 'Unknown',
                date: post.date || '',
                category: post.category || '',
                categorySlug: post.categorySlug || '',
                slug: post.slug || '',
                featured: post.featured || false,
                visitedAt: post.visitedAt ? new Date(post.visitedAt).toLocaleDateString() : ''
            }));

            setBlogItems(formattedPosts);
        } catch (error) {
            console.error('Error loading visited blog posts:', error);
            // Keep empty array if API fails
        }
    };

    const loadProjectsPurchased = async () => {
        try {
            setLoadingProjects(true);
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            
            // Fetch projects purchased by user
            const res = await fetch('/api/projectpayments', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (!res.ok) {
                throw new Error('Failed to fetch purchased projects');
            }

            const projectPayments = await res.json();
            
            // Fetch all projects to get details
            const projectsRes = await fetch('/api/projects', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (!projectsRes.ok) {
                throw new Error('Failed to fetch project details');
            }

            const projectsData = await projectsRes.json();
            const allProjects = projectsData.results || [];

            // Check if user has all-access subscription
            const hasAllAccess = projectsData.hasAllAccess || false;

            // Map purchased projects with their details
            const purchasedProjectIds = projectPayments
                .filter((p: any) => p.status === 'completed')
                .map((p: any) => p.projectId);

            const formattedProjects = allProjects
                .filter((project: any) => {
                    // Show if user purchased the project directly
                    if (purchasedProjectIds.includes(project._id || project.id)) {
                        return true;
                    }
                    // Show all projects if user has all-access (whether paid or free)
                    if (hasAllAccess) {
                        return true;
                    }
                    return false;
                })
                .map((project: any) => ({
                    id: project._id || project.id,
                    title: project.title || '',
                    description: project.description || '',
                    category: project.category || '',
                    slug: project.slug || '',
                    price: project.price || 0,
                    isPaid: project.isPaid || false,
                    zipUrl: project.zipUrl || '',
                    github: project.github || '',
                    demo: project.demo || '',
                    tags: project.tags || [],
                    isPurchased: true
                }));

            setProjectItems(formattedProjects);
        } catch (error) {
            console.error('Error loading purchased projects:', error);
            // Keep empty array if API fails
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleDownloadProject = async (project: ProjectItem) => {
        try {
            setDownloadingProjectId(project.id);
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            
            if (!project.zipUrl) {
                alert('Project file is not available for download');
                return;
            }

            // Create download link
            const downloadUrl = `/api/projects/download-zip?projectId=${project.id}`;
            const response = await fetch(downloadUrl, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (!response.ok) {
                throw new Error('Failed to download project');
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${project.slug}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading project:', error);
            alert('Failed to download project. Please try again.');
        } finally {
            setDownloadingProjectId(null);
        }
    };

    // Load subscription and payment history
    const loadSubscriptionData = async () => {
        try {
            setIsSubscriptionLoading(true);
            setSubscriptionError(null);
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';

            const res = await fetch('/api/account-payments', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (!res.ok) {
                throw new Error('Failed to fetch subscription data');
            }

            const data = await res.json();
            setSubscriptionPayments(data.payments || []);
            setActiveSubscription(data.activeSubscription || null);
        } catch (error) {
            console.error('Error loading subscription data:', error);
            setSubscriptionError('Failed to load subscription data');
        } finally {
            setIsSubscriptionLoading(false);
        }
    };

    const loadEmailPreferences = async () => {
        try {
            setLoadingEmailPreferences(true);
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            const res = await fetch('/api/email-preferences', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (!res.ok) {
                let errorMessage = 'Failed to fetch email preferences';
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    // If can't parse JSON, use status text
                    errorMessage = res.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            setEmailPreferences(data.emailPreferences);
        } catch (error) {
            console.error('Error loading email preferences:', error);
            if (error instanceof Error && error.message.includes('User not found')) {
                // User account was deleted or token is invalid, logout
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('token');
                }
                router.push('/auth');
                return;
            }
            // Keep default preferences if API fails
        } finally {
            setLoadingEmailPreferences(false);
        }
    };

    const handleEmailPreferencesChange = (type: 'twoFANotifications' | 'accountChanges' | 'loginNotifications' | 'newsletter', field: 'enabled' | 'frequency', value: any) => {
        setEmailPreferences(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [type]: {
                    ...prev[type],
                    [field]: value
                }
            };
        });
    };

    const handleSaveEmailPreferences = async () => {
        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            const res = await fetch('/api/email-preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(emailPreferences)
            });

            if (!res.ok) {
                throw new Error('Failed to save email preferences');
            }

            setIsEditingEmailPreferences(false);
            setError(null);
            // Reload email preferences to ensure we have the latest data
            await loadEmailPreferences();
        } catch (error) {
            console.error('Error saving email preferences:', error);
            setError(error instanceof Error ? error.message : 'Failed to save email preferences');
        }
    };

    const handleResetEmailPreferences = async () => {
        if (!window.confirm('Are you sure you want to reset email preferences to defaults?')) {
            return;
        }

        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            const res = await fetch('/api/email-preferences', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!res.ok) {
                throw new Error('Failed to reset email preferences');
            }

            const data = await res.json();
            setEmailPreferences(data.emailPreferences);
            setIsEditingEmailPreferences(false);
            setError(null);
            // No need to reload since we already set the data from response
        } catch (error) {
            console.error('Error resetting email preferences:', error);
            setError(error instanceof Error ? error.message : 'Failed to reset email preferences');
        }
    };

    // Newsletter functions








    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name.includes('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.dob.trim()) newErrors.dob = 'Date of birth is required';

        // Address validation
        if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
        if (!formData.address.addressLine2.trim()) newErrors['address.addressLine2'] = 'Address line 2 is required';
        if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
        if (!formData.address.country.trim()) newErrors['address.country'] = 'Country is required';
        if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
        if (!formData.address.postalCode.trim()) newErrors['address.postalCode'] = 'Postal code is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
                const updateData = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    dateOfBirth: formData.dob || undefined,
                    address: {
                        street: formData.address.street,
                        addressLine2: formData.address.addressLine2,
                        city: formData.address.city,
                        stateProvince: formData.address.state,
                        country: formData.address.country,
                        postalCode: formData.address.postalCode
                    }
                };

                const res = await fetch('/api/user', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(updateData)
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    const errorMessage = errorData.details || errorData.error || 'Failed to update profile';
                    throw new Error(errorMessage);
                }

                const data = await res.json();
                // Update local state with response
                const user = data.user;
                setFormData(prev => ({
                    ...prev,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    dob: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                    address: {
                        ...prev.address,
                        street: user.address?.street || '',
                        addressLine2: user.address?.addressLine2 || '',
                        city: user.address?.city || '',
                        state: user.address?.stateProvince || '',
                        country: user.address?.country || '',
                        postalCode: user.address?.postalCode || ''
                    }
                }));

                setIsEditing(false);
                setError(null);
            } catch (error) {
                console.error('Error updating profile:', error);
                setError('Failed to update profile');
            }
        }
    };

    const handleLogout = () => {
        // Clear authentication token
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('token');
        }
        // Redirect to auth page
        router.push('/auth');
    };

    const handleLogoutDevice = async (item: LoginHistoryItem) => {
        if (item.currentSession) {
            alert('You cannot logout from your current session.');
            return;
        }
        if (!window.confirm('Are you sure you want to logout this session?')) {
            return;
        }

        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            const sessionData = {
                ip: item.ip,
                device: item.device + ' (' + item.browser + ')',
                location: item.location,
                timestamp: new Date(item.date).toISOString(),
                success: true // assuming it's successful since button is shown
            };
            await fetch('/api/logout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    userId: userId,
                    sessionData
                })
            });
            // Refresh login history
            loadLoginHistory();
            setError(null);
        } catch (error) {
            console.error('Error logging out session:', error);
            setError('Failed to logout session');
        }
    };

    const handleTwoFAChange = async (method: keyof TwoFASettings) => {
        try {
            if (method === 'email') {
                if (!twoFASettings.email) {
                    // Enable email 2FA
                    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
                    const res = await fetch('/api/2fa/enable', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({ type: 'email' })
                    });

                    if (!res.ok) {
                        throw new Error('Failed to enable email 2FA');
                    }

                    setEmailVerificationSent(true);
                    setTimeout(() => setEmailVerificationSent(false), 5000);
                    setTwoFASettings(prev => ({
                        ...prev,
                        email: true
                    }));
                } else {
                    // Disable email 2FA
                    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
                    const res = await fetch('/api/2fa/disable', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({ type: 'email' })
                    });

                    if (!res.ok) {
                        throw new Error('Failed to disable email 2FA');
                    }

                    setTwoFASettings(prev => ({
                        ...prev,
                        email: false
                    }));
                }
            } else if (method === 'qrCode') {
                if (!twoFASettings.qrCode) {
                    // Enable TOTP 2FA
                    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
                    const res = await fetch('/api/2fa/enable', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({ type: 'totp' })
                    });

                    if (!res.ok) {
                        throw new Error('Failed to setup TOTP');
                    }

                    const data = await res.json();
                    setQrCodeData(data.otpauth);
                    setShowQrCode(true);
                    // Don't set qrCode: true yet - wait for verification
                } else {
                    // Disable TOTP 2FA
                    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
                    const res = await fetch('/api/2fa/disable', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({ type: 'totp' })
                    });

                    if (!res.ok) {
                        throw new Error('Failed to disable TOTP 2FA');
                    }

                    setTwoFASettings(prev => ({
                        ...prev,
                        qrCode: false
                    }));
                }
            }

            // No more setTwoFASettings here, as it's handled inside each method
        } catch (error) {
            console.error('Error updating 2FA settings:', error);
            setError(error instanceof Error ? error.message : 'Failed to update 2FA settings');
        }
    };

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType) {
            case 'desktop':
                return <FaDesktop className="text-gray-600" />;
            case 'mobile':
                return <FaMobile className="text-gray-600" />;
            case 'tablet':
                return <FaTabletAlt className="text-gray-600" />;
            default:
                return <FaDesktop className="text-gray-600" />;
        }
    };

    const loadLoginHistory = async () => {
        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            const res = await fetch('/api/user/login-history', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to fetch login history: ${res.status} ${res.statusText} - ${errorText}`);
            }

            const data = await res.json();
            const formattedHistory = data.loginHistory.map((item: any, index: number) => ({
                id: index.toString(),
                ip: item.ip,
                device: item.device.split(' (')[0], // Extract device name
                deviceType: item.device.toLowerCase().includes('mobile') ? 'mobile' :
                    item.device.toLowerCase().includes('tablet') ? 'tablet' : 'desktop',
                browser: item.device.split(' (')[1]?.replace(')', '') || 'Unknown', // Extract browser
                location: item.location || 'Unknown',
                date: new Date(item.timestamp).toLocaleString(),
                currentSession: index === 0 && item.success, // Mark first successful login as current session
                loggedOut: item.loggedOut || false
            }));

            setLoginHistory(formattedHistory);
        } catch (error) {
            console.error('Error loading login history:', error);
            if (error instanceof Error && error.message.includes('User not found')) {
                // User account was deleted or token is invalid, logout
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('token');
                }
                router.push('/auth');
                return;
            }
            // Keep default data if API fails
        }
    };


    const filteredBlogs = blogItems.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || blog.categorySlug === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredProjects = projectItems.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(projectSearchTerm.toLowerCase());
        const matchesCategory = selectedProjectCategory === 'all' || project.category === selectedProjectCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'ai-security': return 'bg-blue-100 text-blue-800';
            case 'threats': return 'bg-red-100 text-red-800';
            case 'architecture': return 'bg-purple-100 text-purple-800';
            case 'cloud-security': return 'bg-green-100 text-green-800';
            case 'remote-work': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Pricing helper functions
    const getPricingData = () => {
        const pricing = {
            free: { monthly: 0, quarterly: 0, yearly: 0 },
            supporter: {
                monthly: 849,
                quarterly: 2199,
                yearly: 7499
            },
            allAccess: {
                monthly: 2499,
                quarterly: 6799,
                yearly: 24999
            }
        };
        return pricing;
    };

    const handleSubscribe = async (planType: 'free' | 'supporter' | 'allAccess') => {
        try {
            setIsSubscribing(true);
            setSubscribingPlan(planType);
            setSubscriptionError(null);

            const pricing = getPricingData();
            const amount = pricing[planType][billingCycle];
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';

            const payload = {
                amount,
                currency: 'INR',
                description: `${planType} plan subscription (${billingCycle})`,
                method: planType === 'free' ? 'free' : 'stripe',
                planType,
                billingCycle
            };

            console.log('Sending subscription request:', payload);

            const res = await fetch('/api/account-payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.details || errorData.error || 'Failed to create subscription';
                throw new Error(errorMessage);
            }

            const data = await res.json();

            // Show success message
            if (planType === 'free') {
                setSubscriptionError(null);
                alert('✅ You are now on the Free plan!');
            } else {
                setSubscriptionError(null);
                alert(`✅ Subscription successful!\n\nPlan: ${planType}\nBilling: ${billingCycle}\nAmount: ₹${amount}\n\nPayment ID: ${data.paymentId}`);
            }

            // Reload subscription data
            await loadSubscriptionData();
        } catch (error) {
            console.error('Error creating subscription:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription';
            setSubscriptionError(errorMessage);
            alert(`❌ ${errorMessage}`);
        } finally {
            setIsSubscribing(false);
            setSubscribingPlan(null);
        }
    };

    const handleCancelSubscription = async () => {
        if (!activeSubscription) {
            setSubscriptionError('No active subscription to cancel');
            return;
        }

        // Confirm cancellation
        const confirmCancel = window.confirm(
            `Are you sure you want to cancel your ${activeSubscription.planType || 'subscription'}?\n\n` +
            `Your access will continue until ${new Date(activeSubscription.endDate).toLocaleDateString()}.\n\n` +
            `You can resubscribe anytime.`
        );

        if (!confirmCancel) return;

        try {
            setIsCancelingSubscription(true);
            setSubscriptionError(null);
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';

            const res = await fetch(`/api/account-payments/${activeSubscription._id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.error || 'Failed to cancel subscription';
                throw new Error(errorMessage);
            }

            setSubscriptionError(null);
            alert('✅ Subscription cancelled successfully!\n\nYour access will continue until the end of your current billing period.');
            await loadSubscriptionData();
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription';
            setSubscriptionError(errorMessage);
            alert(`❌ ${errorMessage}`);
        } finally {
            setIsCancelingSubscription(false);
        }
    };

    const handleCancelPayment = async (paymentId: string, paymentAmount: number, paymentDescription: string) => {
        // Confirm cancellation
        const confirmCancel = window.confirm(
            `Are you sure you want to cancel this payment?\n\n` +
            `Description: ${paymentDescription}\n` +
            `Amount: ₹${paymentAmount}\n\n` +
            `This will mark the payment as cancelled.`
        );

        if (!confirmCancel) return;

        try {
            setCancelingPaymentId(paymentId);
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';

            const res = await fetch(`/api/account-payments/${paymentId}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });

            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.error || 'Failed to cancel payment';
                throw new Error(errorMessage);
            }

            alert('✅ Payment cancelled successfully!');
            await loadSubscriptionData();
        } catch (error) {
            console.error('Error cancelling payment:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to cancel payment';
            alert(`❌ ${errorMessage}`);
        } finally {
            setCancelingPaymentId(null);
        }
    };

    const getStatusBadgeColor = (status: string): React.CSSProperties => {
        switch (status) {
            case 'completed': return { backgroundColor: 'rgba(0,255,198,0.2)', color: '#00FFC6' };
            case 'pending': return { backgroundColor: 'rgba(255,200,0,0.2)', color: '#ffc800' };
            case 'failed': return { backgroundColor: 'rgba(255,0,85,0.2)', color: '#ff0055' };
            case 'cancelled': return { backgroundColor: 'rgba(176,245,230,0.2)', color: '#b0f5e6' };
            default: return { backgroundColor: 'rgba(176,245,230,0.2)', color: '#b0f5e6' };
        }
    };

    const handleDownloadInvoice = async (paymentId: string, invoiceId: string) => {
        try {
            setDownloadingInvoiceId(paymentId);
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';

            const response = await fetch('/api/invoice/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    paymentId: paymentId,
                    paymentType: 'account'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate invoice');
            }

            // Get the PDF blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoiceId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            alert('✅ Invoice downloaded successfully!');
        } catch (error) {
            console.error('Error downloading invoice:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to download invoice';
            alert(`❌ ${errorMessage}`);
        } finally {
            setDownloadingInvoiceId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center bg-[#0a0a0a] overflow-hidden pt-24">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(rgba(0,255,198,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,198,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}></div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-10 right-10 w-24 h-24 md:w-32 md:h-32 rounded-full opacity-5 blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(0,255,198,1) 0%, transparent 70%)' }}></div>
                <div className="absolute bottom-10 left-10 w-32 h-32 md:w-40 md:h-40 rounded-full opacity-5 blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(0,255,198,1) 0%, transparent 70%)' }}></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Text Content */}
                        <div className={`space-y-8 ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'} transition-all duration-1000`}>
                            <div>
                                <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: 'rgba(0,255,198,0.1)', color: '#00FFC6' }}>
                                    Account Management
                                </span>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#E0E0E0' }}>
                                    Your <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #00FFC6 0%, #ffffff 50%, #00FFC6 100%)' }}>Account</span>
                                </h1>
                            </div>

                            <p className="text-lg max-w-lg" style={{ color: '#b0f5e6' }}>
                                Manage your account settings, security preferences, and view your activity history all in one place.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setActiveTab('personal')}
                                    className="px-8 py-4 font-medium rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center"
                                    style={{ backgroundColor: '#00FFC6', color: '#0a0a0a', boxShadow: '0 10px 40px rgba(0,255,198,0.4)' }}
                                >
                                    Get Started
                                    <FaUser className="ml-2 w-5 h-5" />
                                </button>
                            </div>

                            {/* Trust indicators */}
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="flex items-center">
                                    <FaCheck className="w-5 h-5 mr-3" style={{ color: '#00FFC6' }} />
                                    <span style={{ color: '#b0f5e6' }}>Secure & Private</span>
                                </div>
                                <div className="flex items-center">
                                    <FaCheck className="w-5 h-5 mr-3" style={{ color: '#00FFC6' }} />
                                    <span style={{ color: '#b0f5e6' }}>Easy Management</span>
                                </div>
                                <div className="flex items-center">
                                    <FaCheck className="w-5 h-5 mr-3" style={{ color: '#00FFC6' }} />
                                    <span style={{ color: '#b0f5e6' }}>Two-Factor Auth</span>
                                </div>
                                <div className="flex items-center">
                                    <FaCheck className="w-5 h-5 mr-3" style={{ color: '#00FFC6' }} />
                                    <span style={{ color: '#b0f5e6' }}>Encrypted Data</span>
                                </div>
                                <div className="flex items-center">
                                    <FaCheck className="w-5 h-5 mr-3" style={{ color: '#00FFC6' }} />
                                    <span style={{ color: '#b0f5e6' }}>Activity Monitoring</span>
                                </div>
                                <div className="flex items-center">
                                    <FaCheck className="w-5 h-5 mr-3" style={{ color: '#00FFC6' }} />
                                    <span style={{ color: '#b0f5e6' }}>Data Protection</span>
                                </div>
                            </div>
                        </div>

                        {/* Visual Content */}
                        <div className={`relative ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'} transition-all duration-1000 delay-300`}>
                            <div className="relative">
                                {/* Main image card */}
                                <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,255,198,0.2), rgba(0,255,198,0.05))', border: '2px solid #00FFC6', boxShadow: '0 30px 80px rgba(0,255,198,0.4)' }}>
                                    <div className="aspect-w-16 aspect-h-12 flex items-center justify-center p-8">
                                        <div className="text-center">
                                            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #00FFC6, rgba(0,255,198,0.7))' }}>
                                                <FaUser className="text-4xl" style={{ color: '#0a0a0a' }} />
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2" style={{ color: '#E0E0E0' }}>Account Dashboard</h3>
                                            <p style={{ color: '#b0f5e6' }}>Manage Your Profile & Security</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating cards */}
                                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-2xl shadow-xl p-4 transform rotate-6 hover:rotate-3 transition-transform duration-300" style={{ background: 'rgba(0,255,198,0.1)', border: '1px solid rgba(0,255,198,0.3)' }}>
                                    <div className="text-center">
                                        <FaShieldAlt className="text-2xl mx-auto mb-2" style={{ color: '#00FFC6' }} />
                                        <p className="text-xs font-medium" style={{ color: '#b0f5e6' }}>Security</p>
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-2xl shadow-xl p-4 transform -rotate-6 hover:-rotate-3 transition-transform duration-300" style={{ background: 'rgba(0,255,198,0.1)', border: '1px solid rgba(0,255,198,0.3)' }}>
                                    <div className="text-center">
                                        <FaCreditCard className="text-xl mx-auto mb-2" style={{ color: '#00FFC6' }} />
                                        <p className="text-xs font-medium" style={{ color: '#b0f5e6' }}>Payments</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="space-y-8 pb-24 pl-8 pr-4 sm:pl-12 sm:pr-6 lg:pl-16 lg:pr-8 py-8">
                {/* Header with Logout Button */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold" style={{ color: '#E0E0E0' }}>Account Settings</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg flex items-center transition-colors duration-300"
                        style={{ backgroundColor: '#ff0055', color: 'white' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#cc0044'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff0055'}
                    >
                        <FaSignOutAlt className="mr-2" />
                        Logout
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar - Blog History */}
                    <div className="lg:col-span-1">
                        {/* Blog History */}
                        <div className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden sticky top-8" style={{ background: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.2)' }}>
                            <div className="p-6 border-b" style={{ background: 'linear-gradient(135deg, rgba(0,255,198,0.2), rgba(0,255,198,0.1))', borderColor: 'rgba(0,255,198,0.3)' }}>
                                <h2 className="text-xl font-bold flex items-center" style={{ color: '#00FFC6' }}>
                                    <FaHistory className="mr-2" />
                                    Blog History
                                </h2>
                                <p className="text-sm mt-1" style={{ color: '#b0f5e6' }}>Blogs you've visited recently</p>
                            </div>

                            <div className="p-4">
                                {/* Search Bar */}
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search blogs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                                        style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.05)', color: '#E0E0E0' }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}
                                    />
                                    <FaSearch className="absolute left-3 top-3" style={{ color: '#00FFC6', opacity: 0.6 }} />
                                </div>

                                {/* Category Filter */}
                                <div className="mb-4">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none"
                                        style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.05)', color: '#E0E0E0' }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}
                                    >
                                        <option value="all" style={{ backgroundColor: '#0a0a0a' }}>All Categories</option>
                                        <option value="ai-security" style={{ backgroundColor: '#0a0a0a' }}>AI & Security</option>
                                        <option value="threats" style={{ backgroundColor: '#0a0a0a' }}>Threats</option>
                                        <option value="architecture" style={{ backgroundColor: '#0a0a0a' }}>Architecture</option>
                                        <option value="cloud-security" style={{ backgroundColor: '#0a0a0a' }}>Cloud Security</option>
                                        <option value="remote-work" style={{ backgroundColor: '#0a0a0a' }}>Remote Work</option>
                                    </select>
                                </div>

                                {/* Total Articles Counter */}
                                <div className="flex items-center justify-between mb-4 p-2 rounded-lg" style={{ backgroundColor: 'rgba(0,255,198,0.1)' }}>
                                    <span className="text-sm font-medium" style={{ color: '#00FFC6' }}>Articles Found</span>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#00FFC6', color: '#0a0a0a' }}>
                                        {filteredBlogs.length}
                                    </span>
                                </div>
                            </div>

                            {/* Blog List */}
                            <div className="max-h-96 overflow-y-auto">
                                {filteredBlogs.length > 0 ? (
                                    filteredBlogs.map(blog => (
                                        <div key={blog.id} style={{ borderBottom: '1px solid rgba(0,255,198,0.1)' }} className="last:border-b-0">
                                            <Link href={`/blog/${blog.slug}`}>
                                                <div className="p-4 transition-colors duration-200 cursor-pointer" style={{ color: '#E0E0E0' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.05)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center">
                                                                <h3 className="font-medium text-sm flex items-center" style={{ color: '#E0E0E0' }}>
                                                                    {blog.title}
                                                                    {blog.featured && (
                                                                        <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full" style={{ backgroundColor: '#00FFC6', color: '#0a0a0a' }}>Featured</span>
                                                                    )}
                                                                </h3>
                                                            </div>
                                                            <p className="text-xs mt-1 line-clamp-2" style={{ color: '#b0f5e6' }}>{blog.excerpt}</p>
                                                            <div className="flex items-center justify-between mt-2">
                                                                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(0,255,198,0.2)', color: '#00FFC6' }}>
                                                                    {blog.category}
                                                                </span>
                                                                <span className="text-xs" style={{ color: '#b0f5e6', opacity: 0.7 }}>
                                                                    {blog.visitedAt ? `Visited: ${blog.visitedAt}` : blog.date}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs mt-1" style={{ color: '#b0f5e6', opacity: 0.7 }}>By {blog.author}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm" style={{ color: '#b0f5e6' }}>
                                        No articles found
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t" style={{ backgroundColor: 'rgba(0,255,198,0.05)', borderColor: 'rgba(0,255,198,0.2)' }}>
                                <Link href="/blog" className="block text-sm font-medium transition-colors" style={{ color: '#00FFC6' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                                    Explore More Blogs →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Middle Content - Account Settings */}
                    <div className="lg:col-span-2">
                        {/* Tab Navigation */}
                        <div className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden" style={{ background: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.2)' }}>
                            <div className="flex flex-wrap" style={{ borderBottom: '1px solid rgba(0,255,198,0.2)' }}>
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className="flex items-center px-6 py-4 text-sm font-medium transition-all duration-500"
                                        style={activeTab === tab.id
                                            ? { color: '#00FFC6', borderBottom: '2px solid #00FFC6', backgroundColor: 'rgba(0,255,198,0.1)' }
                                            : { color: '#b0f5e6', backgroundColor: 'transparent' }}
                                        onMouseEnter={(e) => { if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.05)' }}
                                        onMouseLeave={(e) => { if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = 'transparent' }}
                                    >
                                        <span className="mr-2">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {loading && (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#00FFC6' }}></div>
                                        <span className="ml-2" style={{ color: '#b0f5e6' }}>Loading...</span>
                                    </div>
                                )}

                                {error && (
                                    <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgba(255,0,85,0.1)', border: '1px solid rgba(255,0,85,0.3)' }}>
                                        <div className="flex items-center">
                                            <FaExclamationTriangle className="mr-2" style={{ color: '#ff0055' }} />
                                            <span style={{ color: '#ff6699' }}>{error}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setError(null);
                                                loadUserData();
                                            }}
                                            className="mt-2 text-sm underline"
                                            style={{ color: '#ff0055' }}
                                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                        >
                                            Try again
                                        </button>
                                    </div>
                                )}

                                {!loading && !error && (
                                    <>
                                        {/* Personal Information Tab */}
                                        {activeTab === 'personal' && (
                                            <div className={`space-y-6 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '100ms' }}>
                                                <div className="flex justify-between items-center">
                                                    <h2 className="text-2xl font-bold" style={{ color: '#E0E0E0' }}>Personal Information</h2>
                                                    <button
                                                        onClick={() => setIsEditing(!isEditing)}
                                                        className="p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                                                        style={{ backgroundColor: '#00FFC6', color: '#0a0a0a' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,198,0.6)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
                                                    >
                                                        {isEditing ? <FaSave /> : <FaEdit />}
                                                    </button>
                                                </div>

                                                <form onSubmit={handleSubmit}>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                                                <FaUser className="inline mr-2" />
                                                                Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                value={formData.name}
                                                                onChange={handleChange}
                                                                disabled={!isEditing}
                                                                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-300"
                                                                style={{
                                                                    border: errors.name ? '1px solid #ff0055' : '1px solid rgba(0,255,198,0.3)',
                                                                    backgroundColor: isEditing ? 'rgba(0,255,198,0.05)' : 'rgba(0,255,198,0.02)',
                                                                    color: '#E0E0E0'
                                                                }}
                                                                onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                onBlur={(e) => e.currentTarget.style.borderColor = errors.name ? '#ff0055' : 'rgba(0,255,198,0.3)'}
                                                            />
                                                            {errors.name && <p className="text-xs mt-1" style={{ color: '#ff0055' }}>{errors.name}</p>}
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                                                <FaEnvelope className="inline mr-2" />
                                                                Email
                                                            </label>
                                                            <input
                                                                type="email"
                                                                name="email"
                                                                value={formData.email}
                                                                onChange={handleChange}
                                                                disabled={!isEditing}
                                                                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-300"
                                                                style={{
                                                                    border: errors.email ? '1px solid #ff0055' : '1px solid rgba(0,255,198,0.3)',
                                                                    backgroundColor: isEditing ? 'rgba(0,255,198,0.05)' : 'rgba(0,255,198,0.02)',
                                                                    color: '#E0E0E0'
                                                                }}
                                                                onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                onBlur={(e) => e.currentTarget.style.borderColor = errors.email ? '#ff0055' : 'rgba(0,255,198,0.3)'}
                                                            />
                                                            {errors.email && <p className="text-xs mt-1" style={{ color: '#ff0055' }}>{errors.email}</p>}
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                                                <FaPhone className="inline mr-2" />
                                                                Phone
                                                            </label>
                                                            <input
                                                                type="tel"
                                                                name="phone"
                                                                value={formData.phone}
                                                                onChange={handleChange}
                                                                disabled={!isEditing}
                                                                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-300"
                                                                style={{
                                                                    border: errors.phone ? '1px solid #ff0055' : '1px solid rgba(0,255,198,0.3)',
                                                                    backgroundColor: isEditing ? 'rgba(0,255,198,0.05)' : 'rgba(0,255,198,0.02)',
                                                                    color: '#E0E0E0'
                                                                }}
                                                                onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                onBlur={(e) => e.currentTarget.style.borderColor = errors.phone ? '#ff0055' : 'rgba(0,255,198,0.3)'}
                                                            />
                                                            {errors.phone && <p className="text-xs mt-1" style={{ color: '#ff0055' }}>{errors.phone}</p>}
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                                                <FaCalendar className="inline mr-2" />
                                                                Date of Birth
                                                            </label>
                                                            <input
                                                                type="date"
                                                                name="dob"
                                                                value={formData.dob}
                                                                onChange={handleChange}
                                                                disabled={!isEditing}
                                                                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-300"
                                                                style={{
                                                                    border: errors.dob ? '1px solid #ff0055' : '1px solid rgba(0,255,198,0.3)',
                                                                    backgroundColor: isEditing ? 'rgba(0,255,198,0.05)' : 'rgba(0,255,198,0.02)',
                                                                    color: '#E0E0E0',
                                                                    colorScheme: 'dark'
                                                                }}
                                                                onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                onBlur={(e) => e.currentTarget.style.borderColor = errors.dob ? '#ff0055' : 'rgba(0,255,198,0.3)'}
                                                            />
                                                            {errors.dob && <p className="text-xs mt-1" style={{ color: '#ff0055' }}>{errors.dob}</p>}
                                                        </div>
                                                    </div>

                                                    <div className="mt-8">
                                                        <h3 className="text-lg font-semibold mb-4" style={{ color: '#E0E0E0' }}>
                                                            <FaMapMarkerAlt className="inline mr-2" style={{ color: '#00FFC6' }} />
                                                            Address Information
                                                        </h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div>
                                                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                                                    <FaMapMarkerAlt className="inline mr-2" />
                                                                    Address (Street, P.O. box) *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="address.street"
                                                                    value={formData.address.street}
                                                                    onChange={handleChange}
                                                                    disabled={!isEditing}
                                                                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-300"
                                                                    style={{
                                                                        border: errors['address.street'] ? '1px solid #ff0055' : '1px solid rgba(0,255,198,0.3)',
                                                                        backgroundColor: isEditing ? 'rgba(0,255,198,0.05)' : 'rgba(0,255,198,0.02)',
                                                                        color: '#E0E0E0'
                                                                    }}
                                                                    onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                    onBlur={(e) => e.currentTarget.style.borderColor = errors['address.street'] ? '#ff0055' : 'rgba(0,255,198,0.3)'}
                                                                />
                                                                {errors['address.street'] && <p className="text-xs mt-1" style={{ color: '#ff0055' }}>{errors['address.street']}</p>}
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                                                    <FaBuilding className="inline mr-2" />
                                                                    Address line 2 (Apartment, suite, unit) *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="address.addressLine2"
                                                                    value={formData.address.addressLine2}
                                                                    onChange={handleChange}
                                                                    disabled={!isEditing}
                                                                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-300"
                                                                    style={{
                                                                        border: errors['address.addressLine2'] ? '1px solid #ff0055' : '1px solid rgba(0,255,198,0.3)',
                                                                        backgroundColor: isEditing ? 'rgba(0,255,198,0.05)' : 'rgba(0,255,198,0.02)',
                                                                        color: '#E0E0E0'
                                                                    }}
                                                                    onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                    onBlur={(e) => e.currentTarget.style.borderColor = errors['address.addressLine2'] ? '#ff0055' : 'rgba(0,255,198,0.3)'}
                                                                />
                                                                {errors['address.addressLine2'] && <p className="text-xs mt-1" style={{ color: '#ff0055' }}>{errors['address.addressLine2']}</p>}
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                                                    <FaCity className="inline mr-2" />
                                                                    City *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="address.city"
                                                                    value={formData.address.city}
                                                                    onChange={handleChange}
                                                                    disabled={!isEditing}
                                                                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-300"
                                                                    style={{
                                                                        border: errors['address.city'] ? '1px solid #ff0055' : '1px solid rgba(0,255,198,0.3)',
                                                                        backgroundColor: isEditing ? 'rgba(0,255,198,0.05)' : 'rgba(0,255,198,0.02)',
                                                                        color: '#E0E0E0'
                                                                    }}
                                                                    onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                    onBlur={(e) => e.currentTarget.style.borderColor = errors['address.city'] ? '#ff0055' : 'rgba(0,255,198,0.3)'}
                                                                />
                                                                {errors['address.city'] && <p className="text-xs mt-1" style={{ color: '#ff0055' }}>{errors['address.city']}</p>}
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                                                    <FaGlobe className="inline mr-2" />
                                                                    Country/Region *
                                                                </label>
                                                                <select
                                                                    name="address.country"
                                                                    value={formData.address.country}
                                                                    onChange={handleChange}
                                                                    disabled={!isEditing}
                                                                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-300"
                                                                    style={{
                                                                        border: errors['address.country'] ? '1px solid #ff0055' : '1px solid rgba(0,255,198,0.3)',
                                                                        backgroundColor: isEditing ? 'rgba(0,255,198,0.05)' : 'rgba(0,255,198,0.02)',
                                                                        color: '#E0E0E0'
                                                                    }}
                                                                    onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                    onBlur={(e) => e.currentTarget.style.borderColor = errors['address.country'] ? '#ff0055' : 'rgba(0,255,198,0.3)'}
                                                                >
                                                                    <option value="" style={{ backgroundColor: '#0a0a0a' }}>Select a country</option>
                                                                    <option value="US" style={{ backgroundColor: '#0a0a0a' }}>United States</option>
                                                                    <option value="CA" style={{ backgroundColor: '#0a0a0a' }}>Canada</option>
                                                                    <option value="UK" style={{ backgroundColor: '#0a0a0a' }}>United Kingdom</option>
                                                                    <option value="AU" style={{ backgroundColor: '#0a0a0a' }}>Australia</option>
                                                                    <option value="DE" style={{ backgroundColor: '#0a0a0a' }}>Germany</option>
                                                                    <option value="FR" style={{ backgroundColor: '#0a0a0a' }}>France</option>
                                                                    <option value="JP" style={{ backgroundColor: '#0a0a0a' }}>Japan</option>
                                                                    <option value="CN" style={{ backgroundColor: '#0a0a0a' }}>China</option>
                                                                    <option value="IN" style={{ backgroundColor: '#0a0a0a' }}>India</option>
                                                                    <option value="BR" style={{ backgroundColor: '#0a0a0a' }}>Brazil</option>
                                                                    <option value="MX" style={{ backgroundColor: '#0a0a0a' }}>Mexico</option>
                                                                    <option value="OTHER" style={{ backgroundColor: '#0a0a0a' }}>Other</option>
                                                                </select>
                                                                {errors['address.country'] && <p className="text-xs mt-1" style={{ color: '#ff0055' }}>{errors['address.country']}</p>}
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                                                    <FaBuilding className="inline mr-2" />
                                                                    State/Province *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="address.state"
                                                                    value={formData.address.state}
                                                                    onChange={handleChange}
                                                                    disabled={!isEditing}
                                                                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-300"
                                                                    style={{
                                                                        border: errors['address.state'] ? '1px solid #ff0055' : '1px solid rgba(0,255,198,0.3)',
                                                                        backgroundColor: isEditing ? 'rgba(0,255,198,0.05)' : 'rgba(0,255,198,0.02)',
                                                                        color: '#E0E0E0'
                                                                    }}
                                                                    onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                    onBlur={(e) => e.currentTarget.style.borderColor = errors['address.state'] ? '#ff0055' : 'rgba(0,255,198,0.3)'}
                                                                />
                                                                {errors['address.state'] && <p className="text-xs mt-1" style={{ color: '#ff0055' }}>{errors['address.state']}</p>}
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                                                    <FaEnvelope className="inline mr-2" />
                                                                    Postal/Zip code*
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="address.postalCode"
                                                                    value={formData.address.postalCode}
                                                                    onChange={handleChange}
                                                                    disabled={!isEditing}
                                                                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-300"
                                                                    style={{
                                                                        border: errors['address.postalCode'] ? '1px solid #ff0055' : '1px solid rgba(0,255,198,0.3)',
                                                                        backgroundColor: isEditing ? 'rgba(0,255,198,0.05)' : 'rgba(0,255,198,0.02)',
                                                                        color: '#E0E0E0'
                                                                    }}
                                                                    onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                    onBlur={(e) => e.currentTarget.style.borderColor = errors['address.postalCode'] ? '#ff0055' : 'rgba(0,255,198,0.3)'}
                                                                />
                                                                {errors['address.postalCode'] && <p className="text-xs mt-1" style={{ color: '#ff0055' }}>{errors['address.postalCode']}</p>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-8">
                                                        <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                                            <FaCreditCard className="inline mr-2" />
                                                            VAT/GST ID
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="vatId"
                                                            value={formData.vatId}
                                                            onChange={handleChange}
                                                            disabled={!isEditing}
                                                            className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:outline-none transition-all duration-300"
                                                            style={{
                                                                border: '1px solid rgba(0,255,198,0.3)',
                                                                backgroundColor: isEditing ? 'rgba(0,255,198,0.05)' : 'rgba(0,255,198,0.02)',
                                                                color: '#E0E0E0'
                                                            }}
                                                            onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}
                                                        />
                                                    </div>

                                                    {isEditing && (
                                                        <div className="mt-8 flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsEditing(false)}
                                                                className="mr-4 px-6 py-2 rounded-lg transition-colors duration-300"
                                                                style={{ border: '1px solid rgba(0,255,198,0.3)', color: '#b0f5e6', backgroundColor: 'transparent' }}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.1)'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                className="px-6 py-2 rounded-lg transition-colors duration-300 flex items-center shadow-md hover:shadow-lg"
                                                                style={{ backgroundColor: '#00FFC6', color: '#0a0a0a' }}
                                                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,198,0.6)'}
                                                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
                                                            >
                                                                <FaSave className="mr-2" />
                                                                Save Changes
                                                            </button>
                                                        </div>
                                                    )}
                                                </form>
                                            </div>
                                        )}

                                        {/* Security Tab */}
                                        {activeTab === 'security' && (
                                            <div className={`space-y-6 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '100ms' }}>
                                                <div className="flex items-center">
                                                    <FaShieldAlt className="mr-3 text-2xl" style={{ color: '#00FFC6' }} />
                                                    <h2 className="text-2xl font-bold" style={{ color: '#E0E0E0' }}>Security Settings</h2>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#E0E0E0' }}>Two-Factor Authentication</h3>
                                                    <p className="mb-6" style={{ color: '#b0f5e6' }}>Add an extra layer of security to your account by enabling two-factor authentication.</p>

                                                    <div className="space-y-4">
                                                        {/* Email 2FA */}
                                                        <div className="flex items-center justify-between p-4 rounded-lg transition-all duration-300" style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.02)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00FFC6'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}>
                                                            <div className="flex items-center">
                                                                <FaEnvelope className="mr-3" style={{ color: '#00FFC6' }} />
                                                                <div>
                                                                    <h4 className="font-medium" style={{ color: '#E0E0E0' }}>Email Authentication</h4>
                                                                    <p className="text-sm" style={{ color: '#b0f5e6' }}>Receive a verification code via email</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleTwoFAChange('email')}
                                                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                                                style={{ backgroundColor: twoFASettings.email ? '#00FFC6' : 'rgba(176,245,230,0.3)' }}
                                                            >
                                                                <span className="inline-block h-4 w-4 transform rounded-full transition-transform" style={{ backgroundColor: twoFASettings.email ? '#0a0a0a' : '#b0f5e6', transform: twoFASettings.email ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }} />
                                                            </button>
                                                        </div>

                                                        {emailVerificationSent && (
                                                            <div className="px-4 py-3 rounded-lg flex items-center" style={{ backgroundColor: 'rgba(0,255,198,0.1)', border: '1px solid rgba(0,255,198,0.3)', color: '#00FFC6' }}>
                                                                <FaCheckCircle className="mr-2" />
                                                                Verification email sent! Please check your inbox.
                                                            </div>
                                                        )}

                                                        {/* QR Code 2FA */}
                                                        <div className="flex items-center justify-between p-4 rounded-lg transition-all duration-300" style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.02)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00FFC6'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}>
                                                            <div className="flex items-center">
                                                                <FaQrcode className="mr-3" style={{ color: '#00FFC6' }} />
                                                                <div>
                                                                    <h4 className="font-medium" style={{ color: '#E0E0E0' }}>Authenticator App</h4>
                                                                    <p className="text-sm" style={{ color: '#b0f5e6' }}>Use an app like Google Authenticator</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleTwoFAChange('qrCode')}
                                                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                                                style={{ backgroundColor: twoFASettings.qrCode ? '#00FFC6' : 'rgba(176,245,230,0.3)' }}
                                                            >
                                                                <span className="inline-block h-4 w-4 transform rounded-full transition-transform" style={{ backgroundColor: twoFASettings.qrCode ? '#0a0a0a' : '#b0f5e6', transform: twoFASettings.qrCode ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }} />
                                                            </button>
                                                        </div>

                                                        {showQrCode && qrCodeData && (
                                                            <div className="p-6 rounded-lg" style={{ backgroundColor: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.2)' }}>
                                                                <h4 className="font-medium mb-4" style={{ color: '#E0E0E0' }}>Set up Authenticator App</h4>
                                                                <div className="flex flex-col items-center">
                                                                    <div className="p-4 rounded-lg mb-4 shadow-md" style={{ backgroundColor: 'white' }}>
                                                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`} alt="QR Code" className="rounded-lg" />
                                                                    </div>
                                                                    <p className="text-sm mb-4 text-center" style={{ color: '#b0f5e6' }}>
                                                                        1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)<br />
                                                                        2. Enter the 6-digit code below to verify and enable TOTP
                                                                    </p>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Enter 6-digit code"
                                                                        maxLength={6}
                                                                        className="px-4 py-2 rounded-lg mb-4 w-full max-w-xs text-center tracking-widest font-mono"
                                                                        style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.05)', color: '#E0E0E0' }}
                                                                        onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}
                                                                        onKeyDown={async (e) => {
                                                                            if (e.key === 'Enter') {
                                                                                const code = (e.target as HTMLInputElement).value;
                                                                                if (!code || code.length !== 6) {
                                                                                    alert('Please enter a 6-digit code');
                                                                                    return;
                                                                                }
                                                                                try {
                                                                                    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
                                                                                    const res = await fetch('/api/2fa/verify', {
                                                                                        method: 'POST',
                                                                                        headers: {
                                                                                            'Content-Type': 'application/json',
                                                                                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                                                                        },
                                                                                        body: JSON.stringify({ token: code })
                                                                                    });

                                                                                    if (!res.ok) {
                                                                                        const errorData = await res.json();
                                                                                        throw new Error(errorData.error || 'Failed to verify code');
                                                                                    }

                                                                                    setShowQrCode(false);
                                                                                    setQrCodeData(null);
                                                                                    setTwoFASettings(prev => ({ ...prev, qrCode: true }));
                                                                                    setError(null);

                                                                                    // Clear the input
                                                                                    (e.target as HTMLInputElement).value = '';
                                                                                } catch (error) {
                                                                                    console.error('TOTP verification error:', error);
                                                                                    const errorMessage = error instanceof Error ? error.message : 'Invalid code';
                                                                                    setError(errorMessage);
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                    {error && (
                                                                        <div className="px-4 py-3 rounded-lg mb-4 text-sm" style={{ backgroundColor: 'rgba(255,0,85,0.1)', border: '1px solid rgba(255,0,85,0.3)', color: '#ff6699' }}>
                                                                            {error}
                                                                        </div>
                                                                    )}
                                                                    <div className="flex space-x-3">
                                                                        <button
                                                                            onClick={async () => {
                                                                                const input = document.querySelector('input[placeholder="Enter 6-digit code"]') as HTMLInputElement;
                                                                                const code = input?.value;
                                                                                if (!code || code.length !== 6) {
                                                                                    alert('Please enter a 6-digit code');
                                                                                    return;
                                                                                }
                                                                                try {
                                                                                    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
                                                                                    const res = await fetch('/api/2fa/verify', {
                                                                                        method: 'POST',
                                                                                        headers: {
                                                                                            'Content-Type': 'application/json',
                                                                                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                                                                        },
                                                                                        body: JSON.stringify({ token: code })
                                                                                    });

                                                                                    if (!res.ok) {
                                                                                        const errorData = await res.json();
                                                                                        throw new Error(errorData.error || 'Failed to verify code');
                                                                                    }

                                                                                    setShowQrCode(false);
                                                                                    setQrCodeData(null);
                                                                                    setTwoFASettings(prev => ({ ...prev, qrCode: true }));
                                                                                    setError(null);

                                                                                    // Clear the input
                                                                                    if (input) input.value = '';
                                                                                } catch (error) {
                                                                                    console.error('TOTP verification error:', error);
                                                                                    const errorMessage = error instanceof Error ? error.message : 'Invalid code';
                                                                                    setError(errorMessage);
                                                                                }
                                                                            }}
                                                                            className="px-4 py-2 rounded-lg transition-colors"
                                                                            style={{ backgroundColor: '#00FFC6', color: '#0a0a0a' }}
                                                                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,198,0.6)'}
                                                                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                                                                        >
                                                                            Verify & Enable
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setShowQrCode(false);
                                                                                setQrCodeData(null);
                                                                                setError(null);
                                                                            }}
                                                                            className="px-4 py-2 rounded-lg transition-colors"
                                                                            style={{ backgroundColor: 'rgba(176,245,230,0.2)', color: '#b0f5e6' }}
                                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(176,245,230,0.3)'}
                                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(176,245,230,0.2)'}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-8">
                                                        <h3 className="text-lg font-semibold mb-4" style={{ color: '#E0E0E0' }}>Password Management</h3>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between p-4 rounded-lg transition-all duration-300" style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.02)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00FFC6'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}>
                                                                <div>
                                                                    <h4 className="font-medium" style={{ color: '#E0E0E0' }}>Reset Password</h4>
                                                                    <p className="text-sm" style={{ color: '#b0f5e6' }}>Change your account password</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => console.log('Reset password clicked')}
                                                                    className="px-4 py-2 rounded-lg transition-colors flex items-center shadow-md hover:shadow-lg"
                                                                    style={{ backgroundColor: '#00FFC6', color: '#0a0a0a' }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,198,0.6)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
                                                                >
                                                                    <FaLock className="mr-2" />
                                                                    Reset Password
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center justify-between p-4 rounded-lg transition-all duration-300" style={{ border: '1px solid rgba(255,0,85,0.3)', backgroundColor: 'rgba(255,0,85,0.02)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ff0055'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,0,85,0.3)'}>
                                                                <div>
                                                                    <h4 className="font-medium" style={{ color: '#E0E0E0' }}>Reset 2FA</h4>
                                                                    <p className="text-sm" style={{ color: '#b0f5e6' }}>Disable all two-factor authentication methods</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => console.log('Reset 2FA clicked')}
                                                                    className="px-4 py-2 rounded-lg transition-colors flex items-center shadow-md hover:shadow-lg"
                                                                    style={{ backgroundColor: '#ff0055', color: 'white' }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(255,0,85,0.6)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
                                                                >
                                                                    <FaKey className="mr-2" />
                                                                    Reset 2FA
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.3)' }}>
                                                        <div className="flex items-start">
                                                            <FaExclamationTriangle className="mr-3 mt-0.5" style={{ color: '#ffc800' }} />
                                                            <div>
                                                                <h4 className="font-medium" style={{ color: '#ffc800' }}>Security Tip</h4>
                                                                <p className="text-sm mt-1" style={{ color: 'rgba(255,200,0,0.8)' }}>Enable at least one two-factor authentication method to significantly improve your account security.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Email Preferences Tab */}
                                        {activeTab === 'emailPreferences' && (
                                            <div className={`space-y-6 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '100ms' }}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <FaEnvelope className="mr-3 text-2xl" style={{ color: '#00FFC6' }} />
                                                        <h2 className="text-2xl font-bold" style={{ color: '#E0E0E0' }}>Email Preferences</h2>
                                                    </div>
                                                    {!isEditingEmailPreferences && !loadingEmailPreferences && (
                                                        <button
                                                            onClick={() => setIsEditingEmailPreferences(true)}
                                                            className="px-4 py-2 rounded-lg transition-colors flex items-center"
                                                            style={{ backgroundColor: '#00FFC6', color: '#0a0a0a' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,198,0.6)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                                                        >
                                                            <FaEdit className="mr-2" />
                                                            Edit
                                                        </button>
                                                    )}
                                                </div>

                                                <p style={{ color: '#b0f5e6' }}>Manage your email notification preferences to control which types of emails you receive and how frequently.</p>

                                                {loadingEmailPreferences ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#00FFC6' }}></div>
                                                        <span className="ml-2" style={{ color: '#b0f5e6' }}>Loading email preferences...</span>
                                                    </div>
                                                ) : emailPreferences ? (
                                                    <div className="space-y-4">
                                                        {/* 2FA Notifications */}
                                                        <div className="rounded-lg p-6 transition-colors" style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.02)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00FFC6'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}>
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div>
                                                                    <h3 className="text-lg font-semibold" style={{ color: '#E0E0E0' }}>Two-Factor Authentication Notifications</h3>
                                                                    <p className="text-sm mt-1" style={{ color: '#b0f5e6' }}>Receive alerts about 2FA activity and changes</p>
                                                                </div>
                                                                {isEditingEmailPreferences && (
                                                                    <button
                                                                        onClick={() => handleEmailPreferencesChange('twoFANotifications', 'enabled', !emailPreferences.twoFANotifications.enabled)}
                                                                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                                                        style={{ backgroundColor: emailPreferences.twoFANotifications.enabled ? '#00FFC6' : 'rgba(176,245,230,0.3)' }}
                                                                    >
                                                                        <span className="inline-block h-4 w-4 transform rounded-full transition-transform" style={{ backgroundColor: emailPreferences.twoFANotifications.enabled ? '#0a0a0a' : '#b0f5e6', transform: emailPreferences.twoFANotifications.enabled ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }} />
                                                                    </button>
                                                                )}
                                                                {!isEditingEmailPreferences && (
                                                                    <div className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={emailPreferences.twoFANotifications.enabled ? { backgroundColor: 'rgba(0,255,198,0.2)', color: '#00FFC6' } : { backgroundColor: 'rgba(176,245,230,0.2)', color: '#b0f5e6' }}>
                                                                        {emailPreferences.twoFANotifications.enabled ? 'Enabled' : 'Disabled'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {emailPreferences.twoFANotifications.enabled && (
                                                                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,255,198,0.2)' }}>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Frequency</label>
                                                                    {isEditingEmailPreferences ? (
                                                                        <select
                                                                            value={emailPreferences.twoFANotifications.frequency}
                                                                            onChange={(e) => handleEmailPreferencesChange('twoFANotifications', 'frequency', e.target.value as any)}
                                                                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none"
                                                                            style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.05)', color: '#E0E0E0' }}
                                                                            onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}
                                                                        >
                                                                            <option value="daily" style={{ backgroundColor: '#0a0a0a' }}>Daily</option>
                                                                            <option value="weekly" style={{ backgroundColor: '#0a0a0a' }}>Weekly</option>
                                                                            <option value="monthly" style={{ backgroundColor: '#0a0a0a' }}>Monthly</option>
                                                                            <option value="quarterly" style={{ backgroundColor: '#0a0a0a' }}>Quarterly</option>
                                                                        </select>
                                                                    ) : (
                                                                        <div className="text-sm capitalize" style={{ color: '#b0f5e6' }}>{emailPreferences.twoFANotifications.frequency}</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Account Changes */}
                                                        <div className="rounded-lg p-6 transition-colors" style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.02)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00FFC6'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}>
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div>
                                                                    <h3 className="text-lg font-semibold" style={{ color: '#E0E0E0' }}>Account Changes</h3>
                                                                    <p className="text-sm mt-1" style={{ color: '#b0f5e6' }}>Get notified about profile and security changes</p>
                                                                </div>
                                                                {isEditingEmailPreferences && (
                                                                    <button
                                                                        onClick={() => handleEmailPreferencesChange('accountChanges', 'enabled', !emailPreferences.accountChanges.enabled)}
                                                                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                                                        style={{ backgroundColor: emailPreferences.accountChanges.enabled ? '#00FFC6' : 'rgba(176,245,230,0.3)' }}
                                                                    >
                                                                        <span className="inline-block h-4 w-4 transform rounded-full transition-transform" style={{ backgroundColor: emailPreferences.accountChanges.enabled ? '#0a0a0a' : '#b0f5e6', transform: emailPreferences.accountChanges.enabled ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }} />
                                                                    </button>
                                                                )}
                                                                {!isEditingEmailPreferences && (
                                                                    <div className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={emailPreferences.accountChanges.enabled ? { backgroundColor: 'rgba(0,255,198,0.2)', color: '#00FFC6' } : { backgroundColor: 'rgba(176,245,230,0.2)', color: '#b0f5e6' }}>
                                                                        {emailPreferences.accountChanges.enabled ? 'Enabled' : 'Disabled'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {emailPreferences.accountChanges.enabled && (
                                                                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,255,198,0.2)' }}>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Frequency</label>
                                                                    {isEditingEmailPreferences ? (
                                                                        <select
                                                                            value={emailPreferences.accountChanges.frequency}
                                                                            onChange={(e) => handleEmailPreferencesChange('accountChanges', 'frequency', e.target.value as any)}
                                                                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none"
                                                                            style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.05)', color: '#E0E0E0' }}
                                                                            onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}
                                                                        >
                                                                            <option value="daily" style={{ backgroundColor: '#0a0a0a' }}>Daily</option>
                                                                            <option value="weekly" style={{ backgroundColor: '#0a0a0a' }}>Weekly</option>
                                                                            <option value="monthly" style={{ backgroundColor: '#0a0a0a' }}>Monthly</option>
                                                                            <option value="quarterly" style={{ backgroundColor: '#0a0a0a' }}>Quarterly</option>
                                                                        </select>
                                                                    ) : (
                                                                        <div className="text-sm capitalize" style={{ color: '#b0f5e6' }}>{emailPreferences.accountChanges.frequency}</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Login Notifications */}
                                                        <div className="rounded-lg p-6 transition-colors" style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.02)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00FFC6'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}>
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div>
                                                                    <h3 className="text-lg font-semibold" style={{ color: '#E0E0E0' }}>Login Notifications</h3>
                                                                    <p className="text-sm mt-1" style={{ color: '#b0f5e6' }}>Receive alerts when your account is accessed</p>
                                                                </div>
                                                                {isEditingEmailPreferences && (
                                                                    <button
                                                                        onClick={() => handleEmailPreferencesChange('loginNotifications', 'enabled', !emailPreferences.loginNotifications.enabled)}
                                                                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                                                        style={{ backgroundColor: emailPreferences.loginNotifications.enabled ? '#00FFC6' : 'rgba(176,245,230,0.3)' }}
                                                                    >
                                                                        <span className="inline-block h-4 w-4 transform rounded-full transition-transform" style={{ backgroundColor: emailPreferences.loginNotifications.enabled ? '#0a0a0a' : '#b0f5e6', transform: emailPreferences.loginNotifications.enabled ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }} />
                                                                    </button>
                                                                )}
                                                                {!isEditingEmailPreferences && (
                                                                    <div className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={emailPreferences.loginNotifications.enabled ? { backgroundColor: 'rgba(0,255,198,0.2)', color: '#00FFC6' } : { backgroundColor: 'rgba(176,245,230,0.2)', color: '#b0f5e6' }}>
                                                                        {emailPreferences.loginNotifications.enabled ? 'Enabled' : 'Disabled'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {emailPreferences.loginNotifications.enabled && (
                                                                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,255,198,0.2)' }}>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Frequency</label>
                                                                    {isEditingEmailPreferences ? (
                                                                        <select
                                                                            value={emailPreferences.loginNotifications.frequency}
                                                                            onChange={(e) => handleEmailPreferencesChange('loginNotifications', 'frequency', e.target.value as any)}
                                                                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none"
                                                                            style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.05)', color: '#E0E0E0' }}
                                                                            onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}
                                                                        >
                                                                            <option value="daily" style={{ backgroundColor: '#0a0a0a' }}>Daily</option>
                                                                            <option value="weekly" style={{ backgroundColor: '#0a0a0a' }}>Weekly</option>
                                                                            <option value="monthly" style={{ backgroundColor: '#0a0a0a' }}>Monthly</option>
                                                                            <option value="quarterly" style={{ backgroundColor: '#0a0a0a' }}>Quarterly</option>
                                                                        </select>
                                                                    ) : (
                                                                        <div className="text-sm capitalize" style={{ color: '#b0f5e6' }}>{emailPreferences.loginNotifications.frequency}</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Newsletter */}
                                                        <div className="rounded-lg p-6 transition-colors" style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.02)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00FFC6'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}>
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div>
                                                                    <h3 className="text-lg font-semibold" style={{ color: '#E0E0E0' }}>Newsletter (Projects, Blogs & Updates)</h3>
                                                                    <p className="text-sm mt-1" style={{ color: '#b0f5e6' }}>Stay updated with our latest projects, blogs and announcements</p>
                                                                </div>
                                                                {isEditingEmailPreferences && (
                                                                    <button
                                                                        onClick={() => handleEmailPreferencesChange('newsletter', 'enabled', !emailPreferences.newsletter.enabled)}
                                                                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                                                        style={{ backgroundColor: emailPreferences.newsletter.enabled ? '#00FFC6' : 'rgba(176,245,230,0.3)' }}
                                                                    >
                                                                        <span className="inline-block h-4 w-4 transform rounded-full transition-transform" style={{ backgroundColor: emailPreferences.newsletter.enabled ? '#0a0a0a' : '#b0f5e6', transform: emailPreferences.newsletter.enabled ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }} />
                                                                    </button>
                                                                )}
                                                                {!isEditingEmailPreferences && (
                                                                    <div className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={emailPreferences.newsletter.enabled ? { backgroundColor: 'rgba(0,255,198,0.2)', color: '#00FFC6' } : { backgroundColor: 'rgba(176,245,230,0.2)', color: '#b0f5e6' }}>
                                                                        {emailPreferences.newsletter.enabled ? 'Enabled' : 'Disabled'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {emailPreferences.newsletter.enabled && (
                                                                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,255,198,0.2)' }}>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Frequency</label>
                                                                    {isEditingEmailPreferences ? (
                                                                        <select
                                                                            value={emailPreferences.newsletter.frequency}
                                                                            onChange={(e) => handleEmailPreferencesChange('newsletter', 'frequency', e.target.value as any)}
                                                                            className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none"
                                                                            style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.05)', color: '#E0E0E0' }}
                                                                            onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                                                            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}
                                                                        >
                                                                            <option value="daily" style={{ backgroundColor: '#0a0a0a' }}>Daily</option>
                                                                            <option value="weekly" style={{ backgroundColor: '#0a0a0a' }}>Weekly</option>
                                                                            <option value="monthly" style={{ backgroundColor: '#0a0a0a' }}>Monthly</option>
                                                                            <option value="quarterly" style={{ backgroundColor: '#0a0a0a' }}>Quarterly</option>
                                                                        </select>
                                                                    ) : (
                                                                        <div className="text-sm capitalize" style={{ color: '#b0f5e6' }}>{emailPreferences.newsletter.frequency}</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center py-8">
                                                        <span style={{ color: '#b0f5e6' }}>Failed to load email preferences</span>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                {isEditingEmailPreferences && !loadingEmailPreferences && emailPreferences && (
                                                    <div className="flex justify-end space-x-3 pt-4" style={{ borderTop: '1px solid rgba(0,255,198,0.2)' }}>
                                                        <button
                                                            onClick={() => {
                                                                setIsEditingEmailPreferences(false);
                                                                loadEmailPreferences(); // Reload to discard changes
                                                            }}
                                                            className="px-4 py-2 rounded-lg transition-colors"
                                                            style={{ border: '1px solid rgba(0,255,198,0.3)', color: '#b0f5e6', backgroundColor: 'transparent' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.1)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleResetEmailPreferences}
                                                            className="px-4 py-2 rounded-lg transition-colors"
                                                            style={{ border: '1px solid rgba(255,0,85,0.3)', color: '#ff6699', backgroundColor: 'transparent' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,0,85,0.1)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        >
                                                            Reset to Defaults
                                                        </button>
                                                        <button
                                                            onClick={handleSaveEmailPreferences}
                                                            className="px-4 py-2 rounded-lg transition-colors flex items-center"
                                                            style={{ backgroundColor: '#00FFC6', color: '#0a0a0a' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,198,0.6)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                                                        >
                                                            <FaSave className="mr-2" />
                                                            Save Changes
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Pricing & Subscription Tab */}
                                        {activeTab === 'pricing' && (
                                            <div className={`space-y-3 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '100ms' }}>
                                                {/* Header with Sub-navigation */}
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                                    <div className="flex items-center">
                                                        <FaCreditCard className="mr-2 text-lg" style={{ color: '#00FFC6' }} />
                                                        <h2 className="text-lg font-bold" style={{ color: '#E0E0E0' }}>Pricing & Subscription</h2>
                                                    </div>

                                                    {/* Sub-navigation */}
                                                    <div className="flex rounded-lg p-0.5 w-full sm:w-auto" style={{ backgroundColor: 'rgba(0,255,198,0.1)' }}>
                                                        <button
                                                            onClick={() => setPricingSubView('subscription')}
                                                            className="flex-1 sm:flex-none px-3 py-1 rounded-md text-xs font-medium transition-all duration-300"
                                                            style={pricingSubView === 'subscription'
                                                                ? { backgroundColor: '#00FFC6', color: '#0a0a0a', boxShadow: '0 0 15px rgba(0,255,198,0.4)' }
                                                                : { color: '#b0f5e6', backgroundColor: 'transparent' }}
                                                        >
                                                            Subscription
                                                        </button>
                                                        <button
                                                            onClick={() => setPricingSubView('payments')}
                                                            className="flex-1 sm:flex-none px-3 py-1 rounded-md text-xs font-medium transition-all duration-300"
                                                            style={pricingSubView === 'payments'
                                                                ? { backgroundColor: '#00FFC6', color: '#0a0a0a', boxShadow: '0 0 15px rgba(0,255,198,0.4)' }
                                                                : { color: '#b0f5e6', backgroundColor: 'transparent' }}
                                                        >
                                                            Payments
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Error Message */}
                                                {subscriptionError && (
                                                    <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(255,0,85,0.1)', border: '1px solid rgba(255,0,85,0.3)' }}>
                                                        <div className="flex items-start">
                                                            <FaExclamationTriangle className="mr-3 mt-0.5" style={{ color: '#ff0055' }} />
                                                            <div>
                                                                <h4 className="font-medium" style={{ color: '#ff6699' }}>Subscription Error</h4>
                                                                <p className="text-sm mt-1" style={{ color: '#ff6699', opacity: 0.9 }}>{subscriptionError}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Subscription View */}
                                                {pricingSubView === 'subscription' && (
                                                    <div className="space-y-4">
                                                        {/* Active Subscription Display */}
                                                        {activeSubscription && (
                                                            <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(0,255,198,0.1)', border: '2px solid rgba(0,255,198,0.3)' }}>
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div>
                                                                        <h4 className="font-semibold text-sm mb-1" style={{ color: '#00FFC6' }}>Active Subscription</h4>
                                                                        <p className="text-xs" style={{ color: '#b0f5e6' }}>Your current subscription details and timeline</p>
                                                                    </div>
                                                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(0,255,198,0.2)', color: '#00FFC6' }}>
                                                                        Active
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4 text-xs">
                                                                    <div className="rounded p-2" style={{ backgroundColor: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.2)' }}>
                                                                        <p style={{ color: '#b0f5e6', opacity: 0.7 }}>Plan Type</p>
                                                                        <p className="font-semibold capitalize mt-0.5" style={{ color: '#E0E0E0' }}>{activeSubscription.planType || 'N/A'}</p>
                                                                    </div>
                                                                    <div className="rounded p-2" style={{ backgroundColor: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.2)' }}>
                                                                        <p style={{ color: '#b0f5e6', opacity: 0.7 }}>Billing Cycle</p>
                                                                        <p className="font-semibold capitalize mt-0.5" style={{ color: '#E0E0E0' }}>{activeSubscription.billingCycle || 'N/A'}</p>
                                                                    </div>
                                                                    <div className="rounded p-2" style={{ backgroundColor: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.2)' }}>
                                                                        <p style={{ color: '#b0f5e6', opacity: 0.7 }}>Amount</p>
                                                                        <p className="font-semibold mt-0.5" style={{ color: '#00FFC6' }}>₹{activeSubscription.amount || 0}</p>
                                                                    </div>
                                                                    <div className="rounded p-2" style={{ backgroundColor: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.2)' }}>
                                                                        <p style={{ color: '#b0f5e6', opacity: 0.7 }}>Started</p>
                                                                        <p className="font-semibold mt-0.5" style={{ color: '#E0E0E0' }}>{activeSubscription.startDate ? new Date(activeSubscription.startDate).toLocaleDateString() : 'N/A'}</p>
                                                                    </div>
                                                                    <div className="rounded p-2" style={{ backgroundColor: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.2)' }}>
                                                                        <p style={{ color: '#b0f5e6', opacity: 0.7 }}>Ends</p>
                                                                        <p className="font-semibold mt-0.5" style={{ color: '#E0E0E0' }}>{activeSubscription.endDate ? new Date(activeSubscription.endDate).toLocaleDateString() : 'N/A'}</p>
                                                                    </div>
                                                                    <div className="rounded p-2" style={{ backgroundColor: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.2)' }}>
                                                                        <p style={{ color: '#b0f5e6', opacity: 0.7 }}>Renews</p>
                                                                        <p className="font-semibold mt-0.5" style={{ color: '#00FFC6' }}>{activeSubscription.renewalDate ? new Date(activeSubscription.renewalDate).toLocaleDateString() : 'N/A'}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-3 p-2 rounded" style={{ backgroundColor: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.2)' }}>
                                                                    <p className="text-xs font-medium" style={{ color: '#00FFC6' }}>Transaction ID: <span style={{ color: '#b0f5e6' }}>{activeSubscription.transactionId || activeSubscription.paymentId || 'N/A'}</span></p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={handleCancelSubscription}
                                                                        disabled={isCancelingSubscription}
                                                                        className="flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-300 flex items-center justify-center"
                                                                        style={{ 
                                                                            backgroundColor: 'rgba(255,0,85,0.15)', 
                                                                            color: '#ff6699', 
                                                                            border: '1px solid rgba(255,0,85,0.3)',
                                                                            opacity: isCancelingSubscription ? 0.6 : 1 
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            if (!isCancelingSubscription) {
                                                                                e.currentTarget.style.backgroundColor = 'rgba(255,0,85,0.25)';
                                                                                e.currentTarget.style.borderColor = 'rgba(255,0,85,0.5)';
                                                                            }
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            if (!isCancelingSubscription) {
                                                                                e.currentTarget.style.backgroundColor = 'rgba(255,0,85,0.15)';
                                                                                e.currentTarget.style.borderColor = 'rgba(255,0,85,0.3)';
                                                                            }
                                                                        }}
                                                                    >
                                                                        {isCancelingSubscription ? (
                                                                            <>
                                                                                <FaSpinner className="mr-2 animate-spin" />
                                                                                Cancelling...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <FaBan className="mr-2" />
                                                                                Cancel Subscription
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Billing Cycle Selector */}
                                                        <div className="text-center">
                                                            <h3 className="text-base font-semibold mb-2" style={{ color: '#E0E0E0' }}>Choose Your Plan</h3>
                                                            <p className="mb-4 text-sm" style={{ color: '#b0f5e6' }}>Get access to premium content and support the creator</p>

                                                            <div className="flex justify-center flex-wrap">
                                                                <div className="flex flex-col sm:flex-row rounded-lg p-0.5 max-w-full sm:max-w-md" style={{ backgroundColor: 'rgba(0,255,198,0.1)' }}>
                                                                    <button
                                                                        onClick={() => setBillingCycle('monthly')}
                                                                        disabled={isSubscribing}
                                                                        className="px-4 py-2 rounded-md text-xs font-medium transition-all duration-300"
                                                                        style={billingCycle === 'monthly'
                                                                            ? { backgroundColor: '#00FFC6', color: '#0a0a0a', boxShadow: '0 0 15px rgba(0,255,198,0.4)' }
                                                                            : { color: '#b0f5e6', backgroundColor: 'transparent' }}
                                                                    >
                                                                        Monthly
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setBillingCycle('quarterly')}
                                                                        disabled={isSubscribing}
                                                                        className="px-4 py-2 rounded-md text-xs font-medium transition-all duration-300 relative"
                                                                        style={billingCycle === 'quarterly'
                                                                            ? { backgroundColor: '#00FFC6', color: '#0a0a0a', boxShadow: '0 0 15px rgba(0,255,198,0.4)' }
                                                                            : { color: '#b0f5e6', backgroundColor: 'transparent' }}
                                                                    >
                                                                        Quarterly
                                                                        <span className="absolute -top-3 -right-0.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#0a0a0a', color: '#00FFC6', fontSize: '10px' }}>
                                                                            15% OFF
                                                                        </span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setBillingCycle('yearly')}
                                                                        disabled={isSubscribing}
                                                                        className="px-4 py-2 rounded-md text-xs font-medium transition-all duration-300 relative"
                                                                        style={billingCycle === 'yearly'
                                                                            ? { backgroundColor: '#00FFC6', color: '#0a0a0a', boxShadow: '0 0 15px rgba(0,255,198,0.4)' }
                                                                            : { color: '#b0f5e6', backgroundColor: 'transparent' }}
                                                                    >
                                                                        Yearly
                                                                        <span className="absolute -top-3 -right-0.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#0a0a0a', color: '#00FFC6', fontSize: '10px' }}>
                                                                            30% OFF
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Pricing Cards */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            {/* Free Plan */}
                                                            <div className="rounded-2xl p-5 relative transition-all duration-300" style={{ border: '2px solid rgba(176,245,230,0.3)', backgroundColor: 'rgba(0,255,198,0.02)' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,198,0.2)'; e.currentTarget.style.borderColor = 'rgba(0,255,198,0.5)'; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(176,245,230,0.3)'; }}>
                                                                <div className="text-center h-full flex flex-col">
                                                                    <h3 className="text-lg font-bold mb-1" style={{ color: '#E0E0E0' }}>Free</h3>
                                                                    <div className="mb-4">
                                                                        <span className="text-2xl font-bold" style={{ color: '#E0E0E0' }}>₹0</span>
                                                                        <span className="text-xs" style={{ color: '#b0f5e6' }}>/{billingCycle.replace('ly', '')}</span>
                                                                    </div>
                                                                    <ul className="space-y-2 mb-4 text-left flex-grow">
                                                                        <li className="flex items-center text-sm">
                                                                            <FaCheck className="mr-2 flex-shrink-0 text-xs" style={{ color: '#00FFC6' }} />
                                                                            <span style={{ color: '#b0f5e6' }}>Limited blog access</span>
                                                                        </li>
                                                                        <li className="flex items-center text-sm">
                                                                            <FaCheck className="mr-2 flex-shrink-0 text-xs" style={{ color: '#00FFC6' }} />
                                                                            <span style={{ color: '#b0f5e6' }}>Limited projects</span>
                                                                        </li>
                                                                        <li className="flex items-center text-sm">
                                                                            <FaCheck className="mr-2 flex-shrink-0 text-xs" style={{ color: '#00FFC6' }} />
                                                                            <span style={{ color: '#b0f5e6' }}>Newsletter notifications</span>
                                                                        </li>
                                                                    </ul>
                                                                    <button
                                                                        onClick={() => handleSubscribe('free')}
                                                                        disabled={isSubscribing && subscribingPlan === 'free'}
                                                                        className="w-full py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center text-sm"
                                                                        style={{ backgroundColor: 'rgba(176,245,230,0.2)', color: '#b0f5e6', opacity: isSubscribing && subscribingPlan === 'free' ? 0.6 : 1 }}
                                                                        onMouseEnter={(e) => { if (!(isSubscribing && subscribingPlan === 'free')) e.currentTarget.style.backgroundColor = 'rgba(176,245,230,0.3)'; }}
                                                                        onMouseLeave={(e) => { if (!(isSubscribing && subscribingPlan === 'free')) e.currentTarget.style.backgroundColor = 'rgba(176,245,230,0.2)'; }}
                                                                    >
                                                                        {isSubscribing && subscribingPlan === 'free' ? (
                                                                            <>
                                                                                <FaSpinner className="mr-2 animate-spin" />
                                                                                Processing...
                                                                            </>
                                                                        ) : (
                                                                            'Continue for Free'
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Supporter Plan */}
                                                            <div className="rounded-2xl p-5 relative transition-all duration-300" style={{ border: '2px solid rgba(0,255,198,0.4)', backgroundColor: 'rgba(0,255,198,0.05)' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,198,0.3)'; e.currentTarget.style.borderColor = '#00FFC6'; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(0,255,198,0.4)'; }}>
                                                                <div className="absolute top-3 right-3">
                                                                    <span
                                                                        className="px-2 py-0.5 rounded-full text-xs font-medium absolute -top-2 right-0"
                                                                        style={{ backgroundColor: 'rgba(0,255,198,0.2)', color: '#00FFC6' }}
                                                                    >
                                                                        Popular
                                                                    </span>
                                                                </div>
                                                                <div className="text-center h-full flex flex-col">
                                                                    <h3 className="text-lg font-bold mb-1" style={{ color: '#E0E0E0' }}>Supporter</h3>
                                                                    <div className="mb-4">
                                                                        <span className="text-2xl font-bold" style={{ color: '#E0E0E0' }}>
                                                                            ₹{getPricingData().supporter[billingCycle]}
                                                                        </span>
                                                                        <span className="text-xs" style={{ color: '#b0f5e6' }}>/{billingCycle.replace('ly', '')}</span>
                                                                    </div>
                                                                    <ul className="space-y-2 mb-4 text-left flex-grow">
                                                                        <li className="flex items-center text-sm">
                                                                            <FaCheck className="mr-2 flex-shrink-0 text-xs" style={{ color: '#00FFC6' }} />
                                                                            <span style={{ color: '#b0f5e6' }}>Full blog access</span>
                                                                        </li>
                                                                        <li className="flex items-center text-sm">
                                                                            <FaCheck className="mr-2 flex-shrink-0 text-xs" style={{ color: '#00FFC6' }} />
                                                                            <span style={{ color: '#b0f5e6' }}>Newsletter + PDF guides</span>
                                                                        </li>
                                                                        <li className="flex items-center text-sm">
                                                                            <FaCheck className="mr-2 flex-shrink-0 text-xs" style={{ color: '#00FFC6' }} />
                                                                            <span style={{ color: '#b0f5e6' }}>Support the creator</span>
                                                                        </li>
                                                                        <li className="flex items-center text-sm" style={{ opacity: 0.5 }}>
                                                                            <FaTimes className="mr-2 flex-shrink-0 text-xs" style={{ color: '#b0f5e6' }} />
                                                                            <span style={{ color: '#b0f5e6' }}>No full project access</span>
                                                                        </li>
                                                                    </ul>
                                                                    <button
                                                                        onClick={() => handleSubscribe('supporter')}
                                                                        disabled={isSubscribing && subscribingPlan === 'supporter'}
                                                                        className="w-full py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center text-sm"
                                                                        style={{ backgroundColor: '#00FFC6', color: '#0a0a0a', opacity: isSubscribing && subscribingPlan === 'supporter' ? 0.6 : 1 }}
                                                                        onMouseEnter={(e) => { if (!(isSubscribing && subscribingPlan === 'supporter')) e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,198,0.6)'; }}
                                                                        onMouseLeave={(e) => { if (!(isSubscribing && subscribingPlan === 'supporter')) e.currentTarget.style.boxShadow = 'none'; }}
                                                                    >
                                                                        {isSubscribing && subscribingPlan === 'supporter' ? (
                                                                            <>
                                                                                <FaSpinner className="mr-2 animate-spin" />
                                                                                Processing...
                                                                            </>
                                                                        ) : (
                                                                            'Subscribe'
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* All-Access Plan */}
                                                            <div className="rounded-2xl p-5 relative transition-all duration-300" style={{ background: 'linear-gradient(135deg, rgba(0,255,198,0.15), rgba(0,255,198,0.05))', border: '2px solid #00FFC6' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,198,0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}>
                                                                <div className="absolute top-3 right-3">
                                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium absolute -top-2 right-0" style={{ backgroundColor: '#00FFC6', color: '#0a0a0a' }}>
                                                                        Recommended
                                                                    </span>
                                                                </div>
                                                                <div className="text-center h-full flex flex-col">
                                                                    <h3 className="text-lg font-bold mb-1" style={{ color: '#E0E0E0' }}>All-Access</h3>
                                                                    <div className="mb-4">
                                                                        <span className="text-2xl font-bold" style={{ color: '#E0E0E0' }}>
                                                                            ₹{getPricingData().allAccess[billingCycle]}
                                                                        </span>
                                                                        <span className="text-xs" style={{ color: '#b0f5e6' }}>/{billingCycle.replace('ly', '')}</span>
                                                                    </div>
                                                                    <ul className="space-y-2 mb-4 text-left flex-grow">
                                                                        <li className="flex items-center text-sm">
                                                                            <FaCheck className="mr-2 flex-shrink-0 text-xs" style={{ color: '#00FFC6' }} />
                                                                            <span style={{ color: '#b0f5e6' }}>Full blog access</span>
                                                                        </li>
                                                                        <li className="flex items-center text-sm">
                                                                            <FaCheck className="mr-2 flex-shrink-0 text-xs" style={{ color: '#00FFC6' }} />
                                                                            <span style={{ color: '#b0f5e6' }}>Full project access</span>
                                                                        </li>
                                                                        <li className="flex items-center text-sm">
                                                                            <FaCheck className="mr-2 flex-shrink-0 text-xs" style={{ color: '#00FFC6' }} />
                                                                            <span style={{ color: '#b0f5e6' }}>All premium resources</span>
                                                                        </li>
                                                                        <li className="flex items-center text-sm">
                                                                            <FaCheck className="mr-2 flex-shrink-0 text-xs" style={{ color: '#00FFC6' }} />
                                                                            <span style={{ color: '#b0f5e6' }}>Priority support</span>
                                                                        </li>
                                                                    </ul>
                                                                    <button
                                                                        onClick={() => handleSubscribe('allAccess')}
                                                                        disabled={isSubscribing && subscribingPlan === 'allAccess'}
                                                                        className="w-full py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center text-sm"
                                                                        style={{ background: 'linear-gradient(135deg, #00FFC6, rgba(0,255,198,0.8))', color: '#0a0a0a', opacity: isSubscribing && subscribingPlan === 'allAccess' ? 0.6 : 1 }}
                                                                        onMouseEnter={(e) => { if (!(isSubscribing && subscribingPlan === 'allAccess')) e.currentTarget.style.boxShadow = '0 0 25px rgba(0,255,198,0.6)'; }}
                                                                        onMouseLeave={(e) => { if (!(isSubscribing && subscribingPlan === 'allAccess')) e.currentTarget.style.boxShadow = 'none'; }}
                                                                    >
                                                                        {isSubscribing && subscribingPlan === 'allAccess' ? (
                                                                            <>
                                                                                <FaSpinner className="mr-2 animate-spin" />
                                                                                Processing...
                                                                            </>
                                                                        ) : (
                                                                            'Subscribe'
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.2)' }}>
                                                            <p className="text-xs" style={{ color: '#b0f5e6' }}>
                                                                All plans include access to our cybersecurity insights and expert analysis.
                                                                Cancel anytime, no questions asked.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Payments View */}
                                                {pricingSubView === 'payments' && (
                                                    <div className="space-y-3">
                                                        <div>
                                                            <h3 className="text-base font-semibold mb-1" style={{ color: '#E0E0E0' }}>Payments & Transactions</h3>
                                                            <p className="text-sm" style={{ color: '#b0f5e6' }}>View all your payment transactions, pending payments, and billing history.</p>
                                                        </div>

                                                        {/* Scrollable Payment History Container */}
                                                        <div className="max-h-96 overflow-y-auto space-y-3">
                                                            {/* Pending Payments Section */}
                                                            {subscriptionPayments && subscriptionPayments.some((p: any) => p.status === 'pending') && (
                                                                <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(255,200,0,0.1)', border: '2px solid rgba(255,200,0,0.3)' }}>
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div>
                                                                            <h4 className="font-semibold text-sm mb-1" style={{ color: '#ffc800' }}>Pending Payments</h4>
                                                                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Payments awaiting completion or verification</p>
                                                                        </div>
                                                                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(255,200,0,0.2)', color: '#ffc800' }}>
                                                                            {subscriptionPayments.filter((p: any) => p.status === 'pending').length} Pending
                                                                        </span>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        {subscriptionPayments.filter((p: any) => p.status === 'pending').map((payment: any, index: number) => (
                                                                            <div key={payment._id || payment.id || index} className="rounded p-3" style={{ backgroundColor: 'rgba(255,200,0,0.05)', border: '1px solid rgba(255,200,0,0.2)' }}>
                                                                                <div className="flex flex-col gap-2">
                                                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                                                        <div>
                                                                                            <p className="font-semibold text-xs" style={{ color: '#E0E0E0' }}>{payment.description || `${payment.planType || 'Payment'} (${payment.billingCycle || 'monthly'})`}</p>
                                                                                            <p className="text-xs mt-1" style={{ color: '#b0f5e6' }}>
                                                                                                Initiated: {payment.createdAt || payment.date ? new Date(payment.createdAt || payment.date).toLocaleDateString() : 'N/A'}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div className="text-right">
                                                                                                <p className="font-semibold text-xs" style={{ color: '#ffc800' }}>₹{payment.amount || 0}</p>
                                                                                                <p className="text-xs mt-0.5" style={{ color: '#b0f5e6' }}>Transaction ID: {payment.transactionId || payment.paymentId}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <button
                                                                                        onClick={() => handleCancelPayment(payment._id || payment.id, payment.amount, payment.description || `${payment.planType} (${payment.billingCycle})`)}
                                                                                        disabled={cancelingPaymentId === (payment._id || payment.id)}
                                                                                        className="self-start px-3 py-1 rounded text-xs font-medium transition-all duration-300 flex items-center"
                                                                                        style={{
                                                                                            backgroundColor: 'rgba(255,0,85,0.15)',
                                                                                            color: '#ff6699',
                                                                                            border: '1px solid rgba(255,0,85,0.3)',
                                                                                            opacity: cancelingPaymentId === (payment._id || payment.id) ? 0.6 : 1
                                                                                        }}
                                                                                        onMouseEnter={(e) => {
                                                                                            if (cancelingPaymentId !== (payment._id || payment.id)) {
                                                                                                e.currentTarget.style.backgroundColor = 'rgba(255,0,85,0.25)';
                                                                                                e.currentTarget.style.borderColor = 'rgba(255,0,85,0.5)';
                                                                                            }
                                                                                        }}
                                                                                        onMouseLeave={(e) => {
                                                                                            if (cancelingPaymentId !== (payment._id || payment.id)) {
                                                                                                e.currentTarget.style.backgroundColor = 'rgba(255,0,85,0.15)';
                                                                                                e.currentTarget.style.borderColor = 'rgba(255,0,85,0.3)';
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        {cancelingPaymentId === (payment._id || payment.id) ? (
                                                                                            <>
                                                                                                <FaSpinner className="mr-1 animate-spin text-xs" />
                                                                                                Cancelling...
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <FaBan className="mr-1 text-xs" />
                                                                                                Cancel Payment
                                                                                            </>
                                                                                        )}
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {isSubscriptionLoading ? (
                                                                <div className="text-center py-6 rounded-lg" style={{ backgroundColor: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.1)' }}>
                                                                    <FaSpinner className="text-2xl mx-auto mb-2 animate-spin" style={{ color: '#00FFC6' }} />
                                                                    <p className="text-sm" style={{ color: '#b0f5e6' }}>Loading payment history...</p>
                                                                </div>
                                                            ) : subscriptionPayments && subscriptionPayments.length > 0 ? (
                                                                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,255,198,0.2)' }}>
                                                                    {/* Desktop Table View */}
                                                                    <div className="hidden md:block overflow-x-auto">
                                                                        <table className="w-full">
                                                                            <thead style={{ backgroundColor: 'rgba(0,255,198,0.1)', borderBottom: '1px solid rgba(0,255,198,0.2)' }}>
                                                                                <tr>
                                                                                    <th className="text-left py-4 px-6 font-semibold" style={{ color: '#00FFC6' }}>Date</th>
                                                                                    <th className="text-left py-4 px-6 font-semibold" style={{ color: '#00FFC6' }}>Type</th>
                                                                                    <th className="text-left py-4 px-6 font-semibold" style={{ color: '#00FFC6' }}>Plan/Project</th>
                                                                                    <th className="text-left py-4 px-6 font-semibold" style={{ color: '#00FFC6' }}>Amount</th>
                                                                                    <th className="text-left py-4 px-6 font-semibold" style={{ color: '#00FFC6' }}>Status</th>
                                                                                    <th className="text-center py-4 px-6 font-semibold" style={{ color: '#00FFC6' }}>Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {subscriptionPayments.map((payment: any, index: number) => (
                                                                                <tr key={payment._id || payment.id || index} className="transition-colors duration-200" style={{ borderBottom: index !== subscriptionPayments.length - 1 ? '1px solid rgba(0,255,198,0.1)' : 'none' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.05)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                                                    <td className="py-4 px-6 text-sm" style={{ color: '#E0E0E0' }}>
                                                                                        {payment.createdAt || payment.date ? new Date(payment.createdAt || payment.date).toLocaleDateString() : 'N/A'}
                                                                                    </td>
                                                                                    <td className="py-2 px-4">
                                                                                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" style={payment.planType === 'free' || !payment.planType ? { backgroundColor: 'rgba(176,245,230,0.2)', color: '#b0f5e6' } : { backgroundColor: 'rgba(0,255,198,0.2)', color: '#00FFC6' }}>
                                                                                            {payment.planType ? payment.planType.charAt(0).toUpperCase() + payment.planType.slice(1) : 'Payment'}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="py-2 px-4 font-medium text-xs" style={{ color: '#E0E0E0' }}>
                                                                                        {payment.description || `${payment.planType || 'Plan'} (${payment.billingCycle || 'monthly'})`}
                                                                                    </td>
                                                                                    <td className="py-2 px-4 font-semibold text-xs" style={{ color: '#00FFC6' }}>
                                                                                        ₹{payment.amount || 0}
                                                                                    </td>
                                                                                    <td className="py-2 px-4">
                                                                                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" style={getStatusBadgeColor(payment.status)}>
                                                                                            {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'Unknown'}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="py-2 px-4 text-center">
                                                                                        <button
                                                                                            onClick={() => handleDownloadInvoice(payment._id || payment.id, payment.invoiceId)}
                                                                                            disabled={downloadingInvoiceId === (payment._id || payment.id)}
                                                                                            className="inline-flex items-center px-3 py-1.5 rounded text-xs font-medium transition-all duration-300"
                                                                                            style={{
                                                                                                backgroundColor: 'rgba(0,255,198,0.15)',
                                                                                                color: '#00FFC6',
                                                                                                border: '1px solid rgba(0,255,198,0.3)',
                                                                                                opacity: downloadingInvoiceId === (payment._id || payment.id) ? 0.6 : 1
                                                                                            }}
                                                                                            onMouseEnter={(e) => {
                                                                                                if (downloadingInvoiceId !== (payment._id || payment.id)) {
                                                                                                    e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.25)';
                                                                                                    e.currentTarget.style.borderColor = 'rgba(0,255,198,0.5)';
                                                                                                }
                                                                                            }}
                                                                                            onMouseLeave={(e) => {
                                                                                                if (downloadingInvoiceId !== (payment._id || payment.id)) {
                                                                                                    e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.15)';
                                                                                                    e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)';
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            {downloadingInvoiceId === (payment._id || payment.id) ? (
                                                                                                <>
                                                                                                    <FaSpinner className="mr-1 animate-spin text-xs" />
                                                                                                    <span>Downloading...</span>
                                                                                                </>
                                                                                            ) : (
                                                                                                <>
                                                                                                    <FaDownload className="mr-1 text-xs" />
                                                                                                    <span>Invoice</span>
                                                                                                </>
                                                                                            )}
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>

                                                                {/* Mobile Card View */}
                                                                <div className="md:hidden space-y-4 p-4">
                                                                    {subscriptionPayments.map((payment: any, index: number) => (
                                                                        <div key={payment._id || payment.id || index} className="rounded-lg p-3" style={{ backgroundColor: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.2)' }}>
                                                                            <div className="flex justify-between items-start mb-2">
                                                                                <div className="flex-grow">
                                                                                    <p className="font-semibold text-xs" style={{ color: '#E0E0E0' }}>{payment.description || `${payment.planType || 'Plan'} (${payment.billingCycle || 'monthly'})`}</p>
                                                                                    <p className="text-xs mt-0.5" style={{ color: '#b0f5e6' }}>{payment.createdAt || payment.date ? new Date(payment.createdAt || payment.date).toLocaleDateString() : 'N/A'}</p>
                                                                                </div>
                                                                                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2" style={getStatusBadgeColor(payment.status)}>
                                                                                    {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'Unknown'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center mb-2">
                                                                                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" style={payment.planType && payment.planType !== 'free' ? { backgroundColor: 'rgba(0,255,198,0.2)', color: '#00FFC6' } : { backgroundColor: 'rgba(176,245,230,0.2)', color: '#b0f5e6' }}>
                                                                                    {payment.planType ? payment.planType.charAt(0).toUpperCase() + payment.planType.slice(1) : 'Payment'}
                                                                                </span>
                                                                                <span className="font-semibold text-xs" style={{ color: '#00FFC6' }}>₹{payment.amount || 0}</span>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => handleDownloadInvoice(payment._id || payment.id, payment.invoiceId)}
                                                                                disabled={downloadingInvoiceId === (payment._id || payment.id)}
                                                                                className="w-full px-3 py-1.5 rounded text-xs font-medium transition-all duration-300 flex items-center justify-center"
                                                                                style={{
                                                                                    backgroundColor: 'rgba(0,255,198,0.15)',
                                                                                    color: '#00FFC6',
                                                                                    border: '1px solid rgba(0,255,198,0.3)',
                                                                                    opacity: downloadingInvoiceId === (payment._id || payment.id) ? 0.6 : 1
                                                                                }}
                                                                                onMouseEnter={(e) => {
                                                                                    if (downloadingInvoiceId !== (payment._id || payment.id)) {
                                                                                        e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.25)';
                                                                                        e.currentTarget.style.borderColor = 'rgba(0,255,198,0.5)';
                                                                                    }
                                                                                }}
                                                                                onMouseLeave={(e) => {
                                                                                    if (downloadingInvoiceId !== (payment._id || payment.id)) {
                                                                                        e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.15)';
                                                                                        e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)';
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {downloadingInvoiceId === (payment._id || payment.id) ? (
                                                                                    <>
                                                                                        <FaSpinner className="mr-1 animate-spin text-xs" />
                                                                                        <span>Downloading...</span>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <FaDownload className="mr-1 text-xs" />
                                                                                        <span>Download Invoice</span>
                                                                                    </>
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-6 rounded-lg" style={{ backgroundColor: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.2)' }}>
                                                                <FaCreditCard className="text-2xl mx-auto mb-2" style={{ color: '#b0f5e6', opacity: 0.5 }} />
                                                                <h3 className="text-base font-medium mb-1" style={{ color: '#E0E0E0' }}>No payments yet</h3>
                                                                <p className="text-xs mb-3" style={{ color: '#b0f5e6' }}>
                                                                    When you make your first payment, it will appear here.
                                                                </p>
                                                                <button
                                                                    onClick={() => setPricingSubView('subscription')}
                                                                    className="px-4 py-1.5 rounded-lg transition-all duration-300 text-sm"
                                                                    style={{ backgroundColor: '#00FFC6', color: '#0a0a0a' }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,198,0.6)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                                                                >
                                                                    View Plans
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                )}
                                            </div>
                                        )}
                                        {/* Login History Tab */}
                                        {activeTab === 'loginHistory' && (
                                            <div className={`space-y-6 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '100ms' }}>
                                                <div className="flex items-center">
                                                    <FaHistory className="mr-3 text-2xl" style={{ color: '#00FFC6' }} />
                                                    <h2 className="text-2xl font-bold" style={{ color: '#E0E0E0' }}>Login History</h2>
                                                </div>

                                                <p style={{ color: '#b0f5e6' }}>Review your recent login activity and manage active sessions.</p>

                                                <div className="space-y-4">
                                                    {loginHistory.map((item, _index) => (
                                                        <div key={item.id} className="rounded-lg p-4 transition-all duration-300" style={item.currentSession ? { border: '1px solid #00FFC6', backgroundColor: 'rgba(0,255,198,0.1)' } : { border: '1px solid rgba(0,255,198,0.2)', backgroundColor: 'rgba(0,255,198,0.02)' }} onMouseEnter={(e) => { if (!item.currentSession) e.currentTarget.style.borderColor = '#00FFC6'; }} onMouseLeave={(e) => { if (!item.currentSession) e.currentTarget.style.borderColor = 'rgba(0,255,198,0.2)'; }}>
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-start">
                                                                    <div className="mr-3 mt-1">
                                                                        {getDeviceIcon(item.deviceType)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center">
                                                                            <h4 className="font-medium" style={{ color: '#E0E0E0' }}>{item.device}</h4>
                                                                            {item.currentSession && (
                                                                                <span className="ml-2 px-2 py-1 text-xs rounded-full" style={{ backgroundColor: '#00FFC6', color: '#0a0a0a' }}>Current Session</span>
                                                                            )}
                                                                            {item.loggedOut && (
                                                                                <span className="ml-2 px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'rgba(176,245,230,0.2)', color: '#b0f5e6' }}>Logged Out</span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm mt-1" style={{ color: '#b0f5e6' }}>{item.browser}</p>
                                                                        <div className="flex items-center mt-2 text-sm" style={{ color: '#b0f5e6', opacity: 0.8 }}>
                                                                            <span className="mr-4 flex items-center">
                                                                                IP: {item.ip}
                                                                                <button
                                                                                    className="ml-1 transition-colors"
                                                                                    style={{ color: '#b0f5e6', opacity: 0.6 }}
                                                                                    onClick={() => navigator.clipboard.writeText(item.ip)}
                                                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#00FFC6'}
                                                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#b0f5e6'}
                                                                                >
                                                                                    <FaCopy className="text-xs" />
                                                                                </button>
                                                                            </span>
                                                                            <span className="mr-4 flex items-center">
                                                                                <FaMapMarkerAlt className="mr-1" />
                                                                                {item.location}
                                                                            </span>
                                                                            <span>{item.date}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {!item.currentSession && !item.loggedOut && (
                                                                    <button
                                                                        onClick={() => handleLogoutDevice(item)}
                                                                        className="flex items-center text-sm transition-colors"
                                                                        style={{ color: '#ff0055' }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                                                    >
                                                                        <FaSignOutAlt className="mr-1" />
                                                                        Logout
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,255,198,0.1)', border: '1px solid rgba(0,255,198,0.3)' }}>
                                                    <div className="flex items-start">
                                                        <FaLock className="mr-3 mt-0.5" style={{ color: '#00FFC6' }} />
                                                        <div>
                                                            <h4 className="font-medium" style={{ color: '#00FFC6' }}>Security Notice</h4>
                                                            <p className="text-sm mt-1" style={{ color: '#b0f5e6' }}>If you notice any suspicious activity, please change your password immediately and contact support.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Projects History */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden sticky top-8" style={{ background: 'rgba(0,255,198,0.05)', border: '1px solid rgba(0,255,198,0.2)' }}>
                            <div className="p-6 border-b" style={{ background: 'linear-gradient(135deg, rgba(0,255,198,0.2), rgba(0,255,198,0.1))', borderColor: 'rgba(0,255,198,0.3)' }}>
                                <h2 className="text-xl font-bold flex items-center" style={{ color: '#00FFC6' }}>
                                    <FaTags className="mr-2" />
                                    Projects
                                </h2>
                                <p className="text-sm mt-1" style={{ color: '#b0f5e6' }}>Your purchased projects</p>
                            </div>

                            <div className="p-4">
                                {/* Search Bar */}
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search projects..."
                                        value={projectSearchTerm}
                                        onChange={(e) => setProjectSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:outline-none"
                                        style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.05)', color: '#E0E0E0' }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}
                                    />
                                    <FaSearch className="absolute left-3 top-3" style={{ color: '#00FFC6', opacity: 0.6 }} />
                                </div>

                                {/* Category Filter */}
                                <div className="mb-4">
                                    <select
                                        value={selectedProjectCategory}
                                        onChange={(e) => setSelectedProjectCategory(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:outline-none"
                                        style={{ border: '1px solid rgba(0,255,198,0.3)', backgroundColor: 'rgba(0,255,198,0.05)', color: '#E0E0E0' }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#00FFC6'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,255,198,0.3)'}
                                    >
                                        <option value="all" style={{ backgroundColor: '#0a0a0a' }}>All Categories</option>
                                        <option value="Machine Learning" style={{ backgroundColor: '#0a0a0a' }}>Machine Learning</option>
                                        <option value="Web Development" style={{ backgroundColor: '#0a0a0a' }}>Web Development</option>
                                        <option value="Cybersecurity" style={{ backgroundColor: '#0a0a0a' }}>Cybersecurity</option>
                                        <option value="Cloud Computing" style={{ backgroundColor: '#0a0a0a' }}>Cloud Computing</option>
                                        <option value="Data Science" style={{ backgroundColor: '#0a0a0a' }}>Data Science</option>
                                    </select>
                                </div>

                                {/* Total Projects Counter */}
                                <div className="flex items-center justify-between mb-4 p-2 rounded-lg" style={{ backgroundColor: 'rgba(0,255,198,0.1)' }}>
                                    <span className="text-sm font-medium" style={{ color: '#00FFC6' }}>Projects Found</span>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#00FFC6', color: '#0a0a0a' }}>
                                        {filteredProjects.length}
                                    </span>
                                </div>
                            </div>

                            {/* Projects List */}
                            <div className="max-h-96 overflow-y-auto">
                                {loadingProjects ? (
                                    <div className="p-4 text-center" style={{ color: '#b0f5e6' }}>
                                        <FaSpinner className="inline-block animate-spin mr-2" />
                                        Loading projects...
                                    </div>
                                ) : filteredProjects.length > 0 ? (
                                    filteredProjects.map(project => (
                                        <div key={project.id} style={{ borderBottom: '1px solid rgba(0,255,198,0.1)' }} className="last:border-b-0">
                                            <Link href={`/projects/${project.slug}`}>
                                                <div className="p-4 transition-colors duration-200 cursor-pointer" style={{ color: '#E0E0E0' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.05)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="font-medium text-sm" style={{ color: '#E0E0E0' }}>
                                                                {project.title}
                                                            </h3>
                                                            <p className="text-xs mt-1 line-clamp-2" style={{ color: '#b0f5e6' }}>{project.description}</p>
                                                            <div className="flex items-center justify-between mt-2">
                                                                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(0,255,198,0.2)', color: '#00FFC6' }}>
                                                                    {project.category}
                                                                </span>
                                                                {project.isPaid && (
                                                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,102,0,0.2)', color: '#ff6600' }}>
                                                                        Paid
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {project.tags && project.tags.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {project.tags.slice(0, 2).map((tag: string, idx: number) => (
                                                                        <span key={idx} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,255,198,0.15)', color: '#b0f5e6' }}>
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'rgba(0,255,198,0.1)', backgroundColor: 'rgba(0,255,198,0.02)' }}>
                                                {project.zipUrl && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleDownloadProject(project);
                                                        }}
                                                        disabled={downloadingProjectId === project.id}
                                                        className="flex items-center text-xs font-medium transition-colors px-2 py-1 rounded"
                                                        style={{ 
                                                            backgroundColor: downloadingProjectId === project.id ? 'rgba(0,255,198,0.2)' : 'rgba(0,255,198,0.1)',
                                                            color: '#00FFC6',
                                                            opacity: downloadingProjectId === project.id ? 0.6 : 1
                                                        }}
                                                        onMouseEnter={(e) => { if (downloadingProjectId !== project.id) e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.2)'; }}
                                                        onMouseLeave={(e) => { if (downloadingProjectId !== project.id) e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.1)'; }}
                                                    >
                                                        <FaDownload className="mr-1" />
                                                        {downloadingProjectId === project.id ? 'Downloading...' : 'Download'}
                                                    </button>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    {project.github && (
                                                        <a 
                                                            href={project.github} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center text-xs font-medium transition-colors px-2 py-1 rounded"
                                                            style={{ backgroundColor: 'rgba(0,255,198,0.1)', color: '#b0f5e6' }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.2)'; e.currentTarget.style.color = '#00FFC6'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.1)'; e.currentTarget.style.color = '#b0f5e6'; }}
                                                        >
                                                            <FaGithub className="mr-1" />
                                                            GitHub
                                                        </a>
                                                    )}
                                                    {project.demo && (
                                                        <a 
                                                            href={project.demo} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center text-xs font-medium transition-colors px-2 py-1 rounded"
                                                            style={{ backgroundColor: 'rgba(0,255,198,0.1)', color: '#b0f5e6' }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.2)'; e.currentTarget.style.color = '#00FFC6'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,255,198,0.1)'; e.currentTarget.style.color = '#b0f5e6'; }}
                                                        >
                                                            <FaExternalLinkAlt className="mr-1" />
                                                            Demo
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm" style={{ color: '#b0f5e6' }}>
                                        {loadingProjects ? 'Loading projects...' : 'No purchased projects yet'}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t" style={{ backgroundColor: 'rgba(0,255,198,0.05)', borderColor: 'rgba(0,255,198,0.2)' }}>
                                <Link href="/projects" className="block text-sm font-medium transition-colors" style={{ color: '#00FFC6' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                                    Explore More Projects →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}