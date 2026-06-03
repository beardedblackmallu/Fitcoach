import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Handles three cases:
//   1. Email verification after signup
//   2. Google OAuth callback
//   3. Password reset flow (?type=recovery)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (type === "recovery") {
        // Send to a page where they can set a new password
        // For now, redirect to login with a message
        return NextResponse.redirect(`${origin}/login?reset=true`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — send back to login with an error flag
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
