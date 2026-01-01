import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import ProjectPayment from '../../../models/ProjectPayment';
import { requireAuth } from '../../../lib/requireAuth';
import { generatePID } from '../../../lib/idGenerator';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const payload = auth as any;

    // Get payments for current user
    const payments = await ProjectPayment.find({ userId: payload.id }).sort({ createdAt: -1 });
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching project payments:', error);
    return NextResponse.json({ error: 'Failed to fetch project payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const payload = auth as any;

    const {
      projectId,
      amount,
      currency = 'INR',
      description,
      method
    } = await request.json();

    if (!projectId || !amount || !description || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const paymentId = await generatePID();
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const projectPayment = new ProjectPayment({
      projectId,
      userId: payload.id,
      paymentId,
      amount,
      currency,
      description,
      status: 'pending',
      method,
      transactionId,
      invoiceId,
      date: new Date()
    });

    await projectPayment.save();

    return NextResponse.json({
      message: 'Project payment created successfully',
      paymentId,
      transactionId,
      invoiceId
    });
  } catch (error) {
    console.error('Error creating project payment:', error);
    return NextResponse.json({ error: 'Failed to create project payment' }, { status: 500 });
  }
}