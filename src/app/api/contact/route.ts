import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import { requireAdmin } from '@/lib/requireAuth';
import { validateBody, contactCreateSchema, contactUpdateSchema } from '@/lib/validation';
import { apiSecurityMiddleware, applySecurityToResponse } from '@/lib/middleware';
import { contactRateLimit } from '@/lib/security';
import { logRequest } from '@/lib/logger';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeString(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str.trim();
}

export async function GET(req: NextRequest) {
  // Admin only
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    const response = NextResponse.json(messages);
    return applySecurityToResponse(response);
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch messages.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Apply security middleware with contact rate limiting and CSRF protection
  const securityCheck = await apiSecurityMiddleware(req, {
    customRateLimit: contactRateLimit,
    requireCsrf: true
  });
  if (securityCheck) return securityCheck;

  try {
    await dbConnect();
    const isAdmin = req.headers.get('authorization')?.startsWith('Bearer ');

    let schema = contactCreateSchema;
    if (isAdmin) {
      // Looser validation for admin manual adds
      schema = z.object({
        name: z.string().min(1).max(100),
        email: z.string().email(),
        phone: z.string().min(1).max(20),
        subject: z.string().min(1).max(200),
        message: z.string().min(1).max(2000),
      });
    }

    const validation = await validateBody(schema, req);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const data = validation.data;
    const name = sanitizeString(data.name);
    const email = sanitizeString(data.email);
    const phone = sanitizeString(data.phone);
    const subject = sanitizeString(data.subject);
    const message = sanitizeString(data.message);

    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address.' }, { status: 400 });
    }

    const doc = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message,
      status: 'new',
      createdAt: new Date(),
    });

    const result = await doc.save();

    // Log the contact submission
    logRequest(req, undefined, {
      action: 'contact_submission',
      email: email.toLowerCase(),
      subject,
    });

    const response = NextResponse.json({
      success: true,
      id: result._id,
      message: 'Contact message sent successfully'
    });

    return applySecurityToResponse(response);
  } catch (e) {
    console.error('Contact submission error:', e);
    return NextResponse.json({ success: false, error: 'Failed to submit message.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  // admin only
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }
  try {
    await dbConnect();
    const data = await req.json();
    const { id, ...updateData } = data;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id.' }, { status: 400 });

    // Validate update data
    const validation = contactUpdateSchema.safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') }, { status: 400 });
    }

    const update = validation.data;

    if (update.status && !['new', 'read', 'replied', 'archived'].includes(update.status)) {
      return NextResponse.json({ success: false, error: 'Invalid status.' }, { status: 400 });
    }
    if (update.status === 'replied') {
      (update as any).repliedAt = new Date();
    }
    await ContactMessage.findByIdAndUpdate(id, update);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update message.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  // admin only
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }
  try {
    await dbConnect();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'Missing id.' }, { status: 400 });
    await ContactMessage.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to delete message.' }, { status: 500 });
  }
}
