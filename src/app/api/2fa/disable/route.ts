import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/requireAuth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const payload = await requireAuth(req);
    
    if (payload instanceof NextResponse) {
      return payload;
    }

    const body = await req.json();
    const { type, userId } = body;

    // If userId is provided, admin is disabling 2FA for another user
    // Otherwise, user is disabling their own 2FA
    const targetUserId = userId || payload.id;

    const user = await User.findById(targetUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (type === 'email') {
      // Disable email 2FA
      user.emailOtpEnabled = false;
      user.emailOtpCode = undefined;
      user.emailOtpExpires = undefined;
      await user.save();

      return NextResponse.json({ message: 'Email 2FA disabled successfully' });
    } else if (type === 'totp') {
      // Disable TOTP 2FA
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      await user.save();

      return NextResponse.json({ message: 'TOTP 2FA disabled successfully' });
    } else {
      // Fallback for backward compatibility (no type specified) - disable TOTP
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      await user.save();

      return NextResponse.json({ message: 'TOTP 2FA disabled successfully' });
    }
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
  }
}