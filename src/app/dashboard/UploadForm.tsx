'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { useRouter } from 'next/navigation';

export default function UploadForm() {
  const router = useRouter(); // Page refresh ke bajaye router.refresh() use karo
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing('pdf', {
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onClientUploadComplete: () => {
      setFileName(null);
      setUploadProgress(0);
      router.refresh(); // Soft refresh, state manage karna asaan hoga
    },
    onUploadError: (error) => {
      setFileName(null);
      setUploadProgress(0);
      alert(`Upload failed: ${error.message}`);
    },
  });

  // Helper function to process files
  const processFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF documents are allowed.');
      return;
    }

    setFileName(file.name);
    setUploadProgress(0);

    // Start file upload
    await startUpload([file]);
  };

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
    processFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;
    if (e.target.files) processFiles(Array.from(e.target.files));
  };

  const handleClick = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf"
        className="hidden"
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group relative flex flex-col items-center justify-center w-full min-h-[180px] p-6 text-center border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-zinc-900 bg-zinc-50/20'
            : 'border-zinc-200 hover:border-zinc-400'
        } ${isUploading ? 'cursor-not-allowed opacity-90' : ''}`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <Loader2 className="h-8 w-8 text-zinc-900 animate-spin" />
            <div className="w-full bg-zinc-100 rounded-full h-2">
              <div
                className="bg-zinc-900 h-full rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs font-semibold">{uploadProgress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <FileUp className="h-8 w-8 text-zinc-500" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Drag & drop your PDF here</p>
              <p className="text-xs text-zinc-500">or click to browse files</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
