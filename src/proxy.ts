import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Read the session from the cookie — no network request.
  // getUser() makes a live network call to Supabase auth servers which
  // can fail in the proxy/edge context with "Failed to fetch".
  // getSession() validates the JWT locally from the cookie — reliable here.
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const { pathname } = request.nextUrl;

  // Public paths that never need auth
  const isPublic =
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-icon") ||
    pathname === "/manifest.webmanifest";

  // Unauthenticated user trying to access a protected route → welcome screen
  if (!isPublic && !user) {
    const welcomeUrl = request.nextUrl.clone();
    welcomeUrl.pathname = "/welcome";
    return NextResponse.redirect(welcomeUrl);
  }

  // Authenticated user hitting the welcome/auth pages → dashboard
  if (
    user &&
    (pathname.startsWith("/welcome") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup"))
  ) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|sw\\.js|.*\\.(?:png|jpg|jpeg|gif|svg|ico|woff2?)).*)",
  ],
};
