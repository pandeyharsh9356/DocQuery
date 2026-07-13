'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadForm() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onClientUploadComplete = async (res: Response) => {
    // Refresh the router to update the documents list on the server side
    router.refresh();
    
    // Clear the input field
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Success notification
    alert('PDF uploaded and processed successfully!');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/uploadthing', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload document.');
      }

      await onClientUploadComplete(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        name="file"
        accept="application/pdf"
        required
        disabled={isUploading}
        className="w-full max-w-md rounded-full border border-zinc-200 bg-zinc-50/50 px-4 py-2 text-sm text-zinc-600 shadow-sm transition-all file:mr-4 file:rounded-full file:border-0 file:bg-zinc-950 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white file:transition-all hover:file:bg-zinc-800 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400 dark:file:bg-zinc-50 dark:file:text-black dark:hover:file:bg-zinc-200"
      />
      <button
        type="submit"
        disabled={isUploading}
        className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
      >
        {isUploading ? 'Uploading...' : 'Upload PDF'}
      </button>
      {error && <p className="w-full text-xs font-medium text-rose-500 mt-1">{error}</p>}
    </form>
  );
}
