import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-pill bg-surface-secondary/50 border border-border-subtle shadow-xl">
          <FileQuestion className="h-8 w-8 text-text-muted" />
        </div>
        <h2 className="mb-2 text-3xl font-bold text-text-primary font-display tracking-tight">
          Page Not Found
        </h2>
        <p className="mb-8 text-sm font-medium text-text-muted">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link 
          href="/"
          className="inline-flex rounded-md bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-3.5 text-sm font-bold tracking-wide text-text-primary shadow-sm transition-all hover:from-violet-500 hover:to-blue-500 hover:shadow-glow-lg active:scale-95"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
