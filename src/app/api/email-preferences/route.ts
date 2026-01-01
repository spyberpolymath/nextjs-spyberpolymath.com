import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/requireAuth';
import { safeObjectIdToString, isValidObjectId } from '@/lib/objectIdUtils';

// GET /api/email-preferences - Get user's email preferences
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const payload = await requireAuth(req);

        if (payload instanceof NextResponse) {
            return payload;
        }

        const userId = safeObjectIdToString(payload.id);
        if (!isValidObjectId(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const user = await User.findById(userId);
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

        return NextResponse.json({ emailPreferences });
    } catch (error) {
        console.error('Error fetching email preferences:', error);
        return NextResponse.json({ error: 'Failed to fetch email preferences' }, { status: 500 });
    }
}

// PUT /api/email-preferences - Update user's email preferences
export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const payload = await requireAuth(req);

        if (payload instanceof NextResponse) {
            return payload;
        }

        const body = await req.json();
        const { twoFANotifications, accountChanges, loginNotifications, newsletter } = body;

        // Validate preference structure
        const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly'];
        
        if (twoFANotifications) {
            if (!validFrequencies.includes(twoFANotifications.frequency)) {
                return NextResponse.json({ error: 'Invalid frequency for twoFANotifications' }, { status: 400 });
            }
        }
        
        if (accountChanges) {
            if (!validFrequencies.includes(accountChanges.frequency)) {
                return NextResponse.json({ error: 'Invalid frequency for accountChanges' }, { status: 400 });
            }
        }
        
        if (loginNotifications) {
            if (!validFrequencies.includes(loginNotifications.frequency)) {
                return NextResponse.json({ error: 'Invalid frequency for loginNotifications' }, { status: 400 });
            }
        }
        
        if (newsletter) {
            if (!validFrequencies.includes(newsletter.frequency)) {
                return NextResponse.json({ error: 'Invalid frequency for newsletter' }, { status: 400 });
            }
        }

        const updateData: any = {};
        if (twoFANotifications !== undefined) {
            updateData['emailPreferences.twoFANotifications'] = twoFANotifications;
        }
        if (accountChanges !== undefined) {
            updateData['emailPreferences.accountChanges'] = accountChanges;
        }
        if (loginNotifications !== undefined) {
            updateData['emailPreferences.loginNotifications'] = loginNotifications;
        }
        if (newsletter !== undefined) {
            updateData['emailPreferences.newsletter'] = newsletter;
        }

        const userId = safeObjectIdToString(payload.id);
        if (!isValidObjectId(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

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

        return NextResponse.json({ 
            message: 'Email preferences updated successfully',
            emailPreferences 
        });
    } catch (error) {
        console.error('Error updating email preferences:', error);
        return NextResponse.json({ error: 'Failed to update email preferences' }, { status: 500 });
    }
}

// POST /api/email-preferences - Initialize default email preferences
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const payload = await requireAuth(req);

        if (payload instanceof NextResponse) {
            return payload;
        }

        const defaultPreferences = {
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

        const user = await User.findByIdAndUpdate(
            payload.id,
            { emailPreferences: defaultPreferences },
            { new: true, runValidators: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            message: 'Email preferences initialized successfully',
            emailPreferences: defaultPreferences
        });
    } catch (error) {
        console.error('Error initializing email preferences:', error);
        return NextResponse.json({ error: 'Failed to initialize email preferences' }, { status: 500 });
    }
}

// DELETE /api/email-preferences - Reset email preferences to defaults
export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const payload = await requireAuth(req);

        if (payload instanceof NextResponse) {
            return payload;
        }

        const defaultPreferences = {
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

        const user = await User.findByIdAndUpdate(
            payload.id,
            { emailPreferences: defaultPreferences },
            { new: true, runValidators: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            message: 'Email preferences reset to defaults',
            emailPreferences: defaultPreferences
        });
    } catch (error) {
        console.error('Error resetting email preferences:', error);
        return NextResponse.json({ error: 'Failed to reset email preferences' }, { status: 500 });
    }
}
