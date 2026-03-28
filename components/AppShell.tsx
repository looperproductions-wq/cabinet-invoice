import Link from "next/link";
import { MainNav } from "@/components/MainNav";
import { HeaderAuth } from "@/components/HeaderAuth";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { id: string; name?: string | null; email?: string | null } | null;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-stone-900"
            >
              CabinetPaint
            </Link>
            <p className="text-sm text-stone-500">
              Clients, estimates & invoices for your painting business
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <MainNav />
            <HeaderAuth user={user} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
