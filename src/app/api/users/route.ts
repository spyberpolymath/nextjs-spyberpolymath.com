import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/requireAuth';

// GET /api/users - List all users (no password field) - admin only
export async function GET(req: NextRequest) {
    const adminCheck = await requireAdmin(req);
    if (adminCheck instanceof NextResponse) {
        return adminCheck;
    }
    try {
        await dbConnect();
        const users = await User.find({}, '-password');
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}