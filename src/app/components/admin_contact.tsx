'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, MessageSquare, Search, Filter, Trash2, CheckCircle, Clock, AlertCircle, Download, RefreshCw, Send, Archive, Eye, Edit3, X, ChevronDown, ChevronUp, Inbox, Star, Calendar } from 'lucide-react';

interface ContactMessage {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt?: string;
  repliedAt?: string;
}

export default function AdminContactDashboard() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read' | 'replied' | 'archived'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<Omit<ContactMessage, 'id' | 'status' | 'createdAt' | 'repliedAt'>>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch messages from API
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      
      if (!token) {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin-auth';
        }
        return;
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const res = await fetch('/api/contact', { headers });
      
      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('token');
          window.localStorage.removeItem('role');
          window.localStorage.removeItem('userId');
          window.location.href = '/admin-auth';
        }
        return;
      }

      if (res.status === 403) {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return;
      }

      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching messages:', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
    archived: messages.filter(m => m.status === 'archived').length
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || message.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = async (id: string, newStatus: 'new' | 'read' | 'replied' | 'archived') => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      
      if (!token) {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin-auth';
        }
        return;
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id, status: newStatus })
      });

      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('token');
          window.localStorage.removeItem('role');
          window.localStorage.removeItem('userId');
          window.location.href = '/admin-auth';
        }
        return;
      }

      await fetchMessages();
      if (selectedMessage?._id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      setIsLoading(true);
      try {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
        
        if (!token) {
          if (typeof window !== 'undefined') {
            window.location.href = '/admin-auth';
          }
          return;
        }

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const res = await fetch('/api/contact', {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ id })
        });

        if (res.status === 401) {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('role');
            window.localStorage.removeItem('userId');
            window.location.href = '/admin-auth';
          }
          return;
        }

        await fetchMessages();
        if (selectedMessage?._id === id) {
          setSelectedMessage(null);
        }
      } catch (e) {
        console.error('Error deleting message:', e);
      }
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchMessages();
  };

  // Admin add/edit form handlers
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMessage('');
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let res;
      if (editId) {
        // Update
        res = await fetch('/api/contact', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ id: editId, ...form })
        });
      } else {
        // Add
        res = await fetch('/api/contact', {
          method: 'POST',
          headers,
          body: JSON.stringify(form)
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit form');
        setFormLoading(false);
        return;
      }

      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setEditId(null);
      setFormVisible(false);
      await fetchMessages();
    } catch (err) {
      console.error('Failed to submit form:', err);
      setErrorMessage('Network error occurred');
    }
    setFormLoading(false);
  };

  const handleEdit = (msg: ContactMessage) => {
    setForm({ name: msg.name, email: msg.email, phone: msg.phone, subject: msg.subject, message: msg.message });
    setEditId(msg._id || null);
    setFormVisible(true);
    setErrorMessage('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#00FFC6';
      case 'read': return '#FFB800';
      case 'replied': return '#4CAF50';
      case 'archived': return '#757575';
      default: return '#E0E0E0';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4" />;
      case 'read': return <Eye className="w-4 h-4" />;
      case 'replied': return <CheckCircle className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)', borderColor: '#232323' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#00FFC6' }}>
                <Inbox className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#121212' }} />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold" style={{ color: '#E0E0E0' }}>
                  Contact Dashboard
                </h1>
                <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>
                  Manage and respond to contact form submissions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-lg border transition-all duration-300 flex items-center justify-center"
                style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}
                aria-label="Toggle view mode"
                title="Toggle view mode"
              >
                {viewMode === 'grid' ?
                  <Filter className="w-5 h-5" style={{ color: '#00FFC6' }} /> :
                  <div className="grid grid-cols-2 gap-1" style={{ width: '20px', height: '20px' }}>
                    <div style={{ backgroundColor: '#00FFC6', width: '8px', height: '8px' }}></div>
                    <div style={{ backgroundColor: '#00FFC6', width: '8px', height: '8px' }}></div>
                    <div style={{ backgroundColor: '#00FFC6', width: '8px', height: '8px' }}></div>
                    <div style={{ backgroundColor: '#00FFC6', width: '8px', height: '8px' }}></div>
                  </div>
                }
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 rounded-lg border transition-all duration-300 flex items-center justify-center"
                style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}
                aria-label="Refresh messages"
                title="Refresh messages"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} style={{ color: '#00FFC6' }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="sticky top-[64px] sm:top-[72px] z-40 backdrop-blur-sm border-b" style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)', borderColor: '#232323' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex flex-wrap items-center gap-4">
              {[
                { label: 'Total', value: stats.total, color: '#E0E0E0', icon: <Inbox className="w-4 h-4" /> },
                { label: 'New', value: stats.new, color: '#00FFC6', icon: <AlertCircle className="w-4 h-4" /> },
                { label: 'Read', value: stats.read, color: '#FFB800', icon: <Eye className="w-4 h-4" /> },
                { label: 'Replied', value: stats.replied, color: '#4CAF50', icon: <CheckCircle className="w-4 h-4" /> },
                { label: 'Archived', value: stats.archived, color: '#757575', icon: <Archive className="w-4 h-4" /> }
              ].map((stat, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="p-1 rounded" style={{ backgroundColor: `${stat.color}20` }}>
                    {React.cloneElement(stat.icon, { style: { color: stat.color } })}
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-xs" style={{ color: '#757575' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300"
              style={{ backgroundColor: '#00FFC6', color: '#121212' }}
              onClick={() => {
                setFormVisible(true);
                setEditId(null);
                setErrorMessage('');
                setForm({ name: '', email: '', phone: '', subject: '', message: '' });
              }}
              aria-label="Create new message"
              title="Create new message"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">New Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#757575' }} aria-hidden />
            <label htmlFor="searchMessages" className="sr-only">Search messages</label>
            <input
              id="searchMessages"
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base"
              style={{
                backgroundColor: '#181A1B',
                borderColor: '#232323',
                color: '#E0E0E0'
              }}
              aria-label="Search messages"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5" style={{ color: '#757575' }} aria-hidden />
            <label htmlFor="filterStatus" className="sr-only">Filter status</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base"
              style={{
                backgroundColor: '#181A1B',
                borderColor: '#232323',
                color: '#E0E0E0'
              }}
              aria-label="Filter by status"
            >
              <option value="all">All Messages</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {formVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} role="dialog" aria-modal="true" aria-labelledby="formTitle">
          <div className="w-full max-w-2xl rounded-xl p-4 sm:p-6" style={{ backgroundColor: '#181A1B' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 id="formTitle" className="text-lg sm:text-xl font-bold" style={{ color: '#E0E0E0' }}>
                {editId ? 'Edit Message' : 'Add New Message'}
              </h2>
              <button
                onClick={() => { setFormVisible(false); setEditId(null); }}
                className="p-1 rounded-lg"
                style={{ backgroundColor: '#232323' }}
              >
                <X className="w-5 h-5" style={{ color: '#E0E0E0' }} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Name"
                    className="w-full p-3 rounded-lg border"
                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Email</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="Email"
                    className="w-full p-3 rounded-lg border"
                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="Phone"
                    className="w-full p-3 rounded-lg border"
                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Subject</label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleFormChange}
                    placeholder="Subject"
                    className="w-full p-3 rounded-lg border"
                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" style={{ color: '#b0f5e6' }}>Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleFormChange}
                  placeholder="Message"
                  className="w-full p-3 rounded-lg border"
                  rows={4}
                  style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                  required
                />
              </div>
              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', borderColor: 'rgba(255, 0, 0, 0.3)', border: '1px solid' }}>
                  <div className="text-sm" style={{ color: '#FF0000' }}>
                    {errorMessage}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setFormVisible(false); setEditId(null); }}
                  className="px-4 py-2 rounded-lg border"
                  style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                  style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                >
                  {formLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{editId ? 'Update' : 'Add'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Messages Display */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Mail className="w-16 h-16 mb-4" style={{ color: '#232323' }} />
            <p className="text-lg" style={{ color: '#757575' }}>No messages found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMessages.map((message) => (
              <div
                key={message._id}
                className="rounded-xl border overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}
              >
                <div className="p-4 border-b" style={{ borderColor: '#232323' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00FFC6' }}>
                        <User className="w-5 h-5" style={{ color: '#121212' }} />
                      </div>
                      <div>
                        <h3 className="font-semibold" style={{ color: '#E0E0E0' }}>{message.name}</h3>
                        <p className="text-xs" style={{ color: '#757575' }}>{message.email}</p>
                      </div>
                    </div>
                    <div
                      className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: `${getStatusColor(message.status)}20`,
                        color: getStatusColor(message.status)
                      }}
                    >
                      {getStatusIcon(message.status)}
                      <span className="capitalize">{message.status}</span>
                    </div>
                  </div>
                  <h4 className="font-medium mb-1" style={{ color: '#00FFC6' }}>{message.subject}</h4>
                  <p className="text-sm mb-2 line-clamp-2" style={{ color: '#b0f5e6' }}>{message.message}</p>
                  <div className="flex items-center text-xs" style={{ color: '#757575' }}>
                    <Calendar className="w-3 h-3 mr-1" />
                    {message.createdAt ? formatDate(message.createdAt) : ''}
                  </div>
                </div>
                <div className="p-4 flex justify-between">
                  <div className="flex space-x-2">
                    {(['new', 'read', 'replied', 'archived'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => message._id && handleStatusChange(message._id, status)}
                        className={`p-1 rounded ${message.status === status ? '' : 'opacity-50'}`}
                        style={{ backgroundColor: message.status === status ? `${getStatusColor(status)}20` : 'transparent' }}
                        title={`Mark as ${status}`}
                      >
                        {React.cloneElement(getStatusIcon(status), {
                          style: { color: getStatusColor(status), width: '16px', height: '16px' }
                        })}
                      </button>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedMessage(message)}
                      className="p-1 rounded"
                      style={{ backgroundColor: '#121212' }}
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" style={{ color: '#00FFC6' }} />
                    </button>
                    <button
                      onClick={() => handleEdit(message)}
                      className="p-1 rounded"
                      style={{ backgroundColor: '#121212' }}
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" style={{ color: '#FFB800' }} />
                    </button>
                    <button
                      onClick={() => message._id && handleDelete(message._id)}
                      className="p-1 rounded"
                      style={{ backgroundColor: '#121212' }}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#ff6b6b' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: '#121212' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#b0f5e6' }}>Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#b0f5e6' }}>Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#b0f5e6' }}>Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#b0f5e6' }}>Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: '#b0f5e6' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((message) => (
                  <tr key={message._id} className="border-t" style={{ borderColor: '#232323' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00FFC6' }}>
                          <User className="w-4 h-4" style={{ color: '#121212' }} />
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: '#E0E0E0' }}>{message.name}</div>
                          <div className="text-xs" style={{ color: '#757575' }}>{message.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div style={{ color: '#00FFC6' }}>{message.subject}</div>
                      <div className="text-xs truncate max-w-xs" style={{ color: '#b0f5e6' }}>{message.message}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: `${getStatusColor(message.status)}20`,
                          color: getStatusColor(message.status)
                        }}
                      >
                        {getStatusIcon(message.status)}
                        <span className="capitalize">{message.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#757575' }}>
                      {message.createdAt ? formatDate(message.createdAt) : ''}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end space-x-2">
                        {(['new', 'read', 'replied', 'archived'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => message._id && handleStatusChange(message._id, status)}
                            className={`p-1 rounded ${message.status === status ? '' : 'opacity-50'}`}
                            style={{ backgroundColor: message.status === status ? `${getStatusColor(status)}20` : 'transparent' }}
                            title={`Mark as ${status}`}
                          >
                            {React.cloneElement(getStatusIcon(status), {
                              style: { color: getStatusColor(status), width: '16px', height: '16px' }
                            })}
                          </button>
                        ))}
                        <button
                          onClick={() => setSelectedMessage(message)}
                          className="p-1 rounded"
                          style={{ backgroundColor: '#121212' }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" style={{ color: '#00FFC6' }} />
                        </button>
                        <button
                          onClick={() => handleEdit(message)}
                          className="p-1 rounded"
                          style={{ backgroundColor: '#121212' }}
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" style={{ color: '#FFB800' }} />
                        </button>
                        <button
                          onClick={() => message._id && handleDelete(message._id)}
                          className="p-1 rounded"
                          style={{ backgroundColor: '#121212' }}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#ff6b6b' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl" style={{ backgroundColor: '#181A1B' }}>
            <div className="sticky top-0 p-6 border-b backdrop-blur-sm" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2" style={{ color: '#00FFC6' }}>{selectedMessage.subject}</h2>
                  <div className="flex items-center space-x-4 text-sm" style={{ color: '#b0f5e6' }}>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{selectedMessage.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{selectedMessage.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{selectedMessage.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{selectedMessage.createdAt ? formatDate(selectedMessage.createdAt) : ''}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-1 rounded-lg"
                  style={{ backgroundColor: '#232323' }}
                >
                  <X className="w-5 h-5" style={{ color: '#E0E0E0' }} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#E0E0E0' }}>Message</h3>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#121212' }}>
                  <p className="whitespace-pre-wrap" style={{ color: '#E0E0E0' }}>{selectedMessage.message}</p>
                </div>
              </div>
              {selectedMessage.repliedAt && (
                <div className="mb-6 p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)', borderColor: 'rgba(0, 255, 198, 0.3)', border: '1px solid' }}>
                  <div className="text-sm" style={{ color: '#00FFC6' }}>
                    Replied on {formatDate(selectedMessage.repliedAt)}
                  </div>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#E0E0E0' }}>Status</h3>
                <div className="flex flex-wrap gap-2">
                  {(['new', 'read', 'replied', 'archived'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => selectedMessage._id && handleStatusChange(selectedMessage._id, status)}
                      className={`px-3 py-1 rounded-lg border text-sm capitalize transition-all duration-300 ${selectedMessage.status === status ? 'scale-105' : ''
                        }`}
                      style={{
                        backgroundColor: selectedMessage.status === status ? `${getStatusColor(status)}20` : '#121212',
                        borderColor: getStatusColor(status),
                        color: getStatusColor(status)
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="flex-1 px-6 py-3 rounded-lg font-medium text-center transition-all duration-300 flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: '#00FFC6',
                    color: '#121212'
                  }}
                >
                  <Mail className="w-4 h-4" />
                  <span>Reply via Email</span>
                </a>
                <a
                  href={`tel:${selectedMessage.phone}`}
                  className="flex-1 px-6 py-3 rounded-lg font-medium text-center transition-all duration-300 flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: '#121212',
                    color: '#00FFC6',
                    border: '1px solid #00FFC6'
                  }}
                >
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </a>
                <button
                  onClick={() => handleEdit(selectedMessage)}
                  className="px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: '#121212',
                    color: '#FFB800',
                    border: '1px solid #FFB800'
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => selectedMessage._id && handleDelete(selectedMessage._id)}
                  className="px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: '#121212',
                    color: '#ff6b6b',
                    border: '1px solid #ff6b6b'
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}