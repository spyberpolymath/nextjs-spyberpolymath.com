import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const user = await User.findById(payload.id);
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Don't send sensitive information
      const safeUser = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.role === 'admin',
        twoFactorEnabled: user.emailOtpEnabled
      };

      return NextResponse.json({ 
        valid: true,
        user: safeUser
      });
    } catch (error) {
      return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json({ error: 'Failed to validate token' }, { status: 500 });
  }
}