import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { sendEmailWithPreferences } from '@/lib/resend';

// Helper function to parse user agent and extract device info
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();
  let device = 'Unknown';
  let browser = 'Unknown';

  // Browser detection
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';

  // Device detection
  if (ua.includes('mobile')) device = 'Mobile';
  else if (ua.includes('tablet')) device = 'Tablet';
  else device = 'Desktop';

  return { device, browser };
}

// Helper function to get client IP
function getClientIP(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) return realIP;
  if (clientIP) return clientIP;

  return 'unknown';
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { email, password } = data;

        // Basic input validation
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        if (typeof email !== 'string' || typeof password !== 'string') {
            return NextResponse.json({ error: 'Invalid input format' }, { status: 400 });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
        }

        await dbConnect();
        console.log(`Database connected, searching for user: ${email}`);
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (!user) {
            console.log(`Login attempt: User not found for email: ${email}`);
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        console.log(`Login attempt: User found for email: ${email}, status: ${user.status}, password type: ${user.password ? (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$') ? 'hashed' : 'plain') : 'null/undefined'}`);

        // Check if user account is active
        if (user.status !== 'active') {
            console.log(`Login failed: User account not active for email: ${email}, status: ${user.status}`);
            return NextResponse.json({ error: 'Account is not active' }, { status: 401 });
        }

        // Check if password exists
        if (!user.password) {
            console.log(`Login failed: No password set for user: ${email}`);
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Check password - handle both hashed and plain text passwords for migration
        let isPasswordValid = false;
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
            // Password is hashed
            isPasswordValid = await bcrypt.compare(password, user.password);
            console.log(`Password validation: hashed comparison result: ${isPasswordValid}`);
        } else {
            // Password is plain text (legacy), compare directly
            isPasswordValid = password === user.password;
            console.log(`Password validation: plain text comparison result: ${isPasswordValid}`);
            // If valid, hash the password for future logins
            if (isPasswordValid) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
                await user.save();
                console.log(`Password migrated to hashed for user: ${email}`);
            }
        }

        if (!isPasswordValid) {
            console.log(`Login failed: Invalid password for email: ${email}`);
            // Log failed login attempt
            const ip = getClientIP(request);
            const userAgent = request.headers.get('user-agent') || 'unknown';
            const { device, browser } = parseUserAgent(userAgent);

            user.loginHistory.push({
                ip,
                userAgent,
                device: `${device} (${browser})`,
                timestamp: new Date(),
                success: false
            });
            await user.save();

            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // If 2FA is enabled, require verification
        if (user.emailOtpEnabled || user.twoFactorEnabled) {
            // Determine which 2FA method to use (priority: totp > email)
            let twoFAMethod = 'email'; // default
            if (user.twoFactorEnabled) twoFAMethod = 'totp';

            // For email 2FA, generate and send code
            if (twoFAMethod === 'email' || user.emailOtpEnabled) {
                // Generate a 6-digit code
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                user.emailOtpCode = code;
                user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

                // Enhanced HTML email template with single-letter social media icons
                const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your 2FA Code</title>
    <style>
        @keyframes gradient-wave {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 198, 0.3); }
            50% { box-shadow: 0 0 40px rgba(0, 255, 198, 0.6); }
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a;">
        <tr>
            <td style="padding: 40px 20px; text-align: center;">
                <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: rgba(24, 26, 27, 0.95); border-radius: 8px; border: 2px solid rgba(0, 255, 198, 0.3); box-shadow: 0 0 40px rgba(0, 255, 198, 0.15);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 30px 20px; text-align: center; background: linear-gradient(45deg, #00FFC6, #007BFF, #FF6B6B); background-size: 300% 300%; animation: gradient-wave 6s ease infinite;">
                            <h1 style="margin: 0; color: #121212; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🔐 SpyberPolymath</h1>
                            <p style="margin: 10px 0 0 0; color: #121212; font-size: 16px; font-weight: 500;">Secure Login Verification</p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #E0E0E0; font-size: 24px; margin: 0 0 20px 0; text-align: center;">Your Verification Code</h2>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <div style="display: inline-block; background: linear-gradient(135deg, rgba(0, 255, 198, 0.1), rgba(0, 123, 255, 0.1)); border: 2px solid #00FFC6; border-radius: 12px; padding: 20px; animation: pulse-glow 2s ease-in-out infinite;">
                                    <span style="font-size: 36px; font-weight: bold; color: #00FFC6; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</span>
                                </div>
                            </div>
                            
                            <p style="color: #b0f5e6; font-size: 16px; line-height: 1.6; margin: 20px 0; text-align: center;">
                                Enter this code to complete your login. This code will expire in <strong>10 minutes</strong>.
                            </p>
                            
                            <div style="background-color: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 8px; padding: 15px; margin: 20px 0;">
                                <p style="color: #ff9f9f; font-size: 14px; margin: 0; text-align: center;">
                                    <strong>⚠️ Security Notice:</strong> If you didn't request this code, please contact our support team immediately.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; background-color: rgba(0, 255, 198, 0.05); border-top: 1px solid rgba(0, 255, 198, 0.2);">
                            <p style="color: #757575; font-size: 12px; margin: 0; text-align: center; line-height: 1.5;">
                                This is an automated message from SpyberPolymath. Please do not reply to this email.<br>
                                © 2024 SpyberPolymath. All rights reserved.
                            </p>
                            
                            <div style="text-align: center; margin-top: 15px;">
                                <a href="#" style="color: #00FFC6; text-decoration: none; margin: 0 10px; font-size: 18px;">𝕏</a>
                                <a href="#" style="color: #00FFC6; text-decoration: none; margin: 0 10px; font-size: 18px;">𝕀</a>
                                <a href="#" style="color: #00FFC6; text-decoration: none; margin: 0 10px; font-size: 18px;">𝔾</a>
                                <a href="#" style="color: #00FFC6; text-decoration: none; margin: 0 10px; font-size: 18px;">𝔽</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

                try {
                    await sendEmailWithPreferences(user._id.toString(), 'security', user.email, 'Your 2FA Code - SpyberPolymath', emailHTML);
                } catch (emailError) {
                    console.error('Failed to send 2FA email:', emailError);
                    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
                }
            }

            // Log login attempt (2FA required)
            const ip = getClientIP(request);
            const userAgent = request.headers.get('user-agent') || 'unknown';
            const { device, browser } = parseUserAgent(userAgent);

            user.loginHistory.push({
                ip,
                userAgent,
                device: `${device} (${browser})`,
                timestamp: new Date(),
                success: false // Not fully successful until 2FA is completed
            });
            await user.save();

            return NextResponse.json({ 
                requires2FA: true, 
                method: twoFAMethod,
                userId: user._id,
                emailOtpEnabled: user.emailOtpEnabled || false,
                twoFactorEnabled: user.twoFactorEnabled || false,
                message: '2FA verification required' 
            });
        }

        // No 2FA, login successful
        // Generate JWT token
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not set in environment variables');
        }
        const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({
            id: user._id.toString(),
            email: user.email,
            isAdmin: user.role === 'admin'
        }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(JWT_SECRET);

        // Log successful login
        const ip = getClientIP(request);
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const { device, browser } = parseUserAgent(userAgent);

        user.lastLogin = new Date();
        user.loginHistory.push({
            ip,
            userAgent,
            device: `${device} (${browser})`,
            timestamp: new Date(),
            success: true
        });
        await user.save();

        // Send login notification email if enabled (asynchronously)
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
                    <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                    <li><strong>IP Address:</strong> ${ip}</li>
                    <li><strong>Device:</strong> ${device}</li>
                    <li><strong>Browser:</strong> ${browser}</li>
                  </ul>
                  <p>If this was not you, please change your password immediately and contact support.</p>
                </body>
                </html>
            `
        ).catch(emailError => console.error('Login notification email failed:', emailError));

        return NextResponse.json({ message: 'Login successful!', userId: user._id, token, role: user.role }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}