'use client';
import React, { useState, useEffect } from 'react';
import {
    Users,
    FolderOpen,
    MessageSquare,
    TrendingUp,
    Activity,
    Clock,
    RefreshCw,
    User,
    GraduationCap,
    AlertCircle,
    CheckCircle,
    Eye,
    Download,
    DollarSign,
    FileText,
    Mail
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardStats {
    totalProjects: number;
    publishedProjects: number;
    draftProjects: number;
    pendingProjects: number;
    totalContacts: number;
    newContacts: number;
    starredContacts: number;
    repliedContacts: number;
    monthlyViews: number;
    weeklyGrowth: number;
    totalUsers: number;
    activeUsers: number;
    totalBlogPosts: number;
    publishedBlogPosts: number;
    totalRevenue: string;
    totalLoginAttempts: number;
    successfulLogins: number;
    failedLogins: number;
    loginSuccessRate: number;
    paidProjects: number;
    freeProjects: number;
    averageProjectPrice: string;
    totalProjectRevenue: string;
    totalDownloads: number;
    avgProjectsPerUser: string;
    avgContactsPerDay: string;
    totalBlogViews: number;
    avgEngagementRate: string;
    conversionRate: string;
}

interface Project {
    _id: string;
    id?: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    tags: string[];
    image?: string;
    github?: string;
    demo?: string;
    kaggle?: string;
    linkedin?: string;
    demo2?: string;
    published: boolean;
    created_at: string | Date;
    updated_at: string | Date;
    richDescription?: string;
    price?: number;
    currency?: string;
    isPaid?: boolean;
    zipUrl?: string;
    downloadLimit?: number;
    downloadCount?: number;
    isPaidAfterLimit?: boolean;
}

interface RecentActivity {
    id: string;
    type: 'contact' | 'project' | 'payment' | 'blog' | 'newsletter' | 'account' | 'user';
    title: string;
    description: string;
    timestamp: string | Date;
    status?: string;
    metadata?: any;
}

interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalProjects: 0,
        publishedProjects: 0,
        draftProjects: 0,
        pendingProjects: 0,
        totalContacts: 0,
        newContacts: 0,
        starredContacts: 0,
        repliedContacts: 0,
        monthlyViews: 0,
        weeklyGrowth: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalBlogPosts: 0,
        publishedBlogPosts: 0,
        totalRevenue: '0.00',
        totalLoginAttempts: 0,
        successfulLogins: 0,
        failedLogins: 0,
        loginSuccessRate: 0,
        paidProjects: 0,
        freeProjects: 0,
        averageProjectPrice: '0.00',
        totalProjectRevenue: '0.00',
        totalDownloads: 0,
        avgProjectsPerUser: '0',
        avgContactsPerDay: '0',
        totalBlogViews: 0,
        avgEngagementRate: '0',
        conversionRate: '0'
    });

    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
    const [activeTab, setActiveTab] = useState('projects');

    const [projectTrendData, setProjectTrendData] = useState<any[]>([]);
    const [contactTrendData, setContactTrendData] = useState<any[]>([]);
    const [viewsTrendData, setViewsTrendData] = useState<any[]>([]);
    const [projectStatusData, setProjectStatusData] = useState<any[]>([]);
    const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [projectDetails, setProjectDetails] = useState<any[]>([]);
    const [revenueByCategory, setRevenueByCategory] = useState<any[]>([]);
    const [contactsByType, setContactsByType] = useState<any[]>([]);
    const [paymentStatusBreakdown, setPaymentStatusBreakdown] = useState<any[]>([]);

    // New state variables for additional data
    const [blogsData, setBlogsData] = useState<any[]>([]);
    const [newsletterData, setNewsletterData] = useState<any[]>([]);
    const [accountsData, setAccountsData] = useState<any[]>([]);
    const [accountPaymentsData, setAccountPaymentsData] = useState<any[]>([]);
    const [usersData, setUsersData] = useState<any[]>([]);
    const [projectPaymentsData, setProjectPaymentsData] = useState<any[]>([]);

    // New state variables for trend data
    const [blogTrendData, setBlogTrendData] = useState<any[]>([]);
    const [newsletterTrendData, setNewsletterTrendData] = useState<any[]>([]);
    const [accountPaymentsTrendData, setAccountPaymentsTrendData] = useState<any[]>([]);
    const [userTrendData, setUserTrendData] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTimeframe]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // Get token from localStorage
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

            if (!token) {
                // No token found, redirect to login
                if (typeof window !== 'undefined') {
                    window.location.href = '/admin-auth';
                }
                return;
            }

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            // Fetch all data in parallel
            const [statsRes, projectsRes, contactsRes, paymentsRes, blogsRes, newsletterRes, accountsRes, accountPaymentsRes, usersRes, projectPaymentsRes] = await Promise.all([
                fetch('/api/admin/stats', { headers }),
                fetch('/api/projects', { headers }),
                fetch('/api/contact', { headers }),
                fetch('/api/admin/payments', { headers }).catch(() => null),
                fetch('/api/admin/blog', { headers }).catch(() => null),
                fetch('/api/admin/newsletter/subscribers', { headers }).catch(() => null),
                fetch('/api/accounts', { headers }).catch(() => null),
                fetch('/api/account-payments', { headers }).catch(() => null),
                fetch('/api/users', { headers }).catch(() => null),
                fetch('/api/projectpayments', { headers }).catch(() => null)
            ]);

            // Check for authentication errors
            if (projectsRes.status === 401 || contactsRes.status === 401) {
                // Token is invalid or expired, clear storage and redirect
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('token');
                    window.localStorage.removeItem('role');
                    window.localStorage.removeItem('userId');
                    window.location.href = '/admin-auth';
                }
                return;
            }

            // Check for forbidden errors
            if (projectsRes.status === 403 || contactsRes.status === 403) {
                // User is not admin, redirect to home
                if (typeof window !== 'undefined') {
                    window.location.href = '/';
                }
                return;
            }

            const [statsData, projectsData, contactsData, paymentsData, blogsData, newsletterData, accountsData, accountPaymentsData, usersData, projectPaymentsData] = await Promise.all([
                statsRes.json(),
                projectsRes.json(),
                contactsRes.json(),
                paymentsRes ? paymentsRes.json().catch(() => ({ results: [] })) : { results: [] },
                blogsRes ? blogsRes.json().catch(() => ({ results: [] })) : { results: [] },
                newsletterRes ? newsletterRes.json().catch(() => ({ results: [] })) : { results: [] },
                accountsRes ? accountsRes.json().catch(() => ({ results: [] })) : { results: [] },
                accountPaymentsRes ? accountPaymentsRes.json().catch(() => ({ results: [] })) : { results: [] },
                usersRes ? usersRes.json().catch(() => ({ results: [] })) : { results: [] },
                projectPaymentsRes ? projectPaymentsRes.json().catch(() => ({ results: [] })) : { results: [] }
            ]);

            // Use stats from API
            const summary = statsData.summary;

            // Projects with enhanced data
            const projects = projectsData.results || [];
            const allProjectsData = projects;
            setAllProjects(projects);

            const totalProjects = projects.length;
            const publishedProjects = projects.filter((p: any) => p.published).length;
            const draftProjects = projects.filter((p: any) => !p.published).length;

            // Pending projects - those that are draft/unpublished
            const pending = projects.filter((p: any) => !p.published);
            setPendingProjects(pending);
            const pendingProjectCount = pending.length;

            // Paid vs Free Projects
            const paidProjectCount = projects.filter((p: any) => p.isPaid || (p.price && p.price > 0)).length;
            const freeProjectCount = totalProjects - paidProjectCount;

            // Contacts
            const contacts = Array.isArray(contactsData) ? contactsData : [];
            const totalContacts = contacts.length;
            const newContacts = contacts.filter((c: any) => c.status === 'new').length;
            const starredContacts = contacts.filter((c: any) => c.starred || c.is_starred).length;

            // Blogs - API returns array directly
            const blogs = Array.isArray(blogsData) ? blogsData : [];
            const totalBlogs = blogs.length;
            const publishedBlogs = blogs.filter((b: any) => b.published).length;

            // Newsletter - API returns { subscribers, total, page, totalPages }
            const newsletter = Array.isArray(newsletterData) ? newsletterData : (newsletterData.subscribers || []);
            const totalNewsletterSubs = newsletter.length;

            // Accounts - API returns array directly
            const accounts = Array.isArray(accountsData) ? accountsData : [];
            const totalAccounts = accounts.length;

            // Account Payments - API returns { payments, activeSubscription }
            const accountPayments = Array.isArray(accountPaymentsData) ? accountPaymentsData : (accountPaymentsData.payments || []);

            // Users - API returns array directly
            const users = Array.isArray(usersData) ? usersData : [];
            const totalUsers = users.length;

            // Project Payments - API returns array directly
            const projectPayments = Array.isArray(projectPaymentsData) ? projectPaymentsData : [];

            // Monthly Views (from contacts)
            const monthlyViews = totalContacts;

            // Weekly Growth (% change in projects/contacts in last 7 days)
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const projectsLastWeek = projects.filter((p: any) => new Date(p.created_at) > weekAgo).length;
            const contactsLastWeek = contacts.filter((c: any) => new Date(c.createdAt) > weekAgo).length;
            const totalLastWeek = projectsLastWeek + contactsLastWeek;
            const weeklyGrowth = totalLastWeek > 0 ? ((totalLastWeek / (totalProjects + totalContacts - totalLastWeek)) * 100) : 0;

            // Calculate total revenue from payments
            const payments = paymentsData.results || [];
            const successfulPayments = payments.filter((p: any) => p.status === 'completed' || p.status === 'success');
            const totalRevenueValue = successfulPayments
                .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
                .toFixed(2);

            // Detailed project revenue from paid projects
            const paidProjectsData = projects.filter((p: any) => p.isPaid || (p.price && p.price > 0));
            const totalProjectRevenue = paidProjectsData
                .reduce((sum: number, p: any) => sum + (p.price || 0), 0)
                .toFixed(2);
            const averageProjectPrice = paidProjectCount > 0 ? (Number(totalProjectRevenue) / paidProjectCount).toFixed(2) : '0.00';

            // Contact engagement metrics
            const repliedContacts = contacts.filter((c: any) => c.status === 'replied').length;
            const contactResponseRate = totalContacts > 0 ? ((repliedContacts / totalContacts) * 100).toFixed(1) : '0';

            // Average contacts per day
            const daysWithContacts = 30;
            const avgContactsPerDay = (totalContacts / daysWithContacts).toFixed(2);

            // Download metrics (sum of downloadCount from projects)
            const totalDownloads = projects.reduce((sum: number, p: any) => sum + (p.downloadCount || 0), 0);

            // Engagement rate (views + contacts + downloads as proxy)
            const totalEngagementActions = totalContacts + totalDownloads;
            const avgEngagementRate = totalProjects > 0 ? (totalEngagementActions / totalProjects).toFixed(1) : '0';

            // Conversion rate (successful payments / total contacts)
            const conversionRate = totalContacts > 0 ? ((successfulPayments.length / totalContacts) * 100).toFixed(1) : '0';

            // Average projects per user
            const avgProjectsPerUser = summary.totalUsers > 0 ? (totalProjects / summary.totalUsers).toFixed(2) : '0';

            setStats({
                totalProjects,
                publishedProjects,
                draftProjects,
                pendingProjects: pendingProjectCount,
                totalContacts,
                newContacts,
                starredContacts,
                repliedContacts,
                monthlyViews,
                weeklyGrowth: Number(weeklyGrowth.toFixed(1)),
                totalUsers,
                activeUsers: summary.activeUsers,
                totalBlogPosts: totalBlogs,
                publishedBlogPosts: publishedBlogs,
                totalRevenue: totalRevenueValue,
                totalLoginAttempts: summary.totalLoginAttempts,
                successfulLogins: summary.successfulLogins,
                failedLogins: summary.failedLogins,
                loginSuccessRate: summary.loginSuccessRate,
                paidProjects: paidProjectCount,
                freeProjects: freeProjectCount,
                averageProjectPrice,
                totalProjectRevenue,
                totalDownloads,
                avgProjectsPerUser,
                avgContactsPerDay,
                totalBlogViews: totalContacts * 2,
                avgEngagementRate,
                conversionRate
            });

            // Set additional data for new tabs
            setBlogsData(blogs);
            setNewsletterData(newsletter);
            setAccountsData(accounts);
            setAccountPaymentsData(accountPayments);
            setUsersData(users);
            setProjectPaymentsData(projectPayments);

            // Project Trend Data (last 4 weeks) - including pending
            const projectTrendData = [];
            for (let i = 3; i >= 0; i--) {
                const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
                const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i - 1) * 7);
                const weekProjects = projects.filter((p: any) => new Date(p.created_at) >= start && new Date(p.created_at) < end);
                projectTrendData.push({
                    name: `Week ${4 - i}`,
                    projects: weekProjects.length,
                    published: weekProjects.filter((p: any) => p.published).length,
                    pending: weekProjects.filter((p: any) => !p.published).length
                });
            }
            setProjectTrendData(projectTrendData);

            // Contact Trend Data (last 7 days)
            const contactTrendData: any[] = [];
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for (let i = 6; i >= 0; i--) {
                const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                const general = contacts.filter((c: any) => {
                    const d = new Date(c.createdAt);
                    return d.getDate() === day.getDate() && d.getMonth() === day.getMonth() && d.getFullYear() === day.getFullYear();
                }).length;
                contactTrendData.push({ name: days[day.getDay()], general });
            }
            setContactTrendData(contactTrendData);

            // Views Trend Data (sum of contacts per week)
            const viewsTrendData = [];
            for (let i = 3; i >= 0; i--) {
                const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
                const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i - 1) * 7);
                const weekContacts = contacts.filter((c: any) => new Date(c.createdAt) >= start && new Date(c.createdAt) < end).length;
                viewsTrendData.push({
                    name: `Week ${4 - i}`,
                    views: weekContacts
                });
            }
            setViewsTrendData(viewsTrendData);

            // Blog Trend Data (last 4 weeks)
            const blogTrendData = [];
            for (let i = 3; i >= 0; i--) {
                const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
                const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i - 1) * 7);
                const weekBlogs = blogs.filter((b: any) => new Date(b.createdAt || b.created_at || b.date) >= start && new Date(b.createdAt || b.created_at || b.date) < end);
                blogTrendData.push({
                    name: `Week ${4 - i}`,
                    blogs: weekBlogs.length,
                    published: weekBlogs.filter((b: any) => b.published).length,
                    drafts: weekBlogs.filter((b: any) => !b.published).length
                });
            }
            setBlogTrendData(blogTrendData);

            // Newsletter Trend Data (last 7 days)
            const newsletterTrendData: any[] = [];
            for (let i = 6; i >= 0; i--) {
                const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                const subscriptions = newsletter.filter((s: any) => {
                    const d = new Date(s.createdAt || s.created_at || s.subscribedAt);
                    return d.getDate() === day.getDate() && d.getMonth() === day.getMonth() && d.getFullYear() === day.getFullYear();
                }).length;
                newsletterTrendData.push({ name: days[day.getDay()], subscriptions });
            }
            setNewsletterTrendData(newsletterTrendData);

            // Account Payments Trend Data (last 4 weeks)
            const accountPaymentsTrendData = [];
            for (let i = 3; i >= 0; i--) {
                const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
                const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i - 1) * 7);
                const weekPayments = accountPayments.filter((p: any) => new Date(p.createdAt || p.created_at) >= start && new Date(p.createdAt || p.created_at) < end);
                const totalAmount = weekPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
                accountPaymentsTrendData.push({
                    name: `Week ${4 - i}`,
                    payments: weekPayments.length,
                    amount: totalAmount
                });
            }
            setAccountPaymentsTrendData(accountPaymentsTrendData);

            // Project Status Data - Published, Draft/Pending, Paid, Free
            setProjectStatusData([
                { name: 'Published', value: publishedProjects, color: '#00FFC6' },
                { name: 'Pending', value: pendingProjectCount, color: '#FFB800' },
                { name: 'Paid', value: paidProjectCount, color: '#7ED321' },
                { name: 'Free', value: freeProjectCount, color: '#4A90E2' }
            ]);

            // Revenue by Category
            const categoryRevenue: { [key: string]: number } = {};
            projects.forEach((p: any) => {
                const cat = p.category || 'Uncategorized';
                categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (p.price || 0);
            });
            const revenueByCateg = Object.entries(categoryRevenue).map(([category, revenue]) => ({
                name: category,
                revenue: revenue as number,
                projects: projects.filter((p: any) => p.category === category).length
            })).sort((a, b) => b.revenue - a.revenue);
            setRevenueByCategory(revenueByCateg);

            // Contacts by Type/Status
            const contactsStatus: { [key: string]: number } = { new: 0, read: 0, replied: 0, starred: 0 };
            contacts.forEach((c: any) => {
                if (c.status === 'new') contactsStatus.new++;
                if (c.status === 'read') contactsStatus.read++;
                if (c.status === 'replied') contactsStatus.replied++;
                if (c.starred || c.is_starred) contactsStatus.starred++;
            });
            setContactsByType([
                { name: 'New', value: contactsStatus.new, color: '#FFB800' },
                { name: 'Read', value: contactsStatus.read, color: '#4A90E2' },
                { name: 'Replied', value: contactsStatus.replied, color: '#7ED321' },
                { name: 'Starred', value: contactsStatus.starred, color: '#E91E63' }
            ]);

            // Payment Status Breakdown
            const paymentStatuses: { [key: string]: number } = {};
            payments.forEach((p: any) => {
                const status = p.status || 'unknown';
                paymentStatuses[status] = (paymentStatuses[status] || 0) + 1;
            });
            const paymentBreakdown = Object.entries(paymentStatuses).map(([status, count]) => ({
                name: status.charAt(0).toUpperCase() + status.slice(1),
                value: count as number,
                color: status === 'completed' || status === 'success' ? '#7ED321' : status === 'pending' ? '#FFB800' : '#ff4444'
            }));
            setPaymentStatusBreakdown(paymentBreakdown);

            // Detailed Project Information
            const detailedProjects = projects.map((p: any) => ({
                id: p._id || p.id,
                title: p.title,
                category: p.category,
                status: p.published ? 'Published' : 'Draft',
                type: p.isPaid ? 'Paid' : 'Free',
                price: p.price || 0,
                downloads: p.downloadCount || 0,
                created: p.created_at,
                updated: p.updated_at,
                revenue: (p.price || 0) * 1
            })).sort((a: any, b: any) => new Date(b.created).getTime() - new Date(a.created).getTime());
            setProjectDetails(detailedProjects);

            // Recent Activity (last 10, sorted by date desc)
            const allActivity: RecentActivity[] = [];

            // Add contact activities
            contacts.forEach((c: any) => {
                allActivity.push({
                    id: c._id || c.id,
                    type: 'contact',
                    title: c.subject ? c.subject : 'Contact Message',
                    description: c.message,
                    timestamp: c.createdAt,
                    status: c.status,
                    metadata: { name: c.name, email: c.email }
                });
            });

            // Add project activities
            projects.forEach((p: any) => {
                allActivity.push({
                    id: p._id || p.id,
                    type: 'project',
                    title: p.title,
                    description: p.description,
                    timestamp: p.created_at,
                    status: p.published ? 'published' : 'pending',
                    metadata: {
                        isPaid: p.isPaid || (p.price && p.price > 0),
                        price: p.price,
                        category: p.category
                    }
                });
            });

            // Add payment activities
            payments.forEach((pay: any) => {
                allActivity.push({
                    id: pay._id || pay.id,
                    type: 'payment',
                    title: `Payment - ${pay.planType || 'Project'}`,
                    description: `Amount: ${pay.currency || 'INR'} ${pay.amount}`,
                    timestamp: pay.createdAt,
                    status: pay.status,
                    metadata: { amount: pay.amount, currency: pay.currency }
                });
            });

            // Add blog activities
            blogs.forEach((blog: any) => {
                allActivity.push({
                    id: blog._id || blog.id,
                    type: 'blog',
                    title: blog.title,
                    description: blog.excerpt || blog.content?.substring(0, 100),
                    timestamp: blog.createdAt || blog.created_at || blog.date,
                    status: blog.published ? 'published' : 'draft',
                    metadata: { author: blog.author, category: blog.category }
                });
            });

            // Add newsletter activities
            newsletter.forEach((sub: any) => {
                allActivity.push({
                    id: sub._id || sub.id,
                    type: 'newsletter',
                    title: 'Newsletter Subscription',
                    description: `Email: ${sub.email}`,
                    timestamp: sub.createdAt || sub.created_at || sub.subscribedAt,
                    status: sub.status === 'active' ? 'active' : 'inactive',
                    metadata: { email: sub.email, name: sub.name }
                });
            });

            // Add account activities
            accounts.forEach((acc: any) => {
                allActivity.push({
                    id: acc._id || acc.id,
                    type: 'account',
                    title: `Account - ${acc.name || acc.email}`,
                    description: `Account created`,
                    timestamp: acc.createdAt || acc.created_at,
                    status: acc.active ? 'active' : 'inactive',
                    metadata: { email: acc.email, type: acc.type }
                });
            });

            // Add user activities
            users.forEach((user: any) => {
                allActivity.push({
                    id: user._id || user.id,
                    type: 'user',
                    title: `User - ${user.name || user.email}`,
                    description: `User registered`,
                    timestamp: user.createdAt || user.created_at,
                    status: user.active ? 'active' : 'inactive',
                    metadata: { email: user.email, role: user.role }
                });
            });

            // Add project payment activities
            projectPayments.forEach((pp: any) => {
                allActivity.push({
                    id: pp._id || pp.id,
                    type: 'payment',
                    title: `Project Payment - ${pp.projectTitle || pp.project?.title}`,
                    description: `Amount: ${pp.currency || 'INR'} ${pp.amount}`,
                    timestamp: pp.createdAt || pp.created_at,
                    status: pp.status,
                    metadata: { amount: pp.amount, projectId: pp.projectId }
                });
            });

            allActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setRecentActivity(allActivity.slice(0, 10));

        } catch (err) {
            console.error('Dashboard data fetch error:', err);
            setStats({
                totalProjects: 0,
                publishedProjects: 0,
                draftProjects: 0,
                pendingProjects: 0,
                totalContacts: 0,
                newContacts: 0,
                starredContacts: 0,
                repliedContacts: 0,
                monthlyViews: 0,
                weeklyGrowth: 0,
                totalUsers: 0,
                activeUsers: 0,
                totalBlogPosts: 0,
                publishedBlogPosts: 0,
                totalRevenue: '0.00',
                totalLoginAttempts: 0,
                successfulLogins: 0,
                failedLogins: 0,
                loginSuccessRate: 0,
                paidProjects: 0,
                freeProjects: 0,
                averageProjectPrice: '0.00',
                totalProjectRevenue: '0.00',
                totalDownloads: 0,
                avgProjectsPerUser: '0',
                avgContactsPerDay: '0',
                totalBlogViews: 0,
                avgEngagementRate: '0',
                conversionRate: '0'
            });
            setProjectTrendData([]);
            setContactTrendData([]);
            setViewsTrendData([]);
            setProjectStatusData([]);
            setRecentActivity([]);
            setPendingProjects([]);
            setAllProjects([]);
            setProjectDetails([]);
            setRevenueByCategory([]);
            setContactsByType([]);
            setPaymentStatusBreakdown([]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions: QuickAction[] = [
        {
            id: '1',
            title: 'Add New Project',
            description: 'Create and publish a new project',
            icon: <FolderOpen className="w-6 h-6" />,
            href: '/admin/admin-project',
            color: '#00FFC6'
        },
        {
            id: '2',
            title: 'View All Projects',
            description: 'Manage and view all your projects',
            icon: <FolderOpen className="w-6 h-6" />,
            href: '/admin/admin-projects',
            color: '#4A90E2'
        },
        {
            id: '3',
            title: 'View Contacts',
            description: 'Check new contact messages',
            icon: <MessageSquare className="w-6 h-6" />,
            href: '/admin/admin-contact',
            color: '#4A90E2'
        },
        {
            id: '4',
            title: 'Profile Settings',
            description: 'View detailed profile and settings',
            icon: <User className="w-6 h-6" />,
            href: '/admin/admin-profile',
            color: '#FFB800'
        }
    ];

    const formatDate = (dateInput: string | Date) => {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput || new Date();
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'contact':
                return <MessageSquare className="w-4 h-4" />;
            case 'project':
                return <FolderOpen className="w-4 h-4" />;
            case 'payment':
                return <DollarSign className="w-4 h-4" />;
            case 'blog':
                return <FileText className="w-4 h-4" />;
            case 'newsletter':
                return <Mail className="w-4 h-4" />;
            case 'account':
                return <User className="w-4 h-4" />;
            case 'user':
                return <Users className="w-4 h-4" />;
            default:
                return <Activity className="w-4 h-4" />;
        }
    };

    const getActivityColor = (type: string, status?: string) => {
        if (status === 'new' || status === 'pending') return '#FFB800';
        if (status === 'read') return '#4A90E2';
        if (status === 'replied' || status === 'published' || status === 'completed' || status === 'success') return '#7ED321';

        switch (type) {
            case 'contact':
                return '#00FFC6';
            case 'project':
                return '#FFB800';
            case 'payment':
                return '#7ED321';
            case 'blog':
                return '#9370DB';
            case 'newsletter':
                return '#FF6B6B';
            case 'account':
                return '#1E90FF';
            case 'user':
                return '#4A90E2';
            default:
                return '#E0E0E0';
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: '#181A1B', border: '1px solid #232323', borderRadius: '8px', padding: '12px' }}>
                    <p style={{ color: '#E0E0E0', marginBottom: '8px', fontWeight: 'bold' }}>{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color, fontSize: '14px' }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
            {/* Header */}
            <header className="border-b sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: 'rgba(24, 26, 27, 0.95)', borderColor: '#232323' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #00FFC6, #E0E0E0)' }}>
                                Admin Dashboard
                            </h1>
                            <p className="text-sm mt-1" style={{ color: '#b0f5e6' }}>
                                Welcome back! Here's what's happening with your portfolio.
                            </p>
                        </div>
                        <button
                            onClick={fetchDashboardData}
                            className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
                            style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} style={{ color: '#00FFC6' }} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="border-b" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto">
                        {['projects', 'blogs', 'contacts', 'users', 'newsletter', 'payments', 'accounts', 'project-payments'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${activeTab === tab
                                    ? 'border-transparent'
                                    : 'border-transparent'
                                    }`}
                                style={{
                                    borderBottomColor: activeTab === tab ? '#00FFC6' : 'transparent',
                                    color: activeTab === tab ? '#00FFC6' : '#757575'
                                }}
                            >
                                {tab === 'pending' ? `Pending (${stats.pendingProjects})` : tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#00FFC6' }}>
                            <FolderOpen className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#00FFC6' }}>{stats.totalProjects}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Total Projects</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#00FFC6' }}></span>
                                {stats.publishedProjects} published
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#FFB800' }}>
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#FFB800' }}>{stats.pendingProjects}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Pending Projects</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#FFB800' }}></span>
                                Draft / Awaiting publish
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#9B59B6' }}>
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#4A90E2' }}>{stats.totalContacts}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Contact Messages</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#ff4444' }}></span>
                                {stats.newContacts} new
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#FFB800' }}>
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#FFB800' }}>{stats.monthlyViews.toLocaleString()}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Monthly Views</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#7ED321' }}></span>
                                +{stats.weeklyGrowth}%
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#4A90E2' }}>
                            <User className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#4A90E2' }}>{stats.totalUsers}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Total Users</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#7ED321' }}></span>
                                {stats.activeUsers} active (30d)
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#7ED321' }}>
                            <Activity className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#7ED321' }}>{stats.successfulLogins}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Successful Logins</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#00FFC6' }}></span>
                                {stats.loginSuccessRate}% success rate
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#ff4444' }}>
                            <Activity className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#ff4444' }}>{stats.failedLogins}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Failed Login Attempts</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#ff4444' }}></span>
                                {stats.totalLoginAttempts} total attempts
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#FFD700' }}>
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#FFD700' }}>${stats.totalRevenue}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Total Revenue</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#7ED321' }}></span>
                                From payments
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#7ED321' }}>
                            <DollarSign className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#7ED321' }}>{stats.paidProjects}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Paid Projects</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#7ED321' }}></span>
                                {stats.paidProjects > 0 ? `${((stats.paidProjects / stats.totalProjects) * 100).toFixed(0)}% of total` : 'No paid projects'}
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#00FFC6' }}>
                            <Download className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#00FFC6' }}>{stats.freeProjects}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Free Projects</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#00FFC6' }}></span>
                                {stats.freeProjects > 0 ? `${((stats.freeProjects / stats.totalProjects) * 100).toFixed(0)}% of total` : 'No free projects'}
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#FF6B6B' }}>
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#FF6B6B' }}>₹{stats.averageProjectPrice}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Avg Project Price</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#FF6B6B' }}></span>
                                {stats.paidProjects} paid projects
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#1E90FF' }}>
                            <Activity className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#1E90FF' }}>{stats.totalDownloads.toLocaleString()}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Total Downloads</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#1E90FF' }}></span>
                                {stats.avgProjectsPerUser} avg/user
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#32CD32' }}>
                            <Eye className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#32CD32' }}>{stats.avgEngagementRate}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Avg Engagement</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#32CD32' }}></span>
                                Per project
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#9370DB' }}>
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#9370DB' }}>{stats.conversionRate}%</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Conversion Rate</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#9370DB' }}></span>
                                Contact to Payment
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#00CED1' }}>
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#00CED1' }}>{stats.avgContactsPerDay}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Contacts/Day</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#00CED1' }}></span>
                                {stats.repliedContacts} replied
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg p-4 transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 p-4 rounded-full opacity-20" style={{ backgroundColor: '#FF4500' }}>
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div className="relative">
                            <h3 className="text-lg font-bold" style={{ color: '#FF4500' }}>₹{stats.totalProjectRevenue}</h3>
                            <p className="text-xs" style={{ color: '#b0f5e6' }}>Project Revenue</p>
                            <div className="mt-2 flex items-center text-xs" style={{ color: '#757575' }}>
                                <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: '#FF4500' }}></span>
                                From sales
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'projects' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Project Trends</h2>
                            </div>
                            <div className="p-4">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={projectTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#232323" />
                                        <XAxis dataKey="name" stroke="#757575" />
                                        <YAxis stroke="#757575" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="projects" stackId="1" stroke="#00FFC6" fill="#00FFC6" fillOpacity={0.3} />
                                        <Area type="monotone" dataKey="published" stackId="2" stroke="#7ED321" fill="#7ED321" fillOpacity={0.3} />
                                        <Area type="monotone" dataKey="pending" stackId="3" stroke="#FFB800" fill="#FFB800" fillOpacity={0.3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Recent Project Activity</h2>
                            </div>
                            <div className="p-4 max-h-96 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#00FFC6' }} />
                                    </div>
                                ) : recentActivity.filter(activity => activity.type === 'project').length === 0 ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No recent project activity
                                    </div>
                                ) : (
                                    recentActivity.filter(activity => activity.type === 'project').map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 mb-4 pb-4 border-b last:border-b-0" style={{ borderColor: '#232323' }}>
                                            <div className="flex-shrink-0 p-2 rounded-full" style={{ backgroundColor: '#232323' }}>
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium truncate" style={{ color: '#E0E0E0' }}>
                                                        {activity.title}
                                                    </p>
                                                    <span className="text-xs" style={{ color: '#757575' }}>
                                                        {formatDate(activity.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-1" style={{ color: '#b0f5e6' }}>
                                                    {activity.description}
                                                </p>
                                                {activity.metadata && (
                                                    <div className="mt-2 flex items-center space-x-2">
                                                        {activity.metadata.isPaid && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#7ED321', color: '#000' }}>
                                                                Paid - ₹{activity.metadata.price}
                                                            </span>
                                                        )}
                                                        <span className="text-xs" style={{ color: '#757575' }}>
                                                            {activity.metadata.category}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'blogs' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Blog Posts Trend</h2>
                            </div>
                            <div className="p-4">
                                {blogTrendData.every(item => item.blogs === 0 && item.published === 0 && item.drafts === 0) ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No blog data available yet. Create your first blog post to see trends here.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={blogTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#232323" />
                                            <XAxis dataKey="name" stroke="#757575" />
                                            <YAxis stroke="#757575" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="blogs" stackId="1" stroke="#9370DB" fill="#9370DB" fillOpacity={0.3} />
                                            <Area type="monotone" dataKey="published" stackId="2" stroke="#7ED321" fill="#7ED321" fillOpacity={0.3} />
                                            <Area type="monotone" dataKey="drafts" stackId="3" stroke="#FFB800" fill="#FFB800" fillOpacity={0.3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Recent Blog Activity</h2>
                            </div>
                            <div className="p-4 max-h-96 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#00FFC6' }} />
                                    </div>
                                ) : recentActivity.filter(activity => activity.type === 'blog').length === 0 ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No recent blog activity
                                    </div>
                                ) : (
                                    recentActivity.filter(activity => activity.type === 'blog').map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 mb-4 pb-4 border-b last:border-b-0" style={{ borderColor: '#232323' }}>
                                            <div className="flex-shrink-0 p-2 rounded-full" style={{ backgroundColor: '#232323' }}>
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium truncate" style={{ color: '#E0E0E0' }}>
                                                        {activity.title}
                                                    </p>
                                                    <span className="text-xs" style={{ color: '#757575' }}>
                                                        {formatDate(activity.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-1" style={{ color: '#b0f5e6' }}>
                                                    {activity.description}
                                                </p>
                                                {activity.metadata && (
                                                    <div className="mt-2 flex items-center space-x-2">
                                                        <span className="text-xs" style={{ color: '#757575' }}>
                                                            {activity.metadata.category}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'contacts' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Contact Trends</h2>
                            </div>
                            <div className="p-4">
                                {contactTrendData.every(item => item.general === 0) ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No contact data available yet. Contact messages will appear here.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={contactTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#232323" />
                                            <XAxis dataKey="name" stroke="#757575" />
                                            <YAxis stroke="#757575" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="general" fill="#00FFC6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Recent Contact Activity</h2>
                            </div>
                            <div className="p-4 max-h-96 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#00FFC6' }} />
                                    </div>
                                ) : recentActivity.filter(activity => activity.type === 'contact').length === 0 ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No recent contact activity
                                    </div>
                                ) : (
                                    recentActivity.filter(activity => activity.type === 'contact').map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 mb-4 pb-4 border-b last:border-b-0" style={{ borderColor: '#232323' }}>
                                            <div className="flex-shrink-0 p-2 rounded-full" style={{ backgroundColor: '#232323' }}>
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium truncate" style={{ color: '#E0E0E0' }}>
                                                        {activity.title}
                                                    </p>
                                                    <span className="text-xs" style={{ color: '#757575' }}>
                                                        {formatDate(activity.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-1" style={{ color: '#b0f5e6' }}>
                                                    {activity.description}
                                                </p>
                                                {activity.metadata && (
                                                    <div className="mt-2 flex items-center space-x-2">
                                                        <span className="text-xs" style={{ color: '#757575' }}>
                                                            {activity.metadata.name} - {activity.metadata.email}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>User Growth</h2>
                            </div>
                            <div className="p-4">
                                {viewsTrendData.every(item => item.views === 0) ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No user data available yet. User registrations will appear here.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={viewsTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#232323" />
                                            <XAxis dataKey="name" stroke="#757575" />
                                            <YAxis stroke="#757575" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="views" stroke="#4A90E2" fill="#4A90E2" fillOpacity={0.3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Recent User Activity</h2>
                            </div>
                            <div className="p-4 max-h-96 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#00FFC6' }} />
                                    </div>
                                ) : recentActivity.filter(activity => activity.type === 'user').length === 0 ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No recent user activity
                                    </div>
                                ) : (
                                    recentActivity.filter(activity => activity.type === 'user').map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 mb-4 pb-4 border-b last:border-b-0" style={{ borderColor: '#232323' }}>
                                            <div className="flex-shrink-0 p-2 rounded-full" style={{ backgroundColor: '#232323' }}>
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium truncate" style={{ color: '#E0E0E0' }}>
                                                        {activity.title}
                                                    </p>
                                                    <span className="text-xs" style={{ color: '#757575' }}>
                                                        {formatDate(activity.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-1" style={{ color: '#b0f5e6' }}>
                                                    {activity.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'newsletter' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Newsletter Subscriptions Trend</h2>
                            </div>
                            <div className="p-4">
                                {newsletterTrendData.every(item => item.subscriptions === 0) ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No newsletter data available yet. Subscriber registrations will appear here.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={newsletterTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#232323" />
                                            <XAxis dataKey="name" stroke="#757575" />
                                            <YAxis stroke="#757575" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="subscriptions" fill="#FF6B6B" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Recent Newsletter Activity</h2>
                            </div>
                            <div className="p-4 max-h-96 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#00FFC6' }} />
                                    </div>
                                ) : recentActivity.filter(activity => activity.type === 'newsletter').length === 0 ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No recent newsletter activity
                                    </div>
                                ) : (
                                    recentActivity.filter(activity => activity.type === 'newsletter').map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 mb-4 pb-4 border-b last:border-b-0" style={{ borderColor: '#232323' }}>
                                            <div className="flex-shrink-0 p-2 rounded-full" style={{ backgroundColor: '#232323' }}>
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium truncate" style={{ color: '#E0E0E0' }}>
                                                        {activity.title}
                                                    </p>
                                                    <span className="text-xs" style={{ color: '#757575' }}>
                                                        {formatDate(activity.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-1" style={{ color: '#b0f5e6' }}>
                                                    {activity.description}
                                                </p>
                                                {activity.metadata && (
                                                    <div className="mt-2 flex items-center space-x-2">
                                                        <span className="text-xs" style={{ color: '#757575' }}>
                                                            {activity.metadata.email}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Payment Status Breakdown</h2>
                            </div>
                            <div className="p-4">
                                {paymentStatusBreakdown.length === 0 ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No payment data available yet. Payment transactions will appear here.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={paymentStatusBreakdown}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {paymentStatusBreakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Recent Payment Activity</h2>
                            </div>
                            <div className="p-4 max-h-96 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#00FFC6' }} />
                                    </div>
                                ) : recentActivity.filter(activity => activity.type === 'payment').length === 0 ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No recent payment activity
                                    </div>
                                ) : (
                                    recentActivity.filter(activity => activity.type === 'payment').map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 mb-4 pb-4 border-b last:border-b-0" style={{ borderColor: '#232323' }}>
                                            <div className="flex-shrink-0 p-2 rounded-full" style={{ backgroundColor: '#232323' }}>
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium truncate" style={{ color: '#E0E0E0' }}>
                                                        {activity.title}
                                                    </p>
                                                    <span className="text-xs" style={{ color: '#757575' }}>
                                                        {formatDate(activity.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-1" style={{ color: '#b0f5e6' }}>
                                                    {activity.description}
                                                </p>
                                                {activity.metadata && (
                                                    <div className="mt-2 flex items-center space-x-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: activity.status === 'completed' ? '#7ED321' : '#FFB800', color: '#000' }}>
                                                            {activity.status}
                                                        </span>
                                                        <span className="text-xs" style={{ color: '#757575' }}>
                                                            {activity.metadata.currency} {activity.metadata.amount}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'accounts' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Account Payments Trend</h2>
                            </div>
                            <div className="p-4">
                                {accountPaymentsTrendData.every(item => item.payments === 0 && item.amount === 0) ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No account payment data available yet. Payment transactions will appear here.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={accountPaymentsTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#232323" />
                                            <XAxis dataKey="name" stroke="#757575" />
                                            <YAxis stroke="#757575" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="payments" fill="#1E90FF" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Recent Account Activity</h2>
                            </div>
                            <div className="p-4 max-h-96 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#00FFC6' }} />
                                    </div>
                                ) : recentActivity.filter(activity => activity.type === 'account').length === 0 ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No recent account activity
                                    </div>
                                ) : (
                                    recentActivity.filter(activity => activity.type === 'account').map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 mb-4 pb-4 border-b last:border-b-0" style={{ borderColor: '#232323' }}>
                                            <div className="flex-shrink-0 p-2 rounded-full" style={{ backgroundColor: '#232323' }}>
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium truncate" style={{ color: '#E0E0E0' }}>
                                                        {activity.title}
                                                    </p>
                                                    <span className="text-xs" style={{ color: '#757575' }}>
                                                        {formatDate(activity.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-1" style={{ color: '#b0f5e6' }}>
                                                    {activity.description}
                                                </p>
                                                {activity.metadata && (
                                                    <div className="mt-2 flex items-center space-x-2">
                                                        <span className="text-xs" style={{ color: '#757575' }}>
                                                            {activity.metadata.email}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'project-payments' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Project Revenue by Category</h2>
                            </div>
                            <div className="p-4">
                                {revenueByCategory.length === 0 ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No project revenue data available yet. Project sales will appear here.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={revenueByCategory}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#232323" />
                                            <XAxis dataKey="name" stroke="#757575" />
                                            <YAxis stroke="#757575" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="revenue" fill="#FF4500" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#181A1B', border: '1px solid #232323' }}>
                            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#232323' }}>
                                <h2 className="text-lg font-bold" style={{ color: '#00FFC6' }}>Recent Project Payment Activity</h2>
                            </div>
                            <div className="p-4 max-h-96 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#00FFC6' }} />
                                    </div>
                                ) : recentActivity.filter(activity => activity.type === 'payment').length === 0 ? (
                                    <div className="text-center py-8" style={{ color: '#757575' }}>
                                        No recent project payment activity
                                    </div>
                                ) : (
                                    recentActivity.filter(activity => activity.type === 'payment').map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 mb-4 pb-4 border-b last:border-b-0" style={{ borderColor: '#232323' }}>
                                            <div className="flex-shrink-0 p-2 rounded-full" style={{ backgroundColor: '#232323' }}>
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium truncate" style={{ color: '#E0E0E0' }}>
                                                        {activity.title}
                                                    </p>
                                                    <span className="text-xs" style={{ color: '#757575' }}>
                                                        {formatDate(activity.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-1" style={{ color: '#b0f5e6' }}>
                                                    {activity.description}
                                                </p>
                                                {activity.metadata && (
                                                    <div className="mt-2 flex items-center space-x-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: activity.status === 'completed' ? '#7ED321' : '#FFB800', color: '#000' }}>
                                                            {activity.status}
                                                        </span>
                                                        <span className="text-xs" style={{ color: '#757575' }}>
                                                            {activity.metadata.currency} {activity.metadata.amount}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}