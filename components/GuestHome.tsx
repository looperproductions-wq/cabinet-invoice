import Link from "next/link";
import { APP_NAME } from "@/lib/branding";

export function GuestHome() {
  return (
    <div className="space-y-10">
      <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Welcome to {APP_NAME}
        </h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          Look around the dashboard, clients, estimates, and invoices anytime
          without signing in. When you&apos;re ready to keep clients and
          documents in the cloud, create a free account or sign in—saving only
          works for logged-in users.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/signup?callbackUrl=%2F"
            className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            Create account
          </Link>
          <Link
            href="/login?callbackUrl=%2F"
            className="inline-flex items-center justify-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Clients",
            href: "/clients",
            text: "See how customer records are organized.",
          },
          {
            title: "Estimates",
            href: "/estimates",
            text: "Preview quotes before you send work.",
          },
          {
            title: "Invoices",
            href: "/invoices",
            text: "Review invoice layout and statuses.",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
          >
            <p className="font-semibold text-stone-900">{item.title}</p>
            <p className="mt-2 text-sm text-stone-600">{item.text}</p>
            <span className="mt-3 inline-block text-sm font-medium text-stone-800 underline">
              Explore
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
