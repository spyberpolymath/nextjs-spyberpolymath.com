import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import AccountPayment from '../../../../models/AccountPayment';
import { requireAuth } from '../../../../lib/requireAuth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    await requireAuth(request);

    const { id } = await params;
    const { status } = await request.json();

    if (!['pending', 'completed', 'cancelled', 'failed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const payment = await AccountPayment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating account payment:', error);
    return NextResponse.json({ error: 'Failed to update account payment' }, { status: 500 });
  }
}