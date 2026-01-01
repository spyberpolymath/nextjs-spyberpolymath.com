'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaLock,
    FaKey,
    FaQrcode,
    FaArrowLeft,
    FaCheckCircle,
    FaEye,
    FaEyeSlash,
    FaShieldAlt,
    FaChartLine,
    FaLock as FaLockIcon,
    FaUserShield,
    FaCloudUploadAlt,
    FaMobileAlt,
    FaGlobe,
    FaRocket
} from 'react-icons/fa';
import { getSafeToken, clearInvalidToken } from '@/lib/tokenUtils';

interface AuthFormData {
    email: string;
    password: string;
    confirmPassword?: string;
    name?: string;
    phone?: string;
}

interface TwoFAData {
    emailOTP: string;
    qrOTP: string;
}

interface TwoFAOptions {
    email: boolean;
    totp: boolean;
}

const Auth = () => {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'reset'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [twoFAMethod, setTwoFAMethod] = useState<'email' | 'totp'>('email');
    const [showTwoFA, setShowTwoFA] = useState(false);
    const [twoFAOptions, setTwoFAOptions] = useState<TwoFAOptions>({ email: false, totp: false });

    const [formData, setFormData] = useState<AuthFormData>({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: ''
    });

    const [twoFAData, setTwoFAData] = useState<TwoFAData>({
        emailOTP: '',
        qrOTP: ''
    });

    const getRedirectUrl = () => {
        if (typeof window !== 'undefined') {
            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
                localStorage.removeItem('redirectAfterLogin');
                // If redirecting to admin page but user is not admin, redirect to accounts
                const userRole = localStorage.getItem('userRole');
                if (redirectUrl.startsWith('/admin') && userRole !== 'admin') {
                    return '/accounts';
                }
                return redirectUrl;
            }
        }
        return '/accounts';
    };

    useEffect(() => {
        setIsMounted(true);
        // Clean up any invalid tokens on component mount
        clearInvalidToken();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleTwoFAInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTwoFAData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateLoginForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password.trim()) newErrors.password = 'Password is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateSignupForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.password.trim()) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (!formData.confirmPassword?.trim()) newErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateResetForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateTwoFAForm = () => {
        const newErrors: Record<string, string> = {};

        if (twoFAMethod === 'email' && !twoFAData.emailOTP.trim()) {
            newErrors.emailOTP = 'OTP code is required';
        } else if (twoFAMethod === 'totp' && !twoFAData.qrOTP.trim()) {
            newErrors.qrOTP = 'Verification code is required';
        } else if (twoFAMethod === 'totp' && twoFAData.qrOTP.length !== 6) {
            newErrors.qrOTP = 'Code must be 6 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateLoginForm()) {
            setIsLoading(true);
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.requires2FA) {
                        // Store userId for 2FA verification
                        localStorage.setItem('tempUserId', data.userId);
                        localStorage.setItem('tempUserRole', data.role);

                        // Set available 2FA methods based on backend response
                        setTwoFAOptions({
                            email: data.emailOtpEnabled || false,
                            totp: data.twoFactorEnabled || false
                        });

                        // Set the default method to the one returned by backend
                        if (data.method === 'totp') {
                            setTwoFAMethod('totp');
                        } else {
                            setTwoFAMethod('email');
                        }

                        setShowTwoFA(true);
                    } else {
                        // Login successful, store token
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('userRole', data.role);
                        // Redirect to previous page or accounts
                        window.location.href = getRedirectUrl();
                    }
                } else {
                    setErrors({ email: data.error || 'Login failed' });
                }
            } catch (error) {
                console.error('Login error:', error);
                setErrors({ email: 'Network error. Please try again.' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateSignupForm()) {
            setIsLoading(true);
            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        name: formData.name,
                        phone: formData.phone,
                        confirmPassword: formData.confirmPassword,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Redirect to previous page or accounts after signup
                    window.location.href = getRedirectUrl();
                } else {
                    setErrors({ email: data.error || 'Signup failed' });
                }
            } catch (error) {
                console.error('Signup error:', error);
                setErrors({ email: 'Network error. Please try again.' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handlePasswordReset = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateResetForm()) {
            setIsLoading(true);
            // Simulate API call
            setTimeout(() => {
                setIsLoading(false);
                setResetEmailSent(true);
            }, 1500);
        }
    };

    const handleTwoFASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateTwoFAForm()) {
            setIsLoading(true);
            try {
                const userId = localStorage.getItem('tempUserId');

                let requestBody: Record<string, any> = { userId };

                if (twoFAMethod === 'email') {
                    requestBody.type = 'email';
                    requestBody.data = twoFAData.emailOTP;
                } else if (twoFAMethod === 'totp') {
                    requestBody.type = 'totp';
                    requestBody.data = twoFAData.qrOTP;
                }

                const response = await fetch('/api/2fa/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });

                const data = await response.json();

                if (response.ok) {
                    // Store token and role
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userRole', data.role);
                    // Redirect to previous page or accounts
                    window.location.href = getRedirectUrl();
                } else {
                    const errorKey = twoFAMethod === 'email' ? 'emailOTP' : 'qrOTP';
                    setErrors({ [errorKey]: data.error || '2FA verification failed' });
                }
            } catch (error) {
                console.error('2FA verification error:', error);
                const errorKey = twoFAMethod === 'email' ? 'emailOTP' : 'qrOTP';
                setErrors({ [errorKey]: 'Network error. Please try again.' });
            } finally {
                setIsLoading(false);
            }
        }
    };



    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            name: '',
            phone: ''
        });
        setTwoFAData({
            emailOTP: '',
            qrOTP: ''
        });
        setErrors({});
    };

    const switchTab = (tab: 'login' | 'signup' | 'reset') => {
        setActiveTab(tab);
        resetForm();
        setShowTwoFA(false);
        setResetEmailSent(false);
    };

    return (
        <div className={`min-h-screen ${isMounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700 flex relative overflow-hidden bg-[#121212]`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
                <div className="absolute top-0 left-0 w-full h-full"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, #00FFC6 0%, transparent 50%), 
                                         radial-gradient(circle at 75% 75%, #00FFC6 0%, transparent 50%)`,
                        backgroundSize: '80px 80px'
                    }}></div>
            </div>

            {/* Left Side - Information Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 20% 20%, #00FFC6 0%, transparent 40%), 
                                         radial-gradient(circle at 80% 80%, #00FFC6 0%, transparent 40%)`,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 text-[#E0E0E0]">
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00FFC6] rounded-full shadow-lg mb-6">
                            <FaShieldAlt className="text-[#121212] text-2xl" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4 text-[#E0E0E0]">Spyber Polymath</h1>
                        <p className="text-xl text-[#00FFC6]">Discover ideas that inspire</p>
                    </div>
                    {activeTab === 'login' && !showTwoFA && (
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[rgba(0,255,198,0.2)] rounded-lg flex items-center justify-center">
                                    <FaLockIcon className="text-[#00FFC6] text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-1 text-[#E0E0E0]">Secure Blog Access</h3>
                                    <p className="text-[#757575]">Multi-factor authentication keeps your blog account protected from unauthorized access.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[rgba(0,255,198,0.2)] rounded-lg flex items-center justify-center">
                                    <FaUserShield className="text-[#00FFC6] text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-1 text-[#E0E0E0]">Privacy First</h3>
                                    <p className="text-[#757575]">Your data is encrypted and never shared with third parties without your consent.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[rgba(0,255,198,0.2)] rounded-lg flex items-center justify-center">
                                    <FaMobileAlt className="text-[#00FFC6] text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-1 text-[#E0E0E0]">Access Anywhere</h3>
                                    <p className="text-[#757575]">Securely access your blog from any device, anywhere in the world.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'signup' && !showTwoFA && (
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[rgba(0,255,198,0.2)] rounded-lg flex items-center justify-center">
                                    <FaRocket className="text-[#00FFC6] text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-1 text-[#E0E0E0]">Explore Diverse Blogs</h3>
                                    <p className="text-[#757575]">Discover blogs on various topics and find your favorite writers instantly.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[rgba(0,255,198,0.2)] rounded-lg flex items-center justify-center">
                                    <FaCloudUploadAlt className="text-[#00FFC6] text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-1 text-[#E0E0E0]">Immersive Media Experience</h3>
                                    <p className="text-[#757575]">Enjoy high-quality images, videos, and interactive content in every post.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[rgba(0,255,198,0.2)] rounded-lg flex items-center justify-center">
                                    <FaGlobe className="text-[#00FFC6] text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-1 text-[#E0E0E0]">Connect with Global Voices</h3>
                                    <p className="text-[#757575]">Read perspectives from writers around the world and join the conversation.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {(showTwoFA || activeTab === 'reset') && (
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[rgba(0,255,198,0.2)] rounded-lg flex items-center justify-center">
                                    <FaShieldAlt className="text-[#00FFC6] text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-1 text-[#E0E0E0]">Advanced Security</h3>
                                    <p className="text-[#757575]">Our multi-layered security approach ensures your reading experience remains secure.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[rgba(0,255,198,0.2)] rounded-lg flex items-center justify-center">
                                    <FaChartLine className="text-[#00FFC6] text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-1 text-[#E0E0E0]">Continuous Improvement</h3>
                                    <p className="text-[#757575]">We constantly update our features to enhance your reading experience.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-12">
                        <p className="text-sm text-[#757575]">&copy; 2025 Spyber Polymath. All rights reserved.</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 bg-[#121212] relative z-10">
                <div className={`w-full max-w-md ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-700`}>
                    {/* Mobile Logo/Brand */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00FFC6] rounded-full shadow-lg mb-4">
                            <FaShieldAlt className="text-[#121212] text-2xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#E0E0E0]">Spyber Polymath</h1>
                        <p className="text-[#757575] mt-1">Discover ideas that inspire</p>
                    </div>

                    {/* Auth Card */}
                    <div className="bg-[#181A1B] rounded-2xl shadow-xl overflow-hidden border border-[#232323]">
                        {/* Tab Headers */}
                        <div className="flex border-b border-[#232323]">
                            <button
                                onClick={() => switchTab('login')}
                                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'login' ? 'text-[#00FFC6] border-b-2 border-[#00FFC6] bg-[rgba(0,255,198,0.1)]' : 'text-[#757575] hover:text-[#E0E0E0]'}`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => switchTab('signup')}
                                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'signup' ? 'text-[#00FFC6] border-b-2 border-[#00FFC6] bg-[rgba(0,255,198,0.1)]' : 'text-[#757575] hover:text-[#E0E0E0]'}`}
                            >
                                Sign Up
                            </button>
                            <button
                                onClick={() => switchTab('reset')}
                                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'reset' ? 'text-[#00FFC6] border-b-2 border-[#00FFC6] bg-[rgba(0,255,198,0.1)]' : 'text-[#757575] hover:text-[#E0E0E0]'}`}
                            >
                                Reset
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {/* Login Form */}
                            {activeTab === 'login' && !showTwoFA && (
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#E0E0E0] mb-1">
                                            <FaEnvelope className="inline mr-1 text-[#00FFC6]" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00FFC6]/30 focus:border-[#00FFC6] transition-all bg-[#121212] text-[#E0E0E0] ${errors.email ? 'border-[#ff4444]' : 'border-[#232323]'}`}
                                            placeholder="Enter your email"
                                        />
                                        {errors.email && <p className="text-[#ff4444] text-xs mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#E0E0E0] mb-1">
                                            <FaLock className="inline mr-1 text-[#00FFC6]" />
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00FFC6]/30 focus:border-[#00FFC6] transition-all bg-[#121212] text-[#E0E0E0] ${errors.password ? 'border-[#ff4444]' : 'border-[#232323]'}`}
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-2.5 text-[#757575] hover:text-[#00FFC6] transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-[#ff4444] text-xs mt-1">{errors.password}</p>}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center">
                                            <input type="checkbox" className="mr-2 accent-[#00FFC6]" />
                                            <span className="text-sm text-[#757575]">Remember me</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => switchTab('reset')}
                                            className="text-sm text-[#00FFC6] hover:text-[#E0E0E0] transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-2 px-4 bg-[#00FFC6] text-[#121212] font-medium rounded-lg hover:bg-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 transition-all duration-300 disabled:opacity-50 hover:scale-105 disabled:hover:scale-100"
                                    >
                                        {isLoading ? 'Signing in...' : 'Sign In'}
                                    </button>
                                </form>
                            )}

                            {/* 2FA Verification */}
                            {activeTab === 'login' && showTwoFA && (
                                <div>
                                    <div className="text-center mb-6">
                                        <FaShieldAlt className="mx-auto text-4xl text-[#00FFC6] mb-4" />
                                        <h2 className="text-xl font-semibold text-[#E0E0E0]">Two-Factor Authentication</h2>
                                        <p className="text-[#757575] mt-1">Choose a verification method to continue</p>
                                    </div>

                                    <div className="flex justify-center mb-6">
                                        <div className="inline-flex rounded-lg border border-[#232323] p-1 flex-wrap gap-1 justify-center">
                                            {twoFAOptions.email && (
                                                <button
                                                    type="button"
                                                    onClick={() => setTwoFAMethod('email')}
                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${twoFAMethod === 'email' ? 'bg-[rgba(0,255,198,0.2)] text-[#00FFC6] border border-[#00FFC6]' : 'text-[#757575] hover:text-[#E0E0E0] border border-transparent'}`}
                                                >
                                                    <FaEnvelope className="inline mr-1" />
                                                    Email OTP
                                                </button>
                                            )}
                                            {twoFAOptions.totp && (
                                                <button
                                                    type="button"
                                                    onClick={() => setTwoFAMethod('totp')}
                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${twoFAMethod === 'totp' ? 'bg-[rgba(0,255,198,0.2)] text-[#00FFC6] border border-[#00FFC6]' : 'text-[#757575] hover:text-[#E0E0E0] border border-transparent'}`}
                                                >
                                                    <FaQrcode className="inline mr-1" />
                                                    Authenticator
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {twoFAMethod === 'email' && (
                                        <form onSubmit={handleTwoFASubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-[#E0E0E0] mb-1">
                                                    Enter the 6-digit code sent to your email
                                                </label>
                                                <input
                                                    type="text"
                                                    name="emailOTP"
                                                    value={twoFAData.emailOTP}
                                                    onChange={handleTwoFAInputChange}
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00FFC6]/30 focus:border-[#00FFC6] transition-all bg-[#121212] text-[#E0E0E0] ${errors.emailOTP ? 'border-[#ff4444]' : 'border-[#232323]'}`}
                                                    placeholder="000000"
                                                    maxLength={6}
                                                />
                                                {errors.emailOTP && <p className="text-[#ff4444] text-xs mt-1">{errors.emailOTP}</p>}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    className="text-sm text-[#00FFC6] hover:text-[#E0E0E0] transition-colors"
                                                >
                                                    Resend code
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTwoFA(false)}
                                                    className="text-sm text-[#757575] hover:text-[#E0E0E0] transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full py-2 px-4 bg-[#00FFC6] text-[#121212] font-medium rounded-lg hover:bg-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 transition-all duration-300 disabled:opacity-50 hover:scale-105 disabled:hover:scale-100"
                                            >
                                                {isLoading ? 'Verifying...' : 'Verify'}
                                            </button>
                                        </form>
                                    )}

                                    {twoFAMethod === 'totp' && (
                                        <form onSubmit={handleTwoFASubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-[#E0E0E0] mb-1">
                                                    Enter the 6-digit code from your authenticator app
                                                </label>
                                                <input
                                                    type="text"
                                                    name="qrOTP"
                                                    value={twoFAData.qrOTP}
                                                    onChange={handleTwoFAInputChange}
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00FFC6]/30 focus:border-[#00FFC6] text-center text-2xl letter-spacing tracking-widest transition-all bg-[#121212] text-[#E0E0E0] ${errors.qrOTP ? 'border-[#ff4444]' : 'border-[#232323]'}`}
                                                    placeholder="000000"
                                                    maxLength={6}
                                                />
                                                {errors.qrOTP && <p className="text-[#ff4444] text-xs mt-1">{errors.qrOTP}</p>}
                                            </div>

                                            <div className="bg-[#181A1B] border border-[#00FFC6] rounded-lg p-3 mb-4">
                                                <p className="text-[#00FFC6] text-xs">
                                                    💡 <strong>Tip:</strong> The code changes every 30 seconds. Use the code currently displayed in your authenticator app.
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                {twoFAOptions.email && (
                                                    <button
                                                        type="button"
                                                        className="text-sm text-[#00FFC6] hover:text-[#E0E0E0] transition-colors"
                                                    >
                                                        Try another method
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTwoFA(false)}
                                                    className="text-sm text-[#757575] hover:text-[#E0E0E0] ml-auto transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full py-2 px-4 bg-[#00FFC6] text-[#121212] font-medium rounded-lg hover:bg-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 transition-all duration-300 disabled:opacity-50 hover:scale-105 disabled:hover:scale-100"
                                            >
                                                {isLoading ? 'Verifying...' : 'Verify'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* Signup Form */}
                            {activeTab === 'signup' && !showTwoFA && (
                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#E0E0E0] mb-1">
                                            <FaUser className="inline mr-1 text-[#00FFC6]" />
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00FFC6]/30 focus:border-[#00FFC6] transition-all bg-[#121212] text-[#E0E0E0] ${errors.name ? 'border-[#ff4444]' : 'border-[#232323]'}`}
                                            placeholder="Enter your name"
                                        />
                                        {errors.name && <p className="text-[#ff4444] text-xs mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#E0E0E0] mb-1">
                                            <FaEnvelope className="inline mr-1 text-[#00FFC6]" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00FFC6]/30 focus:border-[#00FFC6] transition-all bg-[#121212] text-[#E0E0E0] ${errors.email ? 'border-[#ff4444]' : 'border-[#232323]'}`}
                                            placeholder="Enter your email"
                                        />
                                        {errors.email && <p className="text-[#ff4444] text-xs mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#E0E0E0] mb-1">
                                            <FaPhone className="inline mr-1 text-[#00FFC6]" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00FFC6]/30 focus:border-[#00FFC6] transition-all bg-[#121212] text-[#E0E0E0] ${errors.phone ? 'border-[#ff4444]' : 'border-[#232323]'}`}
                                            placeholder="Enter your phone number"
                                        />
                                        {errors.phone && <p className="text-[#ff4444] text-xs mt-1">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#E0E0E0] mb-1">
                                            <FaLock className="inline mr-1 text-[#00FFC6]" />
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00FFC6]/30 focus:border-[#00FFC6] transition-all bg-[#121212] text-[#E0E0E0] ${errors.password ? 'border-[#ff4444]' : 'border-[#232323]'}`}
                                                placeholder="Create a password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-2.5 text-[#757575] hover:text-[#00FFC6] transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-[#ff4444] text-xs mt-1">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#E0E0E0] mb-1">
                                            <FaLock className="inline mr-1 text-[#00FFC6]" />
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00FFC6]/30 focus:border-[#00FFC6] transition-all bg-[#121212] text-[#E0E0E0] ${errors.confirmPassword ? 'border-[#ff4444]' : 'border-[#232323]'}`}
                                                placeholder="Confirm your password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-2.5 text-[#757575] hover:text-[#00FFC6] transition-colors"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <p className="text-[#ff4444] text-xs mt-1">{errors.confirmPassword}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-2 px-4 bg-[#00FFC6] text-[#121212] font-medium rounded-lg hover:bg-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 transition-all duration-300 disabled:opacity-50 hover:scale-105 disabled:hover:scale-100"
                                    >
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </form>
                            )}

                            {/* Password Reset Form */}
                            {activeTab === 'reset' && !resetEmailSent && (
                                <form onSubmit={handlePasswordReset} className="space-y-4">
                                    <div className="text-center mb-6">
                                        <FaLock className="mx-auto text-4xl text-[#757575] mb-4" />
                                        <h2 className="text-xl font-semibold text-[#E0E0E0]">Forgot your password?</h2>
                                        <p className="text-[#757575] mt-1">Enter your email address and we'll send you a link to reset your password.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#E0E0E0] mb-1">
                                            <FaEnvelope className="inline mr-1 text-[#00FFC6]" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00FFC6]/30 focus:border-[#00FFC6] transition-all bg-[#121212] text-[#E0E0E0] ${errors.email ? 'border-[#ff4444]' : 'border-[#232323]'}`}
                                            placeholder="Enter your email"
                                        />
                                        {errors.email && <p className="text-[#ff4444] text-xs mt-1">{errors.email}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-2 px-4 bg-[#00FFC6] text-[#121212] font-medium rounded-lg hover:bg-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 transition-all duration-300 disabled:opacity-50 hover:scale-105 disabled:hover:scale-100"
                                    >
                                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                                    </button>

                                    <div className="text-center mt-4">
                                        <button
                                            type="button"
                                            onClick={() => switchTab('login')}
                                            className="text-sm text-[#00FFC6] hover:text-[#E0E0E0] flex items-center justify-center mx-auto transition-colors"
                                        >
                                            <FaArrowLeft className="mr-1" />
                                            Back to Login
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Reset Email Sent */}
                            {activeTab === 'reset' && resetEmailSent && (
                                <div className="text-center">
                                    <FaCheckCircle className="mx-auto text-5xl text-[#00FFC6] mb-4" />
                                    <h2 className="text-xl font-semibold text-[#E0E0E0]">Email Sent!</h2>
                                    <p className="text-[#757575] mt-1">We've sent a password reset link to your email address.</p>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => switchTab('login')}
                                            className="px-4 py-2 bg-[#00FFC6] text-[#121212] rounded-lg hover:bg-[#E0E0E0] transition-colors hover:scale-105 duration-300"
                                        >
                                            Return to Login
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;