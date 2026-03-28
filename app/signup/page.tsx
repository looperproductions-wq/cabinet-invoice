import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignupForm } from "@/components/SignupForm";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-12">
      <SignupForm />
    </div>
  );
}
