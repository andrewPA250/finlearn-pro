import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-6xl font-extrabold text-cyan">404</p>
      <h1 className="mt-4 text-2xl font-bold text-text-primary">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-card bg-cyan px-5 py-2.5 text-sm font-semibold text-bg-primary transition hover:bg-cyan-dark"
        >
          Go home
        </Link>
        <Link
          href="/markets"
          className="rounded-card border border-bg-border bg-bg-card px-5 py-2.5 text-sm font-medium text-text-secondary transition hover:border-cyan/30 hover:text-text-primary"
        >
          Browse markets
        </Link>
      </div>
    </div>
  );
}
