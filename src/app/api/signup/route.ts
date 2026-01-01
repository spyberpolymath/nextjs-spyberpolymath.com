import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateUID } from '@/lib/idGenerator';
import { sendEmailWithPreferences } from '@/lib/resend';
import { apiSecurityMiddleware, applySecurityToResponse } from '@/lib/middleware';
import { authRateLimit } from '@/lib/security';
import { logAuthEvent } from '@/lib/logger';
import crypto from 'crypto';

export async function POST(request: Request) {
  // Apply security middleware with auth rate limiting
  const securityCheck = await apiSecurityMiddleware(request as any, {
    customRateLimit: authRateLimit,
    requireCsrf: true
  });
  if (securityCheck) return securityCheck;

  try {
    const data = await request.json();
    const { email, password, name, phone, confirmPassword } = data;

    // Input validation
    if (!email || !password || !name || !phone || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input format' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (phone.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      } else {
        // Resend verification email for unverified account
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        existingUser.emailVerificationToken = verificationToken;
        existingUser.emailVerificationExpiry = verificationExpiry;
        await existingUser.save();

        // Send verification email
        await sendVerificationEmail(email.toLowerCase().trim(), name, verificationToken);

        return NextResponse.json(
          { message: 'Verification email sent. Please check your email.' },
          { status: 200 }
        );
      }
    }

    // Generate UID
    const uid = await generateUID(false);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user (unverified)
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      role: 'user',
      uid,
      pid: '', // Users don't have PID initially (only for payments)
      paymentHistory: [],
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
    });

    await newUser.save();

    // Send verification email
    await sendVerificationEmail(email.toLowerCase().trim(), name.trim(), verificationToken);

    // Log the signup attempt
    logAuthEvent('signup_attempt', newUser._id.toString(), {
      email: email.toLowerCase().trim(),
      verified: false,
    }, request as any);

    const response = NextResponse.json(
      {
        message: 'Account created successfully. Please check your email to verify your account.',
        requiresVerification: true
      },
      { status: 201 }
    );

    return applySecurityToResponse(response);
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to send verification email
async function sendVerificationEmail(email: string, name: string, token: string) {
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
        <h1>Welcome to SpyberPolymath!</h1>
        <p>Please verify your email address</p>
    </div>
    <div class="content">
        <h2>Hello ${name}!</h2>
        <p>Thank you for signing up for SpyberPolymath. To complete your registration and start exploring cybersecurity resources, please verify your email address.</p>
        <p><a href="${verificationUrl}" class="button">Verify Email Address</a></p>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>If you didn't create an account, please ignore this email.</p>
    </div>
    <div class="footer">
        <p>&copy; 2024 SpyberPolymath. All rights reserved.</p>
    </div>
</body>
</html>`;

  try {
    await sendEmailWithPreferences('new_user', 'security', email, 'Verify Your Email - SpyberPolymath', emailHtml);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't throw error - user account is still created
  }
}
