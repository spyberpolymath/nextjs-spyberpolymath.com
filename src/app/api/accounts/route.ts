import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import AccountPayment from '../../../models/AccountPayment';
import { requireAuth } from '../../../lib/requireAuth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await requireAuth(request);

    const payments = await AccountPayment.find({}).sort({ createdAt: -1 });
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching account payments:', error);
    return NextResponse.json({ error: 'Failed to fetch account payments' }, { status: 500 });
  }
}