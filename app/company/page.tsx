import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { CompanyForm } from "@/components/CompanyForm";

export default async function CompanyPage() {
  const user = await requireUser();
  const company = await prisma.company.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="text-sm font-medium text-stone-600 underline hover:text-stone-900"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
          Company details
        </h1>
        <p className="mt-1 text-stone-600">
          These details will appear on your final invoices and estimates.
        </p>
      </div>

      <section>
        <CompanyForm company={company} />
      </section>
    </div>
  );
}

