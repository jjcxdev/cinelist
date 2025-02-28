// src/app/sign-in/page.tsx
import AuthForm from "@/components/auth"; //Path may be different based on where you store AuthForm
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to home if already signed in
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <AuthForm mode="sign-in" />
    </div>
  );
}
