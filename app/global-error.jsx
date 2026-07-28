"use client";

import { Outfit, Inter } from "next/font/google";
import "../app/globals.css";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function GlobalError({ error, reset }) {
  return (
    <html lang="bn" translate="no" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-screen font-sans antialiased bg-navy-950 text-slate-200 grid place-items-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-white font-display">
            Critical Error
          </h1>
          <p className="mb-8 text-sm text-slate-400">
            A critical system error has occurred. Please reload the application.
          </p>
          <button
            onClick={() => reset()}
            className="w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold tracking-wide text-white transition-all hover:bg-rose-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] active:scale-95"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
