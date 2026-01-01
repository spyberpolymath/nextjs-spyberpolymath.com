import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import { requireAdmin } from '@/lib/requireAuth';

// GET /api/admin/blog - List all blog posts
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();
    const posts = await BlogPost.find({}).sort({ date: -1 });
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/blog - Create new blog post
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();
    const body = await req.json();

    const {
      title,
      excerpt,
      richDescription,
      author,
      category,
      categorySlug,
      image,
      slug,
      featured,
      tags,
      status,
      date
    } = body;

    // Validation
    if (!title || !excerpt || !richDescription || !author || !category || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      );
    }

    // Create blog post
    const newPost = new BlogPost({
      title,
      excerpt,
      richDescription,
      author,
      date: date ? new Date(date) : new Date(),
      category,
      categorySlug: categorySlug || category.toLowerCase().replace(/\s+/g, '-'),
      image: image || '',
      slug,
      featured: featured || false,
      tags: tags || [],
      status: status || 'draft',
      views: 0,
      readTime: Math.ceil(richDescription.split(' ').length / 200)
    });

    await newPost.save();

    return NextResponse.json(
      {
        message: 'Blog post created successfully',
        post: newPost
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
