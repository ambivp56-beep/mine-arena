import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Cookie-bound client acting as the signed-in user, so Row Level Security applies. */
export function supabaseServer() {
  const store = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list: { name: string; value: string; options?: any }[]) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* server component */ }
      },
    },
  });
}

/** Returns the user only if they are signed in AND listed in admin_users. */
export async function requireAdmin() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? { sb, user } : null;
}
