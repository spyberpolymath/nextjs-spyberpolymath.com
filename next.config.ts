/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests from localhost and 127.0.0.1 for development
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_MAIN_SITE_URL: process.env.NEXT_PUBLIC_MAIN_SITE_URL,
    NEXT_PUBLIC_MEDIA_BASE_URL: process.env.NEXT_PUBLIC_MEDIA_BASE_URL,
  },
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
    ],
    // Allow unoptimized images for base64 data URIs from MongoDB
    unoptimized: process.env.NODE_ENV === 'development' || process.env.ALLOW_BASE64_IMAGES === 'true',
  },
  // Handle build-time gracefully when external APIs are not available
  generateBuildId: async () => {
    return 'spyberpolymath-build-id'
  },
  // Enhanced Security headers configuration
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), display-capture=(), bluetooth=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self' https: http://localhost:3000 http://localhost:3001 http://127.0.0.1:3000 http://127.0.0.1:3001; frame-ancestors 'self'; form-action 'self'; base-uri 'self'; object-src 'none'"
          }
        ]
      }
    ]
  }
}

export default nextConfig