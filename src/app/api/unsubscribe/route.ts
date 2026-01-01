import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { apiSecurityMiddleware, applySecurityToResponse } from '@/lib/middleware';
import { logRequest } from '@/lib/logger';

// GET /api/unsubscribe?email=user@example.com - Get user's email preferences by email
export async function GET(req: NextRequest) {
  // Apply security middleware with CSRF protection for sensitive operations
  const securityCheck = await apiSecurityMiddleware(req, { requireCsrf: true });
  if (securityCheck) return securityCheck;

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const emailPreferences = user.emailPreferences || {
      twoFANotifications: {
        enabled: false,
        frequency: 'weekly'
      },
      accountChanges: {
        enabled: true,
        frequency: 'weekly'
      },
      loginNotifications: {
        enabled: true,
        frequency: 'weekly'
      },
      newsletter: {
        enabled: true,
        frequency: 'weekly'
      }
    };

    // Log the preferences access
    logRequest(req, user._id.toString(), {
      action: 'email_preferences_access',
      email: email.toLowerCase().trim(),
    });

    const response = NextResponse.json({ emailPreferences });
    return applySecurityToResponse(response);
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch email preferences' }, { status: 500 });
  }
}

// PUT /api/unsubscribe - Update a specific email preference
export async function PUT(req: NextRequest) {
  // Apply security middleware with CSRF protection
  const securityCheck = await apiSecurityMiddleware(req, { requireCsrf: true });
  if (securityCheck) return securityCheck;

  try {
    const body = await req.json();
    const { email, preference, enabled, frequency } = body;

    if (!email || !preference) {
      return NextResponse.json({ error: 'Email and preference are required' }, { status: 400 });
    }

    // Validate preference type
    const validPreferences = ['twoFANotifications', 'accountChanges', 'loginNotifications', 'newsletter'];
    if (!validPreferences.includes(preference)) {
      return NextResponse.json({ error: 'Invalid preference type' }, { status: 400 });
    }

    // Validate frequency if provided
    const validFrequencies = ['daily', 'weekly', 'monthly', 'never'];
    if (frequency && !validFrequencies.includes(frequency)) {
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize emailPreferences if not exists
    if (!user.emailPreferences) {
      user.emailPreferences = {
        twoFANotifications: { enabled: false, frequency: 'weekly' },
        accountChanges: { enabled: true, frequency: 'weekly' },
        loginNotifications: { enabled: true, frequency: 'weekly' },
        newsletter: { enabled: true, frequency: 'weekly' }
      };
    }

    // Update the specific preference
    if (!user.emailPreferences[preference]) {
      user.emailPreferences[preference] = { enabled: false, frequency: 'weekly' };
    }

    if (enabled !== undefined) {
      user.emailPreferences[preference].enabled = Boolean(enabled);
    }

    if (frequency) {
      user.emailPreferences[preference].frequency = frequency;
    }

    await user.save();

    // Log the preference update
    logRequest(req, user._id.toString(), {
      action: 'email_preference_update',
      email: email.toLowerCase().trim(),
      preference,
      enabled: user.emailPreferences[preference].enabled,
      frequency: user.emailPreferences[preference].frequency,
    });

    const response = NextResponse.json({
      message: 'Email preference updated successfully',
      emailPreferences: user.emailPreferences
    });

    return applySecurityToResponse(response);
  } catch (error) {
    console.error('Error updating email preference:', error);
    return NextResponse.json({ error: 'Failed to update email preference' }, { status: 500 });
  }
}

// DELETE /api/unsubscribe - Unsubscribe from all emails (set all to disabled)
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Set all preferences to disabled
    user.emailPreferences = {
      twoFANotifications: { enabled: false, frequency: 'weekly' },
      accountChanges: { enabled: false, frequency: 'weekly' },
      loginNotifications: { enabled: false, frequency: 'weekly' },
      newsletter: { enabled: false, frequency: 'weekly' }
    };

    await user.save();

    return NextResponse.json({
      message: 'Successfully unsubscribed from all emails',
      emailPreferences: user.emailPreferences
    });
  } catch (error) {
    console.error('Error unsubscribing from all emails:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe from all emails' }, { status: 500 });
  }
}