import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { type NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { requireClerkAuth } from './core';
import pdf from 'pdf-parse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let userId: string;
  let clerkUser: Awaited<ReturnType<typeof requireClerkAuth>>['clerkUser'];

  try {
    const authResult = await requireClerkAuth();
    userId = authResult.userId;
    clerkUser = authResult.clerkUser;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'A PDF file is required.' }, { status: 400 });
  }

  const fileName = (formData.get('fileName') as string | null)?.trim() || file.name;
  const contentType = file.type || 'application/pdf';

  if (!contentType.includes('pdf') && !fileName.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
  }

  const uploadDirectory = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDirectory, { recursive: true });

  const extension = path.extname(fileName) || '.pdf';
  const safeFileName = `${Date.now()}-${randomUUID()}${extension}`;
  const filePath = path.join(uploadDirectory, safeFileName);
  const fileUrl = `/uploads/${safeFileName}`;
  const fileKey = safeFileName;

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, bytes);

  let textContent = '';
  try {
    const parsed = await pdf(bytes);
    textContent = parsed.text || '';
  } catch (parseError) {
    console.error('Error parsing uploaded PDF:', parseError);
  }

  let mongoUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!mongoUser) {
    mongoUser = await prisma.user.create({
      data: {
        clerkUserId: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress ?? `${userId}@local.invalid`,
        name: clerkUser?.fullName ?? null,
        imageUrl: clerkUser?.imageUrl ?? null,
      },
      select: { id: true },
    });
  }

  const document = await prisma.document.create({
    data: {
      userId: mongoUser.id,
      fileName,
      fileUrl,
      fileKey,
      status: 'UPLOADED',
      textContent,
    },
  });

  return NextResponse.json({ success: true, document }, { status: 201 });
}
