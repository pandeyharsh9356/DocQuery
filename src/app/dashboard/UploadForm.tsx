'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';

export default function UploadForm() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading, routeConfig } = useUploadThing('pdf', {
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onClientUploadComplete: () => {
      // Clear local states
      setFileName(null);
      setUploadProgress(0);
      window.location.reload();
    },
    onUploadError: (error) => {
      // Clear local states and notify dashboard of failure
      setFileName(null);
      setUploadProgress(0);
      window.dispatchEvent(new CustomEvent('document-upload-error'));
      alert(`Upload failed: ${error.message}`);
    },
  });

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;

    const files = e.target.files ? Array.from(e.target.files) : [];
    processFiles(files);
  };

  const handleClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const processFiles = (files: File[]) => {
    const file = files[0];
    if (!file) return;

    // Check client-side validation for PDF format
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF documents are allowed.');
      return;
    }

    setFileName(file.name);
    setUploadProgress(0);

    // Dispatch custom window event to trigger optimistic loading skeleton in Documents list
    window.dispatchEvent(
      new CustomEvent('document-upload-start', {
        detail: { fileName: file.name },
      })
    );

    // Start file upload
    startUpload([file]);
  };

  // Dynamically query max size limit from UploadThing routeConfig
  const maxFileSizeLimit = (routeConfig?.pdf as any)?.maxFileSize ?? '32MB';

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="application/pdf"
        className="hidden"
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative flex flex-col items-center justify-center w-full min-h-[180px] p-6 text-center border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-zinc-900 bg-zinc-50/20 dark:border-zinc-100 dark:bg-zinc-900/20'
            : 'border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-650 hover:bg-zinc-50/10 dark:hover:bg-zinc-900/10'
        } ${isUploading ? 'cursor-not-allowed opacity-90' : ''}`}
      >
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              <Loader2 className="h-8 w-8 text-zinc-900 animate-spin dark:text-zinc-100" />
              <div className="space-y-1 w-full">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Uploading <span className="font-semibold text-zinc-800 dark:text-zinc-200">{fileName}</span>
                </p>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden shadow-inner border border-zinc-200/10">
                  <div
                    className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-wider uppercase text-right">
                  {uploadProgress}%
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50/50 border border-zinc-100 text-zinc-650 shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-400">
                <FileUp className="h-6 w-6 text-zinc-500 group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200 transition-colors" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Drag & drop your PDF here
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  or click to browse local files
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-zinc-100/60 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-850/60 dark:text-zinc-450 border border-zinc-250/20 dark:border-zinc-800/25">
                PDF up to {maxFileSizeLimit}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
