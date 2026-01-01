import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import AccountPayment from '@/models/AccountPayment';
import { requireAdmin, requireAuth } from '@/lib/requireAuth';
import { validateBody, projectCreateSchema, projectUpdateSchema } from '@/lib/validation';

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

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    // Support both absolute and relative URLs
    const url = req.url.startsWith('http') ? new URL(req.url) : new URL(req.url, 'http://localhost');
    const category = url.searchParams.get('category');
    const slug = url.searchParams.get('slug');
    let query: any = {};
    if (slug) {
      query.slug = slug;
    } else if (category) {
      query.category = category;
    }
    
    const projects = await Project.find(query).sort({ created_at: -1 });
    
    // Check if user has allAccess subscription
    let hasAllAccess = false;
    try {
      const auth = await requireAuth(req);
      if (!(auth instanceof NextResponse)) {
        const payload = auth as any;
        hasAllAccess = await hasAllAccessSubscription(payload.id);
      }
    } catch (error) {
      // User not authenticated, continue without subscription check
    }
    
    // Add isFreeForUser flag to projects if user has allAccess
    const projectsWithAccessInfo = projects.map((project: any) => {
      const projectObj = project.toObject ? project.toObject() : { ...project };
      // Check if project is paid (either isPaid flag is true OR price > 0)
      const isPaidProject = projectObj.isPaid === true || (projectObj.price && projectObj.price > 0);
      if (hasAllAccess && isPaidProject) {
        projectObj.isFreeForUser = true; // Paid project is free for allAccess subscribers
      }
      return projectObj;
    });
    
    console.log('API /projects - Response data:', {
      projectCount: projectsWithAccessInfo.length,
      hasAllAccess,
      firstProjectData: projectsWithAccessInfo[0] ? {
        title: projectsWithAccessInfo[0].title,
        isPaid: projectsWithAccessInfo[0].isPaid,
        isFreeForUser: projectsWithAccessInfo[0].isFreeForUser
      } : null
    });
    
    return NextResponse.json({ 
      results: projectsWithAccessInfo,
      hasAllAccess
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: any) {
  // admin only
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }
  try {
    await dbConnect();
    const validation = await validateBody(projectCreateSchema, req);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const data = validation.data;
    const projectData = {
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
      richDescription: data.richDescription || '',
    };
    const project = await Project.create(projectData);
    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: any) {
  // admin only
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }
  try {
    await dbConnect();
    const body = await req.json();
    const { id, _id, ...updateFields } = body;
    if (!id && !_id) return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
    const projectId = id || _id;

    const validation = projectUpdateSchema.safeParse(updateFields);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') }, { status: 400 });
    }
    const data = validation.data;

    const updateData = {
      ...data,
      updated_at: new Date(),
      richDescription: data.richDescription || '',
    };
    const updated = await Project.findByIdAndUpdate(projectId, updateData, { new: true });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: any) {
  // admin only
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }
  try {
    await dbConnect();
    const url = new URL(req.url, 'http://localhost');
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
    await Project.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
