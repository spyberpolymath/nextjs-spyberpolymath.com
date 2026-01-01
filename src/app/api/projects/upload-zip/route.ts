import { NextResponse, NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { requireAdmin } from '@/lib/requireAuth';

async function ensureUploadsDir() {
  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'project-zips');
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (!file.type.includes('zip') && !file.name.endsWith('.zip')) {
      return NextResponse.json({ error: 'Only ZIP files are allowed' }, { status: 400 });
    }

    const MAX_ZIP_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_ZIP_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size: 100MB' }, { status: 400 });
    }

    await dbConnect();

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const timestamp = Date.now();
    const fileName = `${projectId}-${timestamp}-${file.name.replace(/\s+/g, '-')}`;
    const uploadsDir = await ensureUploadsDir();
    const filePath = join(uploadsDir, fileName);
    const publicUrl = `/uploads/project-zips/${fileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { zipUrl: publicUrl, updated_at: new Date() },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      zipUrl: publicUrl,
      fileName: file.name,
      project: updatedProject
    });
  } catch (error: any) {
    console.error('ZIP upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload ZIP file' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    const url = new URL(req.url, 'http://localhost');
    const projectId = url.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await dbConnect();

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $unset: { zipUrl: 1 }, updated_at: new Date() },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'ZIP file removed from project',
      project: updatedProject
    });
  } catch (error: any) {
    console.error('ZIP delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove ZIP file' },
      { status: 500 }
    );
  }
}
