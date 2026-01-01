import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { requireAuth } from '@/lib/requireAuth';

export async function POST(request: NextRequest) {
  // Handle CORS
  const origin = request.headers.get('origin');
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

  const responseHeaders = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? (origin || 'http://localhost:3000') : 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: responseHeaders });
  }

  try {
    await dbConnect();

    // Check authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { email } = await request.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Find and update subscriber status to unsubscribed
    const subscriber = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { status: 'unsubscribed' },
      { new: true }
    );

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404, headers: responseHeaders }
      );
    }

    return NextResponse.json(
      { message: 'Successfully unsubscribed from newsletter' },
      { status: 200, headers: responseHeaders }
    );
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: responseHeaders }
    );
  }
}