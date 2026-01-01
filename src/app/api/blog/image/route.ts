import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import { requireAdmin } from '@/lib/requireAuth';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
      const id = formData.get('id') as string | null;

      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { success: false, error: 'Invalid file provided' },
          { status: 400 }
        );
      }

      if (!id || typeof id !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Invalid blog post id provided' },
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
      const cloudinaryUrl = await uploadToCloudinary(buffer, 'spyberpolymath/image/blog', `blog_${id}_${Date.now()}`);

      // Get existing blog post to delete old image if exists
      const existingPost = await BlogPost.findById(id);

      // Delete old image from Cloudinary if exists
      if (existingPost?.image) {
        const oldPublicId = extractPublicId(existingPost.image);
        if (oldPublicId) {
          try {
            await deleteFromCloudinary(oldPublicId);
          } catch (deleteError) {
            console.warn('Failed to delete old image from Cloudinary:', deleteError);
          }
        }
      }

      // Store Cloudinary URL in MongoDB BlogPost.image field
      const blogPost = await BlogPost.findByIdAndUpdate(
        id,
        {
          image: cloudinaryUrl,
          updated_at: new Date()
        },
        { new: true }
      );

      if (!blogPost) {
        return NextResponse.json(
          { success: false, error: 'Blog post not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          image: cloudinaryUrl,
          contentType: file.type,
          size: file.size,
          id: blogPost._id
        }
      }, { status: 200 });

    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { success: false, error: 'Validation failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error uploading blog image:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}