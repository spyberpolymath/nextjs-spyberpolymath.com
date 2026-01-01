import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { safeObjectIdToString } from './objectIdUtils';

// Secret key for JWT verification - should match the one used for signing
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function requireAuth(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Ensure the payload has the expected structure and convert any problematic objects to strings
      if (payload && typeof payload === 'object') {
        // Safely convert id to string format
        if (payload.id) {
          payload.id = safeObjectIdToString(payload.id);
        }
        
        // Ensure other fields are properly typed
        if (payload.email && typeof payload.email !== 'string') {
          payload.email = String(payload.email);
        }
        
        // Ensure isAdmin is boolean
        if (payload.isAdmin !== undefined && typeof payload.isAdmin !== 'boolean') {
          payload.isAdmin = Boolean(payload.isAdmin);
        }
      }
      
      return payload;
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

export async function requireAdmin(req: NextRequest) {
  const payload = await requireAuth(req);
  if (payload instanceof NextResponse) {
    return payload; // Return the error response if authentication failed
  }
  if (!payload.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  return payload;
}