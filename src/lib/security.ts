import rateLimit from 'express-rate-limit';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Rate limiting configurations for Next.js
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: NextRequest): NextResponse | null => {
    const clientIP = getClientIP(req);
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;

    if (!requests.has(clientIP)) {
      requests.set(clientIP, { count: 0, resetTime: windowStart + windowMs });
    }

    const clientData = requests.get(clientIP)!;

    // Reset if window has passed
    if (now > clientData.resetTime) {
      clientData.count = 0;
      clientData.resetTime = windowStart + windowMs;
    }

    clientData.count++;

    if (clientData.count > max) {
      return NextResponse.json(
        { error: message || 'Too many requests, please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((clientData.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString(),
          }
        }
      );
    }

    return null; // Allow request
  };
};

// Specific rate limiters
export const strictRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Too many requests from this IP, please try again after 15 minutes.');
export const generalRateLimit = createRateLimit(15 * 60 * 1000, 100);
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts, please try again later.');
export const contactRateLimit = createRateLimit(60 * 1000, 3, 'Too many contact requests, please try again in a minute.');
export const newsletterRateLimit = createRateLimit(60 * 1000, 5, 'Too many newsletter subscriptions, please try again in a minute.');
export const projectContactRateLimit = createRateLimit(60 * 1000, 5, 'Too many project contact requests, please try again in a minute.');

// CSRF Protection
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const validateCSRFToken = (token: string, secret: string): boolean => {
  try {
    const [timestamp, hash] = token.split('.');
    const expectedHash = crypto.createHmac('sha256', secret).update(timestamp).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
  } catch {
    return false;
  }
};

// CORS configuration
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://spyberpolymath.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-API-Key',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// API Key validation
export const validateApiKey = (apiKey: string | null): boolean => {
  if (!apiKey) return false;

  const validKeys = process.env.API_KEYS?.split(',') || [];
  return validKeys.includes(apiKey);
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Encryption utilities
export const encrypt = (text: string, key: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.padEnd(32, '0').slice(0, 32)), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

export const decrypt = (encrypted: string, key: string): string => {
  const [ivHex, encryptedData] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.padEnd(32, '0').slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Security headers
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
};

// Middleware to apply security headers
export const applySecurityHeaders = (response: NextResponse): NextResponse => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
};

// IP-based rate limiting helper
export const getClientIP = (req: NextRequest): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const clientIP = req.headers.get('x-client-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (clientIP) {
    return clientIP;
  }

  // Fallback to a default or throw error
  return 'unknown';
};