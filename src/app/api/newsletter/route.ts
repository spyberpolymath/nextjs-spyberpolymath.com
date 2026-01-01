import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { requireAuth } from '@/lib/requireAuth';
import { apiSecurityMiddleware, applySecurityToResponse } from '@/lib/middleware';
import { newsletterRateLimit } from '@/lib/security';
import { logRequest } from '@/lib/logger';

export async function POST(request: NextRequest) {
  // Apply security middleware with newsletter rate limiting and CSRF protection
  const securityCheck = await apiSecurityMiddleware(request, {
    customRateLimit: newsletterRateLimit,
    requireCsrf: true
  });
  if (securityCheck) return securityCheck;

  try {
    await dbConnect();

    // Check authentication for accounts source
    const { name, email, phone, interest, whatsapp, source } = await request.json();
    if (source === 'accounts') {
      const authResult = await requireAuth(request);
      if (authResult instanceof NextResponse) {
        return authResult;
      }
    }

    // Validate required fields
    if (!name || !email || !interest) {
      return NextResponse.json(
        { error: 'Name, email, and interest are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone number if provided (basic check)
    if (phone && !/^\d{10,}$/.test(phone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Check if subscriber already exists
    const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return NextResponse.json(
          { message: 'Already subscribed to newsletter' },
          { status: 200 }
        );
      } else if (existingSubscriber.status === 'unsubscribed') {
        // Reactivate the subscription
        existingSubscriber.status = 'active';
        existingSubscriber.name = name.trim();
        existingSubscriber.interest = interest;
        existingSubscriber.source = source || 'newsletter';
        existingSubscriber.frequency = 'weekly';
        if (phone) existingSubscriber.phone = phone.trim();
        existingSubscriber.whatsappEnabled = whatsapp || false;
        await existingSubscriber.save();

        // Log the reactivation
        logRequest(request, undefined, {
          action: 'newsletter_resubscription',
          email: email.toLowerCase(),
          interest,
        });

        const response = NextResponse.json(
          { message: 'Successfully resubscribed to newsletter' },
          { status: 200 }
        );
        return applySecurityToResponse(response);
      }
    }

    // Create new subscriber
    const subscriber = new Subscriber({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : undefined,
      interest,
      whatsappEnabled: whatsapp || false,
      source: source || 'newsletter',
      frequency: 'weekly', // Default frequency
    });

    await subscriber.save();

    // Log the subscription
    logRequest(request, undefined, {
      action: 'newsletter_subscription',
      email: email.toLowerCase(),
      interest,
      source: source || 'newsletter',
    });

    const response = NextResponse.json(
      {
        message: 'Successfully subscribed to newsletter',
        subscriber: {
          id: subscriber._id.toString(),
          name: subscriber.name,
          email: subscriber.email,
          interest: subscriber.interest,
          subscribedAt: subscriber.createdAt,
        }
      },
      { status: 201 }
    );

    return applySecurityToResponse(response);
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}