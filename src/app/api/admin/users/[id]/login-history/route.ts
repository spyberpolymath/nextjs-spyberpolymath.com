import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/requireAuth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();
    const { params } = context;
    const { id } = await params;

    // Find user
    let user;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      user = await User.findById(id);
    }
    if (!user) {
      user = await User.findOne({ id });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      user.loginHistory || [],
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching login history:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}