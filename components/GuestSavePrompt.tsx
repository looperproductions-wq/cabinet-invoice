"use client";

import Link from "next/link";

/** After a failed save when the user is not signed in. */
export function GuestSavePrompt({ callbackPath }: { callbackPath: string }) {
  const cb = encodeURIComponent(callbackPath);
  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm"
      role="alert"
    >
      <p className="font-semibold text-amber-950">Save requires an account</p>
      <p className="mt-2 text-sm text-amber-900/90">
        Create a free account or sign in to store this in your workspace. You can
        keep editing the form above.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/signup?callbackUrl=${cb}`}
          className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          Create account
        </Link>
        <Link
          href={`/login?callbackUrl=${cb}`}
          className="inline-flex items-center justify-center rounded-lg border border-stone-400 bg-white px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-50"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
