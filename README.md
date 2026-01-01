# SpyberPolymath Portfolio

> **Professional portfolio of Aman Anil - A cybersecurity researcher and ethical hacker specializing in API security, AI systems, penetration testing, and digital privacy solutions.**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.16-38B2AC)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-Check_LICENSE-blue)](./LICENSE)

## 🌟 Overview

SpyberPolymath is a comprehensive portfolio website showcasing cybersecurity expertise, research projects, and professional services. Built with modern web technologies, it features a complete content management system, user authentication, payment processing, and secure project delivery.

## ✨ Key Features

### 🏠 **Core Portfolio Features**
- **Professional Portfolio**: Showcase of cybersecurity expertise and projects
- **Interactive Home Page**: Dynamic animations with floating particles and glow effects
- **Expertise Showcase**: Comprehensive display of technical skills and tools
- **Journey Timeline**: Professional development and career milestones
- **Responsive Design**: Optimized for all devices and screen sizes

### 📝 **Content Management**
- **Blog System**: Full-featured blog with rich text editor (React Quill)
- **Project Management**: Detailed project showcase with categorization
- **SEO Optimization**: Dynamic metadata, sitemap generation, and structured data
- **Rich Media Support**: Image handling with Cloudinary integration

### 🔐 **Authentication & Security**
- **JWT-based Authentication**: Secure user sessions with Jose
- **Two-Factor Authentication (2FA)**: Enhanced security with OTP support
- **Role-based Access Control**: Admin and user role management
- **Password Security**: Bcrypt hashing with salt
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: API endpoint protection
- **Helmet Security**: HTTP security headers

### 💳 **E-commerce & Payments**
- **Payment Processing**: Secure payment handling for projects
- **Invoice Generation**: PDF invoice creation with jsPDF
- **Payment History**: Comprehensive payment tracking
- **Project Access Control**: Paid content delivery system
- **All-Access Subscriptions**: Premium membership features

### 📧 **Communication System**
- **Email Integration**: Resend email service with retry logic
- **Newsletter Management**: Subscription and preference handling
- **Contact Forms**: Multi-purpose contact and inquiry forms
- **Email Preferences**: User-controlled notification settings
- **Automated Notifications**: Welcome, security, and login alerts

### 🛠️ **Admin Panel**
- **Dashboard Analytics**: User and payment insights with Recharts
- **User Management**: Complete user lifecycle management
- **Content Administration**: Blog and project CRUD operations
- **Payment Monitoring**: Transaction and revenue tracking
- **System Controls**: 2FA management and security settings

## 🏗️ Architecture Overview

```mermaid
flowchart TD
    %% User Layer
    U["👤 User / Visitor"] -->|Visits| FE["🌐 Next.js Frontend"]

    %% Frontend Pages
    FE --> H["🏠 Home"]
    FE --> B["📝 Blog"]
    FE --> P["📦 Projects"]
    FE --> J["🧭 Journey"]
    FE --> E["🧠 Expertise"]
    FE --> C["📩 Contact"]
    FE --> N["📬 Newsletter"]

    %% Click & Analytics
    FE -->|Page Views & Clicks| GA["📊 Google Analytics (GA4)"]

    %% Admin Layer
    A["🛡️ Admin"] -->|Secure Login| AD["⚙️ Admin Dashboard"]
    AD --> AB["✍️ Blog Admin"]
    AD --> AP["💳 Payments Admin"]
    AD --> APR["📦 Project Admin"]
    AD --> AU["👥 User Admin"]
    AD --> AN["📨 Newsletter Admin"]

    %% API Layer
    FE -->|API Calls| API["🔌 Next.js API Routes"]
    AD -->|Admin APIs| API

    %% Backend Logic
    API --> AUTH["🔐 Auth & 2FA"]
    API --> PAY["💰 Payments Logic"]
    API --> BLOG["📝 Blog Logic"]
    API --> PROJ["📦 Project Logic"]
    API --> MAIL["📧 Email / Resend"]

    %% Database
    API --> DB[("🗄️ MongoDB")]
    DB --> M1["👤 Users"]
    DB --> M2["📝 BlogPosts"]
    DB --> M3["📦 Projects"]
    DB --> M4["💳 AccountPayments"]
    DB --> M5["💳 ProjectPayments"]
    DB --> M6["📬 Subscribers"]
    DB --> M7["📊 Visits & Logs"]

    %% File Storage
    PROJ --> CLD["☁️ Cloudinary"]
    CLD --> IMG["🖼️ Images"]
    CLD --> ZIP["📁 ZIP / PDF Files"]

    %% Download Flow
    U -->|After Payment| DL["⬇️ Download Page"]
    DL -->|Secure Link| CLD

    %% Logging & Security
    API --> LOGS["📑 Logs & Audits"]
```

This comprehensive architecture diagram illustrates the complete data flow and system interactions within the SpyberPolymath portfolio platform:

### **Frontend Layer**
- **Next.js Frontend**: Server-side rendered React application with static generation
- **Page Components**: Modular pages for different sections (Home, Blog, Projects, etc.)
- **Analytics Integration**: Google Analytics (GA4) for user behavior tracking

### **Admin Layer**
- **Secure Admin Dashboard**: Protected admin interface with role-based access
- **Content Management**: Admin panels for blog, projects, payments, users, and newsletter
- **Authentication**: Secure admin login with 2FA support

### **API Layer**
- **Next.js API Routes**: RESTful API endpoints handling all business logic
- **Middleware**: Authentication, validation, rate limiting, and security headers
- **Service Integration**: Payment processing, email delivery, and file management

### **Backend Services**
- **Authentication & 2FA**: JWT-based auth with two-factor authentication
- **Payment Processing**: Secure payment handling with invoice generation
- **Content Management**: Blog and project CRUD operations
- **Email Service**: Automated notifications via Resend service

### **Data Layer**
- **MongoDB Database**: Document-based storage with optimized schemas
- **Collections**: Users, BlogPosts, Projects, Payments, Subscribers, and Analytics
- **File Storage**: Cloudinary for images, documents, and project files

### **Security & Monitoring**
- **Audit Logging**: Comprehensive logging for security and debugging
- **File Security**: Secure download links with access control
- **Rate Limiting**: API protection against abuse and DDoS attacks

## 🏗️ Technology Stack

### **Frontend**
- **Framework**: Next.js 16.0.10 with React 19.2.1
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.1.16 with custom animations
- **Icons**: Lucide React, React Icons
- **Components**: Custom UI components with accessibility
- **Analytics**: Vercel Analytics and Speed Insights

### **Backend & Database**
- **API Routes**: Next.js API routes with middleware
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Jose library
- **File Handling**: Cloudinary for media management
- **Email**: Resend email service
- **Validation**: Zod schema validation

### **Security & DevOps**
- **Security**: Helmet, CSRF protection, rate limiting
- **Logging**: Winston with daily rotation
- **Environment**: Dotenv configuration
- **Development**: TypeScript strict mode
- **Package Management**: NPM with overrides

### **Key Libraries & Dependencies**
```json
{
  "next": "16.0.10",
  "react": "19.2.1",
  "typescript": "^5",
  "tailwindcss": "^4.1.16",
  "mongodb": "^6.20.0",
  "mongoose": "^8.19.2",
  "jose": "^6.1.0",
  "bcryptjs": "^3.0.2",
  "resend": "^6.3.0",
  "cloudinary": "^2.8.0",
  "zod": "^4.1.12",
  "otplib": "^12.0.1",
  "winston": "^3.19.0"
}
```

## 📁 Project Structure

```
├── .env.local                           # Environment variables (local)
├── .gitignore                           # Git ignore rules
├── LICENSE                              # Project license
├── README.md                            # Project documentation
├── next-env.d.ts                        # Next.js TypeScript definitions
├── next.config.ts                       # Next.js configuration
├── package.json                         # Dependencies and scripts
├── package-lock.json                    # Lockfile for dependencies
├── postcss.config.mjs                   # PostCSS configuration
├── tailwind.config.js                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript configuration
├── logs/                                # Application logs
│   ├── combined-2025-12-18.log         # Combined application logs
│   ├── error-2025-12-18.log            # Error logs
│   ├── security-2025-12-18.log         # Security logs
│   └── *-audit.json                    # Audit log files
├── public/                              # Static assets
│   ├── aman-anil-spyberpolymath.jpeg   # Profile image
│   ├── logo.png                        # Logo image
│   ├── robots.txt                      # SEO robots file
│   └── favicon/                        # Favicon assets
│       ├── android-chrome-192x192.png
│       ├── android-chrome-512x512.png
│       ├── apple-touch-icon.png
│       ├── favicon-16x16.png
│       ├── favicon-32x32.png
│       ├── favicon.ico
│       └── site.webmanifest
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── globals.css                 # Global CSS styles
│   │   ├── layout.tsx                  # Root layout component
│   │   ├── not-found.tsx               # 404 error page
│   │   ├── page.tsx                    # Homepage component
│   │   ├── sitemap.ts                  # Dynamic sitemap generation
│   │   ├── accounts/                   # User accounts page
│   │   │   └── page.tsx
│   │   ├── admin/                      # Admin panel pages
│   │   │   ├── layout.tsx              # Admin layout
│   │   │   ├── page.tsx                # Admin dashboard
│   │   │   ├── admin-blog/             # Blog management
│   │   │   │   └── page.tsx
│   │   │   ├── admin-contact/          # Contact management
│   │   │   │   └── page.tsx
│   │   │   ├── admin-newsletter/       # Newsletter management
│   │   │   │   └── page.tsx
│   │   │   ├── admin-payments/         # Payment management
│   │   │   │   └── page.tsx
│   │   │   ├── admin-profile/          # Admin profile
│   │   │   │   └── page.tsx
│   │   │   ├── admin-project/          # Project management
│   │   │   │   └── page.tsx
│   │   │   └── admin-users/            # User management
│   │   │       └── page.tsx
│   │   ├── admin-auth/                 # Admin authentication
│   │   │   └── page.tsx
│   │   ├── api/                        # API routes
│   │   │   ├── 2fa/                    # Two-factor authentication
│   │   │   │   ├── disable/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── enable/
│   │   │   │   │   └── route.ts
│   │   │   │   └── verify/
│   │   │   │       └── route.ts
│   │   │   ├── account-payments/       # Account payment endpoints
│   │   │   │   └── route.ts
│   │   │   ├── accounts/               # Account management
│   │   │   │   └── route.ts
│   │   │   ├── admin/                  # Admin API endpoints
│   │   │   │   ├── 2fa/
│   │   │   │   │   ├── disable/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── enable/
│   │   │   │   │     └── route.ts
│   │   │   │   ├── blog/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── email-preferences/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── fix-project/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── newsletter/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── payments/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── projectpayments/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── stats/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── user-login-history/
│   │   │   │   │   └── route.ts
│   │   │   │   └── users/
│   │   │   │       └── route.ts
│   │   │   ├── blog/                   # Blog API endpoints
│   │   │   │   └── route.ts
│   │   │   ├── contact/                # Contact form API
│   │   │   │   └── route.ts
│   │   │   ├── email-preferences/      # Email preferences
│   │   │   │   └── route.ts
│   │   │   ├── invoice/                # Invoice generation
│   │   │   │   └── generate/
│   │   │   │       └── route.ts
│   │   │   ├── login/                  # User login
│   │   │   │   └── route.ts
│   │   │   ├── logout-session/         # Session logout
│   │   │   │   └── route.ts
│   │   │   ├── newsletter/             # Newsletter API
│   │   │   │   └── route.ts
│   │   │   ├── og/                     # Open Graph images
│   │   │   │   └── route.ts
│   │   │   ├── payment-complete/       # Payment completion
│   │   │   │   └── route.ts
│   │   │   ├── project-contacts/       # Project contact forms
│   │   │   │   └── route.ts
│   │   │   ├── projectpayments/        # Project payments
│   │   │   │   └── route.ts
│   │   │   ├── projects/               # Project management
│   │   │   │   ├── route.ts
│   │   │   │   ├── download-zip/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── image/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── upload-zip/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── signup/                 # User registration
│   │   │   │   └── route.ts
│   │   │   ├── unsubscribe/            # Newsletter unsubscribe
│   │   │   │   └── route.ts
│   │   │   ├── user/                   # User profile API
│   │   │   │   └── route.ts
│   │   │   ├── users/                  # User management
│   │   │   │   └── route.ts
│   │   │   ├── validate-token/         # Token validation
│   │   │   │   └── route.ts
│   │   │   └── verify-email/           # Email verification
│   │   │       └── route.ts
│   │   ├── auth/                       # Authentication pages
│   │   │   └── page.tsx
│   │   ├── blog/                       # Blog pages
│   │   │   ├── page.tsx                # Blog listing
│   │   │   └── [slug]/                 # Individual blog posts
│   │   │       └── page.tsx
│   │   ├── components/                 # React components
│   │   │   ├── Accounts.tsx            # Account management component
│   │   │   ├── admin_auth.tsx          # Admin authentication component
│   │   │   ├── admin_blog.tsx          # Admin blog management
│   │   │   ├── admin_contact.tsx       # Admin contact management
│   │   │   ├── admin_dashbaord.tsx     # Admin dashboard (note: typo in filename)
│   │   │   ├── admin_newsletter.tsx    # Admin newsletter management
│   │   │   ├── admin_payments.tsx      # Admin payments management
│   │   │   ├── admin_profile.tsx       # Admin profile component
│   │   │   ├── admin_projects.tsx      # Admin projects management
│   │   │   ├── admin_users.tsx         # Admin users management
│   │   │   ├── Auth.tsx                # Authentication component
│   │   │   ├── Blog.tsx                # Blog listing component
│   │   │   ├── BlogDetails.tsx         # Blog post details
│   │   │   ├── Contact.tsx             # Contact form component
│   │   │   ├── DownloadProject.tsx     # Project download component
│   │   │   ├── Expertise.tsx           # Skills and expertise showcase
│   │   │   ├── Footer.tsx              # Site footer
│   │   │   ├── Home.tsx                # Homepage component
│   │   │   ├── Journey.tsx             # Professional journey component
│   │   │   ├── LayoutProvider.tsx      # Layout context provider
│   │   │   ├── Navbar.tsx              # Navigation bar
│   │   │   ├── Newsletter.tsx          # Newsletter component
│   │   │   ├── ProjectDetail.tsx       # Project details component
│   │   │   ├── Projects.tsx            # Projects listing component
│   │   │   ├── RichTextEditor.tsx      # Rich text editor component
│   │   │   ├── RouteGuard.tsx          # Route protection component
│   │   │   ├── StructuredData.tsx      # SEO structured data
│   │   │   └── Unsubscribe.tsx         # Newsletter unsubscribe
│   │   ├── contact/                    # Contact page
│   │   │   └── page.tsx
│   │   ├── download-project/           # Project download page
│   │   │   └── page.tsx
│   │   ├── expertise/                  # Expertise page
│   │   │   └── page.tsx
│   │   ├── journey/                    # Journey page
│   │   │   └── page.tsx
│   │   ├── newsletter/                 # Newsletter page
│   │   │   └── page.tsx
│   │   ├── projects/                   # Projects pages
│   │   │   ├── layout.tsx              # Projects layout
│   │   │   ├── page.tsx                # Projects listing
│   │   │   └── [slug]/                 # Individual project pages
│   │   │       └── page.tsx
│   │   └── unsubscribe/                # Unsubscribe page
│   │       └── page.tsx
│   ├── lib/                            # Utility libraries
│   │   ├── blogUtils.ts                # Blog utility functions
│   │   ├── cloudinary.ts               # Cloudinary integration
│   │   ├── idGenerator.ts              # ID generation utilities
│   │   ├── logger.ts                   # Logging utilities
│   │   ├── middleware.ts               # Custom middleware
│   │   ├── mongodb.ts                  # MongoDB connection
│   │   ├── objectIdUtils.ts            # ObjectId utilities
│   │   ├── ogImage.ts                  # Open Graph image generation
│   │   ├── parseUserAgent.ts           # User agent parsing
│   │   ├── requireAuth.ts              # Authentication middleware
│   │   ├── resend.ts                   # Email service integration
│   │   ├── security.ts                 # Security utilities
│   │   ├── seo.ts                      # SEO utilities
│   │   ├── tokenUtils.ts               # JWT token utilities
│   │   └── validation.ts               # Input validation schemas
│   ├── models/                         # MongoDB models
│   │   ├── AccountPayment.ts           # Account payment model
│   │   ├── BlogPost.ts                 # Blog post model
│   │   ├── BlogVisit.ts                # Blog visit tracking model
│   │   ├── Category.ts                 # Category model
│   │   ├── ContactMessage.ts           # Contact message model
│   │   ├── Project.ts                  # Project model
│   │   ├── ProjectPayment.ts           # Project payment model
│   │   ├── Subscriber.ts               # Newsletter subscriber model
│   │   └── User.ts                     # User model
│   ├── scripts/                        # Utility scripts
│   │   └── generateAuth.ts             # Admin credential generation
│   └── types/                          # TypeScript type definitions
│       ├── draftjs-to-html.d.ts        # Draft.js to HTML types
│       └── react-rich-text-editor.d.ts # Rich text editor types
├── .next/                              # Next.js build output (generated)
├── node_modules/                       # Dependencies (generated)
└── .git/                               # Git repository (generated)
```

## 🚀 Getting Started

### Prerequisites

Before running this project, ensure you have:

- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **MongoDB** database (local or Atlas)
- **Resend** email service account
- **Cloudinary** account (for media handling)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/spyberpolymath/nextjs-spyberpolymath.com.git
   cd nextjs-spyberpolymath.com
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create `.env.local` file in the root directory with the following variables:
   ```env
   # ===========================================
   # DATABASE CONFIGURATION
   # ===========================================
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
   # Example: mongodb+srv://admin:password123@cluster0.abcde.mongodb.net/spyberpolymath

   # ===========================================
   # AUTHENTICATION & SECURITY
   # ===========================================
   JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
   JWT_EXPIRES_IN=7d
   ENCRYPTION_KEY=your-32-character-encryption-key-for-sensitive-data
   SESSION_SECRET=your-session-secret-key-for-express-sessions

   # ===========================================
   # EMAIL SERVICE (Resend)
   # ===========================================
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com

   # ===========================================
   # CLOUDINARY (Media Storage - Optional)
   # ===========================================
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret

   # ===========================================
   # APPLICATION URLS
   # ===========================================
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_MAIN_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_MEDIA_BASE_URL=http://localhost:3000

   # ===========================================
   # PRODUCTION URLS (Update for production)
   # ===========================================
   # NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   # NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   # NEXT_PUBLIC_API_URL=https://yourdomain.com/api
   # NEXT_PUBLIC_MAIN_SITE_URL=https://yourdomain.com
   # NEXT_PUBLIC_MEDIA_BASE_URL=https://yourdomain.com
   ```

   **Environment Variable Details:**
   - `MONGODB_URI`: MongoDB connection string (Atlas or local)
   - `JWT_SECRET`: 32+ character secret for JWT token signing
   - `JWT_EXPIRES_IN`: Token expiration time (e.g., 7d, 24h, 3600s)
   - `ENCRYPTION_KEY`: 32-character key for data encryption
   - `SESSION_SECRET`: Secret for session management
   - `RESEND_API_KEY`: API key from Resend email service
   - `RESEND_FROM_EMAIL`: Verified sender email address
   - `CLOUDINARY_*`: Optional media storage configuration

4. **Generate Admin Credentials**
   ```bash
   npm run admin
   ```
   
   **Admin Setup Process:**
   - Interactive CLI prompts for admin details
   - Generates secure random password (12+ characters)
   - Creates admin user in database with UID and PID
   - Displays formatted credentials with QR code option
   - Sets up initial admin role and permissions
   
   **Example Output:**
   ```
   ┌─────────────────────────────────────────────────┐
   │              Generated Credentials              │
   ├─────────────────────────────────────────────────┤
   │ Email:    admin@spyberpolymath.com              │
   │ Password: Xy9$mP2kL8nQ                          │
   │ User ID:  UID000001                             │
   │ Payment ID: PID000001                           │
   └─────────────────────────────────────────────────┘
   ```
   
   **Post-Setup Steps:**
   - Save credentials securely (password manager recommended)
   - Access admin panel at `/admin-auth`
   - Complete 2FA setup for enhanced security
   - Configure email preferences and notifications

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin
   - **Admin Auth**: http://localhost:3000/admin-auth

## 📊 Database Models

### User Schema
```typescript
interface IUser {
  name: string;
  email: string;
  joinedDate: Date;
  lastLogin: Date;
  role?: 'admin' | 'user';
  phone?: string;
  dateOfBirth?: Date;
  status?: string;
  address?: {
    street: string;
    addressLine2?: string;
    city: string;
    stateProvince?: string;
    country: string;
    postalCode: string;
  };
  password: string;
  emailOtpEnabled: boolean;
  emailOtpCode?: string;
  emailOtpExpires?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  uid: string;
  pid: string;
  activeSubscription?: {
    planType: 'free' | 'supporter' | 'allAccess';
    billingCycle: 'monthly' | 'quarterly' | 'yearly';
    startDate: Date;
    endDate: Date;
    renewalDate: Date;
    isActive: boolean;
  };
  loginHistory: Array<{
    ip: string;
    userAgent: string;
    location?: string;
    device?: string;
    timestamp: Date;
    success: boolean;
    loggedOut?: boolean;
  }>;
  paymentHistory: Array<{
    paymentId: string;
    amount: number;
    currency: string;
    description: string;
    date: Date;
    status: string;
  }>;
  emailPreferences: {
    security: boolean;
    welcome: boolean;
    accountChanges: boolean;
    loginNotifications: boolean;
    newsletter: boolean;
    twoFactorNotifications: boolean;
  };
}
```

### Project Schema
```typescript
interface IProject {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  image?: string; // Cloudinary URL
  github?: string;
  demo?: string;
  kaggle?: string;
  linkedin?: string;
  demo2?: string;
  published: boolean;
  created_at: Date;
  updated_at: Date;
  richDescription?: string;
  price?: number;
  currency?: string;
  isPaid?: boolean;
  zipUrl?: string;
  downloadLimit?: number;
  downloadCount?: number;
  isPaidAfterLimit?: boolean;
}
```

### Blog Post Schema
```typescript
interface IBlogPost {
  title: string;
  excerpt: string;
  richDescription: string;
  author: string;
  date: Date;
  category: string;
  categorySlug: string;
  image?: string; // Cloudinary URL
  slug: string;
  featured?: boolean;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  views?: number;
  readTime?: number;
  projectId?: string; // Reference to associated project
}
```

### Payment Schema
```typescript
interface IProjectPayment {
  projectId: string;
  userId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  method: string;
  transactionId: string;
  invoiceId: string;
  date: Date;
  // Contact form fields
  name: string;
  email: string;
  phone: string;
  address: string;
  addressLine2?: string;
  city: string;
  countryRegion: string;
  stateProvince?: string;
  postalCode: string;
  vatGstId?: string;
  message?: string;
}
```

### Account Payment Schema
```typescript
interface IAccountPayment {
  userId: string;
  paymentId: string;
  planType: 'free' | 'supporter' | 'allAccess';
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  method: string;
  transactionId: string;
  invoiceId: string;
  startDate: Date;
  endDate: Date;
  renewalDate: Date;
  isActive: boolean;
}
```

### Subscriber Schema
```typescript
interface ISubscriber {
  email: string;
  name?: string;
  subscribedAt: Date;
  status: 'active' | 'unsubscribed' | 'bounced';
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    categories: string[];
  };
  unsubscribeToken: string;
}
```

### Contact Message Schema
```typescript
interface IContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  adminResponse?: string;
  responseDate?: Date;
}
```

## 🔐 API Endpoints

### Authentication Endpoints
- `POST /api/login` - User authentication with JWT token generation
- `POST /api/signup` - New user registration with email verification
- `POST /api/logout-session` - Secure session termination
- `POST /api/validate-token` - JWT token validation and refresh
- `POST /api/verify-email` - Email address verification
- `POST /api/2fa/enable` - Enable two-factor authentication
- `POST /api/2fa/disable` - Disable two-factor authentication
- `GET /api/2fa/options` - Get 2FA setup options
- `POST /api/2fa/options` - Configure 2FA settings

### Admin Panel Endpoints
- `GET /api/admin/users` - List all users with pagination
- `GET /api/admin/users/[id]` - Get specific user details
- `PUT /api/admin/users/[id]` - Update user information
- `DELETE /api/admin/users/[id]` - Delete user account
- `POST /api/admin/2fa/enable` - Enable admin 2FA
- `POST /api/admin/2fa/disable` - Disable admin 2FA
- `GET /api/admin/analytics` - Dashboard analytics and metrics
- `GET /api/admin/blog` - Admin blog management
- `POST /api/admin/blog` - Create new blog post
- `PUT /api/admin/blog/[id]` - Update blog post
- `DELETE /api/admin/blog/[id]` - Delete blog post
- `GET /api/admin/projects` - Admin project management
- `POST /api/admin/projects` - Create new project
- `PUT /api/admin/projects/[id]` - Update project
- `DELETE /api/admin/projects/[id]` - Delete project
- `POST /api/admin/projects/upload-zip` - Upload project files
- `GET /api/admin/payments` - Payment transaction history
- `GET /api/admin/contacts` - Contact form submissions

### Content Management Endpoints
- `GET /api/blog` - List published blog posts
- `GET /api/blog/[slug]` - Get specific blog post
- `POST /api/blog` - Create blog post (Admin only)
- `PUT /api/blog/[id]` - Update blog post (Admin only)
- `DELETE /api/blog/[id]` - Delete blog post (Admin only)
- `GET /api/projects` - List published projects
- `GET /api/projects/[slug]` - Get specific project details
- `POST /api/projects` - Create project (Admin only)
- `PUT /api/projects/[id]` - Update project (Admin only)
- `DELETE /api/projects/[id]` - Delete project (Admin only)
- `GET /api/projects/image/[slug]` - Get project image
- `POST /api/projects/upload-zip` - Upload project ZIP files
- `GET /api/categories` - Get project categories

### Communication Endpoints
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get contact submissions (Admin)
- `PUT /api/contact/[id]` - Update contact status (Admin)
- `DELETE /api/contact/[id]` - Delete contact submission (Admin)
- `POST /api/newsletter` - Subscribe to newsletter
- `POST /api/unsubscribe` - Unsubscribe from newsletter
- `GET /api/email-preferences` - Get user email preferences
- `PUT /api/email-preferences` - Update email preferences

### Payment & Commerce Endpoints
- `POST /api/project-contacts` - Handle project inquiries and payments
- `POST /api/payment-complete` - Process payment completion
- `GET /api/invoice/generate` - Generate PDF invoices
- `GET /api/user/projects-by-email` - Get user's purchased projects
- `GET /api/account-payments` - Get account payment history
- `POST /api/account-payments` - Process account payments
- `GET /api/projectpayments` - Get project payment records
- `POST /api/projectpayments` - Create payment records

### User Management Endpoints
- `GET /api/user` - Get current user profile
- `PUT /api/user` - Update user profile
- `GET /api/users` - List users (Admin)
- `GET /api/users/[id]` - Get specific user (Admin)
- `PUT /api/users/[id]` - Update user (Admin)
- `DELETE /api/users/[id]` - Delete user (Admin)

### Utility Endpoints
- `GET /api/og` - Generate Open Graph images
- `GET /api/sitemap.xml` - Generate XML sitemap

## 🎨 Design Features

### Visual Elements
- **Dark Theme**: Modern dark UI with cyan accents (#00FFC6)
- **Animations**: Floating particles and glow effects
- **Grid Background**: Subtle animated grid overlay
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: ARIA labels and semantic HTML

### Component Highlights
- **Home**: Interactive hero section with animated elements
- **Expertise**: Technology showcase with interactive cards
- **Projects**: Filterable grid with search functionality
- **Blog**: Rich text content with reading time estimation
- **Admin Panel**: Comprehensive dashboard with analytics

## 🔧 Configuration

### Next.js Configuration (`next.config.ts`)
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cross-origin requests for development
  allowedDevOrigins: ['localhost', '127.0.0.1'],

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_MAIN_SITE_URL: process.env.NEXT_PUBLIC_MAIN_SITE_URL,
    NEXT_PUBLIC_MEDIA_BASE_URL: process.env.NEXT_PUBLIC_MEDIA_BASE_URL,
  },

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    // Allow unoptimized images for base64 data URIs from MongoDB
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
  },

  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },

  // Build optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Tailwind CSS Configuration (`tailwind.config.js`)
```javascript
/ ** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: '#00FFC6',
        secondary: '#0a0a0a',
        accent: '#E0E0E0',
        'cyber-green': '#00FFC6',
        'dark-bg': '#0a0a0a',
        'dark-card': '#1a1a1a',
        'dark-border': '#333333',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 10s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(0,255,198,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,198,0.1) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
    },
  },

  plugins: [
    typography,
    function({ addUtilities }) {
      addUtilities({
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0,0,0,0.2)',
        },
      });
    },
  ],
};

export default config;
```

### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/app/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/models/*": ["./src/models/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build application for production
npm start            # Start production server (after build)

# Database & Admin
npm run admin        # Generate admin credentials and setup

## 🔄 Development Workflow

### Git Workflow
```bash
# Development branch workflow
git checkout -b feature/new-feature
# Make changes...
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create pull request

# Hotfix workflow
git checkout -b hotfix/critical-bug
# Fix critical issue...
git add .
git commit -m "fix: critical bug in authentication"
git push origin hotfix/critical-bug
```

### Code Quality
```bash
# Pre-commit hooks (recommended)
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run test"

# Commit message format
feat: add new user authentication
fix: resolve payment processing bug
docs: update API documentation
style: format code with prettier
refactor: optimize database queries
test: add unit tests for user service
```

### Environment Management
```bash
# Development environment
cp .env.local.example .env.local

# Staging environment
cp .env.local .env.staging
# Update staging-specific variables

# Production environment
# Set environment variables in hosting platform
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(err => console.error(err))"

# Verify environment variables
echo $MONGODB_URI

# Check MongoDB Atlas IP whitelist
# Ensure your IP is whitelisted in MongoDB Atlas dashboard
```

#### Authentication Problems
```bash
# Clear invalid tokens
# Access: http://localhost:3000/api/validate-token (returns 401)

# Reset admin password
npm run admin  # Re-run admin setup

# Check JWT secret length (must be 32+ characters)
node -e "console.log(process.env.JWT_SECRET.length)"
```

#### Email Service Issues
```bash
# Test Resend connection
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@yourdomain.com",
    "to": "test@example.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'

# Check domain verification in Resend dashboard
# Verify RESEND_FROM_EMAIL is verified
```

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npx tsc --noEmit

# Check for missing dependencies
npm ls --depth=0
```

#### Performance Issues
```bash
# Check bundle size
npm install --save-dev @next/bundle-analyzer
# Add to package.json: "analyze": "ANALYZE=true npm run build"

# Monitor API response times
# Check logs/application-*.log for slow queries

# Database performance
# Add indexes to frequently queried fields
db.collection.createIndex({ field: 1 })
```

### Error Logs
```bash
# View application logs
tail -f logs/application-2025-12-18.log

# Search for specific errors
grep "ERROR" logs/application-*.log

# Winston log levels: error, warn, info, debug
```

### Port Conflicts
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

## 🔄 Backup & Recovery

### Database Backup
```bash
# MongoDB Atlas automatic backups
# Configure in Atlas dashboard under "Backup" > "Backup Settings"

# Manual backup script
mongodump --uri="$MONGODB_URI" --out=backup-$(date +%Y%m%d)

# Restore from backup
mongorestore --uri="$MONGODB_URI" backup-20251218
```

### File Storage Backup
```bash
# Cloudinary assets
# Use Cloudinary dashboard for backup
# Or use their API for automated backups

# Local file backup (if any)
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

### Environment Variables Backup
```bash
# Backup environment files
cp .env.local .env.local.backup
cp .env.staging .env.staging.backup

# Secure storage recommendation
# Use a password manager or encrypted storage for sensitive env vars
```

## 📊 Monitoring & Alerts

### Application Monitoring
```typescript
// Add to key API routes
const startTime = Date.now();
// ... route logic ...
const duration = Date.now() - startTime;
logger.info(`API call completed in ${duration}ms`, { route, duration });
```

### Error Tracking
```typescript
// Global error handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

### Performance Monitoring
```typescript
// API response time middleware
export function withTiming(handler: any) {
  return async (req: Request) => {
    const start = Date.now();
    const result = await handler(req);
    const duration = Date.now() - start;
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.url} took ${duration}ms`);
    }
    
    return result;
  };
}
```

### Health Checks
```typescript
// Health check endpoint (/api/health)
export async function GET() {
  try {
    // Check database connection
    await dbConnect();
    
    // Check external services
    // await checkResendConnection();
    // await checkCloudinaryConnection();
    
    return Response.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        email: 'operational',
        storage: 'operational'
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    return Response.json({ 
      status: 'unhealthy', 
      error: error.message 
    }, { status: 503 });
  }
}
```

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with configurable expiration
- Bcrypt password hashing with salting
- Role-based access control (Admin/User)
- Two-factor authentication (2FA) with TOTP
- Session management with secure cookies

### API Security
- CSRF protection middleware
- Rate limiting on sensitive endpoints
- Input validation with Zod schemas
- SQL injection prevention with Mongoose
- XSS protection with Content Security Policy

### Data Protection
- Encrypted sensitive data storage
- Secure password reset mechanisms
- Email verification for new accounts
- Audit logging for admin actions
- Regular security headers (Helmet.js)

## 📧 Email System

### Features
- **Resend Integration**: Professional email delivery
- **Template System**: HTML email templates
- **Retry Logic**: Automatic retry on failures
- **Preference Management**: User-controlled notifications
- **Delivery Tracking**: Email status monitoring

### Email Types
- Welcome emails for new users
- Security notifications (login alerts, 2FA changes)
- Password reset instructions
- Newsletter subscriptions
- Payment confirmations
- Account updates

## 💾 Database Operations

### MongoDB Integration
- **Connection Pooling**: Optimized database connections
- **Schema Validation**: Mongoose schema enforcement
- **Indexing**: Performance-optimized queries
- **Backup Strategy**: Regular database backups
- **Migration Support**: Schema update handling

### Key Collections
- `users` - User accounts and preferences
- `projects` - Portfolio projects and content
- `blogposts` - Blog articles and metadata
- `projectpayments` - Payment transactions
- `subscribers` - Newsletter subscribers
- `contactmessages` - Contact form submissions

## 📈 Analytics & Monitoring

### Performance Tracking
- **Vercel Analytics**: Page views and user behavior
- **Speed Insights**: Core Web Vitals monitoring
- **Error Tracking**: Application error logging
- **API Monitoring**: Endpoint performance metrics

### Logging System
```typescript
// Winston configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  ]
});
```

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production
- Ensure all `.env.local` variables are set in production
- Use strong, unique secrets for JWT and encryption
- Configure proper CORS origins for your domain
- Set up database connection string for production cluster
- Configure email service with production API keys
- Set production URLs (remove localhost references)

### Production Checklist
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Email service verified
- [ ] Domain SSL certificate configured
- [ ] Admin credentials created
- [ ] File upload directories configured
- [ ] CDN configured for media assets
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] Security headers verified

## � Unique Features & Innovations

### **Cybersecurity-Focused Portfolio**
- **Specialized Content**: Tailored for cybersecurity professionals
- **Security Demonstrations**: Live examples of security implementations
- **Vulnerability Showcases**: Educational security examples
- **Privacy-First Design**: Built with privacy considerations

### **Advanced Authentication System**
- **Multi-Factor Authentication**: TOTP-based 2FA with QR codes
- **Session Management**: Secure session handling with automatic cleanup
- **Login History**: Track and monitor account access
- **Security Notifications**: Real-time alerts for suspicious activity

### **Dynamic Content Management**
- **Rich Text Editor**: React Quill integration for blog content
- **Media Management**: Cloudinary integration for optimized images
- **SEO Optimization**: Dynamic meta tags and structured data
- **Content Versioning**: Track content changes and updates

### **E-commerce Integration**
- **Flexible Pricing**: Free/paid project model with download limits
- **Invoice Generation**: PDF invoices with professional formatting
- **Payment Tracking**: Comprehensive transaction history
- **Subscription Management**: All-access membership system

### **Developer Experience**
- **TypeScript First**: Full type safety throughout the application
- **Modern React Patterns**: Hooks, context, and modern best practices
- **Performance Monitoring**: Built-in performance tracking
- **Error Boundaries**: Graceful error handling and recovery

### **Production-Ready Features**
- **Logging System**: Winston with daily rotation and structured logs
- **Health Checks**: System monitoring and status endpoints
- **Backup Ready**: Database and file backup strategies
- **Scalable Architecture**: Designed for horizontal scaling

### **User Experience Innovations**
- **Dark Cyber Theme**: Modern dark UI with neon accents
- **Interactive Animations**: Floating particles and glow effects
- **Responsive Grid**: Adaptive layouts for all screen sizes
- **Accessibility**: WCAG compliant with proper ARIA labels

### **Business Features**
- **Lead Generation**: Contact forms with CRM integration potential
- **Newsletter System**: Subscriber management with preferences
- **Analytics Dashboard**: Business intelligence and insights
- **Export Capabilities**: Data export for business analysis

## 🎯 Key Highlights

- ⚡ **Performance**: Optimized for speed and SEO with Next.js 16
- 🔐 **Security**: Enterprise-level security with JWT, 2FA, and encryption
- 📱 **Responsive**: Perfect on all devices with mobile-first design
- 🛡️ **Cybersecurity Focus**: Specialized for security professionals
- 💼 **Professional**: Production-ready business application
- 🔧 **Maintainable**: Clean, documented, TypeScript codebase
- 📈 **Scalable**: Built for growth with modular architecture
- 🎨 **Modern UI**: Dark theme with cyberpunk aesthetics
- 📧 **Communication**: Complete email and contact system
- 💳 **E-commerce**: Payment processing and invoice generation
- 📊 **Analytics**: Dashboard with comprehensive metrics
- 🔄 **CI/CD Ready**: Automated deployment pipeline support

**Built with ❤️ by Aman Anil - Cybersecurity Researcher & Ethical Hacker**

*Showcasing the intersection of cybersecurity expertise and modern web development.*

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow TypeScript and ESLint conventions
2. **Testing**: Write tests for new features
3. **Documentation**: Update README for significant changes
4. **Security**: Follow security best practices
5. **Performance**: Optimize for Core Web Vitals

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes with proper testing
4. Update documentation as needed
5. Submit a pull request with clear description

## 📄 License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file. Please review the license before using or contributing to this project.

## 🆘 Support & Contact

### Getting Help
- **Documentation**: Check this README for comprehensive information
- **Issues**: Open GitHub issues for bugs or feature requests
- **Email**: Contact through the website's contact form
- **Professional Services**: Available for cybersecurity consulting

### Cybersecurity Services
This portfolio showcases expertise in:
- **API Security Auditing**: Comprehensive API vulnerability assessments
- **Penetration Testing**: Web application and infrastructure testing
- **AI Security Research**: ML/AI system security evaluation
- **Digital Privacy Solutions**: Privacy-focused security implementations
- **Vulnerability Assessment**: Complete security posture analysis

### Professional Contact
- **Website**: [SpyberPolymath.com](https://spyberpolymath.com)
- **Portfolio**: Browse projects and case studies
- **Contact Form**: Available on the website
- **Professional Inquiries**: Use the project contact system

---

## �️ Design Patterns

### Design Patterns Implemented

#### **Repository Pattern**
```typescript
// lib/mongodb.ts - Data access layer
export async function getUserById(id: string) {
  await dbConnect();
  return User.findById(id);
}

export async function createUser(userData: Partial<IUser>) {
  await dbConnect();
  return User.create(userData);
}
```

#### **Middleware Pattern**
```typescript
// lib/middleware.ts - Authentication middleware
export async function requireAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  try {
    const payload = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload;
  } catch {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
}
```

#### **Service Layer Pattern**
```typescript
// lib/resend.ts - Email service
export class EmailService {
  async sendWelcomeEmail(user: IUser) {
    // Implementation
  }
  
  async sendPasswordReset(user: IUser) {
    // Implementation
  }
}
```

#### **Validation Pattern**
```typescript
// lib/validation.ts - Input validation
export const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function validateBody<T>(schema: z.ZodSchema<T>, req: Request) {
  const body = await req.json();
  return schema.parseAsync(body);
}
```

### Security Architecture

#### **Defense in Depth**
- **Network Layer**: Rate limiting, CORS, helmet headers
- **Application Layer**: Input validation, authentication, authorization
- **Data Layer**: Encryption, access controls, audit logging

#### **Authentication Flow**
```mermaid
flowchart TB
    U["👤 User"] -- 🔑 Login Request --> A["🖥️ Login Page"]
    A -- 📨 Email + Password --> B["🛡️ Credential Validation"]
    B -- ❌ Invalid --> X["🚫 Access Denied"]
    B -- ✅ Valid --> C["🔐 Generate JWT Token"]
    C --> D["🍪 Set HttpOnly + Secure Cookie"]
    D --> E["➡️ Redirect to Dashboard"]
    E --> F["🧱 Protected Route Middleware"]
    F -- 🔍 Verify JWT --> G["🕵️ Token Validation"]
    G -- ⏳ Expired / Invalid --> H["🚪 Force Logout"]
    H --> I["🧹 Clear Cookie"]
    I --> A
    G -- ✅ Valid Token --> J["🎯 Grant Access"]
    J --> K["🛡️ Role & Permission Check"]
    K -- ❌ Unauthorized --> X
    K -- ✅ Authorized --> L["📊 Dashboard / Account Pages"]
    L -- 🚪 Logout --> M["🧹 Invalidate Session"]
    M --> I
```

#### **API Security**
- **JWT Authentication**: Stateless token-based auth
- **Role-Based Access**: Admin/User permissions
- **CSRF Protection**: Token-based prevention
- **Rate Limiting**: Request throttling
- **Input Sanitization**: XSS prevention

### Performance Optimizations

#### **Next.js Optimizations**
- **Image Optimization**: Automatic WebP/AVIF conversion
- **Code Splitting**: Automatic route-based splitting
- **Static Generation**: ISR for dynamic content
- **Caching**: Redis for session storage (recommended)

#### **Database Optimizations**
- **Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient MongoDB connections
- **Aggregation Pipelines**: Optimized data processing
- **Caching Layer**: Redis for frequently accessed data

#### **Frontend Optimizations**
- **Lazy Loading**: Component and route lazy loading
- **Bundle Analysis**: Webpack bundle analyzer
- **CDN Integration**: Cloudinary for media assets
- **Compression**: Gzip/Brotli compression

### Scalability Considerations

#### **Horizontal Scaling**
- **Stateless Design**: No server-side sessions
- **Database Sharding**: MongoDB sharding support
- **CDN Integration**: Global content delivery
- **Microservices Ready**: Modular architecture

#### **Monitoring & Observability**
- **Structured Logging**: Winston with log rotation
- **Error Tracking**: Comprehensive error handling
- **Performance Metrics**: Response time monitoring
- **Health Checks**: System health monitoring

### Development Best Practices

#### **Code Quality**
- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for quality gates

#### **Testing Strategy**
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API route testing
- **E2E Tests**: User journey testing (recommended)
- **Performance Tests**: Load testing (recommended)

## Contact Information

For inquiries, support, or collaboration opportunities, please reach out through the following channels:

- **Email**: [info@spyberpolymath.com](mailto:info@spyberpolymath.com)
- **LinkedIn**: [linkedin.com/in/spyberpolymath](https://linkedin.com/in/spyberpolymath)
- **GitHub**: [github.com/spyberpolymath](https://github.com/spyberpolymath)
- **Kaggle**: [kaggle.com/spyberpolymath](https://kaggle.com/spyberpolymath)
- **HackerOne**: [hackerone.com/spyberpolymath1](https://hackerone.com/spyberpolymath1)
- **Website**: [spyberpolymath.com](https://spyberpolymath.com)

---
<div align="center">

### 🌟 SpyberPolymath Portfolio
**Professional Cybersecurity Research & Development Platform**

**© 2025 SpyberPolymath | Aman Anil**  
*Cybersecurity Researcher & Ethical Hacker*

**🌍 Securing the Digital World, One Project at a Time**
---

<sub>Last updated: December 2025 | Version 3.0.0 | Built with ❤️ and ☕</sub>

</div>