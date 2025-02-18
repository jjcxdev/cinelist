import AuthForm from "@/components/auth";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function InvitePage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already signed in and not in the process of setting password, redirect to home
  if (user) {
    redirect("/");
  }

  const email = params.email;

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <AuthForm mode="invite" email={email} />
    </div>
  );
}
