import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/requireAuth';
import bcrypt from 'bcryptjs';

function sanitizeUser(user: any) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  obj.id = obj._id?.toString() || obj.id;
  return obj;
}

// PUT /api/admin/users/[id] - Update user
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

    // Prepare update data
    const updateData = { ...body };

    // Handle password update
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    // Find and update user
    let user;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }
    if (!user) {
      user = await User.findOneAndUpdate({ id }, updateData, { new: true, runValidators: true });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user: sanitizeUser(user)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
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

    // Find and delete user
    let user;
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      user = await User.findByIdAndDelete(id);
    }
    if (!user) {
      user = await User.findOneAndDelete({ id });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}