"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/estimates", label: "Estimates" },
  { href: "/invoices", label: "Invoices" },
  { href: "/company", label: "Company" },
];

export function MainNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return null;
  }
  return (
    <nav className="flex flex-wrap gap-1">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
