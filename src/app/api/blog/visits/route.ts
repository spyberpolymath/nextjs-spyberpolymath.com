import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BlogVisit from '@/models/BlogVisit';
import { requireAuth } from '@/lib/requireAuth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { blogId } = await request.json();

    if (!blogId) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    // Check if user visited this blog recently (within last hour) to avoid spam
    const recentVisit = await BlogVisit.findOne({
      userId: authResult.id,
      blogId,
      visitedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    });

    if (!recentVisit) {
      // Log the visit
      await BlogVisit.create({
        userId: authResult.id,
        blogId,
        visitedAt: new Date()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging blog visit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}