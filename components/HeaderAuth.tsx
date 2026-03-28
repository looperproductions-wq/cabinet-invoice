"use client";

import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/UserMenu";
import Link from "next/link";

export function HeaderAuth({
  user,
}: {
  user: { id: string; name?: string | null; email?: string | null } | null;
}) {
  const pathname = usePathname();
  const onAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (user) {
    return <UserMenu email={user.email} name={user.name} />;
  }
  if (onAuthPage) {
    return null;
  }
  return (
    <div className="flex gap-2 text-sm">
      <Link
        href="/login"
        className="rounded-lg px-3 py-2 font-medium text-stone-700 hover:bg-stone-100"
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        className="rounded-lg bg-stone-900 px-3 py-2 font-medium text-white hover:bg-stone-800"
      >
        Sign up
      </Link>
    </div>
  );
}
