'use client';

import Link from 'next/link';
import { useState } from 'react';

import DocumentChat from '@/components/DocumentChat';

type DocumentSummary = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileKey: string;
  status: string;
  createdAt: string | Date;
};

interface DocumentDashboardProps {
  documents: DocumentSummary[];
  submitChatAction?: (formData: FormData) => Promise<{ reply?: string; error?: string }>;
}

export default function DocumentDashboard({ documents }: DocumentDashboardProps) {
  const [selectedDocument, setSelectedDocument] = useState<DocumentSummary | null>(null);
  const [prevDocuments, setPrevDocuments] = useState<DocumentSummary[]>(documents);
  const [docList, setDocList] = useState<DocumentSummary[]>(documents);

  if (documents !== prevDocuments) {
    setPrevDocuments(documents);
    setDocList(documents);
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PDF file? This action is permanent.')) return;

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete the document.');
      }

      // Remove from state
      setDocList((prev) => prev.filter((doc) => doc.id !== id));
      
      // If the deleted document was being chatted with, close the chat
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
      
      // Clean up localStorage chat history for this deleted document
      localStorage.removeItem(`chat_history_${id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred while deleting.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Documents Section */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">Documents List</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Manage and chat with your uploaded PDF files</p>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {docList.length} Total
          </span>
        </div>

        {docList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
            <span className="text-3xl mb-3 text-zinc-400">📁</span>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No documents yet</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Upload a PDF file using the workspace form above to start.</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200/80 dark:divide-zinc-800/60 dark:border-zinc-800/85">
            {docList.map((document) => {
              const isSelected = selectedDocument?.id === document.id;
              return (
                <li 
                  key={document.id} 
                  className={`flex flex-col gap-4 p-4 transition-all duration-205 sm:flex-row sm:items-center sm:justify-between hover:bg-zinc-50/40 dark:hover:bg-zinc-900/30 ${
                    isSelected ? 'bg-zinc-50/60 dark:bg-zinc-900/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-lg dark:bg-zinc-850">
                      📄
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{document.fileName}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>Uploaded {new Date(document.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          document.status === 'UPLOADED' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                        }`}>
                          {document.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDocument(document)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition-all duration-200 ${
                        isSelected 
                          ? 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-250 dark:hover:bg-zinc-700' 
                          : 'bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200'
                      }`}
                    >
                      {isSelected ? 'Active Chat' : 'Chat'}
                    </button>
                    <Link 
                      href={document.fileUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-850 dark:hover:text-zinc-200"
                    >
                      View PDF
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(document.id)}
                      className="rounded-full border border-rose-200 bg-rose-50/50 px-4 py-2 text-xs font-semibold text-rose-600 shadow-sm transition-all hover:bg-rose-100 hover:text-rose-700 dark:border-rose-900/30 dark:bg-rose-955/10 dark:text-rose-450 dark:hover:bg-rose-950/30"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Chat Section */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
        {selectedDocument ? (
          <DocumentChat
            documentId={selectedDocument.id}
            fileName={selectedDocument.fileName}
            onClose={() => setSelectedDocument(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
            <span className="text-3xl mb-3 text-zinc-300">💬</span>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Interactive Chat Console</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs">Select a document from your workspace list to open the AI-powered grounded chat.</p>
          </div>
        )}
      </section>
    </div>
  );
}
