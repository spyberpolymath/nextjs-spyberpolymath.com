import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/requireAuth';
import { authenticator } from 'otplib';
import { randomBytes } from 'crypto';
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
      // Enable email 2FA for user
      if (user.emailOtpEnabled) {
        return NextResponse.json({ error: 'Email 2FA already enabled' }, { status: 400 });
      }

      user.emailOtpEnabled = true;
      await user.save();

      // Send notification email
      await sendEmailWithPreferences(
        userId,
        'security',
        user.email,
        'Email 2FA Enabled by Admin',
        `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Email 2FA Enabled</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1>Email 2FA Enabled</h1>
            <p>Your email two-factor authentication has been enabled by an administrator.</p>
            <p>If you have questions about this change, please contact support.</p>
          </body>
          </html>
        `
      );

      return NextResponse.json({ message: 'Email 2FA enabled successfully' });
    } else if (type === 'totp') {
      // Enable TOTP 2FA for user
      if (user.twoFactorSecret && user.twoFactorEnabled) {
        return NextResponse.json({ error: 'TOTP 2FA already enabled' }, { status: 400 });
      }

      // Generate new secret
      const secret = authenticator.generateSecret();
      
      // Store the secret and enable (admin override - no verification needed)
      user.twoFactorSecret = secret;
      user.twoFactorEnabled = true;
      await user.save();

      // Send notification email
      await sendEmailWithPreferences(
        userId,
        'security',
        user.email,
        'TOTP 2FA Enabled by Admin',
        `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Authenticator App 2FA Enabled</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1>Authenticator App 2FA Enabled</h1>
            <p>Your authenticator app two-factor authentication has been enabled by an administrator.</p>
            <p>Please contact support to receive setup instructions for your authenticator app.</p>
          </body>
          </html>
        `
      );

      return NextResponse.json({
        message: 'TOTP 2FA enabled successfully'
      });
    } else {
      return NextResponse.json({ error: 'Invalid 2FA type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 });
  }
}