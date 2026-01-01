import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AccountPayment from '@/models/AccountPayment';
import { requireAuth } from '@/lib/requireAuth';
import { generatePID } from '@/lib/idGenerator';

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const payload = auth as any;

    await dbConnect();
    const { amount, currency, description, method } = await req.json();

    // Validate input
    if (!amount || !currency || !description || !method) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, currency, description, method' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Generate PID for this payment
    const paymentId = await generatePID();
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record in AccountPayment model
    const payment = new AccountPayment({
      userId: payload.id,
      paymentId,
      amount,
      currency,
      description,
      status: 'completed',
      method,
      transactionId,
      invoiceId,
      date: new Date()
    });

    await payment.save();

    return NextResponse.json(
      {
        message: 'Payment marked as completed',
        paymentId,
        transactionId,
        invoiceId
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
