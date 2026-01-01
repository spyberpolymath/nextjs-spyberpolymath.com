import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/requireAuth';

// PUT /api/admin/payments/[paymentId] - Update payment status
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ paymentId: string }> }
) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();
    const { params } = context;
    const { paymentId } = await params;
    const { status, refundAmount } = await req.json();

    // Validate status
    const validStatuses = ['completed', 'pending', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Find user with this payment
    const user = await User.findOne({ 'paymentHistory.paymentId': paymentId });

    if (!user) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update the payment
    const payment = user.paymentHistory.find((p: any) => p.paymentId === paymentId);
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    payment.status = status;
    if (status === 'refunded') {
      payment.refundAmount = refundAmount || payment.amount;
      payment.refundDate = new Date();
    }

    await user.save();

    return NextResponse.json(
      {
        message: 'Payment status updated successfully',
        payment
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}