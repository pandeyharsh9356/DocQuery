'use client';

import { UploadButton } from '@/lib/uploadthing';

export default function UploadForm() {
  return (
    <div className="flex flex-col items-start gap-2">
      <UploadButton
        endpoint="pdfUploader"
        onClientUploadComplete={() => {
          window.location.reload();
        }}
        onUploadError={(error: Error) => {
          alert(`Upload failed: ${error.message}`);
        }}
        content={{
          button({ isUploading }) {
            return isUploading ? 'Uploading PDF...' : 'Upload PDF';
          },
          allowedContent: 'PDF up to 4MB'
        }}
        appearance={{
          button: 'w-auto h-auto px-6 py-2.5 rounded-full bg-zinc-900 text-zinc-100 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-sm font-semibold shadow-md border border-zinc-800/20 dark:border-zinc-200/20 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          allowedContent: 'text-xs text-zinc-500 dark:text-zinc-400 font-medium ml-1',
          container: 'flex items-center gap-4',
        }}
      />
    </div>
  );
}
