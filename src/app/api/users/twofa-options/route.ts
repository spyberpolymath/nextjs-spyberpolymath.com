import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/requireAuth';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id'); // Assume user ID is passed in headers for simplicity
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID required' }), { status: 400 });
  }

  await dbConnect();
  const user = await User.findById(userId);
  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  const twoFAOptions = {
    emailOtp: user.emailOtpEnabled || false
  };
  return new Response(JSON.stringify(twoFAOptions), { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const payload = auth as any;

    const body = await req.json();
    const { userId, type } = body;
    if (!userId || type !== 'email') {
      return NextResponse.json({ error: 'userId and type=email required' }, { status: 400 });
    }

    // Check if the authenticated user is the same as the userId or is admin
    if (String(payload.id || payload._id) !== String(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.twoFactorEnabled = true;
    user.emailOtpEnabled = true;
    await user.save();

    return NextResponse.json({ success: true, twoFactorEnabled: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 });
  }
}