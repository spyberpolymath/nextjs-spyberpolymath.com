import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/requireAuth';
import bcrypt from 'bcryptjs';
import { generateUID } from '@/lib/idGenerator';

function sanitizeUser(user: any) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  obj.id = obj._id?.toString() || obj.id;
  
  // Map database fields to frontend expected fields
  obj.registrationDate = obj.joinedDate ? new Date(obj.joinedDate).toISOString().split('T')[0] : '';
  obj.lastLogin = obj.lastLogin ? new Date(obj.lastLogin).toISOString().split('T')[0] : '';
  
  return obj;
}

// GET /api/admin/users - List all users
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();
    
    // Get query parameters for pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 0; // 0 means no limit
    const skip = limit > 0 ? (page - 1) * limit : 0;

    // Get total count
    const total = await User.countDocuments();
    
    // Get paginated users
    const query = User.find({}, '-password').sort({ joinedDate: -1 });
    if (limit > 0) {
        query.skip(skip).limit(limit);
    }
    const users = await query;

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

    return NextResponse.json({
      users: users.map(user => sanitizeUser(user)),
      total,
      page,
      totalPages
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user (admin only)
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await dbConnect();
    const { name, email, password, role = 'user', phone, dateOfBirth, address, status = 'active' } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate UID
    const uid = await generateUID(role === 'admin');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      uid,
      phone: phone || '',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      address: address || {},
      status: status || 'active',
      paymentHistory: []
    });

    await newUser.save();

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: sanitizeUser(newUser)
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
