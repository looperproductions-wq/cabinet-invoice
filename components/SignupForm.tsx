"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser } from "@/app/actions/register";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setPending(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await registerUser(fd);
      if (!res.ok) {
        if (res.fieldErrors && Object.keys(res.fieldErrors).length) {
          setFieldErrors(res.fieldErrors);
        }
        if (res.error) setError(res.error);
        if (!res.fieldErrors && !res.error) setError("Could not create account.");
        return;
      }
      // Full navigation is more reliable than router.push after a server action.
      window.location.assign("/login?registered=1");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not create account.";
      setError(message);
    } finally {
      setPending(false);
    }
  }

  const fieldClass =
    "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-400";

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md space-y-4 rounded-xl border border-stone-200 bg-white p-8 shadow-sm"
    >
      <h1 className="text-xl font-semibold text-stone-900">Create account</h1>
      <p className="text-sm text-stone-600">
        Only signed-in users can see your clients, estimates, and invoices. Each
        account has its own data.
      </p>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="name" className="text-sm font-medium text-stone-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          className={fieldClass}
        />
        {fieldErrors.name && (
          <p className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium text-stone-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={fieldClass}
        />
        {fieldErrors.email && (
          <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-stone-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className={fieldClass}
        />
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-red-700">{fieldErrors.password}</p>
        )}
        <p className="mt-1 text-xs text-stone-500">At least 8 characters.</p>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create account"}
      </button>
      <p className="text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-stone-900 underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
