import { NextResponse, NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { requireAuth } from '@/lib/requireAuth';
import AccountPayment from '@/models/AccountPayment';
import ProjectPayment from '@/models/ProjectPayment';

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
    return false;
  }
}

async function hasProjectPurchase(userId: string, projectId: string): Promise<boolean> {
  try {
    const projectPurchase = await ProjectPayment.findOne({
      userId,
      projectId,
      status: 'completed'
    });
    return !!projectPurchase;
  } catch (error) {
    return false;
  }
}

async function hasProjectAccessByEmail(email: string, projectId: string): Promise<boolean> {
  try {
    // Check if user has all-access subscription
    const hasAllAccess = await AccountPayment.findOne({
      email,
      planType: 'allAccess',
      isActive: true,
      endDate: { $gt: new Date() }
    });

    if (hasAllAccess) {
      return true;
    }

    // Check if user has purchased this specific project
    const projectPurchase = await ProjectPayment.findOne({
      email,
      projectId,
      status: 'completed'
    });

    return !!projectPurchase;
  } catch (error) {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url, 'http://localhost');
    const projectId = url.searchParams.get('projectId');
    const projectSlug = url.searchParams.get('slug');
    const email = url.searchParams.get('email');

    if (!projectId && !projectSlug) {
      return NextResponse.json({ error: 'Project ID or slug is required' }, { status: 400 });
    }

    await dbConnect();

    let project;
    if (projectId) {
      project = await Project.findById(projectId);
    } else if (projectSlug) {
      project = await Project.findOne({ slug: projectSlug });
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!project.zipUrl) {
      return NextResponse.json({ error: 'No ZIP file available for this project' }, { status: 404 });
    }

    console.log('DEBUG: Full project object:', JSON.stringify({
      slug: project.slug,
      title: project.title,
      isPaid: project.isPaid,
      price: project.price,
      isPaidAfterLimit: project.isPaidAfterLimit,
      downloadLimit: project.downloadLimit,
      downloadCount: project.downloadCount,
      zipUrl: project.zipUrl ? 'exists' : 'missing'
    }, null, 2));

    let hasAccess = false;

    // SIMPLE LOGIC: Only block paid projects that require all-access
    // Everything else (free projects, free after limit) should allow download
    
    // Check if it's a paid project that requires subscription
    // IMPORTANT: Price takes priority - if price is 0 or undefined, it's FREE
    // regardless of isPaid flag (in case of data inconsistency)
    const priceValue = Number(project.price) || 0;
    const isPaidProject = priceValue > 0;

    console.log('DEBUG: Access check:', {
      priceValue,
      isPaid: project.isPaid,
      isPaidProject,
      isPaidAfterLimit: project.isPaidAfterLimit
    });

    if (isPaidProject && !project.isPaidAfterLimit) {
      // Paid project that hasn't been auto-converted yet - require subscription or individual purchase
      console.log('DEBUG: This is a PAID project - checking subscription or individual purchase');

      // First check if email parameter is provided (for download-project page)
      if (email) {
        const hasEmailAccess = await hasProjectAccessByEmail(email, project._id.toString());
        hasAccess = hasEmailAccess;
        console.log('DEBUG: Email access check:', hasEmailAccess, 'for email:', email);
      } else {
        // Fallback to authenticated user check
        try {
          const auth = await requireAuth(req);
          if (!(auth instanceof NextResponse)) {
            const payload = auth as any;
            const hasAllAccess = await hasAllAccessSubscription(payload.id);
            const hasProjectPurchaseAccess = await hasProjectPurchase(payload.id, project._id.toString());
            hasAccess = hasAllAccess || hasProjectPurchaseAccess;
            console.log('DEBUG: User all-access?', hasAllAccess, 'Project purchase?', hasProjectPurchaseAccess);
          } else {
            hasAccess = false;
            console.log('DEBUG: User not authenticated');
          }
        } catch (error) {
          hasAccess = false;
          console.log('DEBUG: Auth error:', error);
        }
      }
    } else {
      // FREE project or already converted to paid - ALLOW DOWNLOAD
      console.log('DEBUG: This is a FREE project - ALLOWING download');
      hasAccess = true;
    }

    if (!hasAccess) {
      console.log('DEBUG: DENYING access - returning 403');
      return NextResponse.json(
        { error: 'You do not have access to download this file. Please purchase or subscribe to access.' },
        { status: 403 }
      );
    }
    
    console.log('DEBUG: ALLOWING download - proceeding');

    // Increment download count for free projects (not originally paid)
    if (!isPaidProject || project.isPaidAfterLimit) {
      const currentCount = (project.downloadCount || 0) + 1;
      const downloadLimit = project.downloadLimit || 5;

      console.log('DEBUG: Incrementing download count:', {
        currentCount,
        downloadLimit,
        willMarkAsPaid: currentCount >= downloadLimit && !project.isPaidAfterLimit
      });

      // Check if download limit reached
      if (currentCount >= downloadLimit && !project.isPaidAfterLimit) {
        // Update project to mark as paid after limit
        await Project.findByIdAndUpdate(project._id, {
          downloadCount: currentCount,
          isPaidAfterLimit: true,
          updated_at: new Date()
        });
      } else {
        // Just increment count
        await Project.findByIdAndUpdate(project._id, {
          downloadCount: currentCount,
          updated_at: new Date()
        });
      }
    }

    const extractFileName = (url: string) => {
      const parts = url.split('/');
      return parts[parts.length - 1];
    };

    const fileName = extractFileName(project.zipUrl);
    const filePath = join(process.cwd(), 'public', 'uploads', 'project-zips', fileName);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'ZIP file not found on server' }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const projectName = project.title.replace(/\s+/g, '-').toLowerCase();
    const downloadFileName = `${projectName}.zip`;

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${downloadFileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('ZIP download error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download ZIP file' },
      { status: 500 }
    );
  }
}
