import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/requireAuth';
import { sendEmailWithPreferences } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const payload = await requireAdmin(req);
    
    if (payload instanceof NextResponse) {
      return payload;
    }

    const body = await req.json();
    const { userId, type } = body;

    if (!userId || !type) {
      return NextResponse.json({ error: 'User ID and type are required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (type === 'email') {
      // Disable email 2FA
      user.emailOtpEnabled = false;
      user.emailOtpCode = undefined;
      user.emailOtpExpires = undefined;
      await user.save();

      // Send notification email
      await sendEmailWithPreferences(
        userId,
        'security',
        user.email,
        'Email 2FA Disabled by Admin',
        `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Email 2FA Disabled</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1>Email 2FA Disabled</h1>
            <p>Your email two-factor authentication has been disabled by an administrator.</p>
            <p>If you have questions about this change, please contact support.</p>
          </body>
          </html>
        `
      );

      return NextResponse.json({ message: 'Email 2FA disabled successfully' });
    } else if (type === 'totp') {
      // Disable TOTP 2FA
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      await user.save();

      // Send notification email
      await sendEmailWithPreferences(
        userId,
        'security',
        user.email,
        'TOTP 2FA Disabled by Admin',
        `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Authenticator App 2FA Disabled</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1>Authenticator App 2FA Disabled</h1>
            <p>Your authenticator app two-factor authentication has been disabled by an administrator.</p>
            <p>If you have questions about this change, please contact support.</p>
          </body>
          </html>
        `
      );

      return NextResponse.json({ message: 'TOTP 2FA disabled successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid 2FA type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
  }
}