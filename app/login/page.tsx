import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  const showGoogle =
    !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-12">
      <Suspense fallback={<p className="text-stone-500">Loading…</p>}>
        <LoginForm showGoogle={showGoogle} />
      </Suspense>
    </div>
  );
}
