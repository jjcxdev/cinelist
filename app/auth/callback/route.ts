import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const type = requestUrl.searchParams.get("type");
  const hash = requestUrl.hash;

  const supabase = await createClient();

  // If we have a hash with access_token, this is an invite flow
  if (hash && hash.includes("access_token")) {
    // We need to set up the session using the access token
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        return NextResponse.redirect(
          `${origin}/sign-in?error=${encodeURIComponent(error.message)}`,
        );
      }

      return NextResponse.redirect(`${origin}/auth/invite`);
    }
  }

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Default redirect for other auth flows
  return NextResponse.redirect(`${origin}/protected`);
}
