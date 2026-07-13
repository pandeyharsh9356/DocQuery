import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-50 font-sans text-zinc-900 antialiased selection:bg-zinc-950 selection:text-white dark:bg-zinc-950 dark:text-zinc-50">
      {/* Decorative Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-zinc-200/50 opacity-50 blur-[120px] dark:bg-zinc-900/20" />
      <div className="absolute right-[-10%] bottom-[-10%] h-[600px] w-[600px] rounded-full bg-zinc-300/40 opacity-40 blur-[120px] dark:bg-zinc-800/10" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/75 px-6 py-4 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/75">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white font-mono text-lg font-bold dark:bg-zinc-50 dark:text-black">
              D
            </span>
            DocQuery
          </Link>
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-850 dark:hover:text-zinc-200">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-205">
                Sign up
              </button>
            </SignUpButton>
            <Link 
              href="/dashboard" 
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-850 dark:hover:text-zinc-200"
            >
              Dashboard
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto flex flex-1 max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="relative z-10 max-w-3xl">
          {/* Badge */}
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-500 shadow-sm transition hover:bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Clerk + Prisma + Next.js
          </div>

          <h1 className="bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-950 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-zinc-100 dark:via-zinc-350 dark:to-zinc-50 sm:text-6xl">
            Chat with your PDF documents securely.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
            Upload documents, extract their contents instantly, and chat with them using a modern, beautiful, and secure SaaS dashboard interface.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <SignUpButton mode="modal">
              <button className="rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-zinc-950/10 transition-all hover:bg-zinc-800 hover:scale-[1.03] active:scale-[0.97] dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200">
                Get Started for Free
              </button>
            </SignUpButton>
            <Link 
              href="/dashboard" 
              className="rounded-full border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850 dark:hover:text-zinc-50"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <section className="mt-28 grid w-full gap-6 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/50">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-850 dark:text-white">
              📄
            </div>
            <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Instant Extraction</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Upload any PDF document and extract text instantly using our custom parser pipelines.
            </p>
          </div>
          
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/50">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-850 dark:text-white">
              ⚡
            </div>
            <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">AI-Powered Chat</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Ask detailed questions about your document contents and receive precise answers instantly.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900/50">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-850 dark:text-white">
              🔒
            </div>
            <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">Secure & Isolated</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              All files are stored locally and isolated by users, backed by secure authentication.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

