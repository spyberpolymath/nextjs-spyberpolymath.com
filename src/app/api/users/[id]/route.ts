import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { requireAuth, requireAdmin } from '@/lib/requireAuth';
import { validateBody, userUpdateSchema, userPasswordChangeSchema } from '@/lib/validation';

function sanitizeUser(user: any) {
    if (!user) return null;
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    obj.id = obj._id?.toString() || obj.id;
    return obj;
}

// GET /api/users/[id]
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    // Allow only admin or the user themself
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const payload = auth as any;

    try {
        await dbConnect();
        const { params } = context;
        const { id } = await params;

        // Try finding by MongoDB _id first
        let user;
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
            user = await User.findById(id);
        }
        // Fallback to custom id field
        if (!user) {
            user = await User.findOne({ id });
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Ownership check: allow if admin or same user
        const isOwner = String(user._id) === String(payload.id || payload._id);
        if (!isOwner) {
            const adminCheck = await requireAdmin(req);
            if (adminCheck instanceof NextResponse) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        return NextResponse.json(sanitizeUser(user));
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// PUT /api/users/[id] - Update profile
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    // Allow only admin or the user themself
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const payload = auth as any;

    try {
        await dbConnect();
        const { params } = context;
        const { id } = await params;
        const validation = await validateBody(userUpdateSchema, req);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }
        // Extend type to allow optional password property
        const body: typeof validation.data & { password?: string } = validation.data;

        // Prevent password updates via this route
        if (body.password) delete body.password;

        // Find user
        let user;
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
            user = await User.findById(id);
        }
        if (!user) {
            user = await User.findOne({ id });
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isOwner = String(user._id) === String(payload.id || payload._id);
        if (!isOwner) {
            const adminCheck = await requireAdmin(req);
            if (adminCheck instanceof NextResponse) {
                return adminCheck;
            }
        }
        Object.assign(user, body);
        await user.save();

        return NextResponse.json({
            message: 'User updated successfully',
            user: sanitizeUser(user)
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// POST /api/users/[id] - Change password or toggle 2FA
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    // Allow only admin or the user themself
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const payload = auth as any;

    try {
        await dbConnect();
        const { params } = context;
        const { id } = await params;
        const body = await req.json();

        // Find user
        let user;
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
            user = await User.findById(id);
        }
        if (!user) {
            user = await User.findOne({ id });
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isOwner = String(user._id) === String(payload.id || payload._id);
        if (!isOwner) {
            const adminCheck = await requireAdmin(req);
            if (adminCheck instanceof NextResponse) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // Handle password change
        if (body.currentPassword !== undefined && body.newPassword !== undefined) {
            // Validate the body data directly since we already parsed it
            const validationResult = userPasswordChangeSchema.safeParse(body);
            if (!validationResult.success) {
                return NextResponse.json({ error: validationResult.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') }, { status: 400 });
            }
            const { currentPassword, newPassword } = validationResult.data;

            const match = await bcrypt.compare(currentPassword, user.password || '');
            if (!match) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 400 }
                );
            }

            if (typeof newPassword !== 'string' || newPassword.length < 8) {
                return NextResponse.json(
                    { error: 'New password must be at least 8 characters' },
                    { status: 400 }
                );
            }

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            return NextResponse.json({ message: 'Password updated successfully' });
        }

        // Handle 2FA toggle
        if (body.enable !== undefined) {
            user.twoFactorEnabled = Boolean(body.enable);
            await user.save();

            return NextResponse.json({
                message: 'Two-Factor setting updated',
                twoFactorEnabled: user.twoFactorEnabled
            });
        }

        return NextResponse.json({ error: 'No valid action provided' }, { status: 400 });
    } catch (error) {
        console.error('Error in POST handler:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}