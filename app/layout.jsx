import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Outfit } from "next/font/google";

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Trackr",
  description: "Dark theme tracking dashboard — login, user & admin panels",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className={`${outfit.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
