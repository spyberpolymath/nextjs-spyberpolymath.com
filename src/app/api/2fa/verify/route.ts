import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { authenticator } from 'otplib';
import { SignJWT } from 'jose';
import { sendEmailWithPreferences } from '@/lib/resend';

// Utility function to generate JWT token using jose (consistent with login route)
async function generateJwtToken(user: any, secret: Uint8Array): Promise<string> {
  return await new SignJWT({
    id: user._id.toString(),
    email: user.email,
    isAdmin: user.role === 'admin'
  }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(secret);
}

// Utility function to validate user login history
function markLoginAttemptSuccessful(user: any) {
  if (Array.isArray(user.loginHistory) && user.loginHistory.length > 0) {
    const recentAttempt = user.loginHistory[user.loginHistory.length - 1];
    if (recentAttempt && !recentAttempt.success) {
      recentAttempt.success = true;
      recentAttempt.timestamp = new Date();
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { userId, type, data, token } = body;

    // Validate environment variables
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set');
    }
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

    // Validate request body
    if (!userId || !type || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (type === 'email') {
      // Handle email 2FA verification
      if (!user.emailOtpEnabled) {
        return NextResponse.json({ error: 'Email 2FA not enabled' }, { status: 400 });
      }

      if (user.emailOtpCode !== data || user.emailOtpExpires < new Date()) {
        return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
      }

      // Clear the code and update user
      user.emailOtpCode = undefined;
      user.emailOtpExpires = undefined;
      user.lastLogin = new Date();
      markLoginAttemptSuccessful(user);
      await user.save();

      // Send login notification email if enabled (asynchronously)
      // Get login details from the most recent login attempt
      const recentLogin = user.loginHistory?.[user.loginHistory.length - 1];
      const loginDetails = recentLogin ? {
        time: recentLogin.timestamp ? new Date(recentLogin.timestamp).toLocaleString() : new Date().toLocaleString(),
        ip: recentLogin.ip || 'unknown',
        device: recentLogin.device || 'unknown',
        browser: recentLogin.userAgent?.split(' ').pop() || 'unknown'
      } : {
        time: new Date().toLocaleString(),
        ip: 'unknown',
        device: 'unknown',
        browser: 'unknown'
      };

      sendEmailWithPreferences(
        user._id.toString(),
        'login-notifications',
        user.email,
        'New Login to Your SpyberPolymath Account',
        `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>New Login Detected</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1>New Login Detected</h1>
            <p>Your account was successfully logged in to SpyberPolymath.</p>
            <p><strong>Login Details:</strong></p>
            <ul>
              <li><strong>Time:</strong> ${loginDetails.time}</li>
              <li><strong>IP Address:</strong> ${loginDetails.ip}</li>
              <li><strong>Device:</strong> ${loginDetails.device}</li>
              <li><strong>Browser:</strong> ${loginDetails.browser}</li>
            </ul>
            <p>If this was not you, please change your password immediately and contact support.</p>
          </body>
          </html>
        `
      ).catch(emailError => console.error('Login notification email failed:', emailError));

      const jwtToken = await generateJwtToken(user, JWT_SECRET);
      return NextResponse.json({ success: true, token: jwtToken, role: user.role });
    } else if (type === 'totp') {
      // Handle TOTP 2FA verification
      if (!user.twoFactorSecret) {
        return NextResponse.json({ error: 'TOTP 2FA not set up' }, { status: 400 });
      }

      const isValid = authenticator.verify({
        token: data,
        secret: user.twoFactorSecret,
      });

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid authentication code' }, { status: 400 });
      }

      user.twoFactorEnabled = true;
      user.lastLogin = new Date();
      markLoginAttemptSuccessful(user);
      await user.save();

      // Send login notification email if enabled (asynchronously)
      // Get login details from the most recent login attempt
      const recentLogin = user.loginHistory?.[user.loginHistory.length - 1];
      const loginDetails = recentLogin ? {
        time: recentLogin.timestamp ? new Date(recentLogin.timestamp).toLocaleString() : new Date().toLocaleString(),
        ip: recentLogin.ip || 'unknown',
        device: recentLogin.device || 'unknown',
        browser: recentLogin.userAgent?.split(' ').pop() || 'unknown'
      } : {
        time: new Date().toLocaleString(),
        ip: 'unknown',
        device: 'unknown',
        browser: 'unknown'
      };

      sendEmailWithPreferences(
        user._id.toString(),
        'login-notifications',
        user.email,
        'New Login to Your SpyberPolymath Account',
        `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>New Login Detected</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1>New Login Detected</h1>
            <p>Your account was successfully logged in to SpyberPolymath.</p>
            <p><strong>Login Details:</strong></p>
            <ul>
              <li><strong>Time:</strong> ${loginDetails.time}</li>
              <li><strong>IP Address:</strong> ${loginDetails.ip}</li>
              <li><strong>Device:</strong> ${loginDetails.device}</li>
              <li><strong>Browser:</strong> ${loginDetails.browser}</li>
            </ul>
            <p>If this was not you, please change your password immediately and contact support.</p>
          </body>
          </html>
        `
      ).catch(emailError => console.error('Login notification email failed:', emailError));

      const jwtToken = await generateJwtToken(user, JWT_SECRET);
      return NextResponse.json({ success: true, token: jwtToken, role: user.role });
    } else {
      return NextResponse.json({ error: 'Invalid 2FA type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return NextResponse.json({ error: 'Failed to verify 2FA' }, { status: 500 });
  }
}