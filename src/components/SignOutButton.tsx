"use client";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button className="mc-btn mc-btn-stone !py-3" onClick={async () => { await supabaseBrowser().auth.signOut(); router.replace("/admin/login"); router.refresh(); }}>
      LOG OUT
    </button>
  );
}
