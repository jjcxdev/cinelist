import AuthForm from "@/components/auth";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: { email?: string; token?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already signed in and not in the process of setting password, redirect to home
  if (user && !searchParams.token) {
    redirect("/");
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <AuthForm mode="invite" email={searchParams.email} />
    </div>
  );
}
