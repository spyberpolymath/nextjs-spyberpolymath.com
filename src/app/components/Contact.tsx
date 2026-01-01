'use client';

import React, { useState } from 'react';
import { Mail, Phone, User, MessageSquare, Send, Linkedin, Github, Bug, Box, CheckCircle, AlertCircle, Sparkles, BookA } from 'lucide-react';
import { FaKaggle } from 'react-icons/fa';

interface FormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
    submit?: string;
}

export default function Contact() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const socialLinks = [
        {
            name: 'LinkedIn',
            url: 'https://linkedin.com/in/spyberpolymath',
            icon: Linkedin,
            color: '#0077B5',
            description: 'Professional Network'
        },
        {
            name: 'GitHub',
            url: 'https://github.com/spyberpolymath',
            icon: Github,
            color: '#333',
            description: 'Code Repository'
        },
        {
            name: 'Kaggle',
            url: 'https://kaggle.com/spyberpolymath',
            icon: FaKaggle,
            color: '#20BEFF',
            description: 'Data Science'
        },
        {
            name: 'HackerOne',
            url: 'https://hackerone.com/spyberpolymath1',
            icon: Bug,
            color: '#494649',
            description: 'Bug Bounty'
        },
        {
            name: 'Email',
            url: 'mailto:info@spyberpolymath.com',
            icon: Mail,
            color: '#EA4335',
            description: 'Direct Contact'
        }
    ];

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Please enter your name';
        } else if (formData.name.length > 100) {
            newErrors.name = 'Name must be at most 100 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Please enter your email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Please enter your phone number';
        } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number (digits, spaces, and +()-  only)';
        } else if (formData.phone.trim().replace(/[\s\-\(\)]/g, '').length < 10) {
            newErrors.phone = 'Phone number must have at least 10 digits';
        } else if (formData.phone.length > 20) {
            newErrors.phone = 'Phone number must be at most 20 characters';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Please enter a subject';
        } else if (formData.subject.length > 200) {
            newErrors.subject = 'Subject must be at most 200 characters';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Please enter your message';
        } else if (formData.message.length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        } else if (formData.message.length > 2000) {
            newErrors.message = 'Message must be at most 2000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok && data?.success) {
                setSubmitStatus('success');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                });
            } else {
                setSubmitStatus('error');
                if (data?.error?.issues) {
                    // Handle Zod validation errors
                    const newErrors: FormErrors = {};
                    data.error.issues.forEach((issue: any) => {
                        if (issue.path?.[0]) {
                            newErrors[issue.path[0] as keyof FormErrors] = issue.message;
                        }
                    });
                    setErrors(newErrors);
                } else if (data?.error) {
                    setErrors({ submit: data.error });
                }
            }
        } catch (error: any) {
            console.error('Form submission error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 md:pt-24 lg:pt-28" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
            <style jsx>{`
                /* Respect reduced motion */
                @media (prefers-reduced-motion: reduce) {
                    .animate-pulse, .animate-spin, [style*="animation:"] {
                        animation: none !important;
                    }
                    .transition-all, .transition-transform, .transition-opacity {
                        transition: none !important;
                    }
                }

                /* Focus-visible for keyboard users */
                :global(input:focus-visible), :global(textarea:focus-visible), :global(button:focus-visible), :global(a:focus-visible) {
                    outline: 3px solid rgba(0,255,198,0.18);
                    outline-offset: 3px;
                }

                /* Hover fallbacks for touch devices */
                @media (hover: none) and (pointer: coarse) {
                    .group:hover .group-hover\\:scale-110,
                    .group:hover .group-hover\\:opacity-100,
                    .group:hover .hover\\:-translate-y-3 {
                        transform: none !important;
                        opacity: 1 !important;
                    }
                }
            `}</style>
            {/* Hero Section with Floating Elements */}
            <div className="relative overflow-hidden" style={{ backgroundColor: '#181A1B' }}>
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute w-full h-full" style={{
                        backgroundImage: 'radial-gradient(circle at 30% 20%, #00FFC6 0%, transparent 60%), radial-gradient(circle at 70% 80%, #00FFC6 0%, transparent 60%)',
                        filter: 'blur(80px)'
                    }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-6 border"
                            style={{ backgroundColor: '#121212', borderColor: '#00FFC6', boxShadow: '0 0 20px rgba(0, 255, 198, 0.3)' }}>
                            <Sparkles className="w-4 h-4 animate-pulse" style={{ color: '#00FFC6' }} />
                            <span className="text-sm font-bold tracking-wide" style={{ color: '#00FFC6' }}>LET'S COLLABORATE</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
                            <span className="bg-gradient-to-r bg-clip-text text-transparent"
                                style={{ backgroundImage: 'linear-gradient(135deg, #00FFC6 0%, #E0E0E0 100%)' }}>
                                Get in Touch
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-4" style={{ color: '#b0f5e6' }}>
                            Ready to collaborate on cybersecurity research, discuss AI innovations, or explore ethical technology solutions?
                        </p>
                        <p className="text-2xl font-bold" style={{ color: '#00FFC6' }}>
                            Let's build something amazing together.
                        </p>
                    </div>
                </div>
            </div>

            {/* Social Links Grid */}
            <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 mb-20">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {socialLinks.slice(0, 5).map((social, index) => {
                        const Icon = social.icon;
                        return (
                            <a
                                key={index}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative backdrop-blur-xl border rounded-2xl p-6 hover:-translate-y-3 transition-all duration-300 overflow-hidden"
                                aria-label={`${social.name} - ${social.description}`}
                                title={social.name}
                                style={{
                                    backgroundColor: 'rgba(24, 26, 27, 0.9)',
                                    borderColor: '#232323',
                                    boxShadow: '0 4px 16px rgba(0, 255, 198, 0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#00FFC6';
                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(0, 255, 198, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#232323';
                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0, 255, 198, 0.1)';
                                }}
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ background: 'radial-gradient(circle at center, rgba(0, 255, 198, 0.1), transparent)' }}></div>

                                <div className="relative z-10 text-center">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                                        style={{ backgroundColor: '#121212' }}>
                                        {React.createElement(Icon as any, { className: 'w-6 h-6', style: { color: '#00FFC6' }, 'aria-hidden': true })}
                                    </div>
                                    <div className="text-sm font-bold mb-1" style={{ color: '#E0E0E0' }}>
                                        {social.name}
                                    </div>
                                    <div className="text-xs" style={{ color: '#b0f5e6' }}>
                                        {social.description}
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </section>

            {/* Two Column Layout: Form + Info */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Information Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Contact Info Card */}
                        <div className="backdrop-blur-sm border rounded-2xl p-6"
                            style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: '#00FFC6' }}>
                                <Mail className="w-6 h-6" />
                                Contact Info
                            </h3>
                            <div className="space-y-5">
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-opacity-50 transition-all"
                                    style={{ backgroundColor: '#121212' }}>
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: '#00FFC6' }}>
                                        <Mail className="w-5 h-5" style={{ color: '#121212' }} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#b0f5e6' }}>
                                            Email
                                        </div>
                                        <div className="text-sm font-bold" style={{ color: '#E0E0E0' }}>
                                            info@spyberpolymath.com
                                        </div>
                                        <div className="text-xs mt-1" style={{ color: '#b0f5e6' }}>
                                            Direct professional inquiries
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-opacity-50 transition-all"
                                    style={{ backgroundColor: '#121212' }}>
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: '#00FFC6' }}>
                                        <Bug className="w-5 h-5" style={{ color: '#121212' }} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#b0f5e6' }}>
                                            Security
                                        </div>
                                        <div className="text-sm font-bold" style={{ color: '#E0E0E0' }}>
                                            Responsible Disclosure
                                        </div>
                                        <div className="text-xs mt-1" style={{ color: '#b0f5e6' }}>
                                            Report via HackerOne
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-opacity-50 transition-all"
                                    style={{ backgroundColor: '#121212' }}>
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: '#00FFC6' }}>
                                        <Box className="w-5 h-5" style={{ color: '#121212' }} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#b0f5e6' }}>
                                            Timezone
                                        </div>
                                        <div className="text-sm font-bold" style={{ color: '#E0E0E0' }}>
                                            UTC+5:30 (IST)
                                        </div>
                                        <div className="text-xs mt-1" style={{ color: '#b0f5e6' }}>
                                            Available for global collaboration
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-opacity-50 transition-all"
                                    style={{ backgroundColor: '#121212' }}>
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: '#00FFC6' }}>
                                        <BookA className="w-5 h-5" style={{ color: '#121212' }} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#b0f5e6' }}>
                                            Languages
                                        </div>
                                        <div className="text-sm font-bold" style={{ color: '#E0E0E0' }}>
                                            English, Hindi, Malayalam, Tamil, Kannada
                                        </div>
                                        <div className="text-xs mt-1" style={{ color: '#b0f5e6' }}>
                                            Fluent in multiple languages
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="backdrop-blur-sm border rounded-2xl p-6"
                            style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                            <h3 className="text-lg font-bold mb-4" style={{ color: '#00FFC6' }}>
                                Response Time
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm" style={{ color: '#b0f5e6' }}>General Inquiries</span>
                                    <span className="text-sm font-bold" style={{ color: '#E0E0E0' }}>24-48h</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm" style={{ color: '#b0f5e6' }}>Security Reports</span>
                                    <span className="text-sm font-bold" style={{ color: '#E0E0E0' }}>12-24h</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm" style={{ color: '#b0f5e6' }}>Collaboration</span>
                                    <span className="text-sm font-bold" style={{ color: '#E0E0E0' }}>48-72h</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="backdrop-blur-sm border rounded-2xl p-8 lg:p-10"
                            style={{
                                backgroundColor: '#181A1B',
                                borderColor: '#232323',
                                boxShadow: '0 0 40px rgba(0, 255, 198, 0.1)'
                            }}>
                            <div className="mb-8">
                                <h2 className="text-3xl font-black mb-3" style={{ color: '#00FFC6' }}>
                                    Send a Message
                                </h2>
                                <p className="text-sm" style={{ color: '#b0f5e6' }}>
                                    Fill out the form below and I'll get back to you as soon as possible.
                                </p>
                            </div>

                            <div aria-live="polite">
                                {submitStatus === 'success' && (
                                    <div className="mb-6 p-5 rounded-xl border flex items-start gap-3"
                                        style={{
                                            backgroundColor: 'rgba(0, 255, 198, 0.1)',
                                            borderColor: '#00FFC6'
                                        }}>
                                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#00FFC6' }} />
                                        <div>
                                            <div className="font-bold mb-1" style={{ color: '#00FFC6' }}>
                                                Message Sent Successfully!
                                            </div>
                                            <div className="text-sm" style={{ color: '#b0f5e6' }}>
                                                Thank you for reaching out. I'll get back to you soon.
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {submitStatus === 'error' && (
                                    <div className="mb-6 p-5 rounded-xl border flex items-start gap-3"
                                        style={{
                                            backgroundColor: 'rgba(255, 68, 68, 0.1)',
                                            borderColor: '#ff4444'
                                        }}>
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ff4444' }} />
                                        <div>
                                            <div className="font-bold mb-1" style={{ color: '#ff4444' }}>
                                                Failed to Send Message
                                            </div>
                                            <div className="text-sm" style={{ color: '#b0f5e6' }}>
                                                Please try again or contact me directly via email.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name Field */}
                                    <div>
                                        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider mb-2"
                                            style={{ color: '#b0f5e6' }}>
                                            Full Name *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                                                style={{ color: errors.name ? '#ff4444' : '#00FFC6', opacity: 0.5 }} />
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="John Doe"
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border bg-transparent transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00FFC6]"
                                                style={{
                                                    backgroundColor: '#121212',
                                                    borderColor: errors.name ? '#ff4444' : '#232323',
                                                    color: '#E0E0E0'
                                                }}
                                                aria-invalid={errors.name ? 'true' : 'false'}
                                                aria-describedby={errors.name ? 'error-name' : undefined}
                                                autoComplete="name"
                                            />
                                        </div>
                                        {errors.name && (
                                            <div id="error-name" className="mt-2 text-xs font-semibold flex items-center gap-1" style={{ color: '#ff4444' }}>
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider mb-2"
                                            style={{ color: '#b0f5e6' }}>
                                            Email Address *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                                                style={{ color: errors.email ? '#ff4444' : '#00FFC6', opacity: 0.5 }} />
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="john@example.com"
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border bg-transparent transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00FFC6]"
                                                style={{
                                                    backgroundColor: '#121212',
                                                    borderColor: errors.email ? '#ff4444' : '#232323',
                                                    color: '#E0E0E0'
                                                }}
                                                aria-invalid={errors.email ? 'true' : 'false'}
                                                aria-describedby={errors.email ? 'error-email' : undefined}
                                                autoComplete="email"
                                                inputMode="email"
                                            />
                                        </div>
                                        {errors.email && (
                                            <div id="error-email" className="mt-2 text-xs font-semibold flex items-center gap-1" style={{ color: '#ff4444' }}>
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.email}
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone Field */}
                                    <div>
                                        <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider mb-2"
                                            style={{ color: '#b0f5e6' }}>
                                            Phone Number *
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                                                style={{ color: errors.phone ? '#ff4444' : '#00FFC6', opacity: 0.5 }} />
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border bg-transparent transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00FFC6]"
                                                style={{
                                                    backgroundColor: '#121212',
                                                    borderColor: errors.phone ? '#ff4444' : '#232323',
                                                    color: '#E0E0E0'
                                                }}
                                                aria-invalid={errors.phone ? 'true' : 'false'}
                                                aria-describedby={errors.phone ? 'error-phone' : undefined}
                                                autoComplete="tel"
                                                inputMode="tel"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <div id="error-phone" className="mt-2 text-xs font-semibold flex items-center gap-1" style={{ color: '#ff4444' }}>
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.phone}
                                            </div>
                                        )}
                                    </div>

                                    {/* Subject Field */}
                                    <div>
                                        <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider mb-2"
                                            style={{ color: '#b0f5e6' }}>
                                            Subject *
                                        </label>
                                        <div className="relative">
                                            <BookA className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                                                style={{ color: errors.phone ? '#ff4444' : '#00FFC6', opacity: 0.5 }} />
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                placeholder="What's this about?"
                                                className="w-full px-4 py-4 pl-12 rounded-xl border bg-transparent transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00FFC6]"
                                                style={{
                                                    backgroundColor: '#121212',
                                                    borderColor: errors.subject ? '#ff4444' : '#232323',
                                                    color: '#E0E0E0'
                                                }}
                                                aria-invalid={errors.subject ? 'true' : 'false'}
                                                aria-describedby={errors.subject ? 'error-subject' : undefined}
                                                autoComplete="off"
                                            />
                                            {errors.subject && (
                                                <div id="error-subject" className="mt-2 text-xs font-semibold flex items-center gap-1" style={{ color: '#ff4444' }}>
                                                    <AlertCircle className="w-3 h-3" />
                                                    {errors.subject}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Message Field */}
                                <div>
                                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider mb-2"
                                        style={{ color: '#b0f5e6' }}>
                                        Your Message *
                                    </label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-4 w-5 h-5"
                                            style={{ color: errors.message ? '#ff4444' : '#00FFC6', opacity: 0.5 }} />
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            placeholder="Tell me about your project, idea, or inquiry..."
                                            rows={6}
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border bg-transparent transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00FFC6] resize-none"
                                            style={{
                                                backgroundColor: '#121212',
                                                borderColor: errors.message ? '#ff4444' : '#232323',
                                                color: '#E0E0E0'
                                            }}
                                            aria-invalid={errors.message ? 'true' : 'false'}
                                            aria-describedby={errors.message ? 'error-message' : undefined}
                                        />
                                    </div>
                                    {errors.message && (
                                        <div id="error-message" className="mt-2 text-xs font-semibold flex items-center gap-1" style={{ color: '#ff4444' }}>
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.message}
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="group relative w-full py-5 border rounded-xl font-bold text-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                                        style={{
                                            backgroundColor: isSubmitting ? '#232323' : '#00FFC6',
                                            color: isSubmitting ? '#b0f5e6' : '#121212',
                                            borderColor: '#00FFC6',
                                            boxShadow: '0 10px 30px rgba(0, 255, 198, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSubmitting) {
                                                (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px rgba(0, 255, 198, 0.5)';
                                                (e.currentTarget as HTMLElement).style.backgroundColor = '#121212';
                                                (e.currentTarget as HTMLElement).style.color = '#00FFC6';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSubmitting) {
                                                (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px rgba(0, 255, 198, 0.3)';
                                                (e.currentTarget as HTMLElement).style.backgroundColor = '#00FFC6';
                                                (e.currentTarget as HTMLElement).style.color = '#121212';
                                            }
                                        }}
                                        aria-busy={isSubmitting}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>

                                        <div className="flex items-center justify-center gap-3 relative z-10">
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                                                        style={{ borderColor: '#00FFC6' }}></div>
                                                    <span>SENDING MESSAGE...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    <span>SEND MESSAGE</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                <p className="text-xs text-center" style={{ color: '#b0f5e6' }}>
                                    By submitting this form, you agree to our terms and privacy policy.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Contact Section */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black mb-4" style={{ color: '#00FFC6' }}>
                        Why Reach Out?
                    </h2>
                    <p className="text-lg" style={{ color: '#b0f5e6' }}>
                        Here's what we can collaborate on
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            icon: Bug,
                            title: "Security Research",
                            description: "Collaborate on vulnerability research, penetration testing, or responsible disclosure initiatives.",
                            gradient: "from-red-500/20 to-orange-500/20"
                        },
                        {
                            icon: Github,
                            title: "Open Source Projects",
                            description: "Contribute to or discuss ethical AI, privacy-focused tools, and open source development.",
                            gradient: "from-purple-500/20 to-pink-500/20"
                        },
                        {
                            icon: Sparkles,
                            title: "AI & Machine Learning",
                            description: "Explore cutting-edge AI research, model development, and ethical AI implementation strategies.",
                            gradient: "from-blue-500/20 to-cyan-500/20"
                        },
                        {
                            icon: Mail,
                            title: "Consulting & Advisory",
                            description: "Get expert guidance on cybersecurity strategy, AI integration, or technology architecture.",
                            gradient: "from-green-500/20 to-emerald-500/20"
                        }
                    ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={index}
                                className="group relative backdrop-blur-sm border rounded-2xl p-8 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                                style={{
                                    backgroundColor: '#181A1B',
                                    borderColor: '#232323'
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#00FFC6';
                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(0, 255, 198, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.borderColor = '#232323';
                                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                                        style={{ backgroundColor: '#121212' }}>
                                        <Icon className="w-8 h-8" style={{ color: '#00FFC6' }} />
                                    </div>

                                    <h3 className="text-xl font-bold mb-3 group-hover:text-[#00FFC6] transition-colors"
                                        style={{ color: '#E0E0E0' }}>
                                        {item.title}
                                    </h3>

                                    <p className="text-sm leading-relaxed" style={{ color: '#b0f5e6' }}>
                                        {item.description}
                                    </p>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00FFC6] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="max-w-5xl mx-auto px-6 pb-20">
                <div className="backdrop-blur-sm border rounded-2xl p-8 lg:p-12"
                    style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                    <h2 className="text-3xl font-black mb-8 text-center" style={{ color: '#00FFC6' }}>
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        {[
                            {
                                q: "What's the best way to contact you?",
                                a: "For professional inquiries, use the contact form above or email me directly at info@spyberpolymath.com. For security vulnerabilities, please use HackerOne."
                            },
                            {
                                q: "Do you offer consulting services?",
                                a: "Yes! I provide consulting for cybersecurity strategy, AI/ML implementation, and ethical technology development. Reach out to discuss your specific needs."
                            },
                            {
                                q: "How long does it take to get a response?",
                                a: "I typically respond within 24-48 hours for general inquiries, and 12-24 hours for security-related matters."
                            },
                            {
                                q: "Are you available for collaboration?",
                                a: "Absolutely! I'm always interested in collaborating on innovative projects, especially in cybersecurity, AI ethics, and open source development."
                            }
                        ].map((faq, index) => (
                            <div key={index} className="border-l-4 pl-6 py-4" style={{ borderColor: '#00FFC6' }}>
                                <h4 className="text-lg font-bold mb-2" style={{ color: '#E0E0E0' }}>
                                    {faq.q}
                                </h4>
                                <p className="text-sm leading-relaxed" style={{ color: '#b0f5e6' }}>
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                <div className="relative overflow-hidden border rounded-3xl p-12 text-center"
                    style={{
                        backgroundColor: '#181A1B',
                        borderColor: '#00FFC6',
                        boxShadow: '0 0 60px rgba(0, 255, 198, 0.2)'
                    }}>
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute w-full h-full" style={{
                            backgroundImage: 'radial-gradient(circle at 50% 50%, #00FFC6 0%, transparent 70%)',
                            filter: 'blur(60px)'
                        }}></div>
                    </div>

                    <div className="relative z-10">
                        <Sparkles className="w-16 h-16 mx-auto mb-6 animate-pulse" style={{ color: '#00FFC6' }} />

                        <h3 className="text-4xl font-black mb-4" style={{ color: '#E0E0E0' }}>
                            Let's Build Something Amazing
                        </h3>

                        <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#b0f5e6' }}>
                            Whether it's a groundbreaking security project, an AI innovation, or ethical tech initiative — let's make it happen together.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="https://linkedin.com/in/spyberpolymath"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group px-8 py-4 border rounded-xl font-bold text-lg transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-3"
                                style={{
                                    backgroundColor: '#121212',
                                    color: '#00FFC6',
                                    borderColor: '#00FFC6'
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = '#00FFC6';
                                    (e.currentTarget as HTMLElement).style.color = '#121212';
                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px rgba(0, 255, 198, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = '#121212';
                                    (e.currentTarget as HTMLElement).style.color = '#00FFC6';
                                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                }}
                            >
                                <Linkedin className="w-5 h-5" />
                                <span>Connect on LinkedIn</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}