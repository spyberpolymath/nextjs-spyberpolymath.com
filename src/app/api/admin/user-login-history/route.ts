import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/requireAuth';

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findById(userId).select('name email loginHistory');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return login history, sorted by most recent first
    const loginHistory = user.loginHistory
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      user: { name: user.name, email: user.email },
      loginHistory
    });
  } catch (error) {
    console.error('Error fetching user login history:', error);
    return NextResponse.json({ error: 'Failed to fetch user login history' }, { status: 500 });
  }
}