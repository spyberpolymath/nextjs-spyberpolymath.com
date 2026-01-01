import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/requireAuth';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  console.log('Logout session API called');
  await dbConnect();

  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const payload = auth as any;

  const { userId, sessionData } = await req.json();

  console.log('userId:', userId, 'sessionData:', sessionData);

  if (!userId || !sessionData) {
    return NextResponse.json({ error: 'Missing userId or sessionData' }, { status: 400 });
  }

  // Check permissions: admin or owner
  const isAdmin = payload.isAdmin;
  const isOwner = String(userId) === String(payload.id || payload._id);
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Find the user
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Find the login entry
  const loginIndex = user.loginHistory.findIndex((login: any) =>
    login.timestamp.getTime() === new Date(sessionData.timestamp).getTime() &&
    login.ip === sessionData.ip &&
    login.success === sessionData.success
  );

  console.log('loginIndex:', loginIndex);

  if (loginIndex === -1) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Set loggedOut
  user.loginHistory[loginIndex].loggedOut = true;
  await user.save();

  return NextResponse.json({ message: 'Session logged out successfully' });
}