"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Ideally log to an enterprise logging service here
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="grid min-h-[70vh] place-items-center p-4">
      <div className="w-full max-w-md rounded-pill border border-rose-500/20 bg-navy-900/60 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-pill bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
          <AlertTriangle className="h-7 w-7 text-error" />
        </div>
        <h2 className="mb-3 text-xl font-bold text-text-primary font-display">Something went wrong</h2>
        <p className="mb-8 text-sm text-text-muted">
          An unexpected error occurred in the application. Our team has been notified.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 rounded-md border border-border-subtle bg-navy-800 px-4 py-3 text-sm font-bold text-text-secondary transition-colors hover:bg-navy-700 hover:text-text-primary"
          >
            Refresh Page
          </button>
          <button
            onClick={() => reset()}
            className="flex-1 rounded-md bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-bold text-text-primary shadow-sm transition-all hover:from-violet-500 hover:to-blue-500 hover:shadow-glow-lg active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
