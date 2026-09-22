import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-2 text-2xl font-bold text-text-primary">This page doesn&apos;t exist</h1>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        The page you&apos;re looking for was moved, renamed, or is part of a module not yet built.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-card bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
