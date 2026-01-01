import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/requireAuth';

// GET /api/admin/payments - Get all payments from all users
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();
    const users = await User.find({}, 'email uid paymentHistory');

    // Flatten payment history from all users
    const allPayments: Array<any> = [];
    users.forEach((user: any) => {
      if (user.paymentHistory && user.paymentHistory.length > 0) {
        user.paymentHistory.forEach((payment: any) => {
          allPayments.push({
            ...payment,
            userId: user._id,
            userEmail: user.email,
            userUID: user.uid
          });
        });
      }
    });

    // Sort by date descending
    allPayments.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(allPayments, { status: 200 });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
