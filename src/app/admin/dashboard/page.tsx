import Link from "next/link";
import { requireAdmin } from "@/lib/supabase-server";
import SubmissionsTable, { type Row } from "@/components/SubmissionsTable";
import SignOutButton from "@/components/SignOutButton";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin – Mine Arena 1.0" };

const dayIST = (d: Date | string) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="mc-panel p-5">
      <div className="font-pixel text-2xl text-gold" style={{ textShadow: "3px 3px 0 #000" }}>{value}</div>
      <div className="mt-3 text-sm text-stone">{label}</div>
    </div>
  );
}

export default async function Dashboard() {
  const admin = await requireAdmin();
  if (!admin) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center space-y-6">
        <p className="mc-panel p-6">This account is not on the organizer list. Ask the event lead to add you.</p>
        <SignOutButton />
      </main>
    );
  }

  // Table view loads only what it needs; full medical details load one record at a time.
  const { data, error } = await admin.sb
    .from("medical_registrations")
    .select("id, full_name, team_name, contact_number, emergency_contact_name, emergency_contact_number, has_medical_condition, taking_medication, created_at")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Row[];
  const today = dayIST(new Date());
  const teams = new Set(rows.map((r) => r.team_name.trim().toLowerCase())).size;
  const todayCount = rows.filter((r) => dayIST(r.created_at) === today).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="w-56"><Logo small /></div>
        <div className="flex gap-3">
          <a href="/api/admin/export" className="mc-btn mc-btn-orange !py-3 inline-block">EXPORT CSV</a>
          <SignOutButton />
        </div>
      </header>
      {error && <p role="alert" className="mc-error mb-4">Could not load submissions. Refresh to retry.</p>}
      <div className="grid gap-5 sm:grid-cols-3 mb-10">
        <Stat label="Total submissions" value={rows.length} />
        <Stat label="Unique teams" value={teams} />
        <Stat label="Received today" value={todayCount} />
      </div>
      <SubmissionsTable rows={rows} />
    </main>
  );
}
