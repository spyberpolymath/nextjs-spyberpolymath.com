import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { requireAdmin } from '@/lib/requireAuth';

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    console.log('DEBUG: Fixing project with slug:', slug);

    // Update the project to be FREE
    const updated = await Project.findOneAndUpdate(
      { slug },
      {
        isPaid: false,
        price: 0,
        currency: 'INR',
        updated_at: new Date()
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log('DEBUG: Fixed project:', {
      slug: updated.slug,
      isPaid: updated.isPaid,
      price: updated.price
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Project fixed successfully',
        project: updated
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fix project error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fix project' },
      { status: 500 }
    );
  }
}
