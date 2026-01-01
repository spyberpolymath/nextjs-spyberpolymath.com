import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/requireAuth';

export async function GET(request: NextRequest) {
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
        return adminCheck;
    }

    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        const query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select('name email role status createdAt emailPreferences')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await User.countDocuments(query);

        const formattedPreferences = users.map(user => {
            const u = user as any;
            const prefs = u.emailPreferences || {
                twoFANotifications: { enabled: false, frequency: 'weekly' },
                accountChanges: { enabled: true, frequency: 'weekly' },
                newsletter: { enabled: true, frequency: 'weekly' }
            };

            return {
                id: u._id?.toString?.() ?? String(u._id),
                name: u.name,
                email: u.email,
                role: u.role || 'user',
                status: u.status || 'active',
                joinedDate: u.joinedDate ? new Date(u.joinedDate).toISOString().split('T')[0] : '',
                twoFANotifications: prefs.twoFANotifications,
                accountChanges: prefs.accountChanges,
                newsletter: prefs.newsletter
            };
        });

        return NextResponse.json({
            emailPreferences: formattedPreferences,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Get email preferences error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
        return adminCheck;
    }

    try {
        await dbConnect();

        const { userId, twoFANotifications, accountChanges, newsletter } = await request.json();

        // Validate required fields
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

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
        if (newsletter !== undefined) {
            updateData['emailPreferences.newsletter'] = newsletter;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Email preferences updated successfully' });
    } catch (error) {
        console.error('Update email preferences error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}