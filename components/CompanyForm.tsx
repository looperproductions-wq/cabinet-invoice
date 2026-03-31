"use client";

import { useState } from "react";
import type { Company } from "@prisma/client";
import { saveCompany } from "@/app/actions/company";

type Props = {
  company: Company | null;
};

const fieldClass =
  "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm outline-none ring-stone-400 focus:border-stone-400 focus:ring-2";

export function CompanyForm({ company }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await saveCompany(formData);
      if (res?.error) setError(res.error);
    } catch {
      /* redirect throws */
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      {error && (
        <p
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <div>
        <label htmlFor="name" className="text-sm font-medium text-stone-700">
          Company name <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={company?.name ?? ""}
          className={fieldClass}
          placeholder="Your business name"
        />
      </div>

      <div>
        <label htmlFor="address" className="text-sm font-medium text-stone-700">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          defaultValue={company?.address ?? ""}
          className={fieldClass}
          placeholder="Street address"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-stone-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={company?.email ?? ""}
            className={fieldClass}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-stone-700">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={company?.phone ?? ""}
            className={fieldClass}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="text-sm font-medium text-stone-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={company?.notes ?? ""}
          className={fieldClass}
          placeholder="Optional notes that may appear on invoices/estimates."
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save company details"}
        </button>
      </div>
    </form>
  );
}

