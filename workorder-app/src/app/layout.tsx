import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { SessionProvider } from "@/components/SessionProvider";
import { SignInOut } from "@/components/SignInOut";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workorder App",
  description: "Field service work orders and scheduling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <nav className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-10">
            <div className="max-w-5xl mx-auto flex items-center gap-4 p-3 text-sm">
              <Link href="/dashboard" className="font-semibold">Munkalap rendszer</Link>
              <div className="flex gap-3">
                <Link href="/workorders">Munkalapok</Link>
                <Link href="/calendar">Naptár</Link>
                <Link href="/admin">Admin</Link>
              </div>
              <div className="ml-auto"><SignInOut /></div>
            </div>
          </nav>
          <main className="max-w-5xl mx-auto p-4 sm:p-6">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
