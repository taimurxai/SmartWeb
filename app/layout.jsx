import "./globals.css";
import { StoreProvider } from "@/lib/store";

export const metadata = {
  title: "Tracking Dashboard",
  description: "Dark theme tracking dashboard — login, user & admin panels",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className="min-h-screen font-sans antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
