/**
 * Quick connection test — run once after schema deployment to
 * confirm the browser client can reach Supabase.
 *
 * Usage:
 *   1. Add a temporary button to any page, e.g. /src/app/(app)/page.tsx:
 *        import { testConnection } from "@/lib/supabase/test-connection";
 *        <button onClick={testConnection}>Test DB</button>
 *   2. Open the app in the browser, click the button, check the console.
 *   3. Remove the button after confirming.
 */

import { createClient } from "./client";

export async function testConnection() {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("trainers")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("❌ Supabase connection failed:", error.message);
    return;
  }

  console.log(`✅ Supabase connected. trainers table has ${count ?? 0} rows.`);
}
