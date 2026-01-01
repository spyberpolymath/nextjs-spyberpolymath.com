import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AccountPayment from '@/models/AccountPayment';
import { requireAuth } from '@/lib/requireAuth';

// Get all payments and subscription history for user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const payload = auth as any;

    const payments = await AccountPayment.find({ userId: payload.id }).sort({ createdAt: -1 });
    
    // Get active subscription
    const activeSubscription = await AccountPayment.findOne({
      userId: payload.id,
      isActive: true,
      endDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    return NextResponse.json({ 
      payments,
      activeSubscription: activeSubscription || null
    });
  } catch (error) {
    console.error('Error fetching account payments:', error);
    return NextResponse.json({ error: 'Failed to fetch account payments' }, { status: 500 });
  }
}

// Create new subscription or payment
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const payload = auth as any;

    const { 
      amount, 
      currency = 'INR', 
      description, 
      method = 'stripe',
      planType,
      billingCycle
    } = await request.json();

    console.log('Subscription request received:', { amount, description, planType, billingCycle });

    if (amount === undefined || amount === null || !description) {
      return NextResponse.json({ error: 'Missing required fields: amount and description are required' }, { status: 400 });
    }

    if (!payload.id) {
      return NextResponse.json({ error: 'User ID not found in token' }, { status: 401 });
    }

    // Generate IDs
    const paymentId = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate end date based on billing cycle
    const startDate = new Date();
    let endDate = new Date();
    let renewalDate = new Date();

    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else if (billingCycle === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 3);
      renewalDate.setMonth(renewalDate.getMonth() + 3);
    } else if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    const accountPayment = new AccountPayment({
      userId: payload.id,
      paymentId,
      amount,
      currency,
      description,
      status: 'completed',
      method,
      transactionId,
      invoiceId,
      planType: planType || 'free',
      billingCycle: billingCycle || 'monthly',
      startDate,
      endDate,
      renewalDate,
      isActive: true,
      autoRenew: true,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await accountPayment.save();

    return NextResponse.json({
      message: 'Subscription created successfully',
      paymentId,
      transactionId,
      invoiceId,
      subscription: accountPayment
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subscription:', error?.message || error);
    const errorMessage = error?.message || 'Failed to create subscription';
    return NextResponse.json({ 
      error: 'Failed to create subscription',
      details: errorMessage
    }, { status: 500 });
  }
}

// Update subscription status or details
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const payload = auth as any;

    const { _id, paymentId, status, isActive, autoRenew } = await request.json();
    const id = _id || paymentId;

    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Try to find by _id first (MongoDB document ID), then by paymentId
    let subscription = await AccountPayment.findOne({
      _id: id,
      userId: payload.id
    });

    if (!subscription) {
      subscription = await AccountPayment.findOne({
        paymentId: id,
        userId: payload.id
      });
    }

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Update fields
    if (status) subscription.status = status;
    if (isActive !== undefined) subscription.isActive = isActive;
    if (autoRenew !== undefined) subscription.autoRenew = autoRenew;
    subscription.updatedAt = new Date();

    await subscription.save();

    return NextResponse.json({
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

// Delete account payment/subscription - Note: This handles DELETE /api/account-payments[?id=paymentId] 
// For path-based deletion (/api/account-payments/paymentId), use a [...id]/route.ts file
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const payload = auth as any;

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');

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

    await AccountPayment.deleteOne({ _id: paymentId });

    return NextResponse.json({
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}