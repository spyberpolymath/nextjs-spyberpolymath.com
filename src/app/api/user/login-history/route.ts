import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/requireAuth';
import { safeObjectIdToString, isValidObjectId } from '@/lib/objectIdUtils';

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

    const user = await User.findById(userId).select('loginHistory');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return last 50 login attempts, sorted by most recent first
    const loginHistory = user.loginHistory
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    return NextResponse.json({ loginHistory });
  } catch (error) {
    console.error('Error fetching login history:', error);
    return NextResponse.json({ error: 'Failed to fetch login history' }, { status: 500 });
  }
}