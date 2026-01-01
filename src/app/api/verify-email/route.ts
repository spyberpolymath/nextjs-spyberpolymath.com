import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { apiSecurityMiddleware, applySecurityToResponse } from '@/lib/middleware';
import { logAuthEvent } from '@/lib/logger';

export async function GET(req: NextRequest) {
  // Apply basic security middleware
  const securityCheck = await apiSecurityMiddleware(req);
  if (securityCheck) return securityCheck;

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user with matching verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Mark email as verified and clear verification fields
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    // Log the verification
    logAuthEvent('email_verified', user._id.toString(), {
      email: user.email,
    }, req);

    const response = NextResponse.json({
      message: 'Email verified successfully',
      email: user.email,
      verified: true
    });

    return applySecurityToResponse(response);
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

// POST /api/verify-email - Resend verification email
export async function POST(req: NextRequest) {
  // Apply security middleware with CSRF protection
  const securityCheck = await apiSecurityMiddleware(req, { requireCsrf: true });
  if (securityCheck) return securityCheck;

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: 'If the email exists, a verification link has been sent.' },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      );
    }

    // Generate new verification token
    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpiry = verificationExpiry;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user._id.toString(), user.email, user.name, verificationToken);

    // Log the resend
    logAuthEvent('verification_email_resent', user._id.toString(), {
      email: user.email,
    }, req);

    const response = NextResponse.json({
      message: 'Verification email sent successfully'
    });

    return applySecurityToResponse(response);
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}

// Helper function to send verification email
async function sendVerificationEmail(userId: string, email: string, name: string, token: string) {
  const { sendEmailWithPreferences } = await import('@/lib/resend');
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - SpyberPolymath</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Verify Your Email</h1>
        <p>Please verify your email address</p>
    </div>
    <div class="content">
        <h2>Hello ${name}!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <p><a href="${verificationUrl}" class="button">Verify Email Address</a></p>
        <p>If the button doesn't work, copy and paste this link:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link expires in 24 hours.</p>
    </div>
    <div class="footer">
        <p>&copy; 2024 SpyberPolymath. All rights reserved.</p>
    </div>
</body>
</html>`;

  try {
    await sendEmailWithPreferences(userId, 'security', email, 'Verify Your Email - SpyberPolymath', emailHtml);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}