import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "AgeSmart Verifier Pro",
  description: "Enterprise tracking & verification dashboard — login, user & admin panels",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      translate="no"
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-screen font-sans antialiased bg-surface-secondary text-text-primary" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
