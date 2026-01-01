'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    CreditCard,
    CheckCircle,
    AlertTriangle,
    Clock,
    X,
    Filter,
    Edit3,
    Save,
    Loader,
    Trash2,
    Eye
} from 'lucide-react';

interface AccountPayment {
    _id: string;
    userId: string;
    amount: number;
    currency: string;
    description: string;
    status: 'pending' | 'completed' | 'cancelled' | 'failed';
    method: string;
    paymentId: string;
    transactionId: string;
    invoiceId: string;
    planType?: 'free' | 'supporter' | 'allAccess';
    billingCycle?: 'monthly' | 'quarterly' | 'yearly';
    createdAt: string;
    updatedAt: string;
}

interface ProjectPayment {
    _id: string;
    projectId: string;
    userId: string;
    paymentId: string;
    invoiceId: string;
    transactionId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'cancelled' | 'failed';
    method: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    addressLine2?: string;
    city: string;
    countryRegion: string;
    stateProvince: string;
    postalCode: string;
    createdAt: string;
}

export default function AdminPayments() {
    const [isMounted, setIsMounted] = useState(false);
    const [accountPayments, setAccountPayments] = useState<AccountPayment[]>([]);
    const [projectPayments, setProjectPayments] = useState<ProjectPayment[]>([]);
    const [filteredAccountPayments, setFilteredAccountPayments] = useState<AccountPayment[]>([]);
    const [filteredProjectPayments, setFilteredProjectPayments] = useState<ProjectPayment[]>([]);
    const [accountStatusFilter, setAccountStatusFilter] = useState<string>('all');
    const [projectStatusFilter, setProjectStatusFilter] = useState<string>('all');
    const [editingAccountPaymentId, setEditingAccountPaymentId] = useState<string | null>(null);
    const [editingStatus, setEditingStatus] = useState<'pending' | 'completed' | 'cancelled' | 'failed'>('pending');
    const [editingProjectPaymentId, setEditingProjectPaymentId] = useState<string | null>(null);
    const [editingProjectStatus, setEditingProjectStatus] = useState<'pending' | 'completed' | 'cancelled' | 'failed'>('pending');
    const [viewingProjectPayment, setViewingProjectPayment] = useState<ProjectPayment | null>(null);
    const [viewingAccountPayment, setViewingAccountPayment] = useState<AccountPayment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        setIsMounted(true);
        loadPayments();
    }, []);

    useEffect(() => {
        let result = accountPayments;
        if (accountStatusFilter !== 'all') {
            result = result.filter(payment => payment.status === accountStatusFilter);
        }
        setFilteredAccountPayments(result);
    }, [accountPayments, accountStatusFilter]);

    useEffect(() => {
        let result = projectPayments;
        if (projectStatusFilter !== 'all') {
            result = result.filter(payment => payment.status === projectStatusFilter);
        }
        setFilteredProjectPayments(result);
    }, [projectPayments, projectStatusFilter]);

    async function loadPayments() {
        try {
            setIsLoading(true);
            setError(null);
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';

            const [accountResp, projectResp] = await Promise.all([
                axios.get('/api/accounts', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get('/api/admin/projectpayments', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            setAccountPayments(accountResp.data);
            setProjectPayments(projectResp.data);
        } catch (error: any) {
            console.error('Error loading payments:', error);
            setError('Failed to load payments');
            if (error.response?.status === 401) {
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('token');
                    window.location.href = '/admin-auth';
                }
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleEditAccountPayment = (payment: AccountPayment) => {
        setEditingAccountPaymentId(payment._id);
        setEditingStatus(payment.status);
    };

    const handleSaveAccountPayment = async () => {
        if (!editingAccountPaymentId) return;

        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            await axios.put(`/api/account-payments`, {
                _id: editingAccountPaymentId,
                status: editingStatus
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification('Account payment updated successfully');
            setEditingAccountPaymentId(null);
            await loadPayments();
        } catch (error: any) {
            console.error('Error updating account payment:', error);
            showNotification(error.response?.data?.error || 'Failed to update account payment', 'error');
        }
    };

    const handleCancelEdit = () => {
        setEditingAccountPaymentId(null);
    };

    // Project Payment CRUD Operations
    const handleEditProjectPayment = (payment: ProjectPayment) => {
        setEditingProjectPaymentId(payment._id);
        setEditingProjectStatus(payment.status);
    };

    const handleSaveProjectPayment = async () => {
        if (!editingProjectPaymentId) return;

        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            await axios.put(`/api/admin/projectpayments/${editingProjectPaymentId}`, {
                status: editingProjectStatus
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification('Project payment updated successfully');
            setEditingProjectPaymentId(null);
            await loadPayments();
        } catch (error: any) {
            console.error('Error updating project payment:', error);
            showNotification(error.response?.data?.error || 'Failed to update project payment', 'error');
        }
    };

    const handleDeleteProjectPayment = async (paymentId: string) => {
        if (!window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
            return;
        }

        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            await axios.delete(`/api/admin/projectpayments/${paymentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification('Project payment deleted successfully');
            await loadPayments();
        } catch (error: any) {
            console.error('Error deleting project payment:', error);
            showNotification(error.response?.data?.error || 'Failed to delete project payment', 'error');
        }
    };

    const handleCancelEditProject = () => {
        setEditingProjectPaymentId(null);
    };

    // Account Payment CRUD Operations

    const handleDeleteAccountPayment = async (paymentId: string) => {
        if (!window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
            return;
        }

        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            await axios.delete(`/api/account-payments/${paymentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification('Account payment deleted successfully');
            setViewingAccountPayment(null);
            await loadPayments();
        } catch (error: any) {
            console.error('Error deleting account payment:', error);
            showNotification(error.response?.data?.error || 'Failed to delete account payment', 'error');
        }
    };

    const handleDownloadAccountInvoice = async (paymentId: string, invoiceId: string) => {
        try {
            setDownloadingInvoiceId(paymentId);
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';

            const response = await axios.post(
                '/api/invoice/generate',
                {
                    paymentId: paymentId,
                    paymentType: 'account'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'blob'
                }
            );

            // Create blob and download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoiceId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showNotification('Invoice downloaded successfully');
        } catch (error: any) {
            console.error('Error downloading invoice:', error);
            showNotification(error.response?.data?.error || 'Failed to download invoice', 'error');
        } finally {
            setDownloadingInvoiceId(null);
        }
    };

    const handleDownloadProjectInvoice = async (paymentId: string, invoiceId: string) => {
        try {
            setDownloadingInvoiceId(paymentId);
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';

            const response = await axios.post(
                '/api/invoice/generate',
                {
                    paymentId: paymentId,
                    paymentType: 'project'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'blob'
                }
            );

            // Create blob and download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoiceId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showNotification('Invoice downloaded successfully');
        } catch (error: any) {
            console.error('Error downloading invoice:', error);
            showNotification(error.response?.data?.error || 'Failed to download invoice', 'error');
        } finally {
            setDownloadingInvoiceId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return { backgroundColor: '#16a34a20', color: '#4ade80' };
            case 'pending': return { backgroundColor: '#f59e0b20', color: '#facc15' };
            case 'cancelled': return { backgroundColor: '#4b556320', color: '#9ca3af' };
            case 'failed': return { backgroundColor: '#ef444420', color: '#f87171' };
            default: return { backgroundColor: '#4b556320', color: '#9ca3af' };
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4" style={{ color: '#4ade80' }} />;
            case 'pending': return <Clock className="w-4 h-4" style={{ color: '#facc15' }} />;
            case 'cancelled': return <X className="w-4 h-4" style={{ color: '#9ca3af' }} />;
            case 'failed': return <AlertTriangle className="w-4 h-4" style={{ color: '#f87171' }} />;
            default: return null;
        }
    };

    if (!isMounted) {
        return null;
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
            {/* Notification */}
            {notification && (
                <div className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl shadow-2xl border text-white font-semibold`}
                    style={{
                        backgroundColor: notification.type === 'success' ? '#16a34a' : '#ef4444',
                        borderColor: notification.type === 'success' ? '#4ade80' : '#f87171'
                    }}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 z-40 backdrop-blur-sm" style={{ backgroundColor: 'rgba(18, 18, 18, 0.8)', borderBottom: '1px solid #232323' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: '#00FFC6' }}>
                                <CreditCard className="text-2xl" style={{ color: '#121212' }} />
                            </div>
                            <h1 className="text-2xl font-bold" style={{ color: '#E0E0E0' }}>Payment Management</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="border px-4 py-3 rounded mb-6" style={{ backgroundColor: '#ef444420', borderColor: '#f87171', color: '#fca5a5' }}>
                        {error}
                    </div>
                )}

                {/* Account Payments Section */}
                <div className="rounded-xl border mb-8" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                    <div className="px-6 py-4 border-b" style={{ borderColor: '#232323' }}>
                        <div>
                            <h2 className="text-xl font-semibold" style={{ color: '#E0E0E0' }}>Account Payments</h2>
                            <p className="text-sm" style={{ color: '#757575' }}>Payments related to user accounts</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="px-6 py-4 border-b" style={{ borderColor: '#232323' }}>
                        <div className="flex items-center gap-4">
                            <Filter className="w-5 h-5" style={{ color: '#757575' }} />
                            <select
                                value={accountStatusFilter}
                                onChange={(e) => setAccountStatusFilter(e.target.value)}
                                className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader className="animate-spin text-2xl" style={{ color: '#00FFC6' }} />
                                <span className="ml-3" style={{ color: '#757575' }}>Loading account payments...</span>
                            </div>
                        ) : (
                            <table className="min-w-full">
                                <thead style={{ backgroundColor: '#121212' }}>
                                    <tr className="border-b" style={{ borderColor: '#232323' }}>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>User ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>Created At</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: '#232323' }}>
                                    {filteredAccountPayments.map((payment) => (
                                        <tr key={payment._id} className="transition-all" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#202123'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#E0E0E0' }}>{payment.userId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#E0E0E0' }}>${payment.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {editingAccountPaymentId === payment._id ? (
                                                    <select
                                                        value={editingStatus}
                                                        onChange={(e) => setEditingStatus(e.target.value as any)}
                                                        className="px-2 py-1 rounded text-sm border focus:outline-none focus:ring-2"
                                                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                        <option value="failed">Failed</option>
                                                    </select>
                                                ) : (
                                                    <span style={getStatusColor(payment.status)} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium">
                                                        {getStatusIcon(payment.status)}
                                                        <span className="ml-1.5 capitalize">{payment.status}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#757575' }}>
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {editingAccountPaymentId === payment._id ? (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={handleSaveAccountPayment}
                                                            className="transition-colors"
                                                            style={{ color: '#00FFC6' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                                            title="Save"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="transition-colors"
                                                            style={{ color: '#757575' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = '#E0E0E0'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = '#757575'}
                                                            title="Cancel"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleEditAccountPayment(payment)}
                                                            className="transition-colors"
                                                            style={{ color: '#FFB800' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = '#FFC633'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = '#FFB800'}
                                                            title="Edit Status"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setViewingAccountPayment(payment)}
                                                            className="transition-colors"
                                                            style={{ color: '#60a5fa' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = '#93c5fd'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Project Payments Section */}
                <div className="rounded-xl border" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                    <div className="px-6 py-4 border-b" style={{ borderColor: '#232323' }}>
                        <h2 className="text-xl font-semibold" style={{ color: '#E0E0E0' }}>Project Payments</h2>
                        <p className="text-sm" style={{ color: '#757575' }}>Payments related to projects</p>
                    </div>

                    {/* Filters */}
                    <div className="px-6 py-4 border-b" style={{ borderColor: '#232323' }}>
                        <div className="flex items-center gap-4">
                            <Filter className="w-5 h-5" style={{ color: '#757575' }} />
                            <select
                                value={projectStatusFilter}
                                onChange={(e) => setProjectStatusFilter(e.target.value)}
                                className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader className="animate-spin text-2xl" style={{ color: '#00FFC6' }} />
                                <span className="ml-3" style={{ color: '#757575' }}>Loading project payments...</span>
                            </div>
                        ) : filteredProjectPayments.length === 0 ? (
                            <div className="flex justify-center items-center py-12">
                                <span style={{ color: '#757575' }}>No project payments found</span>
                            </div>
                        ) : (
                            <table className="min-w-full">
                                <thead style={{ backgroundColor: '#121212' }}>
                                    <tr className="border-b" style={{ borderColor: '#232323' }}>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>Payment ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>Project</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>Created At</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: '#232323' }}>
                                    {filteredProjectPayments.map((payment) => (
                                        <tr key={payment._id} className="transition-all" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#202123'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono" style={{ color: '#E0E0E0' }}>{payment.paymentId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#E0E0E0' }}>{payment.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#E0E0E0' }}>{payment.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#E0E0E0' }}>
                                                {payment.currency} {payment.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {editingProjectPaymentId === payment._id ? (
                                                    <select
                                                        value={editingProjectStatus}
                                                        onChange={(e) => setEditingProjectStatus(e.target.value as any)}
                                                        className="px-2 py-1 rounded text-sm border focus:outline-none focus:ring-2"
                                                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                        <option value="failed">Failed</option>
                                                    </select>
                                                ) : (
                                                    <span style={getStatusColor(payment.status)} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium">
                                                        {getStatusIcon(payment.status)}
                                                        <span className="ml-1.5 capitalize">{payment.status}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#E0E0E0' }}>{payment.projectId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#757575' }}>
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {editingProjectPaymentId === payment._id ? (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={handleSaveProjectPayment}
                                                            className="transition-colors"
                                                            style={{ color: '#00FFC6' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                                            title="Save"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEditProject}
                                                            className="transition-colors"
                                                            style={{ color: '#757575' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = '#E0E0E0'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = '#757575'}
                                                            title="Cancel"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => setViewingProjectPayment(payment)}
                                                            className="transition-colors"
                                                            style={{ color: '#60a5fa' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = '#93c5fd'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditProjectPayment(payment)}
                                                            className="transition-colors"
                                                            style={{ color: '#FFB800' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = '#FFC633'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = '#FFB800'}
                                                            title="Edit"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProjectPayment(payment._id)}
                                                            className="transition-colors"
                                                            style={{ color: '#ff6b6b' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = '#ff8a7f'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = '#ff6b6b'}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Project Payment Details Modal */}
            {viewingProjectPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="rounded-xl shadow-2xl max-w-2xl w-full border my-8" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="sticky top-0 px-6 py-4 flex justify-between items-center" style={{ backgroundColor: '#121212', borderBottom: '1px solid #232323' }}>
                            <h3 className="text-xl font-bold" style={{ color: '#E0E0E0' }}>Project Payment Details</h3>
                            <button
                                onClick={() => setViewingProjectPayment(null)}
                                className="transition-colors p-2 rounded-lg hover:bg-opacity-20"
                                style={{ color: '#757575' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#E0E0E0'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#757575'}
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Payment ID</p>
                                <p className="font-mono font-semibold" style={{ color: '#E0E0E0' }}>{viewingProjectPayment.paymentId}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Invoice ID</p>
                                <p className="font-mono font-semibold" style={{ color: '#E0E0E0' }}>{viewingProjectPayment.invoiceId}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Transaction ID</p>
                                <p className="font-mono font-semibold" style={{ color: '#E0E0E0' }}>{viewingProjectPayment.transactionId}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Status</p>
                                <p className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mt-1" style={getStatusColor(viewingProjectPayment.status)}>
                                    {getStatusIcon(viewingProjectPayment.status)}
                                    <span className="ml-1.5 capitalize">{viewingProjectPayment.status}</span>
                                </p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Amount</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>{viewingProjectPayment.currency} {viewingProjectPayment.amount.toFixed(2)}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Method</p>
                                <p className="font-semibold capitalize" style={{ color: '#E0E0E0' }}>{viewingProjectPayment.method}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Customer Name</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>{viewingProjectPayment.name}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Email</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>{viewingProjectPayment.email}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Phone</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>{viewingProjectPayment.phone}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Project ID</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>{viewingProjectPayment.projectId}</p>
                            </div>
                            <div className="md:col-span-2 p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Address</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>
                                    {viewingProjectPayment.address}
                                    {viewingProjectPayment.addressLine2 && `, ${viewingProjectPayment.addressLine2}`}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>City</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>{viewingProjectPayment.city}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>State/Province</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>{viewingProjectPayment.stateProvince}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Country/Region</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>{viewingProjectPayment.countryRegion}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Postal Code</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>{viewingProjectPayment.postalCode}</p>
                            </div>
                            <div className="md:col-span-2 p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Created At</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>{new Date(viewingProjectPayment.createdAt).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="sticky bottom-0 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t" style={{ backgroundColor: '#121212', borderTopColor: '#232323' }}>
                            <button
                                onClick={() => setViewingProjectPayment(null)}
                                className="px-4 py-2 rounded-lg border font-medium transition-all order-3 sm:order-1"
                                style={{ backgroundColor: '#181A1B', borderColor: '#232323', color: '#E0E0E0' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#202123'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181A1B'}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleDownloadProjectInvoice(viewingProjectPayment._id, viewingProjectPayment.invoiceId)}
                                disabled={downloadingInvoiceId === viewingProjectPayment._id}
                                className="px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 order-2 sm:order-2"
                                style={{
                                    backgroundColor: '#00FFC6',
                                    color: '#121212',
                                    opacity: downloadingInvoiceId === viewingProjectPayment._id ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (downloadingInvoiceId !== viewingProjectPayment._id) {
                                        e.currentTarget.style.boxShadow = '0 0 15px rgba(0,255,198,0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (downloadingInvoiceId !== viewingProjectPayment._id) {
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                {downloadingInvoiceId === viewingProjectPayment._id ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        <span>Downloading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4" />
                                        <span>Download Invoice</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleDeleteProjectPayment(viewingProjectPayment._id)}
                                className="px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 order-1 sm:order-3"
                                style={{ backgroundColor: '#ef4444', color: 'white' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Payment</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Account Payment Modal */}
            {viewingAccountPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="rounded-xl shadow-2xl max-w-2xl w-full border my-8" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="sticky top-0 px-6 py-4 border-b flex justify-between items-center" style={{ backgroundColor: '#121212', borderColor: '#232323' }}>
                            <h3 className="text-lg font-semibold" style={{ color: '#E0E0E0' }}>Account Payment Details</h3>
                            <button
                                onClick={() => setViewingAccountPayment(null)}
                                className="transition-colors p-2 rounded-lg hover:bg-opacity-20"
                                style={{ color: '#757575' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#E0E0E0'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#757575'}
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>User ID</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>{viewingAccountPayment.userId}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Amount</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>{viewingAccountPayment.currency} {viewingAccountPayment.amount.toFixed(2)}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Status</p>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={getStatusColor(viewingAccountPayment.status)}>
                                    {getStatusIcon(viewingAccountPayment.status)}
                                    <span className="ml-1.5 capitalize">{viewingAccountPayment.status}</span>
                                </span>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Method</p>
                                <p className="font-semibold capitalize" style={{ color: '#E0E0E0' }}>{viewingAccountPayment.method}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Plan Type</p>
                                <p className="font-semibold capitalize" style={{ color: '#E0E0E0' }}>{viewingAccountPayment.planType || 'N/A'}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Billing Cycle</p>
                                <p className="font-semibold capitalize" style={{ color: '#E0E0E0' }}>{viewingAccountPayment.billingCycle || 'N/A'}</p>
                            </div>
                            <div className="md:col-span-2 p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Description</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>{viewingAccountPayment.description}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Payment ID</p>
                                <p className="font-semibold text-xs" style={{ color: '#E0E0E0' }}>{viewingAccountPayment.paymentId || 'N/A'}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Transaction ID</p>
                                <p className="font-semibold text-xs" style={{ color: '#E0E0E0' }}>{viewingAccountPayment.transactionId || 'N/A'}</p>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Invoice ID</p>
                                <p className="font-semibold text-xs" style={{ color: '#E0E0E0' }}>{viewingAccountPayment.invoiceId || 'N/A'}</p>
                            </div>
                            <div className="md:col-span-2 p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                                <p className="text-sm mb-1" style={{ color: '#b0f5e6' }}>Created At</p>
                                <p className="font-semibold" style={{ color: '#E0E0E0' }}>{new Date(viewingAccountPayment.createdAt).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="sticky bottom-0 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t" style={{ backgroundColor: '#121212', borderTopColor: '#232323' }}>
                            <button
                                onClick={() => setViewingAccountPayment(null)}
                                className="px-4 py-2 rounded-lg border font-medium transition-all order-3 sm:order-1"
                                style={{ backgroundColor: '#181A1B', borderColor: '#232323', color: '#E0E0E0' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#202123'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181A1B'}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleDownloadAccountInvoice(viewingAccountPayment._id, viewingAccountPayment.invoiceId)}
                                disabled={downloadingInvoiceId === viewingAccountPayment._id}
                                className="px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 order-2 sm:order-2"
                                style={{
                                    backgroundColor: '#00FFC6',
                                    color: '#121212',
                                    opacity: downloadingInvoiceId === viewingAccountPayment._id ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (downloadingInvoiceId !== viewingAccountPayment._id) {
                                        e.currentTarget.style.boxShadow = '0 0 15px rgba(0,255,198,0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (downloadingInvoiceId !== viewingAccountPayment._id) {
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                {downloadingInvoiceId === viewingAccountPayment._id ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        <span>Downloading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4" />
                                        <span>Download Invoice</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleDeleteAccountPayment(viewingAccountPayment._id)}
                                className="px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 order-1 sm:order-3"
                                style={{ backgroundColor: '#ef4444', color: 'white' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Payment</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}