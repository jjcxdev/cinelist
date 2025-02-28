import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user?.id)
    .single();

  return user ? (
    <div className="flex w-full items-center justify-center bg-muted-foreground text-muted">
      <div className="flex w-full max-w-lg items-center justify-between px-4 py-2">
        <p>Hello, {profiles?.username}</p>
        <form action={signOutAction}>
          <Button type="submit">Sign out</Button>
        </form>
      </div>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
