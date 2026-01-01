import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/requireAuth';
import { apiSecurityMiddleware, applySecurityToResponse } from '@/lib/middleware';
import { logAdminAction } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    console.log('Fetching categories...');
    await dbConnect();
    console.log('DB connected');

    const categories = await Category.find({}).sort({ name: 1 });
    console.log('Categories found:', categories.length);

    const formattedCategories = categories.map(cat => ({
      ...cat.toObject(),
      _id: cat._id.toString(),
      id: cat._id.toString(),
    }));
    console.log('Formatted categories:', formattedCategories);

    const response = NextResponse.json(formattedCategories);
    return applySecurityToResponse(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Apply security middleware
  const securityCheck = await apiSecurityMiddleware(request as any, { requireCsrf: true });
  if (securityCheck) return securityCheck;

  // Admin authentication required
  const adminCheck = await requireAdmin(request as any);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();

    const body = await request.json();
    const { name, slug, description } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      );
    }

    // Create new category
    const category = await Category.create({
      name,
      slug,
      description: description || '',
      count: 0,
    });

    // Log admin action
    logAdminAction('create_category', (adminCheck as any).id || 'unknown', category._id.toString(), {
      categoryName: name,
      categorySlug: slug,
    }, request as any);

    const response = NextResponse.json({
      message: 'Category created successfully',
      category: {
        ...category.toObject(),
        _id: category._id.toString(),
        id: category._id.toString(),
      }
    }, { status: 201 });

    return applySecurityToResponse(response);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}