import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "Trackr",
  description: "Dark theme tracking dashboard — login, user & admin panels",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className="min-h-screen font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
