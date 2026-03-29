import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { APP_NAME, APP_TAGLINE } from "@/lib/branding";
import { Providers } from "@/components/Providers";
import "./globals.css";

/** Avoid DB access during `next build`; pages load data at request time. */
export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description:
    "Create estimates and invoices and manage clients.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user?.id
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }
    : null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-100 font-sans text-stone-900">
        <Providers>
          <AppShell user={user}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
