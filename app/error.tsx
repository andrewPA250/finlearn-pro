"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-6xl font-extrabold text-negative">!</p>
      <h1 className="mt-4 text-2xl font-bold text-text-primary">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
        An unexpected error occurred. Try refreshing the page or go back to the home page.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[10px] text-text-disabled">
          ref: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-card bg-cyan px-5 py-2.5 text-sm font-semibold text-bg-primary transition hover:bg-cyan-dark"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-card border border-bg-border bg-bg-card px-5 py-2.5 text-sm font-medium text-text-secondary transition hover:border-cyan/30 hover:text-text-primary"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
