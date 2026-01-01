import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/requireAuth';
import { apiSecurityMiddleware, applySecurityToResponse } from '@/lib/middleware';
import { logAdminAction } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'published';

    let query: any = { status };

    if (category && category !== '') {
      query.categorySlug = category;
    }

    if (search && search !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { richDescription: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await BlogPost.find(query).sort({ featured: -1, date: -1 });

    const formattedPosts = posts.map(post => ({
      ...post.toObject(),
      _id: post._id.toString(),
      id: post._id.toString(),
      date: post.date.toISOString().split('T')[0],
    }));

    const response = NextResponse.json(formattedPosts);
    return applySecurityToResponse(response);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Apply security middleware
  const securityCheck = await apiSecurityMiddleware(request, { requireCsrf: true });
  if (securityCheck) return securityCheck;

  // Admin authentication required
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();

    const body = await request.json();
    const { title, excerpt, richDescription, author, date, category, categorySlug, slug, featured, tags, status } = body;

    // Validate required fields
    if (!title || !excerpt || !richDescription || !author || !category || !categorySlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate readTime
    const stripHtml = (html: string) => {
      return html.replace(/<[^>]*>/g, '');
    };
    const textContent = stripHtml(richDescription);
    const readTime = Math.ceil(textContent.split(' ').length / 200);

    // Generate slug if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const newPost = new BlogPost({
      title,
      excerpt,
      richDescription,
      author,
      date: new Date(date),
      category,
      categorySlug,
      image: '', // Will be set via image upload endpoint
      slug: finalSlug,
      featured: featured || false,
      tags: tags || [],
      status: status || 'draft',
      views: 0,
      readTime,
    });

    await newPost.save();

    // Update category count
    await Category.findOneAndUpdate(
      { slug: categorySlug },
      { $inc: { count: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Log admin action
    logAdminAction('create_blog_post', (adminCheck as any).id || 'unknown', newPost._id.toString(), {
      postTitle: title,
      postSlug: finalSlug,
    }, request);

    const response = NextResponse.json({
      ...newPost.toObject(),
      _id: newPost._id.toString(),
      id: newPost._id.toString(),
    }, { status: 201 });

    return applySecurityToResponse(response);
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}