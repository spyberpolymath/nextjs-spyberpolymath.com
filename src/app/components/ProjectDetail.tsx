'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  RefreshCw,
  Github,
  Code,
  CheckCircle,
  Mail,
  Phone,
  User,
  Tag,
  Link as LinkIcon,
  MapPin,
  Building,
  CreditCard,
  Receipt,
  Download
} from 'lucide-react';
import { FaKaggle, FaLinkedin } from 'react-icons/fa';

// Types
interface Project {
  id?: string | number;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  richDescription?: string;
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
  price?: number;
  currency?: string;
  isPaid?: boolean;
  isFreeForUser?: boolean; // Flag indicating paid project is free for user with allAccess
  zipUrl?: string; // URL for zip file download
  downloadLimit?: number; // Free download limit
  downloadCount?: number; // Current download count
  isPaidAfterLimit?: boolean; // Whether project became paid after reaching download limit
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  addressLine2: string;
  city: string;
  countryRegion: string;
  stateProvince: string;
  postalCode: string;
  vatGstId: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

interface ProjectDetailProps {
  project: Project;
  relatedProjects?: Project[];
}

export default function ProjectDetail({ project, relatedProjects = [] }: ProjectDetailProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    addressLine2: '',
    city: '',
    countryRegion: '',
    stateProvince: '',
    postalCode: '',
    vatGstId: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loadedProject, setLoadedProject] = useState<Project | null>(project ?? null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [generatedPaymentId, setGeneratedPaymentId] = useState<string | null>(null);
  const [generatedInvoiceId, setGeneratedInvoiceId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [hasAllAccess, setHasAllAccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = (email: string): boolean => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = 'Please enter your name';
    if (!formData.email.trim()) {
      errors.email = 'Please enter your email address';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) errors.phone = 'Please enter your phone number';
    if (!formData.address.trim()) errors.address = 'Please enter your address';
    if (!formData.city.trim()) errors.city = 'Please enter your city';
    if (!formData.countryRegion.trim()) errors.countryRegion = 'Please enter your country/region';
    if (!formData.stateProvince.trim()) errors.stateProvince = 'Please enter your state/province';
    if (!formData.postalCode.trim()) errors.postalCode = 'Please enter your postal/zip code';
    if (!formData.message.trim()) errors.message = 'Please enter your message';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);
    try {
      const payload = {
        ...formData,
        project_title: displayProject.title,
        project_slug: displayProject.slug
      };
      const res = await fetch('/api/project-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit contact');
      }
      setFormSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        addressLine2: '',
        city: '',
        countryRegion: '',
        stateProvince: '',
        postalCode: '',
        vatGstId: '',
        message: ''
      });
      setFormErrors({});
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setFormErrors({ submit: 'There was an error submitting your message. Please check your connection and try again.' });
      setApiError(error.message || 'Error submitting form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = project.title;
    let shareUrl = '';

    switch (platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this project: ${url}`)}`;
        break;
      default:
        return;
    }

    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // keyboard support for share buttons
  const handleShareKeyDown = (e: React.KeyboardEvent, platform: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleShare(platform);
    }
  };

  const handleDownloadZip = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `/api/projects/download-zip?slug=${displayProject.slug}`;
      const response = await fetch(url, { headers });

      if (response.status === 403) {
        alert('You do not have access to download this file. Please purchase or subscribe to access.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
        throw new Error(errorData.error || 'Failed to download ZIP file');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${displayProject.title.replace(/\s+/g, '-').toLowerCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Download error:', error);
      alert(error.message || 'Failed to download ZIP file');
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      if (!generatedPaymentId || !generatedInvoiceId) {
        alert('Invoice information not available');
        return;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/invoice/generate', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          paymentId: generatedPaymentId,
          paymentType: 'project'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
        throw new Error(errorData.error || 'Failed to download invoice');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `invoice-${generatedInvoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      alert('✅ Invoice downloaded successfully!');
    } catch (error: any) {
      console.error('Invoice download error:', error);
      alert(error.message || 'Failed to download invoice');
    }
  };

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setFormErrors(prev => ({ ...prev, submit: 'Please fill all required fields' }));
      return;
    }

    setIsProcessingPayment(true);
    setApiError(null);

    try {
      // Generate payment and invoice IDs
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const invoiceId = `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Prepare payment payload with form data
      const paymentPayload = {
        project_title: displayProject.title,
        project_slug: displayProject.slug,
        amount: displayProject.price || 0,
        currency: displayProject.currency || 'INR',
        // Form data
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        addressLine2: formData.addressLine2,
        city: formData.city,
        countryRegion: formData.countryRegion,
        stateProvince: formData.stateProvince,
        postalCode: formData.postalCode,
        vatGstId: formData.vatGstId,
        message: formData.message
      };

      // Call API to store payment details
      const res = await fetch('/api/project-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to complete payment');
      }

      const result = await res.json();
      setGeneratedPaymentId(result.paymentId || paymentId);
      setGeneratedInvoiceId(result.invoiceId || invoiceId);
      setPaymentCompleted(true);
      setShowPaymentForm(false);

    } catch (error: any) {
      console.error('Error completing payment:', error);
      setFormErrors({ submit: error.message || 'Failed to process payment. Please try again.' });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getCategoryName = (category: string) => {
    return category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent };
  };

  useEffect(() => {
    if (!project && typeof window !== 'undefined') {
      const slug = window.location.pathname.split('/').pop();
      if (slug) {
        setLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        fetch(`/api/projects?slug=${slug}`, { headers })
          .then(res => res.json())
          .then(data => {
            console.log('ProjectDetail API Response:', data); // Debug log
            if (data.results && data.results.length > 0) {
              setLoadedProject(data.results[0]);
            } else {
              setApiError('Project not found');
            }
            setHasAllAccess(data.hasAllAccess === true);
            setLoading(false);
          })
          .catch(err => {
            console.error('ProjectDetail fetch error:', err); // Debug log
            setApiError('Failed to load project');
            setLoading(false);
          });
      }
    } else if (project) {
      // If project is passed as prop, ensure we update hasAllAccess and isFreeForUser from API
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token && project.slug) {
        const headers: any = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
        fetch(`/api/projects?slug=${project.slug}`, { headers })
          .then(res => res.json())
          .then(data => {
            console.log('ProjectDetail prop-based API Response:', data); // Debug log
            if (data.results && data.results.length > 0) {
              setLoadedProject(data.results[0]);
            }
            setHasAllAccess(data.hasAllAccess === true);
          })
          .catch(err => console.error('ProjectDetail prop-based fetch error:', err));
      }
    }
  }, [project]);

  const displayProject = loadedProject ?? project;
  const hasRichDescription = displayProject?.richDescription &&
    displayProject.richDescription.trim() !== '' &&
    displayProject.richDescription !== '<p></p>';

  // Debug logging
  React.useEffect(() => {
    if (displayProject) {
      console.log('ProjectDetail displayProject:', {
        title: displayProject.title,
        isPaid: displayProject.isPaid,
        price: displayProject.price,
        isFreeForUser: displayProject.isFreeForUser,
        hasAllAccess,
        paymentCompleted,
        shouldShowFreeAccess: (displayProject.isFreeForUser === true || hasAllAccess === true || paymentCompleted === true)
      });
    }
  }, [displayProject, hasAllAccess, paymentCompleted]);

  return (
    <div className="min-h-screen pt-20 md:pt-24 lg:pt-28" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
      {/* Hero Section with Background Image */}
      <div className="relative h-96 overflow-hidden">
        {displayProject.image ? (
          <>
            <img
              src={displayProject.image.startsWith('data:image/') || displayProject.image.startsWith('https://')
                ? displayProject.image
                : `data:image/jpeg;base64,${displayProject.image}`}
              alt={displayProject.title}
              className="w-full h-full object-cover"
              decoding="async"
              style={{ filter: 'brightness(0.3)' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, #121212)' }}></div>
          </>
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #232323, #121212)' }}></div>
        )}

        {/* Back Button Overlay */}
        <div className="absolute top-6 left-6">
          <a
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border hover:border-[#00FFC6] transition-all"
            style={{ backgroundColor: 'rgba(18, 18, 18, 0.8)', borderColor: '#232323', color: '#b0f5e6' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </a>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 pb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wide"
              style={{ backgroundColor: '#00FFC6', color: '#121212' }}>
              {getCategoryName(displayProject.category)}
            </span>
            {!displayProject.published && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border"
                style={{ backgroundColor: 'rgba(35, 35, 35, 0.6)', borderColor: '#00FFC6', color: '#b0f5e6' }}>
                Coming Soon
              </span>
            )}
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r bg-clip-text text-transparent leading-tight"
            style={{ backgroundImage: 'linear-gradient(to right, #00FFC6, #E0E0E0)' }}>
            {displayProject.title}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-12 p-4 rounded-2xl border backdrop-blur-md"
          style={{ backgroundColor: 'rgba(24, 26, 27, 0.8)', borderColor: '#232323' }}>
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: '#b0f5e6' }}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: '#00FFC6' }} />
              <span>{new Date(displayProject.created_at ?? '').toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              })}</span>
            </div>
            {displayProject.updated_at !== displayProject.created_at && (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" style={{ color: '#00FFC6' }} />
                <span>{new Date(displayProject.updated_at ?? '').toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {displayProject.github && (
              <a href={displayProject.github} target="_blank" rel="noopener noreferrer"
                className="p-2.5 rounded-lg border hover:border-[#00FFC6] hover:scale-110 transition-all"
                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                aria-label="Open GitHub repository">
                <Github className="w-5 h-5" />
              </a>
            )}
            {displayProject.kaggle && (
              <a href={displayProject.kaggle} target="_blank" rel="noopener noreferrer"
                className="p-2.5 rounded-lg border hover:border-[#00FFC6] hover:scale-110 transition-all"
                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                aria-label="Open Kaggle page">
                <FaKaggle className="w-5 h-5" />
              </a>
            )}
            {displayProject.linkedin && (
              <a href={displayProject.linkedin} target="_blank" rel="noopener noreferrer"
                className="p-2.5 rounded-lg border hover:border-[#00FFC6] hover:scale-110 transition-all"
                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                aria-label="Open LinkedIn page">
                <FaLinkedin className="w-5 h-5" />
              </a>
            )}
            {displayProject.demo && (
              <a href={displayProject.demo} target="_blank" rel="noopener noreferrer"
                className="p-2.5 rounded-lg border hover:border-[#00FFC6] hover:scale-110 transition-all"
                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                aria-label="Open live demo">
                <LinkIcon className="w-5 h-5" />
              </a>
            )}
            {displayProject.demo2 && (
              <a href={displayProject.demo2} target="_blank" rel="noopener noreferrer"
                className="p-2.5 rounded-lg border hover:border-[#00FFC6] hover:scale-110 transition-all"
                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                aria-label="Open second demo">
                <LinkIcon className="w-5 h-5" />
              </a>
            )}
            {/* Download ZIP Button */}
            <button
              onClick={handleDownloadZip}
              title="Download project files"
              aria-label="Download project files"
              className="p-2.5 rounded-lg border hover:border-[#00FFC6] hover:scale-110 transition-all"
              style={{
                backgroundColor: '#121212',
                borderColor: '#232323',
                color: '#E0E0E0'
              }}>
              <Download className="w-5 h-5" />
            </button>
            <div className="w-px h-6" style={{ backgroundColor: '#232323' }}></div>
            <button onClick={() => handleShare('linkedin')}
              onKeyDown={(e) => handleShareKeyDown(e, 'linkedin')}
              aria-label="Share on LinkedIn"
              className="p-2.5 rounded-lg border hover:border-[#00FFC6] hover:scale-110 transition-all"
              style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}>
              <span className="text-sm font-bold">in</span>
            </button>
            <button onClick={() => handleShare('email')}
              onKeyDown={(e) => handleShareKeyDown(e, 'email')}
              aria-label="Share via Email"
              className="p-2.5 rounded-lg border hover:border-[#00FFC6] hover:scale-110 transition-all"
              style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}>
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pb-20">
          {/* Left Sidebar - Contact */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact CTA */}
            <div className="sticky top-6 rounded-2xl border overflow-hidden"
              style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
              <div className="h-2" style={{ background: 'linear-gradient(to right, #00FFC6, #232323)' }}></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                    <Mail className="w-6 h-6" style={{ color: '#00FFC6' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: '#00FFC6' }}>Support Me</h3>
                    <p className="text-xs" style={{ color: '#b0f5e6' }}>Help support this project</p>
                  </div>
                </div>

                <>
                  {/* Show Download Limit Info for Projects that Hit Limit */}
                  {displayProject.isPaidAfterLimit && (
                    <div className="text-center py-6 mb-6 p-4 rounded-lg border" style={{ backgroundColor: 'rgba(0, 255, 198, 0.05)', borderColor: '#00FFC6' }}>
                      <p className="text-sm mb-2" style={{ color: '#b0f5e6' }}>
                        <span className="font-bold" style={{ color: '#00FFC6' }}>Download Limit Reached</span>
                      </p>
                      <p className="text-xs" style={{ color: '#b0f5e6' }}>
                        This free project has reached {displayProject.downloadCount}/{displayProject.downloadLimit || 5} downloads limit. Upgrade to continue downloading!
                      </p>
                    </div>
                  )}

                  {(displayProject.isFreeForUser === true || hasAllAccess === true || paymentCompleted === true) ? (
                    // User has allAccess subscription or payment is completed, show free access message
                    <div className="text-center py-12">
                      <div className="inline-flex p-4 rounded-full mb-4" style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)' }}>
                        <CheckCircle className="w-12 h-12" style={{ color: '#4ade80' }} />
                      </div>
                      <h4 className="text-lg font-bold mb-2" style={{ color: '#4ade80' }}>Free Access Unlocked</h4>
                      <p className="text-sm mb-4" style={{ color: '#b0f5e6' }}>
                        {displayProject.isFreeForUser || hasAllAccess
                          ? 'You have All-Access subscription. This paid project is now free for you!'
                          : 'Payment completed! You now have access to this project.'}
                      </p>

                      {/* Download Button for All-Access Users */}
                      {!paymentCompleted && (
                        <button
                          onClick={handleDownloadZip}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all hover:scale-105 border border-[#4ade80] mb-4"
                          style={{ backgroundColor: 'transparent', color: '#4ade80' }}>
                          <Download className="w-5 h-5" />
                          <span>Download Project Files</span>
                        </button>
                      )}

                      {paymentCompleted && (
                        <div className="space-y-3 text-left bg-[#121212] p-4 rounded-xl border mb-4" style={{ borderColor: '#232323' }}>
                          <div className="flex justify-between items-center">
                            <span style={{ color: '#b0f5e6' }}>Payment ID:</span>
                            <span className="font-mono text-sm" style={{ color: '#00FFC6' }}>{generatedPaymentId}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span style={{ color: '#b0f5e6' }}>Invoice ID:</span>
                            <span className="font-mono text-sm" style={{ color: '#00FFC6' }}>{generatedInvoiceId}</span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: '#232323' }}>
                            <span style={{ color: '#b0f5e6' }}>Amount Paid:</span>
                            <span className="font-bold" style={{ color: '#00FFC6' }}>₹{displayProject.price}</span>
                          </div>
                        </div>
                      )}

                      {/* Download Buttons for Completed Payment */}
                      {paymentCompleted && (
                        <div className="space-y-2 mb-3">
                          <button
                            onClick={handleDownloadInvoice}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all hover:scale-105 border border-[#00FFC6]"
                            style={{ backgroundColor: 'transparent', color: '#00FFC6' }}>
                            <Download className="w-5 h-5" />
                            <span>Download Invoice (PDF)</span>
                          </button>
                          <button
                            onClick={handleDownloadZip}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-bold transition-all hover:scale-105 border border-[#4ade80]"
                            style={{ backgroundColor: 'transparent', color: '#4ade80' }}>
                            <Download className="w-5 h-5" />
                            <span>Download Project Files</span>
                          </button>
                        </div>
                      )}

                      {paymentCompleted && (
                        <button type="button"
                          onClick={() => {
                            setPaymentCompleted(false);
                            setGeneratedPaymentId(null);
                            setGeneratedInvoiceId(null);
                            setFormData({
                              name: '',
                              email: '',
                              phone: '',
                              address: '',
                              addressLine2: '',
                              city: '',
                              countryRegion: '',
                              stateProvince: '',
                              postalCode: '',
                              vatGstId: '',
                              message: ''
                            });
                          }}
                          className="w-full py-2 rounded-lg font-bold border border-[#00FFC6] transition-all hover:scale-105"
                          style={{ backgroundColor: 'transparent', color: '#00FFC6' }}>
                          New Payment
                        </button>
                      )}
                    </div>
                  ) : showPaymentForm ? (
                    <form onSubmit={handleCompletePayment} className="space-y-4">
                      <div aria-live="polite" aria-atomic="true">
                        {isProcessingPayment && <p className="text-sm" style={{ color: '#b0f5e6' }}>Processing payment...</p>}
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-bold tracking-wide" style={{ color: '#00FFC6' }}>PAYMENT CONFIRMATION</h4>

                        <div className="p-4 rounded-xl border" style={{ backgroundColor: '#121212', borderColor: '#232323' }}>
                          <div className="flex justify-between mb-2">
                            <span style={{ color: '#b0f5e6' }}>Project:</span>
                            <span style={{ color: '#00FFC6' }}>{displayProject.title}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2" style={{ borderColor: '#232323' }}>
                            <span style={{ color: '#b0f5e6' }}>Amount:</span>
                            <span className="font-bold" style={{ color: '#00FFC6' }}>₹{displayProject.price} {displayProject.currency || 'INR'}</span>
                          </div>
                        </div>

                        <p className="text-xs" style={{ color: '#b0f5e6' }}>Please confirm your contact details below to complete the payment:</p>
                      </div>

                      {/* Personal Information Section - Payment */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold tracking-wide" style={{ color: '#00FFC6' }}>PERSONAL INFORMATION</h4>

                        <div>
                          <label htmlFor="payment-name" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>NAME *</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#00FFC6' }} />
                            <input id="payment-name" type="text" name="name" value={formData.name} onChange={handleInputChange} required
                              placeholder="Your full name"
                              className="w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.name ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                          </div>
                          {formErrors.name && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.name}</p>}
                        </div>

                        <div>
                          <label htmlFor="payment-email" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>EMAIL *</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#00FFC6' }} />
                            <input id="payment-email" type="email" name="email" value={formData.email} onChange={handleInputChange} required
                              placeholder="your@email.com"
                              className="w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.email ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                          </div>
                          {formErrors.email && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.email}</p>}
                        </div>

                        <div>
                          <label htmlFor="payment-phone" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>PHONE *</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#00FFC6' }} />
                            <input id="payment-phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                              placeholder="+1 (555) 000-0000"
                              className="w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.phone ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                          </div>
                          {formErrors.phone && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.phone}</p>}
                        </div>
                      </div>

                      {/* Address Information Section - Payment */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold tracking-wide" style={{ color: '#00FFC6' }}>ADDRESS INFORMATION</h4>

                        <div>
                          <label htmlFor="payment-address" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>ADDRESS (STREET, P.O. BOX) *</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#00FFC6' }} />
                            <input id="payment-address" type="text" name="address" value={formData.address} onChange={handleInputChange} required
                              placeholder="Street address or P.O. Box"
                              className="w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.address ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                          </div>
                          {formErrors.address && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.address}</p>}
                        </div>

                        <div>
                          <label htmlFor="payment-address-line2" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>ADDRESS LINE 2 (APARTMENT, SUITE, UNIT)</label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#00FFC6' }} />
                            <input id="payment-address-line2" type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange}
                              placeholder="Apartment, suite, unit, etc."
                              className="w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.addressLine2 ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="payment-city" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>CITY *</label>
                            <input id="payment-city" type="text" name="city" value={formData.city} onChange={handleInputChange} required
                              placeholder="City"
                              className="w-full px-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.city ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                            {formErrors.city && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.city}</p>}
                          </div>

                          <div>
                            <label htmlFor="payment-state" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>STATE/PROVINCE *</label>
                            <input id="payment-state" type="text" name="stateProvince" value={formData.stateProvince} onChange={handleInputChange} required
                              placeholder="State or Province"
                              className="w-full px-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.stateProvince ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                            {formErrors.stateProvince && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.stateProvince}</p>}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="payment-country" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>COUNTRY/REGION *</label>
                            <input id="payment-country" type="text" name="countryRegion" value={formData.countryRegion} onChange={handleInputChange} required
                              placeholder="Country or Region"
                              className="w-full px-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.countryRegion ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                            {formErrors.countryRegion && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.countryRegion}</p>}
                          </div>

                          <div>
                            <label htmlFor="payment-postal-code" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>POSTAL/ZIP CODE *</label>
                            <input id="payment-postal-code" type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required
                              placeholder="ZIP/Postal Code"
                              className="w-full px-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.postalCode ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                            {formErrors.postalCode && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.postalCode}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Business Information Section - Payment */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold tracking-wide" style={{ color: '#00FFC6' }}>BUSINESS INFORMATION</h4>

                        <div>
                          <label htmlFor="payment-vat" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>VAT/GST ID</label>
                          <div className="relative">
                            <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#00FFC6' }} />
                            <input id="payment-vat" type="text" name="vatGstId" value={formData.vatGstId} onChange={handleInputChange}
                              placeholder="VAT/GST ID (optional)"
                              className="w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.vatGstId ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                          </div>
                        </div>
                      </div>

                      {/* Message Section - Payment */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold tracking-wide" style={{ color: '#00FFC6' }}>ADDITIONAL NOTES</h4>

                        <div>
                          <label htmlFor="payment-message" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>MESSAGE</label>
                          <textarea id="payment-message" name="message" value={formData.message} onChange={handleInputChange} rows={3}
                            placeholder="Any additional information (optional)..."
                            className="w-full px-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all resize-none"
                            style={{ backgroundColor: '#121212', borderColor: formErrors.message ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                        </div>
                      </div>

                      {formErrors.submit && (
                        <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#ff4444' }}>
                          {formErrors.submit}
                        </div>
                      )}

                      {/* Action Buttons - Payment */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button type="button"
                          onClick={() => setShowPaymentForm(false)}
                          className="w-full py-3 rounded-xl font-bold transition-all hover:scale-105 border"
                          style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}>
                          Cancel
                        </button>
                        <button type="submit"
                          disabled={isProcessingPayment}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all hover:scale-105 border border-[#00FFC6]"
                          style={{
                            backgroundColor: isProcessingPayment ? '#232323' : 'transparent',
                            color: isProcessingPayment ? '#666' : '#00FFC6',
                            opacity: isProcessingPayment ? 0.6 : 1
                          }}>
                          <CreditCard className="w-5 h-5" />
                          <span>{isProcessingPayment ? 'Processing...' : 'Complete Payment'}</span>
                        </button>
                      </div>
                    </form>
                  ) : formSubmitted ? (
                    <div className="text-center py-8">
                      <div className="inline-flex p-4 rounded-full mb-4" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                        <CheckCircle className="w-12 h-12" style={{ color: '#00FFC6' }} />
                      </div>
                      <h4 className="text-lg font-bold mb-2" style={{ color: '#00FFC6' }}>Message Sent!</h4>
                      <p className="text-sm" style={{ color: '#b0f5e6' }}>I'll get back to you soon.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div aria-live="polite" aria-atomic="true">
                        {isSubmitting && <p className="text-sm" style={{ color: '#b0f5e6' }}>Sending message...</p>}
                        {formSubmitted && <p className="text-sm" style={{ color: '#00FFC6' }}>Message sent successfully.</p>}
                      </div>

                      {/* Personal Information Section */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold tracking-wide" style={{ color: '#00FFC6' }}>PERSONAL INFORMATION</h4>

                        <div>
                          <label htmlFor="contact-name" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>NAME *</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#00FFC6' }} />
                            <input id="contact-name" type="text" name="name" value={formData.name} onChange={handleInputChange} required
                              placeholder="Your full name"
                              className="w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.name ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                          </div>
                          {formErrors.name && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.name}</p>}
                        </div>

                        <div>
                          <label htmlFor="contact-email" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>EMAIL *</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#00FFC6' }} />
                            <input id="contact-email" type="email" name="email" value={formData.email} onChange={handleInputChange} required
                              placeholder="your@email.com"
                              className="w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.email ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                          </div>
                          {formErrors.email && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.email}</p>}
                        </div>

                        <div>
                          <label htmlFor="contact-phone" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>PHONE *</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#00FFC6' }} />
                            <input id="contact-phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                              placeholder="+1 (555) 000-0000"
                              className="w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.phone ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                          </div>
                          {formErrors.phone && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.phone}</p>}
                        </div>
                      </div>

                      {/* Address Information Section */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold tracking-wide" style={{ color: '#00FFC6' }}>ADDRESS INFORMATION</h4>

                        <div>
                          <label htmlFor="contact-address" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>ADDRESS (STREET, P.O. BOX) *</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#00FFC6' }} />
                            <input id="contact-address" type="text" name="address" value={formData.address} onChange={handleInputChange} required
                              placeholder="Street address or P.O. Box"
                              className="w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.address ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                          </div>
                          {formErrors.address && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.address}</p>}
                        </div>

                        <div>
                          <label htmlFor="contact-address-line2" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>ADDRESS LINE 2 (APARTMENT, SUITE, UNIT)</label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#00FFC6' }} />
                            <input id="contact-address-line2" type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange}
                              placeholder="Apartment, suite, unit, etc."
                              className="w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.addressLine2 ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                          </div>
                          {formErrors.addressLine2 && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.addressLine2}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="contact-city" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>CITY *</label>
                            <input id="contact-city" type="text" name="city" value={formData.city} onChange={handleInputChange} required
                              placeholder="City"
                              className="w-full px-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.city ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                            {formErrors.city && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.city}</p>}
                          </div>

                          <div>
                            <label htmlFor="contact-state" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>STATE/PROVINCE *</label>
                            <input id="contact-state" type="text" name="stateProvince" value={formData.stateProvince} onChange={handleInputChange} required
                              placeholder="State or Province"
                              className="w-full px-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.stateProvince ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                            {formErrors.stateProvince && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.stateProvince}</p>}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="contact-country" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>COUNTRY/REGION *</label>
                            <input id="contact-country" type="text" name="countryRegion" value={formData.countryRegion} onChange={handleInputChange} required
                              placeholder="Country or Region"
                              className="w-full px-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.countryRegion ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                            {formErrors.countryRegion && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.countryRegion}</p>}
                          </div>

                          <div>
                            <label htmlFor="contact-postal-code" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>POSTAL/ZIP CODE *</label>
                            <input id="contact-postal-code" type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required
                              placeholder="ZIP/Postal Code"
                              className="w-full px-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.postalCode ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                            {formErrors.postalCode && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.postalCode}</p>}
                          </div>
                        </div>
                      </div>
                      {/* Business Information Section */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold tracking-wide" style={{ color: '#00FFC6' }}>BUSINESS INFORMATION</h4>

                        <div>
                          <label htmlFor="contact-vat" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>VAT/GST ID</label>
                          <div className="relative">
                            <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#00FFC6' }} />
                            <input id="contact-vat" type="text" name="vatGstId" value={formData.vatGstId} onChange={handleInputChange}
                              placeholder="VAT/GST ID (optional)"
                              className="w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all"
                              style={{ backgroundColor: '#121212', borderColor: formErrors.vatGstId ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                          </div>
                          {formErrors.vatGstId && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.vatGstId}</p>}
                        </div>
                      </div>

                      {/* Project Message Section */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold tracking-wide" style={{ color: '#00FFC6' }}>PROJECT MESSAGE</h4>

                        <div>
                          <label htmlFor="contact-message" className="block text-xs font-bold mb-2 tracking-wide" style={{ color: '#00FFC6' }}>MESSAGE *</label>
                          <textarea id="contact-message" name="message" value={formData.message} onChange={handleInputChange} required rows={4}
                            placeholder="Tell me about your interest in this project..."
                            className="w-full px-3 py-3 rounded-xl border focus:outline-none focus:border-[#00FFC6] transition-all resize-none"
                            style={{ backgroundColor: '#121212', borderColor: formErrors.message ? '#ff4444' : '#232323', color: '#E0E0E0' }} />
                          {formErrors.message && <p className="text-xs mt-1" style={{ color: '#ff4444' }}>{formErrors.message}</p>}
                        </div>
                      </div>

                      {formErrors.submit && (
                        <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#ff4444' }}>
                          {formErrors.submit}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 gap-3">
                        {displayProject.isPaid && displayProject.price && displayProject.price > 0 ? (
                          displayProject.isFreeForUser || hasAllAccess ? (
                            <button type="submit"
                              disabled={isSubmitting}
                              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all hover:scale-105 border border-[#4ade80]"
                              style={{
                                backgroundColor: isSubmitting ? '#232323' : 'transparent',
                                color: isSubmitting ? '#666' : '#4ade80',
                                opacity: isSubmitting ? 0.6 : 1
                              }}>
                              <Mail className="w-5 h-5" />
                              <span>{isSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
                            </button>
                          ) : (
                            <button type="button"
                              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all hover:scale-105 border border-[#00FFC6]"
                              style={{ backgroundColor: 'transparent', color: '#00FFC6' }}
                              onClick={() => setShowPaymentForm(!showPaymentForm)}>
                              <CreditCard className="w-5 h-5" />
                              <span>{showPaymentForm ? 'Cancel Payment' : 'Make Payment'}</span>
                            </button>
                          )
                        ) : (
                          <button type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all hover:scale-105 border border-[#00FFC6]"
                            style={{
                              backgroundColor: isSubmitting ? '#232323' : 'transparent',
                              color: isSubmitting ? '#666' : '#00FFC6',
                              opacity: isSubmitting ? 0.6 : 1
                            }}>
                            <Mail className="w-5 h-5" />
                            <span>{isSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </>

                <div className="text-center py-12">
                  <div className="inline-flex p-4 rounded-full mb-4" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                    <Mail className="w-12 h-12" style={{ color: '#00FFC6' }} />
                  </div>
                  <h4 className="text-lg font-bold mb-2" style={{ color: '#00FFC6' }}>This is a Free Project</h4>
                  <p className="text-sm mb-4" style={{ color: '#b0f5e6' }}>
                    {displayProject.downloadLimit ? `Download limit: ${displayProject.downloadCount || 0}/${displayProject.downloadLimit}` : 'No payment required.'}
                  </p>

                  {/* Download Button for Free Projects */}
                  <button
                    onClick={handleDownloadZip}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all hover:scale-105 border border-[#00FFC6]"
                    style={{ backgroundColor: 'transparent', color: '#00FFC6' }}>
                    <Download className="w-5 h-5" />
                    <span>Download Project Files</span>
                  </button>
                </div>

              <div className="mt-6 pt-6 border-t" style={{ borderColor: '#232323' }}>
                <p className="text-xs mb-2" style={{ color: '#b0f5e6' }}>Or reach out directly:</p>
                <a href="mailto:projects@spyberpolymath.com"
                  className="text-sm hover:text-[#00FFC6] transition-colors inline-flex items-center gap-2"
                  style={{ color: '#b0f5e6' }}>
                  <Mail className="w-4 h-4" />
                  projects@spyberpolymath.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Tab Navigation */}
          <div className="flex gap-2 p-1 rounded-xl border" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
            <button onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${activeTab === 'overview' ? 'scale-105' : ''}`}
              style={{
                backgroundColor: activeTab === 'overview' ? '#00FFC6' : 'transparent',
                color: activeTab === 'overview' ? '#121212' : '#b0f5e6'
              }}>
              Overview
            </button>
            <button onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${activeTab === 'details' ? 'scale-105' : ''}`}
              style={{
                backgroundColor: activeTab === 'details' ? '#00FFC6' : 'transparent',
                color: activeTab === 'details' ? '#121212' : '#b0f5e6'
              }}>
              Full Details
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Description Card */}
              <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#00FFC6' }}></div>
                    <h2 className="text-2xl font-black" style={{ color: '#00FFC6' }}>Project Overview</h2>
                    <Link
                      href={`/download-project?projectId=${displayProject._id || displayProject.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ml-auto"
                      style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Project</span>
                    </Link>
                  </div>
                  <div className="space-y-4 text-base leading-relaxed" style={{ color: '#E0E0E0' }}>
                    <p>{displayProject.description}</p>
                    <p>
                      This project showcases advanced techniques in {getCategoryName(displayProject.category).toLowerCase()}
                      and demonstrates practical applications of modern technology stack. Built with privacy-first
                      principles and ethical considerations in mind, this project represents the intersection of
                      security, innovation, and responsibility.
                    </p>
                    {displayProject.tags && displayProject.tags.length > 0 && (
                      <p>
                        The implementation leverages cutting-edge technologies including {displayProject.tags.slice(0, -1).join(', ')}
                        {displayProject.tags.length > 1 && ` and ${displayProject.tags[displayProject.tags.length - 1]}`}
                        to deliver a robust and scalable solution.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Technologies Grid */}
              {displayProject.tags && displayProject.tags.length > 0 && (
                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <Tag className="w-5 h-5" style={{ color: '#00FFC6' }} />
                      <h3 className="text-xl font-black" style={{ color: '#00FFC6' }}>Tech Stack</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {displayProject.tags.map((tag: string, index: number) => (
                        <div key={index}
                          className="px-4 py-3 rounded-xl border text-center font-semibold text-sm hover:border-[#00FFC6] transition-all"
                          style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#b0f5e6' }}>
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Options */}
              <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-5 h-5" style={{ color: '#00FFC6' }} />
                    <h3 className="text-xl font-black" style={{ color: '#00FFC6' }}>Payment Options</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#00FFC6' }}>Project Type</label>
                      <p style={{ color: '#E0E0E0' }}>
                        {displayProject.isPaid ? 'Paid Project' : 'Free Project'}
                      </p>
                    </div>
                    {displayProject.isPaid && displayProject.price && displayProject.price > 0 && (
                      <div>
                        <label className="block text-sm font-bold mb-2" style={{ color: '#00FFC6' }}>Amount</label>
                        <p style={{ color: '#E0E0E0' }}>
                          ₹{displayProject.price} INR
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && hasRichDescription && (
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#00FFC6' }}></div>
                  <h2 className="text-2xl font-black" style={{ color: '#00FFC6' }}>
                    Complete Information: {displayProject.title}
                  </h2>
                </div>
                <div className="rich-text-content text-base leading-relaxed" style={{ color: '#E0E0E0' }}
                  dangerouslySetInnerHTML={createMarkup(displayProject.richDescription ?? '')} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="pb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black" style={{ color: '#00FFC6' }}>More Projects</h2>
            <div className="flex-1 h-px" style={{ backgroundColor: '#232323' }}></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProjects.map((relatedProject: Project) => (
              <a key={relatedProject.id} href={`/projects/${relatedProject.slug}`}
                className="group block rounded-2xl border overflow-hidden hover:-translate-y-2 transition-all duration-300"
                style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                <div className="relative h-48 overflow-hidden">
                  {relatedProject.image ? (
                    <img
                      src={relatedProject.image.startsWith('data:image/') || relatedProject.image.startsWith('https://')
                        ? relatedProject.image
                        : `data:image/jpeg;base64,${relatedProject.image}`}
                      alt={relatedProject.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#121212' }}>
                      <Code className="w-12 h-12 opacity-20" style={{ color: '#00FFC6' }} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#00FFC6', color: '#121212' }}>
                      {getCategoryName(relatedProject.category)}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg group-hover:text-[#00FFC6] transition-colors" style={{ color: '#E0E0E0' }}>
                    {relatedProject.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>

      {/* Styles */ }
  <style jsx>{`
        .rich-text-content h1 { font-size: 2rem; font-weight: bold; margin: 1.5rem 0 1rem; color: #00FFC6; }
        .rich-text-content h2 { font-size: 1.75rem; font-weight: bold; margin: 1.25rem 0 0.75rem; color: #00FFC6; }
        .rich-text-content h3 { font-size: 1.5rem; font-weight: bold; margin: 1rem 0 0.5rem; color: #00FFC6; }
        .rich-text-content p { margin-bottom: 1rem; }
        .rich-text-content ul, .rich-text-content ol { margin-bottom: 1rem; padding-left: 2rem; }
        .rich-text-content li { margin-bottom: 0.5rem; }
        .rich-text-content blockquote { border-left: 4px solid #00FFC6; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #b0f5e6; }
        .rich-text-content code { background-color: #232323; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.9rem; }
        .rich-text-content pre { background-color: #232323; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; }
        .rich-text-content pre code { background-color: transparent; padding: 0; }
        .rich-text-content a { color: #00FFC6; text-decoration: underline; }
        .rich-text-content a:hover { color: #E0E0E0; }
        .rich-text-content img { max-width: 100%; height: auto; margin: 1rem 0; border-radius: 0.5rem; }
        .rich-text-content table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .rich-text-content th, .rich-text-content td { border: 1px solid #232323; padding: 0.5rem; text-align: left; }
        .rich-text-content th { background-color: #181A1B; font-weight: bold; }
        /* Accessibility: focus-visible and reduced-motion */
        :global(:focus-visible) {
          outline: 3px solid #00FFC6;
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          :global(*) {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div >
  );
}