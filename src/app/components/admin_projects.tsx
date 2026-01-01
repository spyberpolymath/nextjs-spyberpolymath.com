'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Save,
  Eye,
  EyeOff,
  Code,
  Image,
  AlertCircle,
  CheckCircle,
  Loader,
  Filter,
  Grid,
  List,
  Folder,
  MoreVertical,
  BarChart3,
  TrendingUp,
  Settings,
  FileText,
  Link2,
  Zap,
  Clock,
  Archive
} from 'lucide-react';
import RichTextEditor from './RichTextEditor';

// Type definitions
interface Project {
  id?: string | number;
  _id?: string;
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
  created_at: string;
  updated_at: string;
  richDescription?: string;
  price?: number;
  currency?: string;
  isPaid?: boolean;
  zipUrl?: string;
}

interface ProjectFormData {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string;
  image: string;
  github: string;
  demo: string;
  kaggle: string;
  linkedin: string;
  demo2: string;
  published: boolean;
  richDescription: string;
  price: number;
  currency: string;
  isPaid: boolean;
  zipUrl?: string;
  downloadLimit?: number;
  downloadCount?: number;
  isPaidAfterLimit?: boolean;
}

interface ZipUpload {
  file: File | null;
  name: string;
  uploading: boolean;
}

interface ImageUpload {
  file: File | null;
  preview: string;
}

interface FormErrors {
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  richDescription?: string;
}

interface Notification {
  message: string;
  type: 'success' | 'error';
}

const CATEGORIES: Record<string, string> = {
  'machine-learning': 'Machine Learning',
  'web-development': 'Web Development',
  'data-science': 'Data Science',
  'cyber-security': 'Cyber Security',
  'mobile-development': 'Mobile Development',
  'blockchain': 'Blockchain',
  'iot': 'IoT'
};

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');
  const [isClient, setIsClient] = useState(false);

  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    slug: '',
    description: '',
    category: '',
    tags: '',
    image: '',
    github: '',
    demo: '',
    kaggle: '',
    linkedin: '',
    demo2: '',
    published: true,
    richDescription: '',
    price: 0,
    currency: 'INR',
    isPaid: false,
    zipUrl: '',
  });

  const [imageUpload, setImageUpload] = useState<ImageUpload>({
    file: null,
    preview: ''
  });

  const [zipUpload, setZipUpload] = useState<ZipUpload>({
    file: null,
    name: '',
    uploading: false
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editorHtml, setEditorHtml] = useState<string>('');
  const [showTagsGrid, setShowTagsGrid] = useState(false);
  const [tagsGridRows, setTagsGridRows] = useState<Array<{ tag: string }>>([]);
  const isMountedRef = useRef(false);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchProjects();
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient) {
      filterProjects();
    }
  }, [projects, searchTerm, selectedCategory, activeTab, isClient]);

  // Sync editor HTML to formData.richDescription
  useEffect(() => {
    if (isClient && isMountedRef.current) {
      setFormData(prev => ({ ...prev, richDescription: editorHtml || '' }));
    }
  }, [editorHtml, isClient]);

  // Sync tagsGridRows to formData.tags
  useEffect(() => {
    if (isClient && showTagsGrid) {
      const tagsString = tagsGridRows
        .map(row => row.tag.trim())
        .filter(Boolean)
        .join(', ');
      setFormData(prev => ({ ...prev, tags: tagsString }));
    }
  }, [tagsGridRows, showTagsGrid, isClient]);

  const fetchProjects = async () => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/projects', { headers });
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      if (isMountedRef.current) {
        setProjects(data.results || []);
      }
    } catch (error) {
      if (isMountedRef.current) {
        showNotification('Failed to fetch projects', 'error');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const filterProjects = useCallback(() => {
    if (!isMountedRef.current) return;

    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (activeTab === 'published') {
      filtered = filtered.filter(p => p.published);
    } else if (activeTab === 'draft') {
      filtered = filtered.filter(p => !p.published);
    }

    if (isMountedRef.current) {
      setFilteredProjects(filtered);
    }
  }, [projects, searchTerm, selectedCategory, activeTab]);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (!isMountedRef.current) return;

    setNotification({ message, type });
    setTimeout(() => {
      if (isMountedRef.current) {
        setNotification(null);
      }
    }, 3000);
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!isMountedRef.current) return;

    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;

    let newValue: any;
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'number') {
      newValue = value === '' ? 0 : parseFloat(value) || 0;
    } else {
      newValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
      ...(name === 'title' && !editingProject ? { slug: generateSlug(value) } : {})
    }));

    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMountedRef.current) return;

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size should be less than 5MB', 'error');
      return;
    }

    // Create preview only, don't convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      if (isMountedRef.current && typeof reader.result === 'string') {
        setImageUpload({
          file,
          preview: reader.result
        });
        // Don't set formData.image here - we'll upload to Cloudinary later
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    if (!isMountedRef.current) return;

    setImageUpload({
      file: null,
      preview: ''
    });
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMountedRef.current) return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('zip') && !file.name.endsWith('.zip')) {
      showNotification('Please select a valid ZIP file', 'error');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      showNotification('ZIP file size should be less than 100MB', 'error');
      return;
    }

    setZipUpload({
      file,
      name: file.name,
      uploading: false
    });
  };

  const uploadZipFile = async () => {
    if (!zipUpload.file || !editingProject) {
      showNotification('Please select a ZIP file and save the project first', 'error');
      return;
    }

    setZipUpload(prev => ({ ...prev, uploading: true }));

    try {
      const projectId = editingProject._id ? String(editingProject._id) : editingProject.id ? String(editingProject.id) : '';
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

      if (!token) {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin-auth';
        }
        return;
      }

      const formData = new FormData();
      formData.append('file', zipUpload.file);
      formData.append('projectId', projectId);

      const res = await fetch('/api/projects/upload-zip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to upload ZIP' }));
        throw new Error(errorData.error || 'Failed to upload ZIP file');
      }

      const result = await res.json();
      setFormData(prev => ({ ...prev, zipUrl: result.zipUrl }));
      setZipUpload({ file: null, name: '', uploading: false });
      showNotification('ZIP file uploaded successfully');
      fetchProjects();
    } catch (error: any) {
      showNotification(error.message || 'Failed to upload ZIP file', 'error');
      setZipUpload(prev => ({ ...prev, uploading: false }));
    }
  };

  const removeZipFile = async () => {
    if (!editingProject) return;

    try {
      const projectId = editingProject._id ? String(editingProject._id) : editingProject.id ? String(editingProject.id) : '';
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

      if (!token) {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin-auth';
        }
        return;
      }

      const res = await fetch(`/api/projects/upload-zip?projectId=${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

      if (!res.ok) {
        throw new Error('Failed to remove ZIP file');
      }

      setFormData(prev => ({ ...prev, zipUrl: '' }));
      setZipUpload({ file: null, name: '', uploading: false });
      showNotification('ZIP file removed successfully');
      fetchProjects();
    } catch (error: any) {
      showNotification('Failed to remove ZIP file', 'error');
    }
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.slug.trim()) errors.slug = 'Slug is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.richDescription.trim() || formData.richDescription === '<p></p>\n') {
      errors.richDescription = 'Rich Description is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMountedRef.current) return;

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Remove image from projectData since we'll handle it separately
      const { image, ...projectDataWithoutImage } = {
        ...formData,
        description: formData.description,
        richDescription: formData.richDescription,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      console.log('DEBUG: Submitting project data:', {
        isPaid: projectDataWithoutImage.isPaid,
        price: projectDataWithoutImage.price,
        title: projectDataWithoutImage.title,
        slug: projectDataWithoutImage.slug
      });

      let projectSlug: string;

      if (editingProject) {
        const updateId = editingProject._id ? String(editingProject._id) : editingProject.id ? String(editingProject.id) : '';
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

        const res = await fetch('/api/projects', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ ...projectDataWithoutImage, id: updateId })
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

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Failed to update project' }));
          throw new Error(errorData.error || 'Failed to update project');
        }

        projectSlug = editingProject.slug;
        showNotification('Project updated successfully');
      } else {
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

        const res = await fetch('/api/projects', {
          method: 'POST',
          headers,
          body: JSON.stringify(projectDataWithoutImage)
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

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Failed to create project' }));
          throw new Error(errorData.error || 'Failed to create project');
        }

        const createdProject = await res.json();
        projectSlug = createdProject.slug;
        showNotification('Project created successfully');
      }

      // Upload image if one was selected
      if (imageUpload.file && projectSlug) {
        try {
          const formData = new FormData();
          formData.append('file', imageUpload.file);
          formData.append('slug', projectSlug);

          const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
          const headers: HeadersInit = {
            'Authorization': `Bearer ${token}`
          };

          const imageResponse = await fetch('/api/projects/image', {
            method: 'POST',
            headers,
            body: formData
          });

          if (!imageResponse.ok) {
            console.warn('Failed to upload image, but project was saved');
          }
        } catch (imageError) {
          console.warn('Image upload failed:', imageError);
        }
      }

      if (isMountedRef.current) {
        setShowModal(false);
        resetForm();
        fetchProjects();
      }
    } catch (error) {
      showNotification('Operation failed. Please try again.', 'error');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (project: Project) => {
    if (!isMountedRef.current) return;

    setEditingProject(project);
    setFormData({
      title: project.title,
      slug: project.slug,
      description: project.description,
      category: project.category,
      tags: project.tags.join(', '),
      image: project.image || '',
      github: project.github || '',
      demo: project.demo || '',
      kaggle: project.kaggle || '',
      linkedin: project.linkedin || '',
      demo2: project.demo2 || '',
      published: project.published,
      richDescription: project.richDescription || '',
      price: project.price || 0,
      currency: project.currency || 'INR',
      isPaid: project.isPaid || false,
      zipUrl: project.zipUrl || '',
      downloadLimit: (project as any).downloadLimit || 5,
      downloadCount: (project as any).downloadCount || 0,
      isPaidAfterLimit: (project as any).isPaidAfterLimit || false,
    });

    // Initialize rich editor from richDescription or description (store HTML)
    try {
      const html = project.richDescription || project.description || '';
      setEditorHtml(html);
    } catch (err) {
      setEditorHtml('');
    }

    // Initialize tags grid rows
    setTagsGridRows((project.tags || []).map(t => ({ tag: t })));

    // Set image preview if project has image
    if (project.image) {
      setImageUpload({
        file: null,
        preview: project.image.startsWith('data:image/') || project.image.startsWith('https://')
          ? project.image
          : `data:image/jpeg;base64,${project.image}`
      });
    } else {
      setImageUpload({
        file: null,
        preview: ''
      });
    }

    setShowModal(true);
  };

  const handleDelete = (id: string | number | undefined) => {
    if (!id || !isMountedRef.current) return;
    if (!confirm('Are you sure you want to delete this project?')) return;

    setIsLoading(true);
    (async () => {
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

        const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE', headers });

        if (res.status === 401) {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('role');
            window.localStorage.removeItem('userId');
            window.location.href = '/admin-auth';
          }
          return;
        }

        if (!res.ok) throw new Error('Failed to delete project');
        if (isMountedRef.current) {
          showNotification('Project deleted successfully');
          fetchProjects();
        }
      } catch {
        if (isMountedRef.current) {
          showNotification('Failed to delete project', 'error');
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    })();
  };

  const resetForm = () => {
    if (!isMountedRef.current) return;

    setFormData({
      title: '',
      slug: '',
      description: '',
      category: '',
      tags: '',
      image: '',
      github: '',
      demo: '',
      kaggle: '',
      linkedin: '',
      demo2: '',
      published: true,
      richDescription: '',
      price: 0,
      currency: 'INR',
      isPaid: false,
      zipUrl: '',
      downloadLimit: 5,
      downloadCount: 0,
      isPaidAfterLimit: false,
    });
    setImageUpload({
      file: null,
      preview: ''
    });
    setZipUpload({
      file: null,
      name: '',
      uploading: false
    });
    setFormErrors({});
    setEditingProject(null);
    setEditorHtml('');
    setShowTagsGrid(false);
    setTagsGridRows([]);
  };

  const handleCloseModal = () => {
    if (!isMountedRef.current) return;

    setShowModal(false);
    resetForm();
  };

  // Safe wrapper for editor HTML change
  const handleEditorHtmlChange = (html: string) => {
    if (isMountedRef.current) {
      setEditorHtml(html);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'machine-learning': return <BarChart3 className="w-4 h-4" />;
      case 'web-development': return <Code className="w-4 h-4" />;
      case 'data-science': return <FileText className="w-4 h-4" />;
      case 'cyber-security': return <Zap className="w-4 h-4" />;
      case 'mobile-development': return <Settings className="w-4 h-4" />;
      case 'blockchain': return <Link2 className="w-4 h-4" />;
      case 'iot': return <Folder className="w-4 h-4" />;
      default: return <Folder className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
        <Loader className="w-8 h-8 animate-spin" style={{ color: '#00FFC6' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)', borderColor: '#232323' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#00FFC6' }}>
                <Folder className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#121212' }} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold truncate" style={{ color: '#E0E0E0' }}>
                  Projects Management
                </h1>
                <p className="text-xs sm:text-sm hidden sm:block" style={{ color: '#757575' }}>
                  Manage all your projects from one place
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-lg border transition-all duration-300 touch-manipulation"
                style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#00FFC6' }} /> : <Grid className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#00FFC6' }} />}
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base touch-manipulation"
                style={{ backgroundColor: '#00FFC6', color: '#121212' }}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Project</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 left-4 sm:left-auto sm:right-6 z-50 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg border ${notification.type === 'error' ? 'border-red-500' : 'border-[#00FFC6]'
          }`} style={{
            backgroundColor: '#181A1B',
            color: notification.type === 'error' ? '#ff4444' : '#00FFC6'
          }}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
          <span className="text-sm sm:text-base flex-1 min-w-0">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 sm:p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                <Folder className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#00FFC6' }} />
              </div>
              <TrendingUp className="w-3 h-3 sm:w-5 sm:h-5" style={{ color: '#7ED321' }} />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ color: '#E0E0E0' }}>{projects.length}</h3>
            <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Total Projects</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 sm:p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                <Eye className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#00FFC6' }} />
              </div>
              <BarChart3 className="w-3 h-3 sm:w-5 sm:h-5" style={{ color: '#00FFC6' }} />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ color: '#E0E0E0' }}>
              {projects.filter(p => p.published).length}
            </h3>
            <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Published</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 sm:p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                <EyeOff className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#00FFC6' }} />
              </div>
              <Archive className="w-3 h-3 sm:w-5 sm:h-5" style={{ color: '#757575' }} />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ color: '#E0E0E0' }}>
              {projects.filter(p => !p.published).length}
            </h3>
            <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Draft</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl border col-span-2 lg:col-span-1" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 sm:p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)' }}>
                <Filter className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: '#00FFC6' }} />
              </div>
              <Clock className="w-3 h-3 sm:w-5 sm:h-5" style={{ color: '#00FFC6' }} />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold mb-1" style={{ color: '#E0E0E0' }}>{filteredProjects.length}</h3>
            <p className="text-xs sm:text-sm" style={{ color: '#757575' }}>Filtered Results</p>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="p-3 sm:p-4 rounded-xl border mb-4 sm:mb-6" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-1 p-1 rounded-lg overflow-x-auto" style={{ backgroundColor: '#121212' }}>
              {[
                { id: 'all', label: 'All Projects', count: projects.length },
                { id: 'published', label: 'Published', count: projects.filter(p => p.published).length },
                { id: 'draft', label: 'Draft', count: projects.filter(p => !p.published).length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-0 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm whitespace-nowrap ${activeTab === tab.id ? '' : 'opacity-60'}`}
                  style={{
                    backgroundColor: activeTab === tab.id ? '#00FFC6' : 'transparent',
                    color: activeTab === tab.id ? '#121212' : '#E0E0E0'
                  }}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-xs" style={{
                    backgroundColor: activeTab === tab.id ? 'rgba(18, 18, 18, 0.2)' : '#232323',
                    color: activeTab === tab.id ? '#121212' : '#757575'
                  }}>{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#757575' }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                  style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedFilters(!expandedFilters)}
                  className="p-2.5 sm:p-3 rounded-lg border transition-all duration-300 touch-manipulation"
                  style={{ backgroundColor: '#121212', borderColor: '#232323' }}
                >
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#00FFC6' }} />
                </button>
              </div>
            </div>

            {expandedFilters && (
              <div className="pt-4 border-t" style={{ borderColor: '#232323' }}>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${selectedCategory === '' ? '' : 'opacity-60'}`}
                    style={{
                      backgroundColor: selectedCategory === '' ? '#00FFC6' : '#121212',
                      color: selectedCategory === '' ? '#121212' : '#E0E0E0'
                    }}
                  >
                    All Categories
                  </button>
                  {Object.entries(CATEGORIES).map(([key, name]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-1 sm:gap-2 text-sm whitespace-nowrap ${selectedCategory === key ? '' : 'opacity-60'}`}
                      style={{
                        backgroundColor: selectedCategory === key ? 'rgba(0, 255, 198, 0.1)' : '#121212',
                        color: selectedCategory === key ? '#00FFC6' : '#E0E0E0'
                      }}
                    >
                      {getCategoryIcon(key)}
                      <span className="hidden sm:inline">{name}</span>
                      <span className="sm:hidden">{name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Projects Display */}
        {isLoading && !showModal ? (
          <div className="flex justify-center items-center py-12 sm:py-20">
            <Loader className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" style={{ color: '#00FFC6' }} />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 rounded-xl border" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
            <Folder className="w-12 h-12 sm:w-16 sm:h-16 mb-4 opacity-30" style={{ color: '#00FFC6' }} />
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-center" style={{ color: '#E0E0E0' }}>No projects found</h3>
            <p className="text-xs sm:text-sm mb-4 sm:mb-6 text-center max-w-md px-4" style={{ color: '#757575' }}>
              {projects.length === 0 ? 'Get started by creating your first project' : 'Try adjusting your search or filters'}
            </p>
            {projects.length === 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 touch-manipulation text-sm sm:text-base"
                style={{ backgroundColor: '#00FFC6', color: '#121212' }}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                Create Project
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProjects.map((project, index) => (
              <div
                key={project._id || project.id || index}
                className="rounded-xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}
              >
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  {project.image ? (
                    <img
                      src={project.image.startsWith('data:image/') || project.image.startsWith('https://')
                        ? project.image
                        : `data:image/jpeg;base64,${project.image}`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#121212' }}>
                      <Image className="w-8 h-8 sm:w-12 sm:h-12 opacity-30" style={{ color: '#00FFC6' }} />
                    </div>
                  )}
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <button
                      onClick={() => setShowDropdown(showDropdown === String(project.id ?? '') ? null : (project.id ? String(project.id) : null))}
                      className="p-1.5 sm:p-2 rounded-lg backdrop-blur-sm touch-manipulation"
                      style={{ backgroundColor: 'rgba(24, 26, 27, 0.8)' }}
                    >
                      <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: '#E0E0E0' }} />
                    </button>
                  </div>
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                      style={{ backgroundColor: 'rgba(0, 255, 198, 0.2)', color: '#00FFC6' }}>
                      {getCategoryIcon(project.category)}
                      <span className="hidden sm:inline">{CATEGORIES[project.category]}</span>
                      <span className="sm:hidden">{CATEGORIES[project.category].split(' ')[0]}</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <h3 className="text-base sm:text-lg font-bold line-clamp-2 pr-2" style={{ color: '#E0E0E0' }}>{project.title}</h3>
                    {project.published ? (
                      <span className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: '#00FFC6' }}>
                        <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="hidden sm:inline">Published</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: '#757575' }}>
                        <EyeOff className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="hidden sm:inline">Draft</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2" style={{ color: '#b0f5e6' }}>{project.description}</p>

                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                    {project.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs" style={{ backgroundColor: '#121212', color: '#757575' }}>
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs" style={{ backgroundColor: '#121212', color: '#757575' }}>
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="flex-1 py-2 rounded-lg font-medium transition-all duration-300 text-sm touch-manipulation"
                      style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)', color: '#00FFC6' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => window.open(`/projects/${project.slug}`, '_blank')}
                      className="flex-1 py-2 rounded-lg font-medium transition-all duration-300 text-sm touch-manipulation"
                      style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                    >
                      View
                    </button>
                  </div>
                </div>

                {showDropdown === project.id && (
                  <div className="p-3 sm:p-4 border-t" style={{ borderColor: '#232323' }}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          handleEdit(project);
                          setShowDropdown(null);
                        }}
                        className="flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation"
                        style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)', color: '#00FFC6' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(project._id || project.id);
                          setShowDropdown(null);
                        }}
                        className="flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation"
                        style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#ff4444' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr style={{ backgroundColor: '#121212' }}>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium" style={{ color: '#b0f5e6' }}>Project</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium" style={{ color: '#b0f5e6' }}>Category</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium" style={{ color: '#b0f5e6' }}>Status</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium" style={{ color: '#b0f5e6' }}>Links</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium" style={{ color: '#b0f5e6' }}>Updated</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium" style={{ color: '#b0f5e6' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project, index) => (
                    <tr
                      key={project._id || project.id || index}
                      className="border-t transition-colors hover:bg-[#1a1c1d]"
                      style={{ borderColor: '#232323' }}
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {project.image ? (
                            <img
                              src={project.image.startsWith('data:image/') || project.image.startsWith('https://')
                                ? project.image
                                : `data:image/jpeg;base64,${project.image}`}
                              alt=""
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#121212' }}>
                              <Image className="w-4 h-4 sm:w-5 sm:h-5 opacity-30" style={{ color: '#00FFC6' }} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm sm:text-base truncate" style={{ color: '#E0E0E0' }}>{project.title}</div>
                            <div className="text-xs opacity-70 truncate max-w-[200px] sm:max-w-none" style={{ color: '#757575' }}>{project.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
                          style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)', color: '#00FFC6' }}>
                          {getCategoryIcon(project.category)}
                          <span className="hidden sm:inline">{CATEGORIES[project.category]}</span>
                          <span className="sm:hidden">{CATEGORIES[project.category].split(' ')[0]}</span>
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        {project.published ? (
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#00FFC6' }}>
                            <Eye className="w-3 h-3" />
                            <span className="hidden sm:inline">Published</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#757575' }}>
                            <EyeOff className="w-3 h-3" />
                            <span className="hidden sm:inline">Draft</span>
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm" style={{ color: '#757575' }}>
                        {formatDate(project.updated_at)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <button
                            onClick={() => handleEdit(project)}
                            className="p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation"
                            style={{ backgroundColor: 'rgba(0, 255, 198, 0.1)', color: '#00FFC6' }}
                          >
                            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => window.open(`/projects/${project.slug}`, '_blank')}
                            className="p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation"
                            style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(project._id || project.id)}
                            className="p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation"
                            style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#ff4444' }}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl" style={{ backgroundColor: '#181A1B', borderColor: '#232323' }}>
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 border-b backdrop-blur-sm" style={{ backgroundColor: 'rgba(24, 26, 27, 0.95)', borderColor: '#232323' }}>
              <h2 className="text-lg sm:text-xl font-bold pr-4" style={{ color: '#E0E0E0' }}>
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg transition-colors touch-manipulation flex-shrink-0"
                style={{ backgroundColor: '#121212', color: '#757575' }}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                    style={{
                      backgroundColor: '#121212',
                      borderColor: formErrors.title ? '#ff4444' : '#232323',
                      color: '#E0E0E0'
                    }}
                  />
                  {formErrors.title && <p className="text-xs sm:text-sm mt-1" style={{ color: '#ff4444' }}>{formErrors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                    style={{
                      backgroundColor: '#121212',
                      borderColor: formErrors.slug ? '#ff4444' : '#232323',
                      color: '#E0E0E0'
                    }}
                  />
                  {formErrors.slug && <p className="text-xs sm:text-sm mt-1" style={{ color: '#ff4444' }}>{formErrors.slug}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                  Description (Plain Text) *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                  style={{
                    backgroundColor: '#121212',
                    borderColor: formErrors.description ? '#ff4444' : '#232323',
                    color: '#E0E0E0',
                  }}
                />
                {formErrors.description && (
                  <p className="text-xs sm:text-sm mt-2" style={{ color: '#ff4444' }}>
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Rich Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                  Rich Description (Rich Text Editor) *
                </label>
                {isClient && (
                  <div className="border rounded-lg overflow-hidden" style={{ borderColor: formErrors.richDescription ? '#ff4444' : '#232323' }}>
                    <RichTextEditor
                      value={editorHtml}
                      onChange={handleEditorHtmlChange}
                      style={{
                        backgroundColor: '#121212',
                        color: '#E0E0E0'
                      }}
                    />
                  </div>
                )}
                {formErrors.richDescription && (
                  <p className="text-xs sm:text-sm mt-2" style={{ color: '#ff4444' }}>
                    {formErrors.richDescription}
                  </p>
                )}
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                    style={{
                      backgroundColor: '#121212',
                      borderColor: formErrors.category ? '#ff4444' : '#232323',
                      color: '#E0E0E0'
                    }}
                  >
                    <option value="">Select Category</option>
                    {Object.entries(CATEGORIES).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                  {formErrors.category && <p className="text-xs sm:text-sm mt-1" style={{ color: '#ff4444' }}>{formErrors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                    Tags (comma-separated)
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="React, Python, TensorFlow"
                        className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowTagsGrid(prev => !prev);
                          if (!showTagsGrid && formData.tags) {
                            // Parse current tags into grid rows when opening
                            const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
                            setTagsGridRows(tags.map(tag => ({ tag })));
                          }
                        }}
                        className="px-2 sm:px-3 py-2 rounded-lg border hover:bg-[#232323] transition-colors whitespace-nowrap text-sm"
                      >
                        {showTagsGrid ? 'Close Grid' : 'Edit in Grid'}
                      </button>
                    </div>

                    {showTagsGrid && (
                      <div className="p-3 sm:p-4 rounded border space-y-2" style={{ backgroundColor: '#121212', borderColor: '#232323' }}>
                        {tagsGridRows.map((row, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={row.tag}
                              onChange={(e) => {
                                const newRows = [...tagsGridRows];
                                newRows[index] = { tag: e.target.value };
                                setTagsGridRows(newRows);
                              }}
                              placeholder="Enter tag"
                              className="flex-1 px-2 sm:px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm"
                              style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                            />
                            <button
                              type="button"
                              onClick={() => setTagsGridRows(tagsGridRows.filter((_, i) => i !== index))}
                              className="p-2 rounded-lg hover:bg-red-600 transition-colors touch-manipulation"
                              style={{ backgroundColor: 'rgba(255, 68, 68, 0.8)', color: 'white' }}
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setTagsGridRows([...tagsGridRows, { tag: '' }])}
                          className="w-full px-3 py-2 rounded-lg border hover:bg-[#232323] transition-colors flex items-center justify-center gap-2 text-sm touch-manipulation"
                          style={{ borderColor: '#232323', color: '#00FFC6' }}
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          Add Tag
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                  Project Image
                </label>

                {imageUpload.preview ? (
                  <div className="space-y-4">
                    {/* Image Preview */}
                    <div className="relative">
                      <img
                        src={imageUpload.preview}
                        alt="Preview"
                        className="w-full h-32 sm:h-48 object-cover rounded-lg border"
                        style={{ borderColor: '#232323' }}
                        crossOrigin="anonymous"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 sm:p-2 rounded-full hover:bg-red-600 transition-colors touch-manipulation"
                        style={{ backgroundColor: 'rgba(255, 68, 68, 0.8)', color: 'white' }}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* Replace Image Button */}
                    <div className="flex items-center justify-center">
                      <label className="cursor-pointer flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-dashed hover:bg-[#232323] transition-colors touch-manipulation"
                        style={{ borderColor: '#00FFC6', color: '#00FFC6' }}>
                        <Image className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">Replace Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg p-6 sm:p-8 text-center hover:bg-[#232323] transition-colors cursor-pointer touch-manipulation"
                    style={{ borderColor: '#00FFC6' }}
                  >
                    <label className="cursor-pointer">
                      <Image className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" style={{ color: '#00FFC6' }} />
                      <div className="space-y-2">
                        <div className="text-base sm:text-lg font-semibold" style={{ color: '#00FFC6' }}>
                          Upload Project Image
                        </div>
                        <div className="text-xs sm:text-sm opacity-70">
                          Click to browse or drag and drop
                        </div>
                        <div className="text-xs opacity-50">
                          Supports JPG, PNG, GIF (max 5MB)
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* ZIP File Upload */}
              {editingProject && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                    Project ZIP File (Optional)
                  </label>
                  {formData.zipUrl ? (
                    <div className="space-y-3">
                      <div className="p-3 sm:p-4 rounded-lg border" style={{ backgroundColor: '#121212', borderColor: '#00FFC6' }}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#00FFC6' }}>ZIP file uploaded</p>
                            <p className="text-xs opacity-75" style={{ color: '#b0f5e6' }}>{formData.zipUrl}</p>
                          </div>
                          <button
                            type="button"
                            onClick={removeZipFile}
                            className="p-2 rounded-lg hover:bg-red-600 transition-colors flex-shrink-0 touch-manipulation"
                            style={{ backgroundColor: 'rgba(255, 68, 68, 0.8)', color: 'white' }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : zipUpload.file ? (
                    <div className="space-y-3">
                      <div className="p-3 sm:p-4 rounded-lg border" style={{ backgroundColor: '#121212', borderColor: '#00FFC6' }}>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{zipUpload.name}</p>
                            <p className="text-xs opacity-75">{(zipUpload.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setZipUpload({ file: null, name: '', uploading: false })}
                            className="p-2 rounded-lg hover:bg-red-600 transition-colors flex-shrink-0 touch-manipulation"
                            style={{ backgroundColor: 'rgba(255, 68, 68, 0.8)', color: 'white' }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={uploadZipFile}
                          disabled={zipUpload.uploading}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                          style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                        >
                          {zipUpload.uploading ? (
                            <>
                              <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin inline mr-2" />
                              Uploading...
                            </>
                          ) : (
                            'Upload ZIP'
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-lg p-6 sm:p-8 text-center hover:bg-[#232323] transition-colors cursor-pointer touch-manipulation"
                      style={{ borderColor: '#00FFC6' }}
                    >
                      <label className="cursor-pointer">
                        <Folder className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" style={{ color: '#00FFC6' }} />
                        <div className="space-y-2">
                          <div className="text-base sm:text-lg font-semibold" style={{ color: '#00FFC6' }}>
                            Upload Project ZIP
                          </div>
                          <div className="text-xs sm:text-sm opacity-70">
                            Click to browse or drag and drop
                          </div>
                          <div className="text-xs opacity-50">
                            ZIP files only (max 100MB)
                          </div>
                        </div>
                        <input
                          type="file"
                          accept=".zip"
                          onChange={handleZipUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Download Limit for Free Projects */}
              <div className="space-y-4">
                <label className="block text-sm font-medium" style={{ color: '#b0f5e6' }}>
                  Free Project Download Limit
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: '#b0f5e6' }}>
                      Download Limit (default: 5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.downloadLimit || 5}
                      onChange={(e) => setFormData(prev => ({ ...prev, downloadLimit: parseInt(e.target.value) || 5 }))}
                      placeholder="Number of free downloads allowed"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                      style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                    />
                    <p className="text-xs mt-1 opacity-75" style={{ color: '#b0f5e6' }}>
                      After this limit, users will need to purchase to download
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: '#b0f5e6' }}>
                      Current Downloads
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.downloadCount || 0}
                      disabled
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none text-sm sm:text-base opacity-60 cursor-not-allowed"
                      style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#b0f5e6' }}
                    />
                    <p className="text-xs mt-1 opacity-75" style={{ color: '#b0f5e6' }}>
                      Read-only: tracks downloads automatically
                    </p>
                  </div>
                </div>
                {formData.isPaidAfterLimit && (
                  <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)' }}>
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#4ade80' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#4ade80' }}>
                        Download limit reached
                      </p>
                      <p className="text-xs opacity-75" style={{ color: '#b0f5e6' }}>
                        This project is now treated as a paid project. Users must purchase to download.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    placeholder="https://github.com/..."
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                    Kaggle URL
                  </label>
                  <input
                    type="url"
                    name="kaggle"
                    value={formData.kaggle}
                    onChange={handleInputChange}
                    placeholder="https://kaggle.com/..."
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="LinkedIn URL (optional)"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                    Demo URL
                  </label>
                  <input
                    type="url"
                    name="demo"
                    value={formData.demo}
                    onChange={handleInputChange}
                    placeholder="https://demo.example.com"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                    Second Demo URL
                  </label>
                  <input
                    type="text"
                    name="demo2"
                    value={formData.demo2}
                    onChange={handleInputChange}
                    placeholder="Second Demo URL (optional)"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                    style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                  />
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                    Payment Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isPaid"
                        checked={!formData.isPaid}
                        onChange={() => setFormData(prev => ({ ...prev, isPaid: false, price: 0 }))}
                        className="w-4 h-4 text-[#00FFC6] focus:ring-[#00FFC6]/30"
                        style={{ accentColor: '#00FFC6' }}
                      />
                      <span className="text-sm" style={{ color: '#E0E0E0' }}>Free</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isPaid"
                        checked={formData.isPaid}
                        onChange={() => setFormData(prev => ({ ...prev, isPaid: true }))}
                        className="w-4 h-4 text-[#00FFC6] focus:ring-[#00FFC6]/30"
                        style={{ accentColor: '#00FFC6' }}
                      />
                      <span className="text-sm" style={{ color: '#E0E0E0' }}>Paid</span>
                    </label>
                  </div>
                </div>

                {formData.isPaid && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                      >
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#b0f5e6' }}>
                        Price
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder={`Enter price in ${formData.currency}`}
                        min="0"
                        step="0.01"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFC6]/30 text-sm sm:text-base"
                        style={{ backgroundColor: '#121212', borderColor: '#232323', color: '#E0E0E0' }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Published */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={formData.published}
                  onChange={handleInputChange}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded border-2 focus:ring-2 focus:ring-[#00FFC6]/30 cursor-pointer"
                  style={{ accentColor: '#00FFC6' }}
                />
                <label htmlFor="published" className="text-sm font-medium cursor-pointer" style={{ color: '#b0f5e6' }}>
                  Publish this project immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base"
                  style={{ backgroundColor: '#00FFC6', color: '#121212' }}
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{editingProject ? 'Update' : 'Create'} Project</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border hover:bg-[#232323] transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base"
                  style={{ borderColor: '#232323' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}