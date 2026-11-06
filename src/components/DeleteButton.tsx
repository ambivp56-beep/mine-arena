"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Deletion runs as the signed-in user, so Row Level Security (admins only) is the real gate.
export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div>
      <button className="mc-btn !bg-[#a82424] !py-3" disabled={busy} onClick={async () => {
        if (!confirm("Delete this record permanently? This cannot be undone.")) return;
        setBusy(true);
        const { error } = await supabaseBrowser().from("medical_registrations").delete().eq("id", id);
        if (error) { setErr("Could not delete. You may not have permission."); setBusy(false); return; }
        router.replace("/admin/dashboard"); router.refresh();
      }}>{busy ? "DELETING..." : "DELETE RECORD"}</button>
      {err && <p role="alert" className="mc-error">{err}</p>}
    </div>
  );
}
