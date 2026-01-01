import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { requireAdmin } from '@/lib/requireAuth';
import { uploadToCloudinary, extractPublicId, deleteFromCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  // Images are now stored directly in projects, not in GridFS. Always return 404.
  return new NextResponse('Not found', { status: 404 });
}

export async function POST(req: NextRequest) {
  try {
    // admin only
    const adminCheck = await requireAdmin(req);
    if (adminCheck instanceof NextResponse) {
      return adminCheck; // Return the error response from requireAdmin
    }

    // At this point, adminCheck is the verified admin payload
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    try {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const slug = formData.get('slug') as string | null;

      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { success: false, error: 'Invalid file provided' },
          { status: 400 }
        );
      }

      if (!slug || typeof slug !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Invalid slug provided' },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!file || !allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
          { status: 400 }
        );
      }

      // Validate file size (e.g., 5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!file || file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: 'File size too large. Maximum size is 5MB.' },
          { status: 400 }
        );
      }

      // Read file as buffer and upload to Cloudinary
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(buffer, 'spyberpolymath/image/projects', `${slug}_${Date.now()}`);

      // Get existing project to delete old image if exists
      const existingProject = await Project.findOne({ slug });

      // Delete old image from Cloudinary if exists
      if (existingProject?.image) {
        const oldPublicId = extractPublicId(existingProject.image);
        if (oldPublicId) {
          try {
            await deleteFromCloudinary(oldPublicId);
          } catch (deleteError) {
            console.warn('Failed to delete old image from Cloudinary:', deleteError);
          }
        }
      }

      // Store Cloudinary URL in MongoDB Project.image field
      const project = await Project.findOneAndUpdate(
        { slug: slug },
        {
          image: cloudinaryUrl,
          updated_at: new Date()
        },
        { new: true }
      );

      if (!project) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          image: cloudinaryUrl,
          contentType: file.type,
          size: file.size,
          slug: project.slug
        }
      }, { status: 200 });

    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add other HTTP methods as named exports if needed
export async function PUT() {
  return new NextResponse('Method Not Allowed', { status: 405 });
}

export async function DELETE() {
  return new NextResponse('Method Not Allowed', { status: 405 });
}

export async function PATCH() {
  return new NextResponse('Method Not Allowed', { status: 405 });
}
