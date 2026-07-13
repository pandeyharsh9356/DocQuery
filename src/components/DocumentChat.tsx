'use client';

import { FormEvent, useMemo, useState, useEffect } from 'react';

export type DocumentChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

interface DocumentChatProps {
  documentId: string;
  fileName: string;
  onClose: () => void;
}

export default function DocumentChat({ documentId, fileName, onClose }: DocumentChatProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<DocumentChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDocumentName = useMemo(() => fileName, [fileName]);

  // Load chat history from localStorage on document selection or mount
  useEffect(() => {
    const saved = localStorage.getItem(`chat_history_${documentId}`);
    let initialMessages: DocumentChatMessage[] = [];
    if (saved) {
      try {
        initialMessages = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse chat history:', e);
      }
    }
    if (initialMessages.length === 0) {
      initialMessages = [
        {
          id: 'intro',
          role: 'system',
          content: `Ask a question about "${fileName}" and get an answer based on the PDF content.`,
        },
      ];
    }
    // Update asynchronously to prevent triggering synchronous setState inside effect warning
    const timer = setTimeout(() => {
      setMessages(initialMessages);
    }, 0);
    return () => clearTimeout(timer);
  }, [documentId, fileName]);

  // Synchronous wrapper to update React state and save to localStorage
  const updateMessages = (
    updater: DocumentChatMessage[] | ((current: DocumentChatMessage[]) => DocumentChatMessage[])
  ) => {
    setMessages((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      localStorage.setItem(`chat_history_${documentId}`, JSON.stringify(next));
      return next;
    });
  };

  const handleClearHistory = () => {
    if (!confirm('Are you sure you want to clear the chat history for this document?')) return;
    const resetState: DocumentChatMessage[] = [
      {
        id: 'intro',
        role: 'system',
        content: `Ask a question about "${fileName}" and get an answer based on the PDF content.`,
      },
    ];
    updateMessages(resetState);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setError(null);
    const userMessage: DocumentChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedQuestion,
    };

    const pendingMessage: DocumentChatMessage = {
      id: `assistant-pending-${Date.now()}`,
      role: 'assistant',
      content: 'Thinking…',
    };

    updateMessages((current) => [...current, userMessage, pendingMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/document-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, question: trimmedQuestion }),
      });

      const contentType = response.headers.get('content-type') ?? '';
      let data: { answer?: string; error?: string } = {};

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response from document chat API:', text);
        throw new Error('The server returned an invalid response.');
      }

      if (!response.ok) {
        throw new Error(data?.error ?? 'Unable to get an answer from the document chat API.');
      }

      updateMessages((current) =>
        current.map((message) =>
          message.id === pendingMessage.id
            ? { ...message, content: data.answer ?? 'No answer was returned.' }
            : message
        )
      );
    } catch (err) {
      updateMessages((current) => current.filter((message) => message.id !== pendingMessage.id));
      setError(err instanceof Error ? err.message : 'Unknown error occurred while asking the document.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/60">
      {/* Chat Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Chatting: &quot;{selectedDocumentName}&quot;</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Ask questions grounded in the PDF document context.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClearHistory}
            className="inline-flex items-center justify-center rounded-full border border-rose-250 bg-white px-4 py-2 text-xs font-semibold text-rose-650 shadow-sm transition-all hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/40 dark:bg-zinc-900 dark:text-rose-450 dark:hover:bg-rose-950/20"
          >
            Clear History
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-450 dark:hover:bg-zinc-850 dark:hover:text-zinc-200"
          >
            Close Chat
          </button>
        </div>
      </div>

      {/* Message Area */}
      <div className="mb-6 h-[26rem] space-y-4 overflow-y-auto rounded-2xl border border-zinc-200/60 bg-zinc-50/30 p-4 dark:border-zinc-800/60 dark:bg-zinc-950/20">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === 'user'
                ? 'flex justify-end animate-fade-in'
                : message.role === 'assistant'
                ? 'flex justify-start animate-fade-in'
                : 'flex justify-center'
            }
          >
            {message.role === 'system' ? (
              <div className="w-full max-w-md border border-zinc-200/50 bg-zinc-50/80 p-4 text-center text-xs leading-relaxed text-zinc-500 shadow-sm rounded-2xl dark:border-zinc-800/40 dark:bg-zinc-900/30 dark:text-zinc-400">
                💡 {message.content}
              </div>
            ) : (
              <div
                className={
                  message.role === 'user'
                    ? 'rounded-2xl rounded-tr-none bg-zinc-950 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm dark:bg-zinc-50 dark:text-black'
                    : 'rounded-2xl rounded-tl-none border border-zinc-200 bg-white px-4 py-2.5 text-sm leading-relaxed text-zinc-850 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200'
                }
              >
                {message.content === 'Thinking…' ? (
                  <div className="flex items-center gap-1.5 py-1 px-1.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce-dot" />
                    <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce-dot" />
                    <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce-dot" />
                  </div>
                ) : (
                  message.content
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {error ? (
        <div className="mb-4 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-xs font-medium text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/20 dark:text-rose-450">{error}</div>
      ) : null}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="document-question" className="sr-only">
          Ask a question about the PDF
        </label>
        <textarea
          id="document-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          placeholder="Ask a question about this PDF..."
          className="min-h-[90px] w-full rounded-2xl border border-zinc-200/80 bg-zinc-50/20 px-4 py-3 text-sm text-zinc-900 shadow-sm transition-all focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-100 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            AI responses are strictly grounded in PDF content.
          </span>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-650"
          >
            {isLoading ? 'Asking...' : 'Ask Document'}
          </button>
        </div>
      </form>
    </div>
  );
}
