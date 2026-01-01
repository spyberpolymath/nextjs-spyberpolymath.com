import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import AccountPayment from '@/models/AccountPayment';
import { requireAuth } from '@/lib/requireAuth';

// Helper function to check if user has active allAccess subscription
async function hasAllAccessSubscription(userId: string): Promise<boolean> {
  try {
    const activeSubscription = await AccountPayment.findOne({
      userId,
      planType: 'allAccess',
      isActive: true,
      endDate: { $gt: new Date() }
    });
    return !!activeSubscription;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Find the project by ID
    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if user has allAccess subscription to determine pricing visibility
    let hasAllAccess = false;
    let isFreeForUser = false;

    try {
      const auth = await requireAuth(req);
      if (!(auth instanceof NextResponse)) {
        const payload = auth as any;
        hasAllAccess = await hasAllAccessSubscription(payload.id);
        isFreeForUser = hasAllAccess;
      }
    } catch (error) {
      // User not authenticated, continue without subscription check
    }

    // Return project data with access information
    const projectData = {
      _id: project._id.toString(),
      title: project.title,
      slug: project.slug,
      description: project.description,
      richDescription: project.richDescription,
      category: project.category,
      tags: project.tags,
      image: project.image,
      github: project.github,
      demo: project.demo,
      kaggle: project.kaggle,
      linkedin: project.linkedin,
      demo2: project.demo2,
      published: project.published,
      created_at: project.created_at,
      updated_at: project.updated_at,
      price: project.price,
      currency: project.currency,
      isPaid: project.isPaid,
      isFreeForUser,
      zipUrl: project.zipUrl,
      downloadLimit: project.downloadLimit,
      downloadCount: project.downloadCount,
      isPaidAfterLimit: project.isPaidAfterLimit
    };

    return NextResponse.json(projectData);

  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}