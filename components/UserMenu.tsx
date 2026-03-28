"use client";

import { signOut } from "next-auth/react";

export function UserMenu({
  email,
  name,
}: {
  email?: string | null;
  name?: string | null;
}) {
  const label = name?.trim() || email || "Account";

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-stone-200 pt-4 sm:border-t-0 sm:pt-0">
      <span
        className="max-w-[200px] truncate text-sm text-stone-600"
        title={email ?? ""}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
      >
        Sign out
      </button>
    </div>
  );
}
