import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/requireAuth';
import { authenticator } from 'otplib';
import { randomBytes } from 'crypto';
import { sendEmailWithPreferences } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const payload = await requireAuth(req);
    
    if (payload instanceof NextResponse) {
      return payload;
    }

    const body = await req.json();
    const { type, userId } = body;

    // If userId is provided, admin is setting up 2FA for another user
    // Otherwise, user is setting up their own 2FA
    const targetUserId = userId || payload.id;

    const user = await User.findById(targetUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (type === 'email') {
      // Enable email 2FA
      if (user.emailOtpEnabled) {
        return NextResponse.json({ error: 'Email 2FA already enabled' }, { status: 400 });
      }

      // Generate verification code
      const code = randomBytes(3).toString('hex').toUpperCase();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.emailOtpEnabled = true;
      user.emailOtpCode = code;
      user.emailOtpExpires = expires;
      await user.save();

      // Send verification email
      await sendEmailWithPreferences(
        user._id.toString(),
        'security',
        user.email,
        'Email 2FA Enabled',
        `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Email 2FA Enabled</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1>Email 2FA Enabled</h1>
            <p>Your email two-factor authentication has been enabled.</p>
            <p>If you did not request this, please contact support.</p>
          </body>
          </html>
        `
      );

      return NextResponse.json({ message: 'Email 2FA enabled successfully' });
    } else if (type === 'totp') {
      // Enable TOTP 2FA
      // Allow regenerating if already enabled (useful for admin operations)
      // Generate new secret
      const secret = authenticator.generateSecret();
      
      // Store the secret but don't enable yet - wait for verification
      user.twoFactorSecret = secret;
      user.twoFactorEnabled = false; // Reset until verification
      await user.save();

      // Generate QR code data
      const otpauth = authenticator.keyuri(user.email, 'SpyberPolymath', secret);

      return NextResponse.json({
        secret,
        otpauth,
        message: 'TOTP secret generated. Please verify to enable.'
      });
    } else {
      // Fallback for backward compatibility (no type specified)
      // Allow regenerating if already enabled (useful for admin operations)
      // Generate new secret
      const secret = authenticator.generateSecret();
      
      // Store the secret but don't enable yet - wait for verification
      user.twoFactorSecret = secret;
      user.twoFactorEnabled = false; // Reset until verification
      await user.save();

      // Generate QR code data
      const otpauth = authenticator.keyuri(user.email, 'SpyberPolymath', secret);

      return NextResponse.json({
        secret,
        otpauth,
        message: 'TOTP secret generated. Please verify to enable.'
      });
    }
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 });
  }
}