import { NextRequest, NextResponse } from 'next/server';
import { generalRateLimit, applySecurityHeaders, corsHeaders } from '@/lib/security';
import { logRequest, logSecurityEvent, logger } from '@/lib/logger';

// Global security middleware
export function securityMiddleware(req: NextRequest): NextResponse | null {
  // Log the request
  logRequest(req);

  // Apply rate limiting
  const rateLimitResult = generalRateLimit(req);
  if (rateLimitResult) {
    logSecurityEvent('Rate Limit Exceeded', {
      url: req.url,
      method: req.method,
      userAgent: req.headers.get('user-agent'),
    }, req);
    return rateLimitResult;
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /eval\(/i,  // Code injection
    /base64/i,  // Base64 encoded attacks
  ];

  const url = req.url.toLowerCase();
  const userAgent = (req.headers.get('user-agent') || '').toLowerCase();

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(userAgent)) {
      logSecurityEvent('Suspicious Request Detected', {
        pattern: pattern.toString(),
        url: req.url,
        userAgent: req.headers.get('user-agent'),
        method: req.method,
      }, req);

      return NextResponse.json(
        { error: 'Bad Request' },
        { status: 400 }
      );
    }
  }

  return null; // Continue processing
}

// CORS middleware
export function corsMiddleware(req: NextRequest): NextResponse | null {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });

    // Apply CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Handle multiple allowed origins
        const origin = req.headers.get('origin');
        if (origin && value.includes(origin)) {
          response.headers.set(key, origin);
        }
      } else {
        response.headers.set(key, value);
      }
    });

    return response;
  }

  return null; // Continue processing
}

// API key middleware for protected endpoints
export function apiKeyMiddleware(req: NextRequest, required: boolean = false): NextResponse | null {
  const apiKey = req.headers.get('x-api-key');

  if (required && !apiKey) {
    logSecurityEvent('Missing API Key', {
      url: req.url,
      method: req.method,
    }, req);

    return NextResponse.json(
      { error: 'API key required' },
      { status: 401 }
    );
  }

  // Additional API key validation could be added here
  // For now, just check if it exists when required

  return null;
}

// CSRF token validation middleware
export function csrfMiddleware(req: NextRequest, required: boolean = false): NextResponse | null {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return null; // CSRF not applicable to safe methods
  }

  const csrfToken = req.headers.get('x-csrf-token');

  if (required && !csrfToken) {
    logSecurityEvent('Missing CSRF Token', {
      url: req.url,
      method: req.method,
    }, req);

    return NextResponse.json(
      { error: 'CSRF token required' },
      { status: 403 }
    );
  }

  // In a real implementation, you'd validate the token against a session
  // For now, just check presence when required

  return null;
}

// Apply security headers to response
export function applySecurityToResponse(response: NextResponse): NextResponse {
  return applySecurityHeaders(response);
}

// Combined middleware function for API routes
export async function apiSecurityMiddleware(
  req: NextRequest,
  options: {
    requireApiKey?: boolean;
    requireCsrf?: boolean;
    customRateLimit?: (req: NextRequest) => NextResponse | null;
  } = {}
): Promise<NextResponse | null> {
  try {
    // Apply CORS
    const corsResult = corsMiddleware(req);
    if (corsResult) return corsResult;

    // Apply security checks
    const securityResult = securityMiddleware(req);
    if (securityResult) return securityResult;

    // Apply custom or general rate limiting
    const rateLimitResult = options.customRateLimit ? options.customRateLimit(req) : generalRateLimit(req);
    if (rateLimitResult) return rateLimitResult;

    // Check API key if required
    if (options.requireApiKey) {
      const apiKeyResult = apiKeyMiddleware(req, true);
      if (apiKeyResult) return apiKeyResult;
    }

    // Check CSRF if required
    if (options.requireCsrf) {
      const csrfResult = csrfMiddleware(req, true);
      if (csrfResult) return csrfResult;
    }

    return null; // All checks passed
  } catch (error) {
    logger.error('Security middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}