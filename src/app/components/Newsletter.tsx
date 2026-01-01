'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaPaperPlane, FaUser, FaAt, FaTags, FaShieldAlt, FaLock, FaBug, FaRobot, FaCheckCircle, FaExclamationCircle as ExclamationCircle, FaArrowRight, FaNewspaper } from 'react-icons/fa';
import { Code, Shield, Brain, Infinity, ChevronRight, Zap, Target, Lock, Leaf, Check, Tags, User } from 'lucide-react';

interface SubscribeData {
    name: string;
    email: string;
    interest: string;
    source: 'newsletter' | 'accounts';
}

interface SubscribeResult {
    success: boolean;
    message: string;
}

// Subscribe to newsletter via API
async function subscribeToNewsletter(data: SubscribeData): Promise<SubscribeResult> {
    try {
        const response = await fetch('/api/newsletter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: result.error || 'Failed to subscribe to newsletter'
            };
        }

        return {
            success: true,
            message: result.message || 'Successfully subscribed to newsletter'
        };
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An unexpected error occurred'
        };
    }
}

interface NewsletterProps { }

interface FormData {
    name: string;
    email: string;
    interest: string;
}

interface FormErrors {
    name: string;
    email: string;
    interest: string;
}

export default function Newsletter({ }: NewsletterProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        interest: ''
    });
    const [errors, setErrors] = useState<FormErrors>({
        name: '',
        email: '',
        interest: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const interestOptions = [
        { value: 'ai-security', label: 'AI & Security' },
        { value: 'threats', label: 'Threats' },
        { value: 'architecture', label: 'Architecture' },
        { value: 'cloud-security', label: 'Cloud Security' },
        { value: 'remote-work', label: 'Remote Work' },
        { value: 'general', label: 'General Cybersecurity' }
    ];

    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {
            name: '',
            email: '',
            interest: ''
        };

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.interest) {
            newErrors.interest = 'Please select your interest';
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    }, [formData]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: inputValue
        }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Clear submit error
        if (submitError) {
            setSubmitError('');
        }
    }, [errors, submitError]);

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const result = await subscribeToNewsletter({ ...formData, source: 'newsletter' });

            if (!result.success) {
                setSubmitError(result.message);
                return;
            }

            console.log('Newsletter signup successful:', formData);
            setIsSubmitted(true);
            setFormData({ name: '', email: '', interest: '' });
        } catch (error) {
            console.error('Newsletter signup error:', error);
            setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateForm]);

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0a0a] text-[#E0E0E0] antialiased overflow-x-hidden">
                {/* Animated Grid Background */}
                <div
                    className="pointer-events-none fixed inset-0 opacity-[0.02]"
                    aria-hidden="true"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(0,255,198,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,255,198,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                    }}
                />

                {/* Floating Particles Effect */}
                <div className="pointer-events-none fixed inset-0" aria-hidden="true">
                    <div
                        className="absolute top-1/3 left-1/5 w-2 h-2 rounded-full bg-[#00FFC6] opacity-40 animate-pulse"
                        style={{ animation: "float 6s ease-in-out infinite" }}
                    />
                    <div
                        className="absolute top-2/3 right-1/4 w-3 h-3 rounded-full bg-[#00FFC6] opacity-30 animate-pulse"
                        style={{ animation: "float 8s ease-in-out infinite 2s" }}
                    />
                    <div
                        className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-[#00FFC6] opacity-50 animate-pulse"
                        style={{ animation: "float 7s ease-in-out infinite 1s" }}
                    />
                </div>

                <div className="max-w-md w-full">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#00FFC6] to-transparent rounded-2xl blur-xl opacity-20"></div>
                        <div className="relative bg-[#0a0a0a] border border-[#00FFC6]/30 rounded-2xl p-8 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00FFC6] rounded-full mb-6 mx-auto">
                                <Lock className="text-[#0a0a0a] text-4xl" />
                            </div>
                            <h2 className="text-3xl font-black text-[#00FFC6] mb-3">All Set!</h2>
                            <p className="text-[#b0f5e6] text-sm mb-8">
                                Check your email for confirmation. Welcome to the community!
                            </p>
                            <button
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setFormData({ name: '', email: '', interest: '' });
                                }}
                                className="w-full bg-[#00FFC6] text-[#0a0a0a] font-bold py-3 px-6 rounded-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
                                style={{ boxShadow: "0 10px 40px rgba(0,255,198,0.4)" }}
                            >
                                <ChevronRight className="text-sm" />
                                Subscribe Another Email
                            </button>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes float {
                        0%, 100% {
                            transform: translateY(0px);
                        }
                        50% {
                            transform: translateY(-20px);
                        }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <main
            className="min-h-screen pt-20 md:pt-24 lg:pt-28 bg-[#0a0a0a] text-[#E0E0E0] antialiased overflow-x-hidden"
            aria-labelledby="newsletter-title"
        >
            {/* Animated Grid Background */}
            <div
                className="pointer-events-none fixed inset-0 opacity-[0.02]"
                aria-hidden="true"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,255,198,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,255,198,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                }}
            />

            {/* Floating Particles Effect */}
            <div className="pointer-events-none fixed inset-0" aria-hidden="true">
                <div
                    className="absolute top-1/3 left-1/5 w-2 h-2 rounded-full bg-[#00FFC6] opacity-40 animate-pulse"
                    style={{ animation: "float 6s ease-in-out infinite" }}
                />
                <div
                    className="absolute top-2/3 right-1/4 w-3 h-3 rounded-full bg-[#00FFC6] opacity-30 animate-pulse"
                    style={{ animation: "float 8s ease-in-out infinite 2s" }}
                />
                <div
                    className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-[#00FFC6] opacity-50 animate-pulse"
                    style={{ animation: "float 7s ease-in-out infinite 1s" }}
                />
            </div>

            {/* Radial Glow Effects */}
            <div className="pointer-events-none fixed inset-0" aria-hidden="true">
                <div
                    className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full opacity-5 blur-[120px]"
                    style={{
                        background: "radial-gradient(circle, rgba(0,255,198,1) 0%, transparent 70%)",
                        animation: "glow 10s ease-in-out infinite",
                    }}
                />
                <div
                    className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-5 blur-[120px]"
                    style={{
                        background: "radial-gradient(circle, rgba(0,255,198,1) 0%, transparent 70%)",
                        animation: "glow 12s ease-in-out infinite 3s",
                    }}
                />
            </div>

            {/* Newsletter Header */}
            <header className="relative max-w-7xl mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20 z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Text Content */}
                    <div className="space-y-8">
                        {/* Main Title */}
                        <div>
                            <h1
                                id="newsletter-title"
                                className="text-6xl sm:text-7xl md:text-8xl font-black mb-4 bg-clip-text text-transparent leading-tight"
                                style={{
                                    backgroundImage: "linear-gradient(135deg, #00FFC6 0%, #ffffff 50%, #00FFC6 100%)",
                                    backgroundSize: "200%",
                                    animation: "shimmer 4s linear infinite",
                                    textShadow: "0 0 60px rgba(0,255,198,0.4)",
                                }}
                            >
                                Newsletter
                                <br />
                                Subscription
                            </h1>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-1 w-12 rounded-full bg-[#00FFC6]" />
                                <p className="text-xl md:text-2xl font-bold text-[#b0f5e6]">
                                    Stay Updated with <span className="text-[#00FFC6]">Security Insights</span>
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-lg text-[#b0f5e6] leading-relaxed max-w-xl">
                            Get exclusive insights on the latest threats, security best practices, and industry trends delivered straight to your inbox every week.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#00FFC6]/20 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-[#00FFC6]" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#00FFC6]">10,000+</p>
                                    <p className="text-xs text-[#b0f5e6]">Active Subscribers</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#00FFC6]/20 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-[#00FFC6]" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#00FFC6]">Weekly</p>
                                    <p className="text-xs text-[#b0f5e6]">Expert Curated</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#00FFC6]/20 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-[#00FFC6]" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#00FFC6]">Secure</p>
                                    <p className="text-xs text-[#b0f5e6]">Privacy First</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Visual Element */}
                    <div className="relative flex items-center justify-center">
                        <div className="relative">
                            {/* Main Avatar Circle */}
                            <div
                                className="relative w-48 sm:w-64 md:w-72 lg:w-80 h-48 sm:h-64 md:h-72 lg:h-80 rounded-full border-4 flex items-center justify-center overflow-hidden"
                                style={{
                                    borderColor: "#00FFC6",
                                    background: "linear-gradient(135deg, rgba(0,255,198,0.2), rgba(0,255,198,0.05))",
                                    boxShadow: "0 30px 80px rgba(0,255,198,0.4), inset 0 0 50px rgba(0,255,198,0.1)",
                                }}
                                aria-hidden={false}
                            >
                                <div
                                    className="absolute inset-0 w-full h-full rounded-full"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(0,255,198,0.2), rgba(0,255,198,0.05))",
                                    }}
                                />
                                <span className="text-9xl font-black text-[#00FFC6]" aria-hidden="true">📧</span>
                            </div>

                            {/* Orbiting Icons */}
                            <div className="absolute inset-0" style={{ animation: "rotate 20s linear infinite" }} aria-hidden="true">
                                <Shield className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-[#00FFC6] opacity-80" aria-hidden="true" focusable={false} />
                            </div>
                            <div className="absolute inset-0" style={{ animation: "rotate 25s linear infinite reverse" }} aria-hidden="true">
                                <Brain className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 text-[#00FFC6] opacity-80" aria-hidden="true" focusable={false} />
                            </div>
                            <div className="absolute inset-0" style={{ animation: "rotate 30s linear infinite" }} aria-hidden="true">
                                <Code className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-12 h-12 text-[#00FFC6] opacity-80" aria-hidden="true" focusable={false} />
                            </div>

                            {/* Decorative Rings */}
                            <div
                                className="absolute inset-0 -m-8 rounded-full border opacity-20"
                                style={{ borderColor: "#00FFC6", animation: "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite" }}
                                aria-hidden="true"
                            />
                            <div
                                className="absolute inset-0 -m-16 rounded-full border opacity-10"
                                style={{ borderColor: "#00FFC6", animation: "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite 1.5s" }}
                                aria-hidden="true"
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Tagline */}
                <div className="mt-16 text-center">
                    <p className="text-xs uppercase tracking-widest text-[#b0f5e6] mb-2">Security Intelligence</p>
                    <p className="text-3xl font-black text-[#00FFC6]">Weekly Updates × Expert Insights</p>
                </div>
            </header>

            {/* Newsletter Form Section */}
            <section className="relative max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left side - Form */}
                    <div
                        className="rounded-3xl p-10 border backdrop-blur-sm group hover:-translate-y-1 transition-all duration-300"
                        style={{
                            background: "linear-gradient(135deg, rgba(0,255,198,0.1) 0%, rgba(0,0,0,0.9) 100%)",
                            borderColor: "rgba(0,255,198,0.3)",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                        }}
                    >
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(0,255,198,0.2)" }}>
                                <Brain className="w-10 h-10 text-[#00FFC6]" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-[#00FFC6] mb-2">Subscribe Now</h3>
                                <div className="h-1 w-20 rounded-full bg-[#00FFC6]" />
                            </div>
                        </div>

                        <div className="space-y-4 text-base text-[#E0E0E0] leading-relaxed">
                            <p>
                                Join our community of security professionals and stay ahead of emerging threats with expert-curated insights.
                            </p>
                            <p>
                                Get weekly updates on the latest cybersecurity trends, vulnerability research, and best practices delivered directly to your inbox.
                            </p>
                        </div>

                        <div className="space-y-3 mt-6">
                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#00FFC6]/10 transition-colors group">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00FFC6]/20 flex items-center justify-center group-hover:bg-[#00FFC6]/30 transition-colors">
                                    <Shield className="text-[#00FFC6] text-sm" />
                                </div>
                                <span className="text-[#b0f5e6] font-medium">Curated threat analysis</span>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#00FFC6]/10 transition-colors group">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00FFC6]/20 flex items-center justify-center group-hover:bg-[#00FFC6]/30 transition-colors">
                                    <Brain className="text-[#00FFC6] text-sm" />
                                </div>
                                <span className="text-[#b0f5e6] font-medium">Security best practices</span>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#00FFC6]/10 transition-colors group">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00FFC6]/20 flex items-center justify-center group-hover:bg-[#00FFC6]/30 transition-colors">
                                    <Code className="text-[#00FFC6] text-sm" />
                                </div>
                                <span className="text-[#b0f5e6] font-medium">Expert insights & tips</span>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#00FFC6]/10 transition-colors group">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00FFC6]/20 flex items-center justify-center group-hover:bg-[#00FFC6]/30 transition-colors">
                                    <Lock className="text-[#00FFC6] text-sm" />
                                </div>
                                <span className="text-[#b0f5e6] font-medium">Privacy guaranteed</span>
                            </div>
                        </div>

                        {submitError && (
                            <div className="p-4 bg-red-50/10 border border-red-500/30 rounded-lg flex items-start gap-3 mt-6">
                                <ExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-red-500 text-sm">{submitError}</p>
                            </div>
                        )}
                    </div>

                    {/* Right side - Form Fields */}
                    <div
                        className="rounded-3xl p-10 border backdrop-blur-sm"
                        style={{
                            background: "linear-gradient(135deg, rgba(0,255,198,0.08) 0%, rgba(0,0,0,0.95) 100%)",
                            borderColor: "rgba(0,255,198,0.3)",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                        }}
                    >
                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-[#00FFC6] mb-2 flex items-center">
                                    <User className="w-3 h-3 mr-2" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-[#00FFC6] focus:border-transparent outline-none transition-all ${errors.name ? 'border-red-300 bg-red-50/20' : 'border-[#00FFC6]/30 bg-[#0a0a0a] hover:border-[#00FFC6]/50'}`}
                                    placeholder="John Doe"
                                    style={{ color: '#E0E0E0' }}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><ExclamationCircle className="w-3 h-3" />{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-[#00FFC6] mb-2 flex items-center">
                                    <FaAt className="w-3 h-3 mr-2" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-[#00FFC6] focus:border-transparent outline-none transition-all ${errors.email ? 'border-red-300 bg-red-50/20' : 'border-[#00FFC6]/30 bg-[#0a0a0a] hover:border-[#00FFC6]/50'}`}
                                    placeholder="you@example.com"
                                    style={{ color: '#E0E0E0' }}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><ExclamationCircle className="w-3 h-3" />{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="interest" className="block text-sm font-bold text-[#00FFC6] mb-2 flex items-center">
                                    <Tags className="w-3 h-3 mr-2" />
                                    Primary Interest
                                </label>
                                <select
                                    id="interest"
                                    name="interest"
                                    value={formData.interest}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-[#00FFC6] focus:border-transparent outline-none transition-all appearance-none ${errors.interest ? 'border-red-300 bg-red-50/20' : 'border-[#00FFC6]/30 bg-[#0a0a0a] hover:border-[#00FFC6]/50'}`}
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23b0f5e6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                                        paddingRight: '2.5rem',
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundRepeat: 'no-repeat',
                                        color: '#E0E0E0'
                                    }}
                                >
                                    <option value="">Select your interest</option>
                                    {interestOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.interest && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><ExclamationCircle className="w-3 h-3" />{errors.interest}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#00FFC6] text-[#0a0a0a] font-bold py-3 px-6 rounded-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ boxShadow: "0 10px 40px rgba(0,255,198,0.4)" }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0a0a0a] border-t-transparent"></div>
                                        <span>Subscribing...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaPaperPlane className="text-sm" />
                                        <span>Subscribe Now</span>
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-[#b0f5e6] text-center flex items-center justify-center gap-1">
                                <Lock className="text-xs" />
                                We respect your privacy. Unsubscribe anytime.
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            {/* Benefits Cards Section */}
            <section className="relative max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Shield,
                            title: "Weekly Newsletter",
                            description: "Curated cybersecurity news and threat analysis delivered every Friday.",
                            color: "from-[#00FFC6] to-[#00FFC6]/20"
                        },
                        {
                            icon: Brain,
                            title: "Expert Analysis",
                            description: "Deep-dive reports on emerging threats and security best practices.",
                            color: "from-[#00FFC6] to-[#00FFC6]/20"
                        },
                        {
                            icon: Code,
                            title: "AI-Powered Insights",
                            description: "Real-time threat detection and vulnerability notifications.",
                            color: "from-[#00FFC6] to-[#00FFC6]/20"
                        }
                    ].map((benefit, idx) => {
                        const Icon = benefit.icon;
                        return (
                            <div
                                key={idx}
                                className={`group relative rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-2 overflow-hidden`}
                                style={{
                                    background: "linear-gradient(135deg, rgba(0,255,198,0.08) 0%, rgba(0,0,0,0.95) 100%)",
                                    borderColor: "rgba(0,255,198,0.3)",
                                    boxShadow: "0 15px 50px rgba(0,0,0,0.6)",
                                }}
                            >
                                {/* Background Number */}
                                <div className="absolute top-4 right-4 text-8xl font-black text-[#00FFC6] opacity-5">
                                    {idx + 1}
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(0,255,198,0.2)" }}>
                                                <Icon className="w-6 h-6 text-[#00FFC6]" />
                                            </div>
                                            <span className="text-xl font-black text-[#00FFC6]">{idx + 1}</span>
                                        </div>
                                        <ChevronRight className="w-6 h-6 text-[#00FFC6] opacity-50 group-hover:translate-x-2 group-hover:opacity-100 transition-all" />
                                    </div>

                                    <h5 className="text-2xl font-bold text-[#E0E0E0] mb-4 group-hover:text-[#00FFC6] transition-colors">
                                        {benefit.title}
                                    </h5>

                                    <p className="text-sm text-[#b0f5e6] leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </div>

                                {/* Hover Glow Effect */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{
                                        background: "radial-gradient(circle at center, rgba(0,255,198,0.1), transparent 70%)"
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="relative max-w-7xl mx-auto px-6 py-16">
                <div
                    className="rounded-3xl p-12 md:p-16 text-center"
                    style={{
                        background: "linear-gradient(135deg, rgba(0,255,198,0.15) 0%, rgba(0,0,0,0.9) 100%)",
                        borderColor: "rgba(0,255,198,0.4)",
                        boxShadow: "0 20px 60px rgba(0,255,198,0.2)",
                    }}
                >
                    <Zap className="w-12 h-12 text-[#00FFC6] mx-auto mb-4" />
                    <h4 className="text-3xl font-black text-[#00FFC6] mb-4">Ready to Stay Secure?</h4>
                    <p className="text-lg text-[#E0E0E0] leading-relaxed max-w-4xl mx-auto mb-8">
                        Don't miss out on critical security updates and expert insights. Subscribe now and join thousands of professionals who trust us for their cybersecurity intelligence.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => {
                                if (formRef.current) {
                                    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }}
                            className="px-8 py-4 bg-[#00FFC6] text-[#0a0a0a] font-bold rounded-xl hover:scale-105 hover:shadow-2xl transition-all duration-300"
                            style={{ boxShadow: "0 10px 40px rgba(0,255,198,0.4)" }}
                        >
                            <Lock className="w-5 h-5 inline mr-2" />
                            Subscribe Now
                        </button>
                        <div className="flex items-center gap-3 text-[#b0f5e6]">
                            <div className="w-12 h-12 rounded-full bg-[#00FFC6]/20 flex items-center justify-center">
                                <Check className="text-[#00FFC6] text-lg" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-[#00FFC6]">Free to subscribe</p>
                                <p className="text-sm">Cancel anytime</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Spacing */}
            <div className="h-24" />

            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        background-position: 0% 50%;
                    }
                    100% {
                        background-position: 200% 50%;
                    }
                }
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
                @keyframes glow {
                    0%, 100% {
                        opacity: 0.05;
                    }
                    50% {
                        opacity: 0.08;
                    }
                }
                @keyframes rotate {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                @keyframes ping {
                    75%, 100% {
                        transform: scale(1.1);
                        opacity: 0;
                    }
                }
            `}</style>
        </main>
    );
}