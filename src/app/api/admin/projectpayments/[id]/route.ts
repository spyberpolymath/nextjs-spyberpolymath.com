import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/mongodb';
import ProjectPayment from '../../../../../models/ProjectPayment';
import { requireAuth } from '../../../../../lib/requireAuth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    // Verify admin authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Update project payment
    const updatedPayment = await ProjectPayment.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedPayment) {
      return NextResponse.json(
        { error: 'Project payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Error updating project payment:', error);
    return NextResponse.json(
      { error: 'Failed to update project payment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    // Verify admin authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    // Delete project payment
    const deletedPayment = await ProjectPayment.findByIdAndDelete(id);

    if (!deletedPayment) {
      return NextResponse.json(
        { error: 'Project payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Project payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting project payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete project payment' },
      { status: 500 }
    );
  }
}
