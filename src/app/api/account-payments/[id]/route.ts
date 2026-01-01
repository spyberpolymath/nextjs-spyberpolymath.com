import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AccountPayment from '@/models/AccountPayment';
import { requireAuth } from '@/lib/requireAuth';

// Delete/Cancel account payment by ID
// Supports both subscription cancellation and payment deletion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const payload = auth as any;

    const { id: paymentId } = await params;

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    const payment = await AccountPayment.findOne({
      _id: paymentId,
      userId: payload.id
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // For subscriptions with planType (not free), mark as cancelled
    if (payment.planType && payment.planType !== 'free') {
      const updatedPayment = await AccountPayment.findByIdAndUpdate(
        paymentId,
        {
          status: 'cancelled',
          isActive: false,
          autoRenew: false,
          updatedAt: new Date()
        },
        { new: true }
      );

      return NextResponse.json({
        message: 'Subscription cancelled successfully',
        payment: updatedPayment
      });
    }

    // For other payments (free plans or non-subscription payments), delete them
    await AccountPayment.deleteOne({ _id: paymentId });

    return NextResponse.json({
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting/cancelling payment:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}
