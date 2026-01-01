import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectPayment from '@/models/ProjectPayment';
import { apiSecurityMiddleware, applySecurityToResponse } from '@/lib/middleware';
import { projectContactRateLimit } from '@/lib/security';
import { logRequest } from '@/lib/logger';

export async function POST(req: NextRequest) {
  // Apply security middleware with project contact rate limiting
  const securityCheck = await apiSecurityMiddleware(req, {
    customRateLimit: projectContactRateLimit,
    requireCsrf: true
  });
  if (securityCheck) return securityCheck;

  try {
    await dbConnect();

    const {
      name,
      email,
      phone,
      address,
      addressLine2,
      city,
      countryRegion,
      stateProvince,
      postalCode,
      vatGstId,
      message,
      project_title,
      project_slug,
      amount,
      currency = 'INR',
      status = 'completed'
    } = await req.json();

    // Validate required fields
    if (!name || !email || !phone || !address || !city || !countryRegion || !stateProvince || !postalCode || !project_title || !project_slug) {
      return NextResponse.json(
        { error: 'Missing required contact information' },
        { status: 400 }
      );
    }

    // Validate amount - can be 0 for inquiries or > 0 for payments
    const finalAmount = amount !== undefined && amount !== null ? amount : 0;
    if (finalAmount < 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    // Determine status based on amount
    const finalStatus = finalAmount > 0 ? (status || 'completed') : 'pending';

    // Generate payment, transaction, and invoice IDs
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const invoiceId = `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record in ProjectPayment with full payment details
    const projectPayment = new ProjectPayment({
      projectId: project_slug,
      userId: email,
      paymentId,
      amount: finalAmount,
      currency,
      description: finalAmount > 0 ? `Payment for project: ${project_title}` : `Inquiry for project: ${project_title}`,
      status: finalStatus,
      method: finalAmount > 0 ? 'manual' : 'inquiry',
      transactionId,
      invoiceId,
      date: new Date(),
      name,
      email,
      phone,
      address,
      addressLine2: addressLine2 || '',
      city,
      countryRegion,
      stateProvince,
      postalCode,
      vatGstId: vatGstId || '',
      message: message || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedPayment = await projectPayment.save();

    // Log the request
    logRequest(req, undefined, {
      action: 'project_contact',
      projectSlug: project_slug,
      amount: finalAmount,
      paymentId,
    });

    const response = NextResponse.json(
      {
        message: 'Payment submitted successfully',
        paymentId: savedPayment.paymentId,
        invoiceId: savedPayment.invoiceId,
        transactionId: savedPayment.transactionId,
        status: savedPayment.status,
        amount: savedPayment.amount,
        currency: savedPayment.currency
      },
      { status: 200 }
    );

    return applySecurityToResponse(response);
  } catch (error: any) {
    console.error('Payment submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit payment' },
      { status: 500 }
    );
  }
}