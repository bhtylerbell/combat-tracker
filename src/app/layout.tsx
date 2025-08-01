import "./globals.css";
import type { ReactNode } from "react";
import { APP_VERSION } from "@/utils/version";
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: "Combat Tracker",
  description: "D&D and TTRPG combat manager",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gradient-to-br from-zinc-900 via-gray-900 to-gray-800 text-gray-100">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
