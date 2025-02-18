import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");
  const origin = requestUrl.origin;

  const supabase = await createClient();

  if (token && type === "invite") {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "invite",
      });

      if (error) {
        console.error("Invite verification error:", error);
        return NextResponse.redirect(
          `${origin}/sign-in?error=${encodeURIComponent(error.message)}`,
        );
      }

      // If verification successful, redirect to invite page with the email
      return NextResponse.redirect(
        `${origin}/auth/invite?email=${encodeURIComponent(data.user?.email || "")}`,
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      return NextResponse.redirect(
        `${origin}/sign-in?error=Invalid or expired invite link`,
      );
    }
  }

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Default redirect for other auth flows
  return NextResponse.redirect(`${origin}/protected`);
}
