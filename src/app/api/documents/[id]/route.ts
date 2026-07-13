import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Retrieve document metadata to check owner and get fileKey
    const document = await prisma.document.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    // Verify ownership
    if (document.user.clerkUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete file from local filesystem
    const filePath = path.join(process.cwd(), 'public', 'uploads', document.fileKey);
    try {
      await fs.unlink(filePath);
    } catch (fsError: unknown) {
      const errMsg = fsError instanceof Error ? fsError.message : 'Unknown error';
      console.warn(`File could not be deleted from disk at ${filePath}:`, errMsg);
      // Proceed to DB deletion even if file was missing on disk
    }

    // Delete record from database (Prisma schema Cascade will delete related messages)
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Document deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
