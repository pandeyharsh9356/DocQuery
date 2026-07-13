import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import DocumentDashboard from './DocumentDashboard';
import UploadForm from './UploadForm';

// Ye function update kar diya hai
async function submitChatAction(formData: FormData) {
  'use server';

  const message = formData.get('message')?.toString().trim() ?? '';
  const context = formData.get('context')?.toString() ?? ''; // Ye line add ki hai

  if (!message) {
    return { error: 'Message is required.' };
  }

  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }), // Yahan context bheja hai
  });

  const data = await response.json();
  return { reply: data.reply ?? data.error ?? 'No response' };
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const clerkUser = await currentUser();
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

  const documents = await prisma.document.findMany({
    where: { userId: mongoUser.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, fileName: true, fileUrl: true, fileKey: true, status: true, createdAt: true },
  });

  return (
    <div className="relative min-h-screen bg-zinc-50/50 font-sans text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
      {/* Decorative Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-zinc-200/30 opacity-30 blur-[100px] dark:bg-zinc-900/10" />
      <div className="absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-zinc-300/30 opacity-30 blur-[100px] dark:bg-zinc-800/5" />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/75 px-6 py-4 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/75">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white font-mono text-lg font-bold dark:bg-zinc-50 dark:text-black">
              D
            </span>
            DocQuery
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Home
            </Link>
            <UserButton />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-6 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Your Workspace</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Upload a new PDF document or select an existing one below to start chatting with its content.
            </p>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800/80" />

          {/* Form with premium input stylings */}
          <UploadForm />
        </header>

        {/* Humne submitChatAction ko yahan pass kar diya hai */}
        <DocumentDashboard documents={documents} submitChatAction={submitChatAction} />
      </main>
    </div>
  );
}
