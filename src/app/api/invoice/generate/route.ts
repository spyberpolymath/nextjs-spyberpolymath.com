import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/requireAuth';
import dbConnect from '@/lib/mongodb';
import AccountPayment from '@/models/AccountPayment';
import ProjectPayment from '@/models/ProjectPayment';
import User from '@/models/User';
import { jsPDF } from 'jspdf';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const payload = auth as any;

    const { paymentId, paymentType } = await request.json();

    if (!paymentId || !paymentType) {
      return NextResponse.json(
        { error: 'Missing paymentId or paymentType' },
        { status: 400 }
      );
    }

    let payment: any = null;
    let invoiceData: any = null;

    if (paymentType === 'account') {
      const query = payload.role === 'admin' ? { _id: paymentId } : { _id: paymentId, userId: payload.id };
      payment = await AccountPayment.findOne(query);

      if (!payment) {
        return NextResponse.json(
          { error: 'Account payment not found' },
          { status: 404 }
        );
      }

      const user = await User.findOne({ _id: payment.userId });

      invoiceData = {
        invoiceNumber: payment.invoiceId || `INV-${payment._id}`,
        type: 'Account Payment',
        date: payment.createdAt ? new Date(payment.createdAt) : payment.date ? new Date(payment.date) : new Date(),
        dueDate: payment.endDate ? new Date(payment.endDate) : new Date(),
        transactionId: payment.transactionId || payment.paymentId,
        paymentId: payment.paymentId,
        amount: typeof payment.amount === 'number' ? payment.amount : 0,
        currency: payment.currency || 'INR',
        description: payment.description,
        status: payment.status,
        planType: payment.planType,
        billingCycle: payment.billingCycle,
        userName: user?.name || 'Customer',
        userEmail: user?.email || '',
        userPhone: user?.phone || '',
        startDate: payment.startDate,
        endDate: payment.endDate,
        renewalDate: payment.renewalDate
      };
    } else if (paymentType === 'project') {
      const query = payload.role === 'admin' ? { _id: paymentId } : { _id: paymentId, userId: payload.id };
      payment = await ProjectPayment.findOne(query);

      if (!payment) {
        return NextResponse.json(
          { error: 'Project payment not found' },
          { status: 404 }
        );
      }

      invoiceData = {
        invoiceNumber: payment.invoiceId || `INV-${payment._id}`,
        type: 'Project Payment',
        date: payment.createdAt ? new Date(payment.createdAt) : new Date(),
        dueDate: payment.createdAt ? new Date(payment.createdAt) : new Date(),
        transactionId: payment.transactionId,
        paymentId: payment.paymentId,
        amount: typeof payment.amount === 'number' ? payment.amount : 0,
        currency: payment.currency || 'INR',
        description: `Project Purchase`,
        status: payment.status,
        projectId: payment.projectId,
        userName: payment.name || 'Customer',
        userEmail: payment.email || '',
        userPhone: payment.phone || '',
        userAddress: `${payment.address || ''}${payment.addressLine2 ? ', ' + (payment.addressLine2 || '') : ''}`,
        userCity: payment.city || '',
        userState: payment.stateProvince || '',
        userCountry: payment.countryRegion || '',
        userPostal: payment.postalCode || ''
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid payment type' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}

async function generateInvoicePDF(data: any): Promise<Buffer> {
  const doc = new jsPDF();

  // Company Header
  doc.setFontSize(24);
  doc.text('INVOICE', 20, 30);

  doc.setFontSize(10);
  doc.text('SpyberPolymath', 20, 40);
  doc.text('https://spyberpolymath.com', 20, 50);

  // Invoice Details (Top Right)
  doc.setFontSize(11);
  doc.text('Invoice Details', 120, 30);
  doc.setFontSize(10);
  doc.text(`Invoice #: ${data.invoiceNumber}`, 120, 40);
  doc.text(`Date: ${data.date.toLocaleDateString('en-IN')}`, 120, 50);
  doc.text(`Due Date: ${data.dueDate.toLocaleDateString('en-IN')}`, 120, 60);
  doc.text(`Transaction ID: ${data.transactionId}`, 120, 70);

  // Bill To Section
  doc.setFontSize(12);
  doc.text('Bill To:', 20, 90);
  doc.setFontSize(10);
  doc.text(data.userName, 20, 100);
  doc.text(data.userEmail, 20, 110);
  doc.text(data.userPhone || 'N/A', 20, 120);

  if (data.userAddress) {
    doc.text(data.userAddress, 20, 130);
    doc.text(`${data.userCity}, ${data.userState} ${data.userPostal}`, 20, 140);
    doc.text(data.userCountry, 20, 150);
  }

  // Items Table
  let y = data.userAddress ? 170 : 140;
  doc.setFontSize(11);
  doc.text('Description', 20, y);
  doc.text('Amount', 120, y);
  doc.text('Status', 160, y);

  y += 10;
  doc.setFontSize(10);

  const description = data.planType && data.billingCycle
    ? `${data.description} - ${data.planType} (${data.billingCycle})`
    : data.description;

  doc.text(description, 20, y, { maxWidth: 80 });
  const amountText = `₹${data.amount.toFixed(2)} ${data.currency}`;
  doc.text(amountText, 120, y);
  const statusText = data.status.charAt(0).toUpperCase() + data.status.slice(1);
  doc.text(statusText, 160, y);

  // Additional details
  y += 30;
  doc.setFontSize(10);
  doc.text('Additional Information:', 20, y);

  y += 15;
  if (data.planType) {
    doc.text(`Plan Type: ${data.planType}`, 20, y);
    y += 10;
  }
  if (data.billingCycle) {
    doc.text(`Billing Cycle: ${data.billingCycle}`, 20, y);
    y += 10;
  }
  if (data.startDate && !isNaN(new Date(data.startDate).getTime())) {
    doc.text(`Start Date: ${new Date(data.startDate).toLocaleDateString('en-IN')}`, 20, y);
    y += 10;
  }
  if (data.endDate && !isNaN(new Date(data.endDate).getTime())) {
    doc.text(`End Date: ${new Date(data.endDate).toLocaleDateString('en-IN')}`, 20, y);
    y += 10;
  }
  if (data.renewalDate && data.type === 'Account Payment' && !isNaN(new Date(data.renewalDate).getTime())) {
    doc.text(`Renewal Date: ${new Date(data.renewalDate).toLocaleDateString('en-IN')}`, 20, y);
    y += 10;
  }
  if (data.projectId) {
    doc.text(`Project ID: ${data.projectId}`, 20, y);
    y += 10;
  }

  // Totals Section
  y += 20;
  doc.setFontSize(11);
  doc.text('Total Amount:', 120, y);
  doc.text(`₹${data.amount.toFixed(2)} ${data.currency}`, 160, y);

  // Footer
  y += 40;
  doc.setFontSize(9);
  doc.text(
    'Thank you for your transaction. If you have any questions, please contact us at contact@spyberpolymath.com',
    105,
    y,
    { align: 'center', maxWidth: 180 }
  );
  y += 15;
  doc.text(`Payment Method: ${data.paymentMethod || 'Stripe'}`, 20, y);
  y += 10;
  doc.text(`This invoice was generated on ${new Date().toLocaleDateString('en-IN')}`, 20, y);

  // Get PDF as buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}
