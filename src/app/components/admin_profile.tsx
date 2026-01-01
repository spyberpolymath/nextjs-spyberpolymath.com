'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    Shield,
    AlertCircle,
    Loader,
    Save,
    RefreshCw,
    Key,
    Smartphone,
    LogOut,
    Edit3,
    Calendar,
    Clock,
    CheckCircle,
    Menu,
    X as CloseIcon,
    History,
    MapPin
} from 'lucide-react';

interface ProfileData {
    id: string;
    name: string;
    email: string;
    joinedDate: string;
    lastLogin: string;
    twoFactorEnabled: boolean;
    emailOtpEnabled?: boolean;
    totpEnabled?: boolean;
    role?: string;
    phone?: string;
    dateOfBirth?: string;
    status?: string;
    address?: {
        street: string;
        addressLine2?: string;
        city: string;
        stateProvince?: string;
        country: string;
        postalCode: string;
    };
    loginHistory?: Array<{
        ip: string;
        userAgent: string;
        location?: string;
        device?: string;
        timestamp: Date;
        success: boolean;
        loggedOut?: boolean;
    }>;
}

interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
}

export default function AdminProfile() {
    const searchParams = useSearchParams();
    const paramId = searchParams.get('id');
    const [userId, setUserId] = useState<string | null>(paramId);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [twoFAType, setTwoFAType] = useState<'none' | 'email'>('none');
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'loginHistory'>('profile');
    const [notAdmin, setNotAdmin] = useState(false);
    const [fetchedFromList, setFetchedFromList] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showTOTPSSetup, setShowTOTPSSetup] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [emailVerificationCode, setEmailVerificationCode] = useState('');
    const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);
    const [totpVerificationLoading, setTotpVerificationLoading] = useState(false);

    useEffect(() => {
        if (!userId) {
            try {
                const stored = typeof window !== 'undefined' ? window.localStorage.getItem('userId') : null;
                if (stored) setUserId(stored);
            } catch (e) {
                // ignore
            }
        }

        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

                if (!token) {
                    if (typeof window !== 'undefined') {
                        window.location.href = '/admin-auth';
                    }
                    return;
                }

                // Set up axios headers
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                if (!userId) {
                    const listResp = await axios.get(`/api/users`, config);

                    if (listResp.status === 401) {
                        if (typeof window !== 'undefined') {
                            window.localStorage.removeItem('token');
                            window.localStorage.removeItem('role');
                            window.localStorage.removeItem('userId');
                            window.location.href = '/admin-auth';
                        }
                        return;
                    }

                    if (listResp.status === 403) {
                        if (typeof window !== 'undefined') {
                            window.location.href = '/';
                        }
                        return;
                    }

                    const users = listResp.data;
                    if (Array.isArray(users) && users.length > 0) {
                        const first = users[0];
                        const normalizedId = first._id ? String(first._id) : (first.id || null);
                        if (normalizedId) setUserId(normalizedId);
                        setProfileData({ ...first, id: normalizedId });
                        setFetchedFromList(true);
                        return;
                    } else {
                        setProfileData(null);
                        return;
                    }
                }

                if (fetchedFromList && profileData && (profileData.id === userId || String((profileData as any)._id) === userId)) {
                    setFetchedFromList(false);
                    setIsLoading(false);
                    return;
                }

                const response = await axios.get(`/api/users/${userId}`, config);

                if (response.status === 401) {
                    if (typeof window !== 'undefined') {
                        window.localStorage.removeItem('token');
                        window.localStorage.removeItem('role');
                        window.localStorage.removeItem('userId');
                        window.location.href = '/admin-auth';
                    }
                    return;
                }

                const user = response.data;
                setProfileData({ ...user, id: user._id ? String(user._id) : (user.id || '') });
                setNotAdmin(false);
            } catch (error: any) {
                console.error('Error fetching profile data:', error);
                if (error?.response?.status === 401) {
                    if (typeof window !== 'undefined') {
                        window.localStorage.removeItem('token');
                        window.localStorage.removeItem('role');
                        window.localStorage.removeItem('userId');
                        window.location.href = '/admin-auth';
                    }
                    return;
                } else if (error?.response?.status === 403) {
                    setNotAdmin(true);
                } else if (error?.response?.status === 404) {
                    setProfileData(null);
                    setNotAdmin(false);
                } else {
                    setProfileData(null);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [userId]);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setProfileData(prev => {
            if (!prev) {
                const defaultUser: ProfileData = {
                    id: '',
                    name: '',
                    email: '',
                    joinedDate: '',
                    lastLogin: '',
                    twoFactorEnabled: false,
                    phone: '',
                    status: 'active',
                    address: {
                        street: '',
                        city: '',
                        country: '',
                        postalCode: ''
                    }
                };
                return {
                    ...defaultUser,
                    [name]: type === 'checkbox' ? checked : value
                } as ProfileData;
            }

            if (name.startsWith('address.')) {
                const addressField = name.split('.')[1];
                return {
                    ...prev,
                    address: {
                        ...prev.address,
                        [addressField]: value
                    }
                } as ProfileData;
            }

            return {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            } as ProfileData;
        });

        if (formErrors[name as keyof FormErrors]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));

        if (formErrors[name as keyof FormErrors]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateProfileForm = (): boolean => {
        const errors: FormErrors = {};

        if (!profileData?.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!profileData?.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePasswordForm = (): boolean => {
        const errors: FormErrors = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }

        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
            errors.newPassword = 'Password must contain uppercase, lowercase, and numbers';
        }

        if (!passwordData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profileData || !validateProfileForm()) return;

        setIsLoading(true);

        const updatePayload: any = {};

        if (profileData.name && profileData.name.trim()) updatePayload.name = profileData.name.trim();
        if (profileData.email && profileData.email.trim()) updatePayload.email = profileData.email.trim();
        if (profileData.phone && profileData.phone.trim()) updatePayload.phone = profileData.phone.trim();
        if (profileData.dateOfBirth) updatePayload.dateOfBirth = profileData.dateOfBirth;
        if (profileData.status) updatePayload.status = profileData.status;
        if (profileData.role) updatePayload.role = profileData.role;

        if (profileData.address) {
            const addr: any = {};
            if (profileData.address.street && profileData.address.street.trim()) addr.street = profileData.address.street.trim();
            if (profileData.address.addressLine2 && profileData.address.addressLine2.trim()) addr.addressLine2 = profileData.address.addressLine2.trim();
            if (profileData.address.city && profileData.address.city.trim()) addr.city = profileData.address.city.trim();
            if (profileData.address.stateProvince && profileData.address.stateProvince.trim()) addr.stateProvince = profileData.address.stateProvince.trim();
            if (profileData.address.country && profileData.address.country.trim()) addr.country = profileData.address.country.trim();
            if (profileData.address.postalCode && profileData.address.postalCode.trim()) addr.postalCode = profileData.address.postalCode.trim();
            if (Object.keys(addr).length > 0) updatePayload.address = addr;
        }

        if (Object.keys(updatePayload).length === 0) {
            showNotification('No changes to update', 'error');
            setIsLoading(false);
            return;
        }

        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            await axios.put(`/api/users/${profileData.id}`, updatePayload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            showNotification('Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            showNotification('Failed to update profile', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profileData || !validatePasswordForm()) return;

        setIsLoading(true);

        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            await axios.post(`/api/users/${profileData.id}`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showNotification('Password updated successfully');
        } catch (error) {
            showNotification('Failed to update password', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const refreshProfileData = async () => {
        if (!userId) return;
        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            const response = await axios.get(`/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const user = response.data;
            setProfileData({ ...user, id: user._id ? String(user._id) : (user.id || '') });
        } catch (error) {
            console.error('Error refreshing profile data:', error);
        }
    };

    const handleDisableEmail2FA = async () => {
        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            await axios.post(`/api/2fa/disable`, { type: 'email', userId: profileData?.id }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (profileData) {
                setProfileData({ ...profileData, emailOtpEnabled: false });
            }
            showNotification('Email 2FA disabled successfully');
            await refreshProfileData();
        } catch (error) {
            console.error('Error disabling email 2FA:', error);
            showNotification('Failed to disable Email 2FA', 'error');
        }
    };

    const handleDisableTOTP2FA = async () => {
        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            await axios.post(`/api/2fa/disable`, { type: 'totp', userId: profileData?.id }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (profileData) {
                setProfileData({ ...profileData, twoFactorEnabled: false });
            }
            showNotification('Authenticator App disabled successfully');
            await refreshProfileData();
        } catch (error) {
            console.error('Error disabling TOTP 2FA:', error);
            showNotification('Failed to disable Authenticator App', 'error');
        }
    };

    async function handleEmail2FASetup(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        if (!profileData) return;
        setIsLoading(true);
        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            const response = await axios.post('/api/2fa/enable', {
                type: 'email',
                userId: profileData.id
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Show email verification modal
            setShowEmailVerification(true);
            setEmailVerificationCode('');
            showNotification('Verification code sent to your email');
        } catch (error: any) {
            console.error('Error enabling email 2FA:', error);
            const errorMessage = error?.response?.data?.error || 'Failed to enable Email 2FA';
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    }

    async function verifyEmail2FA(code: string) {
        if (!code || code.length === 0) {
            showNotification('Please enter the verification code', 'error');
            return;
        }
        
        setEmailVerificationLoading(true);
        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            await axios.post('/api/2fa/verify', {
                type: 'email',
                data: code,
                userId: profileData?.id
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (profileData) {
                setProfileData({ ...profileData, emailOtpEnabled: true } as ProfileData);
            }
            
            setShowEmailVerification(false);
            setEmailVerificationCode('');
            showNotification('Email 2FA enabled successfully');
        } catch (error: any) {
            console.error('Error verifying email 2FA:', error);
            const errorMessage = error?.response?.data?.error || 'Invalid verification code';
            showNotification(errorMessage, 'error');
        } finally {
            setEmailVerificationLoading(false);
        }
    }

    async function handleTOTPSetup(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        if (!profileData || !profileData.id) {
            showNotification('User profile not loaded', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            console.log('Setting up TOTP for user:', profileData.id);
            const response = await axios.post('/api/2fa/enable', {
                type: 'totp',
                userId: profileData.id
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('TOTP setup response:', response.data);
            const { secret, otpauth } = response.data;
            if (!otpauth) {
                showNotification('Failed to generate QR code', 'error');
                setIsLoading(false);
                return;
            }
            setQrCode(otpauth);
            setShowTOTPSSetup(true);
        } catch (error: any) {
            console.error('Error setting up TOTP:', error);
            const errorMessage = error?.response?.data?.error || 'Failed to setup Authenticator App';
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    }

    async function verifyTOTP(totpToken: string) {
        if (!totpToken || totpToken.length !== 6 || !/^\d+$/.test(totpToken)) {
            showNotification('Please enter a valid 6-digit code', 'error');
            return;
        }
        
        if (!profileData || !profileData.id) {
            showNotification('User profile not loaded', 'error');
            return;
        }
        
        setTotpVerificationLoading(true);
        try {
            const authToken = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            console.log('Verifying TOTP for user:', profileData.id, 'with code:', totpToken);
            const response = await axios.post('/api/2fa/verify', { 
                type: 'totp',
                data: totpToken,
                userId: profileData.id
            }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            console.log('TOTP verification response:', response.data);
            setProfileData({ ...profileData, twoFactorEnabled: true } as ProfileData);
            showNotification('Authenticator App enabled successfully');
            setShowTOTPSSetup(false);
            setQrCode(null);
            setEmailVerificationCode('');
        } catch (error: any) {
            console.error('Error verifying TOTP:', error);
            const errorMessage = error?.response?.data?.error || 'Invalid TOTP code';
            showNotification(errorMessage, 'error');
        } finally {
            setTotpVerificationLoading(false);
        }
    }

    const handleLogoutSession = async (login: any) => {
        if (!window.confirm('Are you sure you want to logout this session?')) {
            return;
        }
        
        setIsLoading(true);
        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            await axios.post('/api/logout-session', {
                userId: profileData?.id,
                sessionData: login
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            showNotification('Session logged out successfully');
            await refreshProfileData();
        } catch (error: any) {
            console.error('Error logging out session:', error);
            const errorMessage = error?.response?.data?.error || 'Failed to logout session';
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Don't render anything until client-side hydration is complete
    if (typeof window === 'undefined') {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
                <Loader className="w-8 h-8 animate-spin" style={{ color: '#00FFC6' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`} style={{ backgroundColor: '#181A1B' }}>
                <div className="flex items-center justify-between p-4 lg:hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#00FFC6' }}>
                            <User className="w-5 h-5" style={{ color: '#121212' }} />
                        </div>
                        <span className="text-lg font-bold" style={{ color: '#E0E0E0' }}>Profile</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 rounded-lg hover:bg-opacity-20"
                        style={{ color: '#E0E0E0' }}
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 lg:p-6">
                    <div className="hidden lg:flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#00FFC6' }}>
                            <User className="w-6 h-6" style={{ color: '#121212' }} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold" style={{ color: '#E0E0E0' }}>Profile</h1>
                            <p className="text-xs" style={{ color: '#757575' }}>Manage your account</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {[

                            { id: 'profile', label: 'Profile', icon: User },
                            { id: 'security', label: 'Security', icon: Shield },
                            { id: 'loginHistory', label: 'Login History', icon: History }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as any);
                                    setSidebarOpen(false); // Close sidebar on mobile after selection
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === tab.id ? 'bg-opacity-20' : ''}`}

                                style={{
                                    backgroundColor: activeTab === tab.id ? 'rgba(0, 255, 198, 0.2)' : 'transparent',
                                    color: activeTab === tab.id ? '#00FFC6' : '#E0E0E0'
                                }}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300" style={{ borderColor: '#232323', color: '#ff6b6b' }}>
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-30 backdrop-blur-md border-b" style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)', borderColor: '#232323' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="p-2 rounded-lg border lg:hidden"
                                    style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}
                                >
                                    <Menu className="w-5 h-5" style={{ color: '#00FFC6' }} />
                                </button>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: '#E0E0E0' }}>
                                    {activeTab === 'profile' && 'Profile Information'}
                                    {activeTab === 'security' && 'Security Settings'}
                                    {activeTab === 'loginHistory' && 'Login History'}
                                </h2>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="p-2 rounded-lg border transition-all duration-300"
                                style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}
                            >
                                <RefreshCw className="w-5 h-5" style={{ color: '#00FFC6' }} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Notification */}
                {notification && (
                    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border max-w-sm sm:max-w-md ${notification.type === 'error' ? 'border-red-500' : 'border-[#00FFC6]'
                        }`} style={{
                            backgroundColor: '#181A1B',
                            color: notification.type === 'error' ? '#ff4444' : '#00FFC6'
                        }}>
                        {notification.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                        <span className="text-sm sm:text-base break-words">{notification.message}</span>
                    </div>
                )}

                <div className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 lg:py-20">
                                <Loader className="w-8 h-8 lg:w-12 lg:h-12 mb-4 animate-spin" style={{ color: '#00FFC6' }} />
                                <p className="text-base lg:text-lg" style={{ color: '#E0E0E0' }}>Loading...</p>
                            </div>
                        ) : notAdmin ? (
                            <div className="flex flex-col items-center justify-center py-12 lg:py-20">
                                <AlertCircle className="w-8 h-8 lg:w-12 lg:h-12 mb-4" style={{ color: '#ff6b6b' }} />
                                <h2 className="text-xl lg:text-2xl font-bold mb-2" style={{ color: '#E0E0E0' }}>Access Denied</h2>
                                <p className="text-base lg:text-lg text-center" style={{ color: '#757575' }}>You do not have admin privileges to view this page.</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'profile' && (
                                    <div className="space-y-6 lg:space-y-8">
                                        {/* Profile Card */}
                                        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#181A1B', borderColor: '#232323', border: '1px solid' }}>
                                            <div className="p-4 sm:p-6">
                                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                                    <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#E0E0E0' }}>Profile Information</h3>
                                                    <button
                                                        onClick={() => setIsEditing(!isEditing)}
                                                        className="p-2 rounded-lg transition-all duration-300"
                                                        style={{ backgroundColor: isEditing ? '#00FFC6' : 'transparent', color: isEditing ? '#121212' : '#00FFC6' }}
                                                    >
                                                        {isEditing ? <Save className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                                                    </button>
                                                </div>

                                                <div className="flex flex-col gap-4 sm:gap-6">
                                                    <div className="flex-1">
                                                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Full Name</label>
                                                                    <input
                                                                        type="text"
                                                                        name="name"
                                                                        value={profileData?.name ?? ''}
                                                                        onChange={handleProfileInputChange}
                                                                        disabled={!isEditing}
                                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                                        style={{
                                                                            backgroundColor: '#121212',
                                                                            borderColor: formErrors.name ? '#ff4444' : '#232323',
                                                                            color: '#E0E0E0',
                                                                            opacity: isEditing ? 1 : 0.7
                                                                        }}
                                                                    />
                                                                    {formErrors.name && (
                                                                        <p className="mt-2 text-xs sm:text-sm flex items-center gap-2" style={{ color: '#ff4444' }}>
                                                                            <AlertCircle className="w-4 h-4" />
                                                                            {formErrors.name}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Email Address</label>
                                                                    <input
                                                                        type="email"
                                                                        name="email"
                                                                        value={profileData?.email ?? ''}
                                                                        onChange={handleProfileInputChange}
                                                                        disabled={!isEditing}
                                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                                        style={{
                                                                            backgroundColor: '#121212',
                                                                            borderColor: formErrors.email ? '#ff4444' : '#232323',
                                                                            color: '#E0E0E0',
                                                                            opacity: isEditing ? 1 : 0.7
                                                                        }}
                                                                    />
                                                                    {formErrors.email && (
                                                                        <p className="mt-2 text-xs sm:text-sm flex items-center gap-2" style={{ color: '#ff4444' }}>
                                                                            <AlertCircle className="w-4 h-4" />
                                                                            {formErrors.email}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Phone</label>
                                                                    <input
                                                                        type="text"
                                                                        name="phone"
                                                                        value={profileData?.phone ?? ''}
                                                                        onChange={handleProfileInputChange}
                                                                        disabled={!isEditing}
                                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                                        style={{
                                                                            backgroundColor: '#121212',
                                                                            borderColor: '#232323',
                                                                            color: '#E0E0E0',
                                                                            opacity: isEditing ? 1 : 0.7
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Date of Birth</label>
                                                                    <input
                                                                        type="date"
                                                                        name="dateOfBirth"
                                                                        value={profileData?.dateOfBirth ?? ''}
                                                                        onChange={handleProfileInputChange}
                                                                        disabled={!isEditing}
                                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                                        style={{
                                                                            backgroundColor: '#121212',
                                                                            borderColor: '#232323',
                                                                            color: '#E0E0E0',
                                                                            opacity: isEditing ? 1 : 0.7
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Role</label>
                                                                    <select
                                                                        name="role"
                                                                        value={profileData?.role ?? 'user'}
                                                                        onChange={handleProfileInputChange}
                                                                        disabled={!isEditing}
                                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                                        style={{
                                                                            backgroundColor: '#121212',
                                                                            borderColor: '#232323',
                                                                            color: '#E0E0E0',
                                                                            opacity: isEditing ? 1 : 0.7
                                                                        }}
                                                                    >
                                                                        <option value="user">User</option>
                                                                        <option value="admin">Admin</option>
                                                                        <option value="moderator">Moderator</option>
                                                                    </select>
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Status</label>
                                                                    <select
                                                                        name="status"
                                                                        value={profileData?.status ?? 'active'}
                                                                        onChange={handleProfileInputChange}
                                                                        disabled={!isEditing}
                                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                                        style={{
                                                                            backgroundColor: '#121212',
                                                                            borderColor: '#232323',
                                                                            color: '#E0E0E0',
                                                                            opacity: isEditing ? 1 : 0.7
                                                                        }}
                                                                    >
                                                                        <option value="active">Active</option>
                                                                        <option value="inactive">Inactive</option>
                                                                        <option value="suspended">Suspended</option>
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Street Address</label>
                                                                    <input
                                                                        type="text"
                                                                        name="address.street"
                                                                        value={profileData?.address?.street ?? ''}
                                                                        onChange={handleProfileInputChange}
                                                                        disabled={!isEditing}
                                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                                        style={{
                                                                            backgroundColor: '#121212',
                                                                            borderColor: '#232323',
                                                                            color: '#E0E0E0',
                                                                            opacity: isEditing ? 1 : 0.7
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Address Line 2 (Apartment, suite, unit)</label>
                                                                    <input
                                                                        type="text"
                                                                        name="address.addressLine2"
                                                                        value={profileData?.address?.addressLine2 ?? ''}
                                                                        onChange={handleProfileInputChange}
                                                                        disabled={!isEditing}
                                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                                        style={{
                                                                            backgroundColor: '#121212',
                                                                            borderColor: '#232323',
                                                                            color: '#E0E0E0',
                                                                            opacity: isEditing ? 1 : 0.7
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>City</label>
                                                                    <input
                                                                        type="text"
                                                                        name="address.city"
                                                                        value={profileData?.address?.city ?? ''}
                                                                        onChange={handleProfileInputChange}
                                                                        disabled={!isEditing}
                                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                                        style={{
                                                                            backgroundColor: '#121212',
                                                                            borderColor: '#232323',
                                                                            color: '#E0E0E0',
                                                                            opacity: isEditing ? 1 : 0.7
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>State/Province</label>
                                                                    <input
                                                                        type="text"
                                                                        name="address.stateProvince"
                                                                        value={profileData?.address?.stateProvince ?? ''}
                                                                        onChange={handleProfileInputChange}
                                                                        disabled={!isEditing}
                                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                                        style={{
                                                                            backgroundColor: '#121212',
                                                                            borderColor: '#232323',
                                                                            color: '#E0E0E0',
                                                                            opacity: isEditing ? 1 : 0.7
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Country</label>
                                                                    <input
                                                                        type="text"
                                                                        name="address.country"
                                                                        value={profileData?.address?.country ?? ''}
                                                                        onChange={handleProfileInputChange}
                                                                        disabled={!isEditing}
                                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                                        style={{
                                                                            backgroundColor: '#121212',
                                                                            borderColor: '#232323',
                                                                            color: '#E0E0E0',
                                                                            opacity: isEditing ? 1 : 0.7
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Postal Code</label>
                                                                    <input
                                                                        type="text"
                                                                        name="address.postalCode"
                                                                        value={profileData?.address?.postalCode ?? ''}
                                                                        onChange={handleProfileInputChange}
                                                                        disabled={!isEditing}
                                                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                                        style={{
                                                                            backgroundColor: '#121212',
                                                                            borderColor: '#232323',
                                                                            color: '#E0E0E0',
                                                                            opacity: isEditing ? 1 : 0.7
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {isEditing && (
                                                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                                                    <button
                                                                        type="submit"
                                                                        disabled={isLoading}
                                                                        className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 flex items-center justify-center gap-3 text-sm sm:text-base"
                                                                        style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                                                                    >
                                                                        {isLoading ? (
                                                                            <>

                                                                                <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                                                                <span>Saving...</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                                <span>Save Changes</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setIsEditing(false)}
                                                                        className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                                                                        style={{ backgroundColor: 'transparent', color: '#E0E0E0', border: '1px solid #232323' }}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Account Info */}
                                        <div className="rounded-xl p-4 sm:p-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323', border: '1px solid' }}>
                                            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: '#E0E0E0' }}>Account Information</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 sm:p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                                                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#00FFC6' }} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Member Since</p>
                                                        <p className="font-medium text-sm sm:text-base truncate" style={{ color: '#E0E0E0' }}>
                                                            {profileData ? formatDate(profileData.joinedDate) : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 sm:p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                                                        <Clock className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#00FFC6' }} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Last Login</p>
                                                        <p className="font-medium text-sm sm:text-base truncate" style={{ color: '#E0E0E0' }}>
                                                            {profileData ? formatDate(profileData.lastLogin) : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 sm:p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                                                        <User className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#00FFC6' }} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Role</p>
                                                        <p className="font-medium text-sm sm:text-base truncate" style={{ color: '#E0E0E0' }}>
                                                            {profileData?.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : 'User'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 sm:p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                                                        <Shield className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#00FFC6' }} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Status</p>
                                                        <p className="font-medium text-sm sm:text-base truncate" style={{ color: '#E0E0E0' }}>
                                                            {profileData?.status ? profileData.status.charAt(0).toUpperCase() + profileData.status.slice(1) : 'Active'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 sm:p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                                                        <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#00FFC6' }} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Phone</p>
                                                        <p className="font-medium text-sm sm:text-base truncate" style={{ color: '#E0E0E0' }}>
                                                            {profileData?.phone || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 sm:p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                                                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#00FFC6' }} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Address</p>
                                                        <p className="font-medium text-sm sm:text-base truncate" style={{ color: '#E0E0E0' }}>
                                                            {profileData?.address ? `${profileData.address.street}, ${profileData.address.city}, ${profileData.address.country} ${profileData.address.postalCode}`.replace(/^, |, $/, '') : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-6 lg:space-y-8">
                                        {/* Password Change */}
                                        <div className="rounded-xl p-4 sm:p-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323', border: '1px solid' }}>
                                            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: '#E0E0E0' }}>Change Password</h3>
                                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Current Password</label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#00FFC6' }} />
                                                        <input
                                                            type={showPasswords.current ? 'text' : 'password'}
                                                            name="currentPassword"
                                                            value={passwordData.currentPassword}
                                                            onChange={handlePasswordInputChange}
                                                            className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                            style={{
                                                                backgroundColor: '#121212',
                                                                borderColor: formErrors.currentPassword ? '#ff4444' : '#232323',
                                                                color: '#E0E0E0'
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibility('current')}
                                                            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-1"
                                                            style={{ color: '#757575' }}
                                                        >
                                                            {showPasswords.current ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                                        </button>
                                                    </div>
                                                    {formErrors.currentPassword && (
                                                        <p className="mt-2 text-xs sm:text-sm flex items-center gap-2" style={{ color: '#ff4444' }}>
                                                            <AlertCircle className="w-4 h-4" />
                                                            {formErrors.currentPassword}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>New Password</label>
                                                        <div className="relative">
                                                            <Key className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#00FFC6' }} />
                                                            <input
                                                                type={showPasswords.new ? 'text' : 'password'}
                                                                name="newPassword"
                                                                value={passwordData.newPassword}
                                                                onChange={handlePasswordInputChange}
                                                                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                                style={{
                                                                    backgroundColor: '#121212',
                                                                    borderColor: formErrors.newPassword ? '#ff4444' : '#232323',
                                                                    color: '#E0E0E0'
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => togglePasswordVisibility('new')}
                                                                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-1"
                                                                style={{ color: '#757575' }}
                                                            >
                                                                {showPasswords.new ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                                            </button>
                                                        </div>
                                                        {formErrors.newPassword && (
                                                            <p className="mt-2 text-xs sm:text-sm flex items-center gap-2" style={{ color: '#ff4444' }}>
                                                                <AlertCircle className="w-4 h-4" />
                                                                {formErrors.newPassword}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Confirm New Password</label>
                                                        <div className="relative">
                                                            <Key className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#00FFC6' }} />
                                                            <input
                                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                                name="confirmPassword"
                                                                value={passwordData.confirmPassword}
                                                                onChange={handlePasswordInputChange}
                                                                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                                                                style={{
                                                                    backgroundColor: '#121212',
                                                                    borderColor: formErrors.confirmPassword ? '#ff4444' : '#232323',
                                                                    color: '#E0E0E0'
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => togglePasswordVisibility('confirm')}
                                                                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-1"
                                                                style={{ color: '#757575' }}
                                                            >
                                                                {showPasswords.confirm ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                                            </button>
                                                        </div>
                                                        {formErrors.confirmPassword && (
                                                            <p className="mt-2 text-xs sm:text-sm flex items-center gap-2" style={{ color: '#ff4444' }}>
                                                                <AlertCircle className="w-4 h-4" />
                                                                {formErrors.confirmPassword}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 flex items-center justify-center gap-3 text-sm sm:text-base"
                                                    style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                                            <span>Updating...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                                                            <span>Update Password</span>
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        </div>

                                        {/* Two Factor Authentication */}
                                        <div className="rounded-xl p-4 sm:p-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323', border: '1px solid' }}>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                                                <div>
                                                    <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2" style={{ color: '#E0E0E0' }}>Two-Factor Authentication</h3>
                                                    <p className="text-sm" style={{ color: '#b0f5e6' }}>Add an extra layer of security to your account</p>
                                                </div>
                                                <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto ${(profileData?.emailOtpEnabled || profileData?.twoFactorEnabled) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {(profileData?.emailOtpEnabled || profileData?.twoFactorEnabled) ? 'Enabled' : 'Disabled'}
                                                </div>
                                            </div>

                                            {/* Email Authentication */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg gap-3 mb-4" style={{ backgroundColor: '#121212' }}>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                                                        <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#00FFC6' }} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm sm:text-base" style={{ color: '#E0E0E0' }}>Email Authentication</p>
                                                        <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Receive a code via email</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={profileData?.emailOtpEnabled ? handleDisableEmail2FA : handleEmail2FASetup}
                                                    disabled={isLoading}
                                                    className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none self-start sm:self-auto disabled:opacity-50"
                                                    style={{ backgroundColor: profileData?.emailOtpEnabled ? '#00FFC6' : '#232323' }}
                                                >
                                                    <span
                                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${profileData?.emailOtpEnabled ? 'translate-x-8' : 'translate-x-1'}`}
                                                        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
                                                    ></span>
                                                </button>
                                            </div>

                                            {/* Authenticator App */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg gap-3 mb-4" style={{ backgroundColor: '#121212' }}>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                                                        <Key className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#00FFC6' }} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm sm:text-base" style={{ color: '#E0E0E0' }}>Authenticator App</p>
                                                        <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Use an authenticator app like Google Authenticator</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={profileData?.twoFactorEnabled ? handleDisableTOTP2FA : handleTOTPSetup}
                                                    disabled={isLoading}
                                                    className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none self-start sm:self-auto disabled:opacity-50"
                                                    style={{ backgroundColor: profileData?.twoFactorEnabled ? '#00FFC6' : '#232323' }}
                                                >
                                                    <span
                                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${profileData?.twoFactorEnabled ? 'translate-x-8' : 'translate-x-1'}`}
                                                        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
                                                    ></span>
                                                </button>
                                            </div>

                                            <div className="mt-4 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 198, 0.05)' }}>
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: '#00FFC6' }} />
                                                    <div className="text-xs sm:text-sm" style={{ color: '#b0f5e6' }}>
                                                        <p className="mb-2">Enable multiple 2FA methods for enhanced security. You can use any combination of email or authenticator app.</p>
                                                        <p>Make sure your email address is up to date and you have access to your authenticator app.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'loginHistory' && (
                                    <div className="space-y-6 lg:space-y-8">
                                        {/* Login History */}
                                        <div className="rounded-xl p-4 sm:p-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323', border: '1px solid' }}>
                                            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: '#E0E0E0' }}>Login History</h3>
                                            {profileData?.loginHistory && profileData.loginHistory.length > 0 ? (
                                                <div className="space-y-3">
                                                    {profileData.loginHistory.slice(0, 10).map((login, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-lg flex-shrink-0 ${login.loggedOut ? 'bg-gray-500/20' : login.success ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                                                    <History className={`w-4 h-4 ${login.loggedOut ? 'text-gray-400' : login.success ? 'text-green-400' : 'text-red-400'}`} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-medium text-sm truncate" style={{ color: '#E0E0E0' }}>
                                                                        {login.ip} - {login.device || 'Unknown Device'}
                                                                    </p>
                                                                    <p className="text-xs" style={{ color: '#757575' }}>
                                                                        {formatDate(login.timestamp.toString())} {login.location ? `• ${login.location}` : ''}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${login.loggedOut ? 'bg-gray-500/20 text-gray-400' : login.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                                    {login.loggedOut ? 'Logged Out' : login.success ? 'Success' : 'Failed'}
                                                                </div>
                                                                {login.success && !login.loggedOut && (
                                                                    <button
                                                                        onClick={() => handleLogoutSession(login)}
                                                                        className="px-2 py-1 text-xs font-semibold rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                                        disabled={isLoading}
                                                                    >
                                                                        Logout
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm" style={{ color: '#757575' }}>No login history available.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* TOTP Setup Modal */}
            {showTOTPSSetup && qrCode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-[#181A1B] rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4" style={{ color: '#E0E0E0' }}>Setup Authenticator App</h3>
                        <p className="text-sm mb-4" style={{ color: '#b0f5e6' }}>Scan this QR code with your authenticator app like Google Authenticator, Authy, or Microsoft Authenticator:</p>
                        <div className="flex justify-center mb-4 p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`} alt="QR Code" className="rounded-lg" />
                        </div>
                        <p className="text-xs mb-3" style={{ color: '#757575' }}>Once scanned, enter the 6-digit code from your authenticator app:</p>
                        <input
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            value={emailVerificationCode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                setEmailVerificationCode(value);
                            }}
                            className="w-full p-3 rounded-lg mb-4 text-center text-2xl tracking-widest"
                            style={{ backgroundColor: '#121212', color: '#00FFC6', border: '1px solid #232323' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && emailVerificationCode.length === 6) {
                                    verifyTOTP(emailVerificationCode);
                                }
                            }}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => verifyTOTP(emailVerificationCode)}
                                disabled={totpVerificationLoading || emailVerificationCode.length !== 6}
                                className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                            >
                                {totpVerificationLoading && <Loader className="w-4 h-4 animate-spin" />}
                                {totpVerificationLoading ? 'Verifying...' : 'Verify'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowTOTPSSetup(false);
                                    setQrCode(null);
                                    setEmailVerificationCode('');
                                }}
                                disabled={totpVerificationLoading}
                                className="flex-1 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                                style={{ backgroundColor: '#232323', color: '#E0E0E0' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Verification Modal */}
            {showEmailVerification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-[#181A1B] rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4" style={{ color: '#E0E0E0' }}>Verify Email 2FA</h3>
                        <p className="text-sm mb-4" style={{ color: '#b0f5e6' }}>A verification code has been sent to your email address. Please enter it below:</p>
                        <input
                            type="text"
                            placeholder="Enter verification code"
                            value={emailVerificationCode}
                            onChange={(e) => setEmailVerificationCode(e.target.value)}
                            className="w-full p-3 rounded-lg mb-4"
                            style={{ backgroundColor: '#121212', color: '#E0E0E0', border: '1px solid #232323' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && emailVerificationCode.length > 0) {
                                    verifyEmail2FA(emailVerificationCode);
                                }
                            }}
                        />
                        <p className="text-xs mb-4" style={{ color: '#757575' }}>Code expires in 10 minutes</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => verifyEmail2FA(emailVerificationCode)}
                                disabled={emailVerificationLoading || emailVerificationCode.length === 0}
                                className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                            >
                                {emailVerificationLoading && <Loader className="w-4 h-4 animate-spin" />}
                                {emailVerificationLoading ? 'Verifying...' : 'Verify'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowEmailVerification(false);
                                    setEmailVerificationCode('');
                                }}
                                disabled={emailVerificationLoading}
                                className="flex-1 px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                                style={{ backgroundColor: '#232323', color: '#E0E0E0' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}