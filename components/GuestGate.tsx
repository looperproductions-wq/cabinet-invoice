import Link from "next/link";

/**
 * Shown when a guest opens a “save” flow. callbackPath is a path like `/clients/new`.
 */
export function GuestGate({
  title,
  description,
  callbackPath,
}: {
  title: string;
  description: string;
  callbackPath: string;
}) {
  const cb = encodeURIComponent(callbackPath);
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-amber-950">{title}</h1>
      <p className="mt-2 text-sm text-amber-900/90">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
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
      <p className="mt-4 text-xs text-amber-800/80">
        You can keep browsing the rest of the app without an account.
      </p>
    </div>
  );
}
