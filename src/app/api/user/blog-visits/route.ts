import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BlogVisit from '@/models/BlogVisit';
import BlogPost from '@/models/BlogPost';
import { requireAuth } from '@/lib/requireAuth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get user's blog visits, sorted by most recent
    const visits = await BlogVisit.find({ userId: authResult.id })
      .sort({ visitedAt: -1 })
      .limit(50); // Limit to prevent too many results

    if (visits.length === 0) {
      return NextResponse.json({ blogs: [] });
    }

    // Get unique blog IDs
    const blogIds = [...new Set(visits.map(v => v.blogId))];

    // Fetch blog details
    const blogs = await BlogPost.find({
      _id: { $in: blogIds },
      status: 'published'
    }).select('title excerpt author date category categorySlug slug featured');

    // Create a map of blogId to visit date
    const visitMap = new Map();
    visits.forEach(visit => {
      if (!visitMap.has(visit.blogId)) {
        visitMap.set(visit.blogId, visit.visitedAt);
      }
    });

    // Format blogs with visit date
    const formattedBlogs = blogs.map(blog => ({
      id: blog._id.toString(),
      title: blog.title,
      excerpt: blog.excerpt,
      author: blog.author,
      date: blog.date,
      category: blog.category,
      categorySlug: blog.categorySlug,
      slug: blog.slug,
      featured: blog.featured,
      visitedAt: visitMap.get(blog._id.toString())
    }));

    return NextResponse.json({ blogs: formattedBlogs });
  } catch (error) {
    console.error('Error fetching user blog visits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}