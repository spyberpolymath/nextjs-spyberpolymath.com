import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import ProjectPayment from '../../../../models/ProjectPayment';
import { requireAuth } from '../../../../lib/requireAuth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Verify admin authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    
    // Fetch ALL project payments without user filtering
    // In production, verify user is admin here
    const payments = await ProjectPayment.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching admin project payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project payments' },
      { status: 500 }
    );
  }
}
