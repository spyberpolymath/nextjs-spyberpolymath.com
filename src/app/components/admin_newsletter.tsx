'use client';

import { useEffect, useState } from 'react';
import { Mail, Plus, Edit3, Trash2, Save, X, Search, Filter, ChevronLeft, ChevronRight, User, AtSign, Tags, Download, Send, CheckCircle, AlertTriangle, Users, TrendingUp, Eye, Archive, RefreshCw } from 'lucide-react';

// Subscriber interface
export interface Subscriber {
    id: string;
    name: string;
    email: string;
    interest: string;
    interestLabel: string;
    source: string;
    frequency: string;
    subscriptionDate: string;
    status: string;
    lastEmailSent?: string;
}

// User interface for accounts source
export interface UserAccount {
    id: string;
    name: string;
    email: string;
    status: string;
    joinedDate: string;
    lastLogin: string;
    emailPreferences?: {
        twoFANotifications: {
            enabled: boolean;
            frequency: string;
        };
        accountChanges: {
            enabled: boolean;
            frequency: string;
        };
        newsletter: {
            enabled: boolean;
            frequency: string;
        };
    };
}

interface FetchSubscribersResult {
    subscribers: Subscriber[];
    total: number;
    page: number;
    totalPages: number;
}

interface FetchUsersResult {
    users: UserAccount[];
    total: number;
    page: number;
    totalPages: number;
}

// Fetch newsletter subscribers from API
async function fetchNewsletterSubscribers(
    page: number = 1,
    limit: number = 10,
    source?: string
): Promise<FetchSubscribersResult> {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (source) {
            params.append('source', source);
        }

        const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch(`/api/admin/newsletter/subscribers?${params.toString()}`, { headers });
        if (!response.ok) {
            throw new Error('Failed to fetch newsletter subscribers');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching newsletter subscribers:', error);
        return { subscribers: [], total: 0, page: 1, totalPages: 0 };
    }
}

// Fetch users from API for accounts source
async function fetchUsers(
    page: number = 1,
    limit: number = 10
): Promise<FetchUsersResult> {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch(`/api/admin/users?${params.toString()}`, { headers });
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching users:', error);
        return { users: [], total: 0, page: 1, totalPages: 0 };
    }
}

// Update subscriber via API
async function updateSubscriber(id: string, data: any): Promise<{
    success: boolean; error?: string; message?: string;
}> {
    try {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch(`/api/admin/newsletter/subscribers/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error || 'Failed to update subscriber' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating subscriber:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// Delete subscriber via API
async function deleteSubscriber(id: string): Promise<{
    success: boolean; error?: string; message?: string;
}> {
    try {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
        const headers: HeadersInit = {
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch(`/api/admin/newsletter/subscribers/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            const result = await response.json();
            return { success: false, error: result.error || 'Failed to delete subscriber' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting subscriber:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// Create subscriber via API
async function createSubscriber(data: any): Promise<{
    success: boolean; error?: string; id?: string;
}> {
    try {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch('/api/admin/newsletter/subscribers', {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error || 'Failed to create subscriber' };
        }

        return { success: true, id: result.id };
    } catch (error) {
        console.error('Error creating subscriber:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// Update user via API
async function updateUser(id: string, data: any): Promise<{
    success: boolean; error?: string; message?: string;
}> {
    try {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch(`/api/admin/users/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error || 'Failed to update user' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// Delete user via API
async function deleteUser(id: string): Promise<{
    success: boolean; error?: string; message?: string;
}> {
    try {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
        const headers: HeadersInit = {
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch(`/api/admin/users/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            const result = await response.json();
            return { success: false, error: result.error || 'Failed to delete user' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// Create user via API
async function createUser(data: any): Promise<{
    success: boolean; error?: string; user?: any;
}> {
    try {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error || 'Failed to create user' };
        }

        return { success: true, user: result.user };
    } catch (error) {
        console.error('Error creating user:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// Get single subscriber via API
async function getSubscriber(id: string): Promise<any | null> {
    try {
        const response = await fetch(`/api/admin/newsletter/subscribers/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch subscriber');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching subscriber:', error);
        return null;
    }
}

// Default mock subscribers removed; subscribers are loaded via API at runtime.

const interestOptions = [
    { value: 'ai-security', label: 'AI & Security' },
    { value: 'threats', label: 'Threats' },
    { value: 'architecture', label: 'Architecture' },
    { value: 'cloud-security', label: 'Cloud Security' },
    { value: 'remote-work', label: 'Remote Work' },
    { value: 'general', label: 'General Cybersecurity' }
];

const emptySubscriber: any = {
    id: '',
    name: '',
    email: '',
    interest: '',
    interestLabel: '',
    source: 'newsletter',
    frequency: 'weekly',
    subscriptionDate: new Date().toISOString().split('T')[0],
    status: 'active'
};

export default function AdminNewsletter() {
    const [isMounted, setIsMounted] = useState(false);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [totalSubscribers, setTotalSubscribers] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [subscribersPerPage] = useState(5);
    const [selectedSource, setSelectedSource] = useState<'accounts' | 'newsletter'>('newsletter');

    // CRUD state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [viewingItem, setViewingItem] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            if (selectedSource === 'newsletter') {
                const result = await fetchNewsletterSubscribers(currentPage, subscribersPerPage, selectedSource);
                setSubscribers(result.subscribers);
                setTotalSubscribers(result.total);
                setTotalPages(result.totalPages);
            } else {
                const result = await fetchUsers(currentPage, subscribersPerPage);
                setUsers(result.users);
                setTotalUsers(result.total);
                setTotalPages(result.totalPages);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [currentPage, selectedSource]);

    const handleSourceSwitch = (source: 'accounts' | 'newsletter') => {
        setSelectedSource(source);
        setCurrentPage(1); // Reset to first page when switching sources
    };

    // CRUD Handlers
    const handleCreate = () => {
        setEditingItem(null);
        setShowCreateModal(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setShowEditModal(true);
    };

    const handleView = (item: any) => {
        setViewingItem(item);
        setShowViewModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return;
        }

        setIsSubmitting(true);
        try {
            let result;
            if (selectedSource === 'newsletter') {
                result = await deleteSubscriber(id);
            } else {
                result = await deleteUser(id);
            }

            if (result.success) {
                loadData(); // Reload the list
                alert('Item deleted successfully');
            } else {
                alert(result.error || 'Failed to delete item');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred while deleting');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSave = async (data: any) => {
        setIsSubmitting(true);
        try {
            let result;
            if (editingItem) {
                // Update existing item
                if (selectedSource === 'newsletter') {
                    result = await updateSubscriber(editingItem.id, data);
                } else {
                    result = await updateUser(editingItem.id, data);
                }
            } else {
                // Create new item
                if (selectedSource === 'newsletter') {
                    result = await createSubscriber(data);
                } else {
                    result = await createUser(data);
                }
            }

            if (result.success) {
                loadData(); // Reload the list
                setShowCreateModal(false);
                setShowEditModal(false);
                setEditingItem(null);
                alert(editingItem ? 'Item updated successfully' : 'Item created successfully');
            } else {
                alert(result.error || 'Failed to save item');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('An error occurred while saving');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowViewModal(false);
        setEditingItem(null);
        setViewingItem(null);
    };

    const handleToggleStatus = async (subscriberId: string) => {
        const subscriber = subscribers.find(s => s.id === subscriberId);
        if (!subscriber) return;

        const newStatus = subscriber.status === 'active' ? 'inactive' : 'active';
        try {
            const result = await updateSubscriber(subscriberId, { status: newStatus });
            if (result.success) {
                loadData(); // Reload the list
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Toggle status error:', error);
            alert('An error occurred while updating status');
        }
    };

    const handleUnsubscribe = async (subscriberId: string) => {
        if (window.confirm('Are you sure you want to unsubscribe this user?')) {
            try {
                const result = await updateSubscriber(subscriberId, { status: 'unsubscribed' });
                if (result.success) {
                    loadData(); // Reload the list
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Unsubscribe error:', error);
                alert('An error occurred while unsubscribing');
            }
        }
    };

    const handleResendConfirmation = (subscriberId: string) => {
        // Not used for email preferences
    };

    const handleExportData = () => {
        // In a real app, this would generate and download a CSV file
        alert('Exporting subscriber data...');
    };

    // Pagination
    const indexOfLastSubscriber = currentPage * subscribersPerPage;
    const indexOfFirstSubscriber = indexOfLastSubscriber - subscribersPerPage;
    const currentSubscribers = subscribers.slice(indexOfFirstSubscriber, indexOfLastSubscriber);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return { backgroundColor: '#4CAF5020', color: '#4CAF50' };
            case 'inactive': return { backgroundColor: '#75757520', color: '#757575' };
            case 'unsubscribed': return { backgroundColor: '#ff6b6b20', color: '#ff6b6b' };
            default: return { backgroundColor: '#75757520', color: '#757575' };
        }
    };

    const getInterestColor = (interest: string) => {
        switch (interest) {
            case 'ai-security': return { backgroundColor: '#00FFC620', color: '#00FFC6' };
            case 'threats': return { backgroundColor: '#ff6b6b20', color: '#ff6b6b' };
            case 'architecture': return { backgroundColor: '#FFB80020', color: '#FFB800' };
            case 'cloud-security': return { backgroundColor: '#4CAF5020', color: '#4CAF50' };
            case 'remote-work': return { backgroundColor: '#FFB80020', color: '#FFB800' };
            case 'general': return { backgroundColor: '#75757520', color: '#757575' };
            default: return { backgroundColor: '#75757520', color: '#757575' };
        }
    };

    const activeCount = selectedSource === 'newsletter'
        ? subscribers.filter(s => s.status === 'active').length
        : users.filter(u => u.status === 'active').length;
    const inactiveCount = selectedSource === 'newsletter'
        ? subscribers.filter(s => s.status === 'inactive').length
        : users.filter(u => u.status === 'inactive').length;
    const totalCount = selectedSource === 'newsletter' ? totalSubscribers : totalUsers;

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)', borderColor: '#232323' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#00FFC6' }}>
                                <Mail className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#121212' }} />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-2xl font-bold" style={{ color: '#E0E0E0' }}>
                                    Newsletter Management
                                </h1>
                                <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>
                                    Manage subscribers and email preferences
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleCreate}
                                className="px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300"
                                style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                                title="Create new subscriber/user"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="text-sm">New</span>
                            </button>
                            <button
                                onClick={handleExportData}
                                className="p-2 rounded-lg border transition-all duration-300"
                                style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}
                                title="Export data"
                            >
                                <Download className="w-5 h-5" style={{ color: '#00FFC6' }} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Source Toggle Bar */}
            <div className="sticky top-[64px] sm:top-[72px] z-40 backdrop-blur-sm border-b" style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)', borderColor: '#232323' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="text-sm" style={{ color: '#757575' }}>Source:</span>
                            <div className="flex rounded-lg p-1" style={{ backgroundColor: '#181A1B' }}>
                                <button
                                    onClick={() => handleSourceSwitch('newsletter')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${selectedSource === 'newsletter' ? 'opacity-100' : 'opacity-60'}`}
                                    style={{ backgroundColor: selectedSource === 'newsletter' ? '#00FFC6' : 'transparent', color: selectedSource === 'newsletter' ? '#121212' : '#E0E0E0' }}
                                >
                                    Newsletter
                                </button>
                                <button
                                    onClick={() => handleSourceSwitch('accounts')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${selectedSource === 'accounts' ? 'opacity-100' : 'opacity-60'}`}
                                    style={{ backgroundColor: selectedSource === 'accounts' ? '#00FFC6' : 'transparent', color: selectedSource === 'accounts' ? '#121212' : '#E0E0E0' }}
                                >
                                    Accounts
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="rounded-xl border p-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="flex items-center">
                            <div className="p-3 rounded-full mr-4" style={{ backgroundColor: '#00FFC620' }}>
                                <Users className="w-6 h-6" style={{ color: '#00FFC6' }} />
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#757575' }}>Total {selectedSource === 'newsletter' ? 'Subscribers' : 'Users'}</p>
                                <p className="text-2xl font-semibold" style={{ color: '#00FFC6' }}>{totalCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border p-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="flex items-center">
                            <div className="p-3 rounded-full mr-4" style={{ backgroundColor: '#4CAF5020' }}>
                                <CheckCircle className="w-6 h-6" style={{ color: '#4CAF50' }} />
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#757575' }}>Active {selectedSource === 'newsletter' ? 'Subscribers' : 'Users'}</p>
                                <p className="text-2xl font-semibold" style={{ color: '#4CAF50' }}>{activeCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border p-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="flex items-center">
                            <div className="p-3 rounded-full mr-4" style={{ backgroundColor: '#FF000020' }}>
                                <AlertTriangle className="w-6 h-6" style={{ color: '#ff6b6b' }} />
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#757575' }}>Inactive {selectedSource === 'newsletter' ? 'Subscribers' : 'Users'}</p>
                                <p className="text-2xl font-semibold" style={{ color: '#ff6b6b' }}>{inactiveCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email Preferences Table */}
                <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                    <div className="px-6 py-4 border-b" style={{ borderColor: '#232323' }}>
                        <h3 className="text-lg font-medium" style={{ color: '#E0E0E0' }}>
                            {selectedSource === 'newsletter' ? 'Newsletter Subscribers' : 'Account Subscribers'}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: '#757575' }}>
                            {selectedSource === 'newsletter' ? 'Subscribers from the newsletter page' : 'Subscribers from user accounts'}
                        </p>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#00FFC6' }}></div>
                            <p className="mt-2" style={{ color: '#757575' }}>Loading subscribers...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y" style={{ borderColor: '#232323' }}>
                                <thead style={{ backgroundColor: '#121212' }}>
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                            Email
                                        </th>
                                        {selectedSource === 'newsletter' ? (
                                            <>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                                    Interest
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                                    Subscribed
                                                </th>
                                            </>
                                        ) : (
                                            <>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                                    2FA Notifications
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                                    Account Changes
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                                    Newsletter
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                                    Joined
                                                </th>
                                            </>
                                        )}
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody style={{ borderColor: '#232323' }}>
                                    {selectedSource === 'newsletter' ? (
                                        subscribers.length > 0 ? (
                                            subscribers.map((subscriber) => (
                                                <tr key={subscriber.id} className="border-t transition-colors duration-300 hover:opacity-70" style={{ borderColor: '#232323' }}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium" style={{ color: '#E0E0E0' }}>{subscriber.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm" style={{ color: '#b0f5e6' }}>{subscriber.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: '#00FFC620', color: '#00FFC6' }}>
                                                            {subscriber.interestLabel || subscriber.interest}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#757575' }}>
                                                        {new Date(subscriber.subscriptionDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleView(subscriber)}
                                                                className="p-1 rounded transition-colors"
                                                                style={{ backgroundColor: '#121212' }}
                                                                title="View"
                                                            >
                                                                <Eye className="w-4 h-4" style={{ color: '#00FFC6' }} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(subscriber)}
                                                                className="p-1 rounded transition-colors"
                                                                style={{ backgroundColor: '#121212' }}
                                                                title="Edit"
                                                            >
                                                                <Edit3 className="w-4 h-4" style={{ color: '#FFB800' }} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleStatus(subscriber.id)}
                                                                className="p-1 rounded transition-colors"
                                                                style={{ backgroundColor: '#121212' }}
                                                                title={subscriber.status === 'active' ? 'Deactivate' : 'Activate'}
                                                            >
                                                                {subscriber.status === 'active' ?
                                                                    <Archive className="w-4 h-4" style={{ color: '#4CAF50' }} /> :
                                                                    <RefreshCw className="w-4 h-4" style={{ color: '#FFB800' }} />
                                                                }
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(subscriber.id)}
                                                                className="p-1 rounded transition-colors"
                                                                style={{ backgroundColor: '#121212' }}
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" style={{ color: '#ff6b6b' }} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 text-center text-sm" style={{ color: '#757575' }}>
                                                    No subscribers found
                                                </td>
                                            </tr>
                                        )
                                    ) : (
                                        users.length > 0 ? (
                                            users.map((user) => (
                                                <tr key={user.id} className="border-t transition-colors duration-300 hover:opacity-70" style={{ borderColor: '#232323' }}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium" style={{ color: '#E0E0E0' }}>{user.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm" style={{ color: '#b0f5e6' }}>{user.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs" style={{ color: user.emailPreferences?.twoFANotifications?.enabled ? '#4CAF50' : '#757575' }}>
                                                                {user.emailPreferences?.twoFANotifications?.enabled ? 'Enabled' : 'Disabled'}
                                                            </span>
                                                            <span className="text-xs capitalize" style={{ color: '#757575' }}>
                                                                {user.emailPreferences?.twoFANotifications?.frequency || 'weekly'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs" style={{ color: user.emailPreferences?.accountChanges?.enabled ? '#4CAF50' : '#757575' }}>
                                                                {user.emailPreferences?.accountChanges?.enabled ? 'Enabled' : 'Disabled'}
                                                            </span>
                                                            <span className="text-xs capitalize" style={{ color: '#757575' }}>
                                                                {user.emailPreferences?.accountChanges?.frequency || 'weekly'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs" style={{ color: user.emailPreferences?.newsletter?.enabled ? '#4CAF50' : '#757575' }}>
                                                                {user.emailPreferences?.newsletter?.enabled ? 'Enabled' : 'Disabled'}
                                                            </span>
                                                            <span className="text-xs capitalize" style={{ color: '#757575' }}>
                                                                {user.emailPreferences?.newsletter?.frequency || 'weekly'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: user.status === 'active' ? '#4CAF5020' : '#75757520', color: user.status === 'active' ? '#4CAF50' : '#757575' }}>
                                                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#757575' }}>
                                                        {new Date(user.joinedDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleView(user)}
                                                                className="p-1 rounded transition-colors"
                                                                style={{ backgroundColor: '#121212' }}
                                                                title="View"
                                                            >
                                                                <Eye className="w-4 h-4" style={{ color: '#00FFC6' }} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(user)}
                                                                className="p-1 rounded transition-colors"
                                                                style={{ backgroundColor: '#121212' }}
                                                                title="Edit"
                                                            >
                                                                <Edit3 className="w-4 h-4" style={{ color: '#FFB800' }} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(user.id)}
                                                                className="p-1 rounded transition-colors"
                                                                style={{ backgroundColor: '#121212' }}
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" style={{ color: '#ff6b6b' }} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-4 text-center text-sm" style={{ color: '#757575' }}>
                                                    No users found
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3 flex items-center justify-between border-t sm:px-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-all"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-all"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm" style={{ color: '#b0f5e6' }}>
                                        Showing <span className="font-medium">{(currentPage - 1) * subscribersPerPage + 1}</span> to{' '}
                                        <span className="font-medium">{(currentPage - 1) * subscribersPerPage + (selectedSource === 'newsletter' ? subscribers.length : users.length)}</span> of{' '}
                                        <span className="font-medium">{totalCount}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium transition-all"
                                            style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                        >
                                            <span className="sr-only">Previous</span>
                                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className="relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all"
                                                style={{
                                                    backgroundColor: currentPage === i + 1 ? '#00FFC6' : '#121212',
                                                    borderColor: currentPage === i + 1 ? '#00FFC6' : '#232323',
                                                    color: currentPage === i + 1 ? '#121212' : '#E0E0E0'
                                                }}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium transition-all"
                                            style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                        >
                                            <span className="sr-only">Next</span>
                                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 overflow-y-auto h-full w-full z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} role="dialog" aria-modal="true" aria-labelledby="modalTitle">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-xl" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 id="modalTitle" className="text-lg font-medium" style={{ color: '#E0E0E0' }}>
                                    {editingItem ? 'Edit' : 'Create'} {selectedSource === 'newsletter' ? 'Subscriber' : 'User'}
                                </h3>
                                <button
                                    onClick={handleCancel}
                                    className="p-1 rounded-lg"
                                    style={{ backgroundColor: '#232323' }}
                                >
                                    <X className="w-6 h-6" style={{ color: '#E0E0E0' }} />
                                </button>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target as HTMLFormElement);
                                const data: any = {};

                                if (selectedSource === 'newsletter') {
                                    data.name = formData.get('name');
                                    data.email = formData.get('email');
                                    data.interest = formData.get('interest');
                                    data.frequency = formData.get('frequency') || 'weekly';
                                    data.status = formData.get('status') || 'active';
                                    data.source = 'newsletter';
                                    if (formData.get('subscriptionDate')) {
                                        data.subscriptionDate = formData.get('subscriptionDate');
                                    }
                                } else {
                                    data.name = formData.get('name');
                                    data.email = formData.get('email');
                                    data.status = formData.get('status') || 'active';
                                    data.password = formData.get('password'); // Only for new users
                                    data.emailPreferences = {
                                        twoFANotifications: {
                                            enabled: formData.get('twoFAEnabled') === 'on',
                                            frequency: formData.get('twoFAFrequency') || 'weekly'
                                        },
                                        accountChanges: {
                                            enabled: formData.get('accountChangesEnabled') === 'on',
                                            frequency: formData.get('accountChangesFrequency') || 'weekly'
                                        },
                                        newsletter: {
                                            enabled: formData.get('newsletterEnabled') === 'on',
                                            frequency: formData.get('newsletterFrequency') || 'weekly'
                                        }
                                    };
                                }

                                handleSave(data);
                            }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            defaultValue={editingItem?.name || ''}
                                            required
                                            className="w-full p-3 rounded-lg border"
                                            style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            defaultValue={editingItem?.email || ''}
                                            required
                                            className="w-full p-3 rounded-lg border"
                                            style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                        />
                                    </div>

                                    {selectedSource === 'newsletter' ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Interest</label>
                                                <select
                                                    name="interest"
                                                    defaultValue={editingItem?.interest || ''}
                                                    required
                                                    className="w-full p-3 rounded-lg border"
                                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                                >
                                                    <option value="">Select Interest</option>
                                                    {interestOptions.map(option => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Frequency</label>
                                                <select
                                                    name="frequency"
                                                    defaultValue={editingItem?.frequency || 'weekly'}
                                                    className="w-full p-3 rounded-lg border"
                                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                                >
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                </select>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {!editingItem && (
                                                <div>
                                                    <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Password</label>
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        required={!editingItem}
                                                        className="w-full p-3 rounded-lg border"
                                                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                                    />
                                                </div>
                                            )}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Email Preferences</label>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 border rounded-lg" style={{ backgroundColor: '#121212', borderColor: '#232323' }}>
                                                        <div>
                                                            <label className="text-sm font-medium" style={{ color: '#E0E0E0' }}>2FA Notifications</label>
                                                            <p className="text-xs" style={{ color: '#757575' }}>Receive notifications about 2FA activities</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                name="twoFAEnabled"
                                                                defaultChecked={editingItem?.emailPreferences?.twoFANotifications?.enabled || false}
                                                                className="rounded"
                                                                style={{ accentColor: '#00FFC6' }}
                                                            />
                                                            <select
                                                                name="twoFAFrequency"
                                                                defaultValue={editingItem?.emailPreferences?.twoFANotifications?.frequency || 'weekly'}
                                                                className="text-sm rounded px-2 py-1"
                                                                style={{ backgroundColor: '#232323', borderColor: '#232323', color: '#E0E0E0' }}
                                                            >
                                                                <option value="daily">Daily</option>
                                                                <option value="weekly">Weekly</option>
                                                                <option value="monthly">Monthly</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 border rounded-lg" style={{ backgroundColor: '#121212', borderColor: '#232323' }}>
                                                        <div>
                                                            <label className="text-sm font-medium" style={{ color: '#E0E0E0' }}>Account Changes</label>
                                                            <p className="text-xs" style={{ color: '#757575' }}>Receive notifications about account modifications</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                name="accountChangesEnabled"
                                                                defaultChecked={editingItem?.emailPreferences?.accountChanges?.enabled || true}
                                                                className="rounded"
                                                                style={{ accentColor: '#00FFC6' }}
                                                            />
                                                            <select
                                                                name="accountChangesFrequency"
                                                                defaultValue={editingItem?.emailPreferences?.accountChanges?.frequency || 'weekly'}
                                                                className="text-sm rounded px-2 py-1"
                                                                style={{ backgroundColor: '#232323', borderColor: '#232323', color: '#E0E0E0' }}
                                                            >
                                                                <option value="daily">Daily</option>
                                                                <option value="weekly">Weekly</option>
                                                                <option value="monthly">Monthly</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 border rounded-lg" style={{ backgroundColor: '#121212', borderColor: '#232323' }}>
                                                        <div>
                                                            <label className="text-sm font-medium" style={{ color: '#E0E0E0' }}>Newsletter</label>
                                                            <p className="text-xs" style={{ color: '#757575' }}>Receive project updates and blogs</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                name="newsletterEnabled"
                                                                defaultChecked={editingItem?.emailPreferences?.newsletter?.enabled || true}
                                                                className="rounded"
                                                                style={{ accentColor: '#00FFC6' }}
                                                            />
                                                            <select
                                                                name="newsletterFrequency"
                                                                defaultValue={editingItem?.emailPreferences?.newsletter?.frequency || 'weekly'}
                                                                className="text-sm rounded px-2 py-1"
                                                                style={{ backgroundColor: '#232323', borderColor: '#232323', color: '#E0E0E0' }}
                                                            >
                                                                <option value="daily">Daily</option>
                                                                <option value="weekly">Weekly</option>
                                                                <option value="monthly">Monthly</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Status</label>
                                        <select
                                            name="status"
                                            defaultValue={editingItem?.status || 'active'}
                                            className="w-full p-3 rounded-lg border"
                                            style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            {selectedSource === 'newsletter' && <option value="unsubscribed">Unsubscribed</option>}
                                        </select>
                                    </div>

                                    {selectedSource === 'newsletter' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Subscription Date</label>
                                            <input
                                                type="date"
                                                name="subscriptionDate"
                                                defaultValue={editingItem?.subscriptionDate || new Date().toISOString().split('T')[0]}
                                                className="w-full p-3 rounded-lg border"
                                                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 rounded-lg border text-sm font-medium transition-all"
                                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2"
                                        style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                                    >
                                        {isSubmitting ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        <span>{isSubmitting ? 'Saving...' : (editingItem ? 'Update' : 'Create')}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && viewingItem && (
                <div className="fixed inset-0 overflow-y-auto h-full w-full z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} role="dialog" aria-modal="true">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-xl" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium" style={{ color: '#E0E0E0' }}>
                                    View {selectedSource === 'newsletter' ? 'Subscriber' : 'User'}
                                </h3>
                                <button
                                    onClick={handleCancel}
                                    className="p-1 rounded-lg"
                                    style={{ backgroundColor: '#232323' }}
                                >
                                    <X className="w-6 h-6" style={{ color: '#E0E0E0' }} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Name</label>
                                        <p className="text-sm" style={{ color: '#E0E0E0' }}>{viewingItem.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Email</label>
                                        <p className="text-sm" style={{ color: '#E0E0E0' }}>{viewingItem.email}</p>
                                    </div>

                                    {selectedSource === 'newsletter' ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Interest</label>
                                                <p className="text-sm" style={{ color: '#E0E0E0' }}>{viewingItem.interestLabel || viewingItem.interest}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Frequency</label>
                                                <p className="text-sm capitalize" style={{ color: '#E0E0E0' }}>{viewingItem.frequency}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Subscription Date</label>
                                                <p className="text-sm" style={{ color: '#E0E0E0' }}>{new Date(viewingItem.subscriptionDate).toLocaleDateString()}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Joined Date</label>
                                                <p className="text-sm" style={{ color: '#E0E0E0' }}>{new Date(viewingItem.joinedDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Last Login</label>
                                                <p className="text-sm" style={{ color: '#E0E0E0' }}>{new Date(viewingItem.lastLogin).toLocaleDateString()}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>Email Preferences</label>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: '#121212' }}>
                                                        <span className="text-sm" style={{ color: '#E0E0E0' }}>2FA Notifications:</span>
                                                        <span className="text-sm" style={{ color: viewingItem.emailPreferences?.twoFANotifications?.enabled ? '#4CAF50' : '#757575' }}>
                                                            {viewingItem.emailPreferences?.twoFANotifications?.enabled ? 'Enabled' : 'Disabled'}
                                                            ({viewingItem.emailPreferences?.twoFANotifications?.frequency || 'weekly'})
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: '#121212' }}>
                                                        <span className="text-sm" style={{ color: '#E0E0E0' }}>Account Changes:</span>
                                                        <span className="text-sm" style={{ color: viewingItem.emailPreferences?.accountChanges?.enabled ? '#4CAF50' : '#757575' }}>
                                                            {viewingItem.emailPreferences?.accountChanges?.enabled ? 'Enabled' : 'Disabled'}
                                                            ({viewingItem.emailPreferences?.accountChanges?.frequency || 'weekly'})
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: '#121212' }}>
                                                        <span className="text-sm" style={{ color: '#E0E0E0' }}>Newsletter:</span>
                                                        <span className="text-sm" style={{ color: viewingItem.emailPreferences?.newsletter?.enabled ? '#4CAF50' : '#757575' }}>
                                                            {viewingItem.emailPreferences?.newsletter?.enabled ? 'Enabled' : 'Disabled'}
                                                            ({viewingItem.emailPreferences?.newsletter?.frequency || 'weekly'})
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Status</label>
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: viewingItem.status === 'active' ? '#4CAF5020' : '#75757520', color: viewingItem.status === 'active' ? '#4CAF50' : '#757575' }}>
                                            {viewingItem.status.charAt(0).toUpperCase() + viewingItem.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 rounded-lg border text-sm font-medium transition-all"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        handleCancel();
                                        handleEdit(viewingItem);
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2"
                                    style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                                >
                                    <Edit3 className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}