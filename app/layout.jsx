import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Outfit, Inter, JetBrains_Mono } from "next/font/google";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "AgeSmart Verifier Pro",
  description: "Enterprise tracking & verification dashboard — login, user & admin panels",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      translate="no"
      className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-screen font-sans antialiased bg-[#0a0a0f] text-slate-100" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
