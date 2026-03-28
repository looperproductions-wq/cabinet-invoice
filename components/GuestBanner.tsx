import Link from "next/link";

/** Shown at top of list/browse pages for signed-out visitors. */
export function GuestBanner({ callbackPath }: { callbackPath: string }) {
  const cb = encodeURIComponent(callbackPath);
  return (
    <div className="mb-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
      <span className="font-medium">Browsing without an account.</span> You can
      explore the app, but nothing is saved until you{" "}
      <Link href={`/signup?callbackUrl=${cb}`} className="font-semibold underline">
        create an account
      </Link>{" "}
      or{" "}
      <Link href={`/login?callbackUrl=${cb}`} className="font-semibold underline">
        sign in
      </Link>
      .
    </div>
  );
}
