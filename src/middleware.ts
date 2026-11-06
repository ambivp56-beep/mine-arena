import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// First gate: refresh the session and bounce signed-out users. Pages/APIs re-check admin
// membership on the server (requireAdmin) and RLS enforces it again in the database.
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: { name: string; value: string; options?: any }[]) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await sb.auth.getUser();
  const path = req.nextUrl.pathname;
  const isLogin = path === "/admin/login";

  if (!user && !isLogin) {
    if (path.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  if (user && isLogin) return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  return res;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
