import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/requireAuth';

// GET /api/admin/payments/user/[userId] - Get payments for specific user
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();
    const { params } = context;
    const { userId } = await params;

    let user;
    if (/^[0-9a-fA-F]{24}$/.test(userId)) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await User.findOne({ uid: userId });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        userId: user._id,
        uid: user.uid,
        email: user.email,
        payments: user.paymentHistory || []
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user payments:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
