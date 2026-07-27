import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Outfit, Inter } from "next/font/google";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Trackr",
  description: "Dark theme tracking dashboard — login, user & admin panels",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className={`${outfit.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans antialiased bg-navy-950 text-slate-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
