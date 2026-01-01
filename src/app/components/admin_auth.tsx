'use client';
import React, { useState } from 'react';
import {
    Lock,
    Mail,
    Eye,
    EyeOff,
    Shield,
    AlertCircle,
    CheckCircle,
    Loader,
    Smartphone,
    Key,
    ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { validateTokenStructure, clearInvalidToken } from '@/lib/tokenUtils';

interface LoginForm {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
    twofa?: string;
}

interface Notification {
    message: string;
    type: 'success' | 'error';
}

interface TwoFAMethods {
    email: boolean;
    totp: boolean;
}

export default function AdminAuth() {
    const router = useRouter();
    const [checkingSession, setCheckingSession] = useState(true);
    const [formData, setFormData] = useState<LoginForm>({
        email: '',
        password: ''
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<Notification | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [twoFARequired, setTwoFARequired] = useState(false);
    const [showTwoFAMethod, setShowTwoFAMethod] = useState(false);
    const [userIdFor2FA, setUserIdFor2FA] = useState<string | null>(null);
    const [twoFACode, setTwoFACode] = useState('');
    const [selectedTwoFAMethod, setSelectedTwoFAMethod] = useState<'email' | 'totp' | null>(null);
    const [twoFAMethods, setTwoFAMethods] = useState<TwoFAMethods>({
        email: false,
        totp: false
    });

    const getRedirectUrl = () => {
        if (typeof window !== 'undefined') {
            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
                localStorage.removeItem('redirectAfterLogin');
                return redirectUrl;
            }
        }
        return '/admin';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormErrors({});
        setNotification(null);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                setFormErrors({ general: result.error });
            } else if (result.requires2FA && result.userId) {
                // 2FA is required, show method selection
                setTwoFARequired(true);
                setUserIdFor2FA(result.userId);
                setTwoFAMethods({
                    email: result.emailOtpEnabled || false,
                    totp: result.twoFactorEnabled || false
                });
                // Show method selection screen
                setShowTwoFAMethod(true);
                
                // Set default method to the one returned by backend
                if (result.method === 'totp') {
                    setSelectedTwoFAMethod('totp');
                } else {
                    setSelectedTwoFAMethod('email');
                }
                
                setNotification({ message: 'Select your preferred 2FA method', type: 'success' });
            } else {
                setNotification({ message: result.message, type: 'success' });
                setIsAuthenticated(true);
                if (typeof window !== 'undefined' && result.userId && result.token) {
                    window.localStorage.setItem('userId', result.userId);
                    window.localStorage.setItem('role', result.role || 'admin');
                    window.localStorage.setItem('token', result.token);
                    setTimeout(() => {
                        router.push(getRedirectUrl());
                    }, 300);
                }
            }
        } catch (error) {
            setFormErrors({ general: 'An unexpected error occurred.' });
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        let mounted = true;

        const validateToken = async (token: string) => {
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
                return false;
            }
        };

        (async () => {
            if (typeof window === 'undefined') return;
            try {
                const storedRole = window.localStorage.getItem('role');
                const token = window.localStorage.getItem('token');
                
                if (token && storedRole === 'admin') {
                    // Use the new token validation utility
                    if (validateTokenStructure(token)) {
                        const ok = await validateToken(token);
                        if (ok) {
                            if (mounted) router.replace('/admin');
                            return;
                        }
                    }
                    // Clear invalid token
                    clearInvalidToken();
                }
            } catch (err) {
                // Clear invalid token on any error
                clearInvalidToken();
            } finally {
                if (mounted) setCheckingSession(false);
            }
        })();

        return () => { mounted = false };
    }, [router]);

    const handleSelectTwoFAMethod = async (method: 'email' | 'totp') => {
        setSelectedTwoFAMethod(method);
        setTwoFACode('');
        setFormErrors({});
        setNotification(null);

        // If email is selected, send code
        if (method === 'email') {
            setIsLoading(true);
            try {
                const res = await fetch('/api/2fa/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userIdFor2FA, type: 'email', action: 'send' })
                });
                const result = await res.json();
                if (result.success || res.ok) {
                    setNotification({ message: '2FA code sent to your email', type: 'success' });
                } else {
                    setFormErrors({ twofa: result.error || 'Failed to send 2FA code' });
                }
            } catch (error) {
                setFormErrors({ twofa: 'Failed to send 2FA code.' });
            } finally {
                setIsLoading(false);
            }
        } else if (method === 'totp') {
            setNotification({ message: 'Enter your TOTP code from your authenticator app', type: 'success' });
        }
    };

    const handleEmail2FAVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userIdFor2FA) return;
        setIsLoading(true);
        setFormErrors({});
        try {
            const res = await fetch(`/api/2fa/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userIdFor2FA, type: 'email', data: twoFACode })
            });
            const result = await res.json();
            if (result.success) {
                setNotification({ message: '2FA verification successful!', type: 'success' });
                setIsAuthenticated(true);
                if (typeof window !== 'undefined' && result.token) {
                    window.localStorage.setItem('userId', userIdFor2FA!);
                    window.localStorage.setItem('role', result.role || 'admin');
                    window.localStorage.setItem('token', result.token);
                    setTimeout(() => {
                        router.push(getRedirectUrl());
                    }, 300);
                }
            } else {
                setFormErrors({ twofa: result.error || 'Invalid 2FA code' });
            }
        } catch (error) {
            setFormErrors({ twofa: '2FA verification failed.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTOTPVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userIdFor2FA) return;
        setIsLoading(true);
        setFormErrors({});
        try {
            const res = await fetch(`/api/2fa/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userIdFor2FA, type: 'totp', data: twoFACode })
            });
            const result = await res.json();
            if (result.success) {
                setNotification({ message: '2FA verification successful!', type: 'success' });
                setIsAuthenticated(true);
                if (typeof window !== 'undefined' && result.token) {
                    window.localStorage.setItem('userId', userIdFor2FA!);
                    window.localStorage.setItem('role', result.role || 'admin');
                    window.localStorage.setItem('token', result.token);
                    setTimeout(() => {
                        router.push(getRedirectUrl());
                    }, 300);
                }
            } else {
                setFormErrors({ twofa: result.error || 'Invalid TOTP code' });
            }
        } catch (error) {
            setFormErrors({ twofa: 'TOTP verification failed.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#121212]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
                <div className="absolute top-0 left-0 w-full h-full"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, #00FFC6 0%, transparent 50%), 
                                         radial-gradient(circle at 75% 75%, #00FFC6 0%, transparent 50%)`,
                        backgroundSize: '80px 80px'
                    }}></div>
            </div>

            {/* Header */}
            <header className="relative z-10 px-4 py-6 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00FFC6]">
                            <Shield className="w-6 h-6" style={{ color: '#121212' }} />
                        </div>
                        <h1 className="text-xl font-bold text-[#E0E0E0]">SpyberPolymath Admin</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00FFC6]"></div>
                        <span className="text-sm text-[#757575]">Secure Portal</span>
                    </div>
                </div>
            </header>

            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-2 sm:top-6 sm:right-6 z-50 flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 rounded-lg shadow-lg border ${notification.type === 'error' ? 'border-red-500' : 'border-[#00FFC6]'
                    }`} style={{
                        backgroundColor: '#181A1B',
                        color: notification.type === 'error' ? '#ff4444' : '#00FFC6'
                    }}>
                    {notification.type === 'error' ?
                        <AlertCircle className="w-5 h-5" /> :
                        <CheckCircle className="w-5 h-5" />
                    }
                    <span className="text-sm sm:text-base">{notification.message}</span>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center relative z-10 px-2 py-6 sm:p-6">
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                    {/* Left Panel - Visual */}
                    <div className="hidden lg:flex flex-col justify-center items-center p-4 sm:p-8 rounded-2xl bg-[rgba(0,255,198,0.05)]">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center mb-6 sm:mb-8 bg-[rgba(0,255,198,0.1)]">
                            <Shield className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: '#00FFC6' }} />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-center text-[#E0E0E0]">Secure Admin Access</h2>
                        <p className="text-center mb-4 sm:mb-8 text-[#b0f5e6] text-sm sm:text-base">
                            Your login credentials are encrypted and secured with industry-standard protocols.
                        </p>
                        <div className="space-y-3 w-full">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#00FFC6]">
                                    <CheckCircle className="w-5 h-5" style={{ color: '#121212' }} />
                                </div>
                                <span className="text-[#E0E0E0] text-sm sm:text-base">Two-Factor Authentication</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#00FFC6]">
                                    <CheckCircle className="w-5 h-5" style={{ color: '#121212' }} />
                                </div>
                                <span className="text-[#E0E0E0] text-sm sm:text-base">Encrypted Data Transfer</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#00FFC6]">
                                    <CheckCircle className="w-5 h-5" style={{ color: '#121212' }} />
                                </div>
                                <span className="text-[#E0E0E0] text-sm sm:text-base">Session Management</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Form */}
                    <div className="p-4 sm:p-8 rounded-2xl bg-[#181A1B]">
                        <div className="mb-6 sm:mb-8">
                            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-[#E0E0E0]">
                                {twoFARequired ? 'Two-Factor Authentication' : 'Sign In'}
                            </h2>
                            <p className="text-[#757575] text-sm sm:text-base">
                                {twoFARequired ? 'Enter the verification code sent to your email' : 'Enter your credentials to access the admin portal'}
                            </p>
                        </div>

                        {formErrors.general && (
                            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border flex items-center gap-3"
                                style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', borderColor: 'rgba(255, 68, 68, 0.3)' }}>
                                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#ff4444' }} />
                                <span className="text-xs sm:text-sm text-[#ff4444]">{formErrors.general}</span>
                            </div>
                        )}

                        {!twoFARequired ? (
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-[#E0E0E0]">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#00FFC6]" />
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="admin@spyberpolymath.com"
                                            className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 transition-all text-xs sm:text-base"
                                            style={{
                                                backgroundColor: '#121212',
                                                borderColor: formErrors.email ? '#ff4444' : '#232323',
                                                color: '#E0E0E0'
                                            }}
                                            disabled={isLoading}
                                            autoComplete="username"
                                            required
                                        />
                                    </div>
                                    {formErrors.email && (
                                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm flex items-center gap-2 text-[#ff4444]">
                                            <AlertCircle className="w-4 h-4" />
                                            {formErrors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-[#E0E0E0]">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#00FFC6]" />
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter your password"
                                            className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 transition-all text-xs sm:text-base"
                                            style={{
                                                backgroundColor: '#121212',
                                                borderColor: formErrors.password ? '#ff4444' : '#232323',
                                                color: '#E0E0E0'
                                            }}
                                            disabled={isLoading}
                                            autoComplete="current-password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-opacity-10 text-[#757575]"
                                            disabled={isLoading}
                                            tabIndex={0}
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {formErrors.password && (
                                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm flex items-center gap-2 text-[#ff4444]">
                                            <AlertCircle className="w-4 h-4" />
                                            {formErrors.password}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || isAuthenticated}
                                    className="w-full py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-base"
                                    style={{
                                        backgroundColor: isAuthenticated ? '#7ED321' : '#00FFC6',
                                        color: '#121212'
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            <span>Authenticating...</span>
                                        </>
                                    ) : isAuthenticated ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Login Successful!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-5 h-5" />
                                            <span>Access Admin Portal</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : showTwoFAMethod && !selectedTwoFAMethod ? (
                            // 2FA Method Selection Screen
                            <div className="space-y-4 sm:space-y-6">
                                <p className="text-[#757575] text-xs sm:text-sm mb-6">
                                    Select your preferred authentication method
                                </p>

                                {formErrors.twofa && (
                                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border flex items-center gap-3"
                                        style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', borderColor: 'rgba(255, 68, 68, 0.3)' }}>
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#ff4444' }} />
                                        <span className="text-xs sm:text-sm text-[#ff4444]">{formErrors.twofa}</span>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {/* Email Option */}
                                    {twoFAMethods.email && (
                                        <button
                                            type="button"
                                            onClick={() => handleSelectTwoFAMethod('email')}
                                            disabled={isLoading}
                                            className="w-full p-4 rounded-lg border-2 transition-all hover:border-[#00FFC6] hover:bg-[rgba(0,255,198,0.05)] disabled:opacity-50 text-left"
                                            style={{
                                                borderColor: selectedTwoFAMethod === 'email' ? '#00FFC6' : '#232323',
                                                backgroundColor: selectedTwoFAMethod === 'email' ? 'rgba(0,255,198,0.1)' : '#121212'
                                            }}
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: 'rgba(0,255,198,0.2)' }}>
                                                    <Mail className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#00FFC6' }} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-[#E0E0E0] text-xs sm:text-sm">Email OTP</h3>
                                                    <p className="text-[#757575] text-xs">Receive a code via email</p>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-[#757575]" />
                                            </div>
                                        </button>
                                    )}

                                    {/* TOTP Option */}
                                    {twoFAMethods.totp && (
                                        <button
                                            type="button"
                                            onClick={() => handleSelectTwoFAMethod('totp')}
                                            disabled={isLoading}
                                            className="w-full p-4 rounded-lg border-2 transition-all hover:border-[#00FFC6] hover:bg-[rgba(0,255,198,0.05)] disabled:opacity-50 text-left"
                                            style={{
                                                borderColor: selectedTwoFAMethod === 'totp' ? '#00FFC6' : '#232323',
                                                backgroundColor: selectedTwoFAMethod === 'totp' ? 'rgba(0,255,198,0.1)' : '#121212'
                                            }}
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: 'rgba(0,255,198,0.2)' }}>
                                                    <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#00FFC6' }} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-[#E0E0E0] text-xs sm:text-sm">Authenticator App</h3>
                                                    <p className="text-[#757575] text-xs">Use your TOTP app</p>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-[#757575]" />
                                            </div>
                                        </button>
                                    )}

                                </div>

                                <button
                                    type="button"
                                    onClick={() => setTwoFARequired(false)}
                                    className="w-full py-2 rounded-lg text-[#757575] hover:text-[#00FFC6] transition-colors text-xs sm:text-sm"
                                >
                                    ← Back to Login
                                </button>
                            </div>
                        ) : (
                            // 2FA Verification Screen
                            <>
                                {selectedTwoFAMethod === 'email' && (
                                    <form onSubmit={handleEmail2FAVerification} className="space-y-4 sm:space-y-6">
                                        <div>
                                            <label htmlFor="twofa-email" className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-[#E0E0E0]">
                                                Email Verification Code
                                            </label>
                                            <input
                                                id="twofa-email"
                                                type="text"
                                                placeholder="Enter 6-digit code"
                                                className="w-full py-2 sm:py-3 rounded-lg border px-3 sm:px-4 mb-1 sm:mb-2 text-xs sm:text-base tracking-widest text-center"
                                                value={twoFACode}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                    setTwoFACode(val);
                                                    if (formErrors.twofa) {
                                                        setFormErrors(prev => ({ ...prev, twofa: '' }));
                                                    }
                                                }}
                                                disabled={isLoading}
                                                style={{
                                                    backgroundColor: '#121212',
                                                    borderColor: formErrors.twofa ? '#ff4444' : '#232323',
                                                    color: '#E0E0E0',
                                                    letterSpacing: '0.3em'
                                                }}
                                                autoComplete="one-time-code"
                                                maxLength={6}
                                                required
                                            />
                                            {formErrors.twofa && (
                                                <p className="mt-1 sm:mt-2 text-xs sm:text-sm flex items-center gap-2 text-[#ff4444]">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {formErrors.twofa}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading || isAuthenticated || twoFACode.length < 6}
                                            className="w-full py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-base"
                                            style={{
                                                backgroundColor: isAuthenticated ? '#7ED321' : '#00FFC6',
                                                color: '#121212'
                                            }}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader className="w-5 h-5 animate-spin" />
                                                    <span>Verifying...</span>
                                                </>
                                            ) : isAuthenticated ? (
                                                <>
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>Login Successful!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="w-5 h-5" />
                                                    <span>Verify Code</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedTwoFAMethod(null);
                                                setTwoFACode('');
                                                setFormErrors({});
                                            }}
                                            className="w-full py-2 rounded-lg text-[#757575] hover:text-[#00FFC6] transition-colors text-xs sm:text-sm"
                                        >
                                            ← Change Method
                                        </button>
                                    </form>
                                )}

                                {selectedTwoFAMethod === 'totp' && (
                                    <form onSubmit={handleTOTPVerification} className="space-y-4 sm:space-y-6">
                                        <div>
                                            <label htmlFor="twofa-totp" className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-[#E0E0E0]">
                                                TOTP Verification Code
                                            </label>
                                            <input
                                                id="twofa-totp"
                                                type="text"
                                                placeholder="Enter 6-digit code"
                                                className="w-full py-2 sm:py-3 rounded-lg border px-3 sm:px-4 mb-1 sm:mb-2 text-xs sm:text-base tracking-widest text-center"
                                                value={twoFACode}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                    setTwoFACode(val);
                                                    if (formErrors.twofa) {
                                                        setFormErrors(prev => ({ ...prev, twofa: '' }));
                                                    }
                                                }}
                                                disabled={isLoading}
                                                style={{
                                                    backgroundColor: '#121212',
                                                    borderColor: formErrors.twofa ? '#ff4444' : '#232323',
                                                    color: '#E0E0E0',
                                                    letterSpacing: '0.3em'
                                                }}
                                                autoComplete="one-time-code"
                                                maxLength={6}
                                                required
                                            />
                                            {formErrors.twofa && (
                                                <p className="mt-1 sm:mt-2 text-xs sm:text-sm flex items-center gap-2 text-[#ff4444]">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {formErrors.twofa}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading || isAuthenticated || twoFACode.length < 6}
                                            className="w-full py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-base"
                                            style={{
                                                backgroundColor: isAuthenticated ? '#7ED321' : '#00FFC6',
                                                color: '#121212'
                                            }}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader className="w-5 h-5 animate-spin" />
                                                    <span>Verifying...</span>
                                                </>
                                            ) : isAuthenticated ? (
                                                <>
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>Login Successful!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="w-5 h-5" />
                                                    <span>Verify Code</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedTwoFAMethod(null);
                                                setTwoFACode('');
                                                setFormErrors({});
                                            }}
                                            className="w-full py-2 rounded-lg text-[#757575] hover:text-[#00FFC6] transition-colors text-xs sm:text-sm"
                                        >
                                            ← Change Method
                                        </button>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 px-4 py-6 text-center">
                <p className="text-xs text-[#757575]">
                    Protected by advanced security measures
                </p>
                <p className="text-xs mt-1 text-[#757575]">
                    © 2025 SpyberPolymath. All rights reserved.
                </p>
            </footer>
        </div>
    );
}