'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Plus, Edit3, Trash2, Save, X, Search, Filter, ChevronLeft, ChevronRight, UserCircle, CheckCircle, AlertTriangle, Lock, Unlock, History, Eye, EyeOff, Shield, AlertCircle, RefreshCw, Send } from 'lucide-react';

interface UserData {
    id: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    address: {
        street: string;
        addressLine2?: string;
        city: string;
        stateProvince?: string;
        country: string;
        postalCode: string;
    };
    registrationDate: string;
    lastLogin: string;
    status: 'active' | 'inactive' | 'suspended';
    role: 'user' | 'admin' | 'moderator';
    emailOtpEnabled?: boolean;
    twoFactorEnabled?: boolean;
}

// Default mock users removed. Data is loaded from the API at runtime.

const emptyUser: UserData = {
    id: '',
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: {
        street: '',
        addressLine2: '',
        city: '',
        stateProvince: '',
        country: '',
        postalCode: ''
    },
    registrationDate: new Date().toISOString().split('T')[0],
    lastLogin: '',
    status: 'active',
    role: 'user'
};

export default function AdminUsers() {
    const [isMounted, setIsMounted] = useState(false);
    const [users, setUsers] = useState<UserData[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [isCreating, setIsCreating] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState<UserData>(emptyUser);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [showLoginHistory, setShowLoginHistory] = useState(false);
    const [loginHistoryUser, setLoginHistoryUser] = useState<UserData | null>(null);
    const [loginHistory, setLoginHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showManage2FA, setShowManage2FA] = useState(false);
    const [manage2FAUser, setManage2FAUser] = useState<UserData | null>(null);
    const [twoFASettings, setTwoFASettings] = useState({ email: false, qrCode: false });

    useEffect(() => {
        setIsMounted(true);
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            setIsLoading(true);
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            const res = await fetch('/api/admin/users', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });
            if (!res.ok) {
                if (res.status === 401) {
                    if (typeof window !== 'undefined') window.location.href = '/admin-auth';
                    return;
                }
                throw new Error('Failed to fetch users');
            }
            const data = await res.json();
            console.log('Loaded users data:', data); // Debug log to see what's being loaded
            if (data.users && Array.isArray(data.users)) {
                setUsers(data.users);
                setFilteredUsers(data.users);
            } else {
                console.error('Unexpected data format:', data);
                setUsers([]);
                setFilteredUsers([]);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            setNotification({ message: 'Failed to load users', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        let result = users;

        // Apply search filter
        if (searchTerm) {
            result = result.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone.includes(searchTerm)
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(user => user.status === statusFilter);
        }

        // Apply role filter
        if (roleFilter !== 'all') {
            result = result.filter(user => user.role === roleFilter);
        }

        setFilteredUsers(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [users, searchTerm, statusFilter, roleFilter]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'dateOfBirth') {
            setFormData(prev => ({
                ...prev,
                dateOfBirth: value
            }));
        } else if (name.includes('address.')) {
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

        // Address validation
        if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
        if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
        if (!formData.address.country.trim()) newErrors['address.country'] = 'Country is required';
        if (!formData.address.postalCode.trim()) newErrors['address.postalCode'] = 'Postal code is required';

        // Password validation for new users
        if (isCreating && !password.trim()) newErrors.password = 'Password is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreate = () => {
        setIsCreating(true);
        setFormData(emptyUser);
        setPassword('');
        setErrors({});
    };

    const handleEdit = (user: UserData) => {
        setEditingUserId(user.id);
        setFormData({ ...emptyUser, ...user });
        setPassword('');
        setErrors({});
    };

    const handleSave = async () => {
        if (validateForm()) {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            try {
                if (isCreating) {
                    // Create new user
                    const payload = {
                        name: formData.name,
                        email: formData.email,
                        password,
                        role: formData.role,
                        phone: formData.phone,
                        dateOfBirth: formData.dateOfBirth || undefined,
                        address: formData.address,
                        status: formData.status
                    };
                    await axios.post('/api/admin/users', payload, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    showNotification('User created successfully');
                    setIsCreating(false);
                } else {
                    // Update existing user
                    const { id, registrationDate, lastLogin, ...updateData } = formData;
                    if (password) (updateData as any).password = password;
                    await axios.put(`/api/admin/users/${editingUserId}`, updateData, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    showNotification('User updated successfully');
                    setEditingUserId(null);
                }
                loadUsers();
                setPassword('');
            } catch (error) {
                showNotification(isCreating ? 'Failed to create user' : 'Failed to update user', 'error');
            }
        }
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingUserId(null);
        setFormData(emptyUser);
        setPassword('');
        setErrors({});
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
                await axios.delete(`/api/admin/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                showNotification('User deleted successfully');
                loadUsers();
            } catch (error) {
                showNotification('Failed to delete user', 'error');
            }
        }
    };

    const handleToggleStatus = async (userId: string) => {
        try {
            const user = Array.isArray(users) ? users.find(u => u.id === userId) : null;
            if (!user) return;
            const newStatus = user.status === 'active' ? 'inactive' : 'active';
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            await axios.put(`/api/admin/users/${userId}`, { status: newStatus }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            showNotification(`User status updated to ${newStatus}`);
            loadUsers();
        } catch (error) {
            showNotification('Failed to update user status', 'error');
        }
    };

    const handleViewLoginHistory = async (user: UserData) => {
        setLoginHistoryUser(user);
        setShowLoginHistory(true);
        setLoadingHistory(true);
        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            const res = await fetch(`/api/admin/users/${user.id}/login-history`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
            });
            if (res.ok) {
                const data = await res.json();
                setLoginHistory(data);
            } else {
                setLoginHistory([]);
            }
        } catch (error) {
            console.error('Error fetching login history:', error);
            setLoginHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleManage2FA = (user: UserData) => {
        setManage2FAUser(user);
        setTwoFASettings({
            email: user.emailOtpEnabled || false,
            qrCode: user.twoFactorEnabled || false
        });
        setShowManage2FA(true);
    };

    const handleToggle2FA = async (method: 'email' | 'qrCode') => {
        if (!manage2FAUser) return;

        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            let endpoint = '';
            let body: any = { userId: manage2FAUser.id };

            if (method === 'email') {
                endpoint = twoFASettings.email ? '/api/admin/2fa/disable' : '/api/admin/2fa/enable';
                body.type = 'email';
            } else if (method === 'qrCode') {
                endpoint = twoFASettings.qrCode ? '/api/admin/2fa/disable' : '/api/admin/2fa/enable';
                body.type = 'totp';
            }

            console.log('Making 2FA request:', { endpoint, body }); // Debug log

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP ${res.status}`);
            }

            const responseData = await res.json();
            console.log('2FA response:', responseData); // Debug log

            // Update local state
            setTwoFASettings(prev => ({ ...prev, [method]: !prev[method] }));

            // Update the manage2FAUser state to reflect the change
            setManage2FAUser(prev => {
                if (!prev) return prev;
                const updated = { ...prev };
                if (method === 'email') {
                    updated.emailOtpEnabled = !twoFASettings.email;
                } else if (method === 'qrCode') {
                    updated.twoFactorEnabled = !twoFASettings.qrCode;
                }
                return updated;
            });

            showNotification('2FA updated successfully');

            // Refresh the user list to get the latest data from the database
            loadUsers();
        } catch (error) {
            console.error('2FA toggle error:', error);
            showNotification(`Failed to update 2FA: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
    };

    const handleLogoutSession = async (login: any) => {
        if (!window.confirm('Are you sure you want to logout this session?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : '';
            await axios.post('/api/logout-session', {
                userId: loginHistoryUser?.id,
                sessionData: login
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            showNotification('Session logged out successfully');
            // Refresh login history
            if (loginHistoryUser) {
                await handleViewLoginHistory(loginHistoryUser);
            }
        } catch (error: any) {
            console.error('Error logging out session:', error);
            const errorMessage = error?.response?.data?.error || 'Failed to logout session';
            showNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const filteredUsersLength = Array.isArray(filteredUsers) ? filteredUsers.length : 0;
    const currentUsers = Array.isArray(filteredUsers) ? filteredUsers.slice(indexOfFirstUser, indexOfLastUser) : [];
    const totalPages = Math.ceil(filteredUsersLength / usersPerPage);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return { backgroundColor: '#4CAF5020', color: '#4CAF50' };
            case 'inactive': return { backgroundColor: '#75757520', color: '#757575' };
            case 'suspended': return { backgroundColor: '#ff6b6b20', color: '#ff6b6b' };
            default: return { backgroundColor: '#75757520', color: '#757575' };
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return { backgroundColor: '#FFB80020', color: '#FFB800' };
            case 'moderator': return { backgroundColor: '#00FFC620', color: '#00FFC6' };
            case 'user': return { backgroundColor: '#75757520', color: '#757575' };
            default: return { backgroundColor: '#75757520', color: '#757575' };
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
            {/* Notification */}
            {notification && (
                <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border max-w-sm sm:max-w-md" style={{ backgroundColor: notification.type === 'error' ? '#ff6b6b20' : '#00FFC620', borderColor: notification.type === 'error' ? '#ff6b6b' : '#00FFC6' }}>
                    <div style={{ color: notification.type === 'error' ? '#ff6b6b' : '#00FFC6' }}>
                        {notification.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                    </div>
                    <span className="text-sm sm:text-base break-words" style={{ color: '#E0E0E0' }}>{notification.message}</span>
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)', borderColor: '#232323' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#00FFC6' }}>
                                <UserCircle className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#121212' }} />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-2xl font-bold" style={{ color: '#E0E0E0' }}>
                                    User Management
                                </h1>
                                <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>
                                    Manage users and their permissions
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300"
                            style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                            title="Add new user"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm">New User</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="rounded-xl border p-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="flex items-center">
                            <div className="p-3 rounded-full mr-4" style={{ backgroundColor: '#00FFC620' }}>
                                <User className="w-6 h-6" style={{ color: '#00FFC6' }} />
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#757575' }}>Total Users</p>
                                <p className="text-2xl font-semibold" style={{ color: '#00FFC6' }}>{Array.isArray(users) ? users.length : 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border p-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="flex items-center">
                            <div className="p-3 rounded-full mr-4" style={{ backgroundColor: '#4CAF5020' }}>
                                <CheckCircle className="w-6 h-6" style={{ color: '#4CAF50' }} />
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#757575' }}>Active Users</p>
                                <p className="text-2xl font-semibold" style={{ color: '#4CAF50' }}>
                                    {Array.isArray(users) ? users.filter(u => u.status === 'active').length : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border p-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="flex items-center">
                            <div className="p-3 rounded-full mr-4" style={{ backgroundColor: '#75757520' }}>
                                <AlertTriangle className="w-6 h-6" style={{ color: '#757575' }} />
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#757575' }}>Inactive Users</p>
                                <p className="text-2xl font-semibold" style={{ color: '#757575' }}>
                                    {Array.isArray(users) ? users.filter(u => u.status === 'inactive').length : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border p-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="flex items-center">
                            <div className="p-3 rounded-full mr-4" style={{ backgroundColor: '#FFB80020' }}>
                                <Shield className="w-6 h-6" style={{ color: '#FFB800' }} />
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#757575' }}>Admins</p>
                                <p className="text-2xl font-semibold" style={{ color: '#FFB800' }}>
                                    {Array.isArray(users) ? users.filter(u => u.role === 'admin').length : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-xl border mb-6 p-4" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                />
                                <Search className="absolute left-3 top-3 w-5 h-5" style={{ color: '#757575' }} />
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                        <div className="w-full md:w-48">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                            >
                                <option value="all">All Roles</option>
                                <option value="user">User</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* User Form (for creating/editing) */}
                {(isCreating || editingUserId) && (
                    <div className="rounded-xl border mb-6 p-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <h2 className="text-xl font-semibold mb-4" style={{ color: '#E0E0E0' }}>
                            {isCreating ? 'Create New User' : 'Edit User'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: '#121212', borderColor: errors.name ? '#ff6b6b' : '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                />
                                {errors.name && <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: '#121212', borderColor: errors.email ? '#ff6b6b' : '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                />
                                {errors.email && <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: '#121212', borderColor: errors.phone ? '#ff6b6b' : '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                />
                                {errors.phone && <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                >
                                    <option value="user">User</option>
                                    <option value="moderator">Moderator</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                            {editingUserId && (
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                        New Password (leave blank to keep current)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                            style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-3"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ color: '#757575' }}
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: '#121212', borderColor: errors['address.street'] ? '#ff6b6b' : '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                />
                                {errors['address.street'] && <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{errors['address.street']}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                    Address Line 2 (Apartment, suite, unit)
                                </label>
                                <input
                                    type="text"
                                    name="address.addressLine2"
                                    value={formData.address.addressLine2 || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="address.city"
                                    value={formData.address.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: '#121212', borderColor: errors['address.city'] ? '#ff6b6b' : '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                />
                                {errors['address.city'] && <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{errors['address.city']}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                    State/Province
                                </label>
                                <input
                                    type="text"
                                    name="address.stateProvince"
                                    value={formData.address.stateProvince || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                    Country
                                </label>
                                <input
                                    type="text"
                                    name="address.country"
                                    value={formData.address.country}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: '#121212', borderColor: errors['address.country'] ? '#ff6b6b' : '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                />
                                {errors['address.country'] && <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{errors['address.country']}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                                    Postal Code
                                </label>
                                <input
                                    type="text"
                                    name="address.postalCode"
                                    value={formData.address.postalCode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                    style={{ backgroundColor: '#121212', borderColor: errors['address.postalCode'] ? '#ff6b6b' : '#232323', color: '#E0E0E0', outlineColor: '#00FFC6' }}
                                />
                                {errors['address.postalCode'] && <p className="text-xs mt-1" style={{ color: '#ff6b6b' }}>{errors['address.postalCode']}</p>}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 rounded-lg border text-sm font-medium transition-all"
                                style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                            >
                                <X className="inline mr-2 w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2"
                                style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                            >
                                <Save className="w-4 h-4" />
                                <span>Save</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="rounded-lg overflow-hidden border" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b" style={{ backgroundColor: '#121212', borderColor: '#232323' }}>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                        User
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                        Contact
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                        2FA
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                        Registration
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: '#232323' }}>
                                {currentUsers.length > 0 ? (
                                    currentUsers.map((user) => (
                                        <tr key={user.id} className="transition-all" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#202123')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#181A1B')}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium" style={{ color: '#E0E0E0' }}>{user.name}</div>
                                                <div className="text-sm" style={{ color: '#757575' }}>ID: {user.id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm" style={{ color: '#E0E0E0' }}>{user.email}</div>
                                                <div className="text-sm" style={{ color: '#757575' }}>{user.phone}</div>
                                                <div className="text-sm" style={{ color: '#757575' }}>{user.address ? `${user.address.city}, ${user.address.country}` : 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span style={getRoleColor(user.role)} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span style={getStatusColor(user.status || 'active')} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                                    {(user.status || 'active').charAt(0).toUpperCase() + (user.status || 'active').slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col space-y-1">
                                                    {user.emailOtpEnabled && <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#1e3a8a20', color: '#60a5fa' }}>Email OTP</span>}
                                                    {user.twoFactorEnabled && <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#16a34a20', color: '#4ade80' }}>TOTP</span>}
                                                    {(!user.emailOtpEnabled && !user.twoFactorEnabled) && <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#4b551420', color: '#9ca3af' }}>None</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#757575' }}>
                                                <div style={{ color: '#E0E0E0' }}>{user.registrationDate}</div>
                                                <div className="text-xs">Last login: {user.lastLogin}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        title="Edit"
                                                        className="transition-colors"
                                                        style={{ color: '#FFB800' }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.color = '#FFC633')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.color = '#FFB800')}
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewLoginHistory(user)}
                                                        title="View Login History"
                                                        className="transition-colors"
                                                        style={{ color: '#9D4EDD' }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.color = '#C77DFF')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.color = '#9D4EDD')}
                                                    >
                                                        <History className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id)}
                                                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                                                        className="transition-colors"
                                                        style={{ color: user.status === 'active' ? '#ff6b6b' : '#4CAF50' }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                                    >
                                                        {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleManage2FA(user)}
                                                        title="Manage 2FA"
                                                        className="transition-colors"
                                                        style={{ color: '#00FFC6' }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.color = '#33ffe0')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.color = '#00FFC6')}
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        title="Delete"
                                                        className="transition-colors"
                                                        style={{ color: '#ff6b6b' }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ff8a7f')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.color = '#ff6b6b')}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-sm" style={{ color: '#757575' }}>
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3 flex items-center justify-between border-t sm:px-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                    onMouseEnter={(e) => !(currentPage === 1) && (e.currentTarget.style.backgroundColor = '#202123')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#121212')}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                    onMouseEnter={(e) => !(currentPage === totalPages) && (e.currentTarget.style.backgroundColor = '#202123')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#121212')}
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm" style={{ color: '#E0E0E0' }}>
                                        Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                                        <span className="font-medium">{indexOfLastUser > filteredUsersLength ? filteredUsersLength : indexOfLastUser}</span> of{' '}
                                        <span className="font-medium">{filteredUsersLength}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                            onMouseEnter={(e) => !(currentPage === 1) && (e.currentTarget.style.backgroundColor = '#202123')}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#121212')}
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
                                                onMouseEnter={(e) => currentPage !== i + 1 && (e.currentTarget.style.backgroundColor = '#202123')}
                                                onMouseLeave={(e) => currentPage !== i + 1 && (e.currentTarget.style.backgroundColor = '#121212')}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                            onMouseEnter={(e) => !(currentPage === totalPages) && (e.currentTarget.style.backgroundColor = '#202123')}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#121212')}
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

            {/* Login History Modal */}
            {showLoginHistory && loginHistoryUser && (
                <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-6 border w-11/12 max-w-4xl rounded-xl shadow-2xl" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-medium" style={{ color: '#E0E0E0' }}>
                                    Login History - {loginHistoryUser.name}
                                </h3>
                                <button
                                    onClick={() => setShowLoginHistory(false)}
                                    className="transition-colors"
                                    style={{ color: '#757575' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#E0E0E0')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = '#757575')}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {loadingHistory ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#00FFC6' }}></div>
                                    <p className="mt-4" style={{ color: '#757575' }}>Loading login history...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#232323' }}>
                                    <table className="min-w-full">
                                        <thead style={{ backgroundColor: '#121212', borderColor: '#232323' }}>
                                            <tr className="border-b" style={{ borderColor: '#232323' }}>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                                    Date & Time
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                                    IP Address
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                                    Device
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                                    Location
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b0f5e6' }}>
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: '#232323' }}>
                                            {loginHistory.length > 0 ? (
                                                loginHistory.map((entry: any, index: number) => (
                                                    <tr key={index} className="transition-all" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#202123')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#181A1B')}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#E0E0E0' }}>
                                                            {new Date(entry.timestamp).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#E0E0E0' }}>
                                                            {entry.ip}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#E0E0E0' }}>
                                                            {entry.device}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#E0E0E0' }}>
                                                            {entry.location || 'Unknown'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" style={{
                                                                backgroundColor: entry.loggedOut ? '#4b551420' : entry.success ? '#16a34a20' : '#7f1d1d20',
                                                                color: entry.loggedOut ? '#9ca3af' : entry.success ? '#4ade80' : '#fca5a5'
                                                            }}>
                                                                {entry.loggedOut ? 'Logged Out' : entry.success ? 'Success' : 'Failed'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            {entry.success && !entry.loggedOut && (
                                                                <button
                                                                    onClick={() => handleLogoutSession(entry)}
                                                                    className="transition-colors"
                                                                    style={{ color: '#ff6b6b' }}
                                                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ff8a7f')}
                                                                    onMouseLeave={(e) => (e.currentTarget.style.color = '#ff6b6b')}
                                                                    disabled={isLoading}
                                                                >
                                                                    Logout
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-4 text-center text-sm" style={{ color: '#757575' }}>
                                                        No login history available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Manage 2FA Modal */}
            {showManage2FA && manage2FAUser && (
                <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-6 border w-11/12 max-w-md rounded-xl shadow-2xl" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-medium" style={{ color: '#E0E0E0' }}>
                                    Manage 2FA - {manage2FAUser.name}
                                </h3>
                                <button
                                    onClick={() => setShowManage2FA(false)}
                                    className="transition-colors"
                                    style={{ color: '#757575' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#E0E0E0')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = '#757575')}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Email OTP */}
                                <div className="flex items-center justify-between p-4 rounded-lg border transition-all" style={{ backgroundColor: '#121212', borderColor: '#232323' }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00FFC6')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#232323')}>
                                    <div>
                                        <h4 className="font-medium" style={{ color: '#E0E0E0' }}>Email OTP</h4>
                                        <p className="text-sm" style={{ color: '#757575' }}>Send OTP to email</p>
                                    </div>
                                    <button
                                        onClick={() => handleToggle2FA('email')}
                                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all"
                                        style={{ backgroundColor: twoFASettings.email ? '#00FFC6' : '#404040' }}
                                    >
                                        <span className={`inline-block h-4 w-4 rounded-full transition-all ${twoFASettings.email ? 'translate-x-6' : 'translate-x-1'}`} style={{ backgroundColor: '#181A1B' }} />
                                    </button>
                                </div>

                                {/* TOTP */}
                                <div className="flex items-center justify-between p-4 rounded-lg border transition-all" style={{ backgroundColor: '#121212', borderColor: '#232323' }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00FFC6')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#232323')}>
                                    <div>
                                        <h4 className="font-medium" style={{ color: '#E0E0E0' }}>TOTP</h4>
                                        <p className="text-sm" style={{ color: '#757575' }}>Time-based one-time password</p>
                                    </div>
                                    <button
                                        onClick={() => handleToggle2FA('qrCode')}
                                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all"
                                        style={{ backgroundColor: twoFASettings.qrCode ? '#00FFC6' : '#404040' }}
                                    >
                                        <span className={`inline-block h-4 w-4 rounded-full transition-all ${twoFASettings.qrCode ? 'translate-x-6' : 'translate-x-1'}`} style={{ backgroundColor: '#181A1B' }} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setShowManage2FA(false)}
                                    className="px-4 py-2 rounded-lg border font-medium transition-all"
                                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#202123')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#121212')}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}