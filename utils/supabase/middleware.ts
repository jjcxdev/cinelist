import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: "",
              ...options,
            });
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protected routes
    if (request.nextUrl.pathname.startsWith("/protected") && !user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Redirect from sign-in/sign-up if already authenticated
    if (
      user &&
      (request.nextUrl.pathname === "/sign-in" ||
        request.nextUrl.pathname === "/sign-up")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    console.error("Supabase client error:", e);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const response = await updateSession(request);

  // Copy the headers to the response
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("x-pathname", request.nextUrl.pathname);

  // Return new response with merged headers
  return new Response(response.body, {
    ...response,
    headers: responseHeaders,
  });
}
