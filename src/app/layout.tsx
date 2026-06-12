import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { logout } from "@/lib/auth";
import { AUTH_ENABLED, isOwner } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Blog",
  description: "Next.js + Supabase로 만든 개인 블로그",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const owner = await isOwner();

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="border-b border-black/10 dark:border-white/10">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold">
              My Blog
            </Link>
            <nav className="flex items-center gap-2">
              {/* 로그인 기능 OFF: 글쓰기만 노출 */}
              {!AUTH_ENABLED ? (
                <Link
                  href="/posts/new"
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  글쓰기
                </Link>
              ) : owner ? (
                <>
                  <Link
                    href="/posts/new"
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    글쓰기
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="rounded-md px-3 py-1.5 text-sm font-medium text-black/60 transition hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
                    >
                      로그아웃
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
                >
                  로그인
                </Link>
              )}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-black/10 py-6 text-center text-sm text-black/50 dark:border-white/10 dark:text-white/50">
          © {new Date().getFullYear()} My Blog
        </footer>
      </body>
    </html>
  );
}
