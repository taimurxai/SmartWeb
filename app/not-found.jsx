import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-slate-800/50 border border-white/10 shadow-xl">
          <FileQuestion className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="mb-2 text-3xl font-bold text-white font-display tracking-tight">
          Page Not Found
        </h2>
        <p className="mb-8 text-sm font-medium text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link 
          href="/"
          className="inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-glow transition-all hover:from-violet-500 hover:to-blue-500 hover:shadow-glow-lg active:scale-95"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
