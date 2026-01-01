import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import Category from '@/models/Category';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const post = await BlogPost.findById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment views
    await BlogPost.findByIdAndUpdate(id, { $inc: { views: 1 } });

    const formattedPost = {
      ...post.toObject(),
      _id: post._id.toString(),
      id: post._id.toString(),
      date: post.date.toISOString().split('T')[0],
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const body = await request.json();
    const { title, excerpt, richDescription, author, date, category, categorySlug, slug, featured, tags, status } = body;

    const existingPost = await BlogPost.findById(id);
    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Calculate readTime only if richDescription is provided
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (richDescription !== undefined) {
      updateData.richDescription = richDescription;
      const stripHtml = (html: string) => {
        return html.replace(/<[^>]*>/g, '');
      };
      const textContent = stripHtml(richDescription);
      updateData.readTime = Math.ceil(textContent.split(' ').length / 200);
    }
    if (author !== undefined) updateData.author = author;
    if (date !== undefined) updateData.date = new Date(date);
    if (category !== undefined) updateData.category = category;
    if (categorySlug !== undefined) updateData.categorySlug = categorySlug;
    if (slug !== undefined) updateData.slug = slug;
    if (featured !== undefined) updateData.featured = featured;
    if (tags !== undefined) updateData.tags = tags;
    if (status !== undefined) updateData.status = status;

    const updatedPost = await BlogPost.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const deletedPost = await BlogPost.findByIdAndDelete(id);

    if (!deletedPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Update category count
    await Category.findOneAndUpdate(
      { slug: deletedPost.categorySlug },
      { $inc: { count: -1 } }
    );

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}