import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

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

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
