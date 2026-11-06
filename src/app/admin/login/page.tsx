"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setError("");
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setError("Wrong email or password."); setLoading(false); return; }
    router.replace("/admin/dashboard"); router.refresh();
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Logo small />
      <form onSubmit={onSubmit} className="mc-panel mc-grass-top mt-12 p-6 space-y-6">
        <h1 className="font-pixel text-sm text-gold" style={{ textShadow: "3px 3px 0 #000" }}>ORGANIZER LOGIN</h1>
        <div>
          <label htmlFor="email" className="mc-label">Email</label>
          <input id="email" type="email" required autoComplete="username" className="mc-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password" className="mc-label">Password</label>
          <input id="password" type="password" required autoComplete="current-password" className="mc-input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p role="alert" className="mc-error">{error}</p>}
        <button className="mc-btn w-full" disabled={loading}>{loading ? "LOGGING IN..." : "LOGIN"}</button>
      </form>
    </main>
  );
}
