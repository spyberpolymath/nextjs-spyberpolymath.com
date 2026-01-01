import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import { requireAdmin } from '@/lib/requireAuth';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();
    const { params } = context;
    const { id } = await params;
    const body = await req.json();

    // Find and update
    let post;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      post = await BlogPost.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    }
    if (!post) {
      post = await BlogPost.findOneAndUpdate({ slug: id }, body, { new: true, runValidators: true });
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Recalculate read time if content changed
    if (body.richDescription) {
      post.readTime = Math.ceil(body.richDescription.split(' ').length / 200);
      await post.save();
    }

    return NextResponse.json(
      {
        message: 'Blog post updated successfully',
        post
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blog/[id] - Delete blog post
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();
    const { params } = context;
    const { id } = await params;

    // Find and delete
    let post;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      post = await BlogPost.findByIdAndDelete(id);
    }
    if (!post) {
      post = await BlogPost.findOneAndDelete({ slug: id });
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Blog post deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}