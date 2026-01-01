import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectPayment from '@/models/ProjectPayment';
import Project from '@/models/Project';
import AccountPayment from '@/models/AccountPayment';
import mongoose from 'mongoose';

// Helper function to check if a string is a valid ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    await dbConnect();

    // Find all project payments for this email
    const projectPayments = await ProjectPayment.find({
      email: email.trim(),
      status: 'completed'
    }).select('projectId');

    // Get unique project IDs and filter out invalid ObjectIds
    const projectIds = [...new Set(projectPayments.map(payment => payment.projectId))].filter(id => isValidObjectId(id));

    // Check if user has all-access subscription
    const hasAllAccess = await AccountPayment.findOne({
      email: email.trim(),
      planType: 'allAccess',
      isActive: true,
      endDate: { $gt: new Date() }
    });

    let projects: any[] = [];

    if (projectIds.length > 0) {
      // Convert valid string IDs to ObjectIds for the query
      const validObjectIds = projectIds.map(id => new mongoose.Types.ObjectId(id));

      // Get project details for purchased projects
      const purchasedProjects = await Project.find({
        _id: { $in: validObjectIds }
      }).select('_id title slug description price isPaid zipUrl');

      projects = purchasedProjects.map(project => ({
        _id: project._id.toString(),
        title: project.title,
        slug: project.slug,
        description: project.description,
        price: project.price,
        isPaid: project.isPaid,
        zipUrl: project.zipUrl
      }));
    }

    // If user has all-access, get all projects
    if (hasAllAccess) {
      const allProjects = await Project.find({}).select('_id title slug description price isPaid zipUrl');

      // Merge with purchased projects, avoiding duplicates
      const allProjectIds = new Set(projects.map(p => p._id));
      const additionalProjects = allProjects
        .filter(project => !allProjectIds.has(project._id.toString()))
        .map(project => ({
          _id: project._id.toString(),
          title: project.title,
          slug: project.slug,
          description: project.description,
          price: project.price,
          isPaid: project.isPaid,
          zipUrl: project.zipUrl
        }));

      projects = [...projects, ...additionalProjects];
    }

    return NextResponse.json({
      success: true,
      email: email.trim(),
      projects,
      hasAllAccess: !!hasAllAccess,
      projectCount: projects.length
    });

  } catch (error) {
    console.error('Error fetching projects by email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}