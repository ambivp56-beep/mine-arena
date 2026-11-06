"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

export type Row = {
  id: string; full_name: string; team_name: string; contact_number: string;
  emergency_contact_name: string; emergency_contact_number: string;
  has_medical_condition: boolean; taking_medication: boolean; created_at: string;
};

const badge = (yes: boolean) => (
  <span className={`px-2 py-1 text-xs font-bold ${yes ? "bg-ember text-black" : "bg-grassdark text-white"}`}>{yes ? "YES" : "NO"}</span>
);

export default function SubmissionsTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    const digits = s.replace(/\D/g, "");
    return rows.filter((r) =>
      r.full_name.toLowerCase().includes(s) || r.team_name.toLowerCase().includes(s) ||
      (digits.length > 2 && r.contact_number.replace(/\D/g, "").includes(digits)));
  }, [q, rows]);

  return (
    <div>
      <label htmlFor="search" className="mc-label">Search by name, team or contact number</label>
      <input id="search" type="search" className="mc-input max-w-xl" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Start typing..." />
      <p className="mt-3 text-sm text-stone" aria-live="polite">{filtered.length} of {rows.length} shown</p>

      <div className="mt-4 overflow-x-auto mc-panel">
        <table className="w-full text-sm min-w-[980px]">
          <thead className="bg-black/50 text-gold text-left">
            <tr>{["Submission ID","Full Name","Team","Contact","Emergency Contact","Medical","Medication","Submitted",""].map((h) => <th key={h} className="px-3 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-white/10 hover:bg-grass/10">
                <td className="px-3 py-3 font-mono text-xs">{r.id.slice(0, 8)}</td>
                <td className="px-3 py-3 font-semibold">{r.full_name}</td>
                <td className="px-3 py-3">{r.team_name}</td>
                <td className="px-3 py-3 whitespace-nowrap">{r.contact_number}</td>
                <td className="px-3 py-3"><div className="font-semibold text-gold">{r.emergency_contact_name}</div><div className="whitespace-nowrap">{r.emergency_contact_number}</div></td>
                <td className="px-3 py-3">{badge(r.has_medical_condition)}</td>
                <td className="px-3 py-3">{badge(r.taking_medication)}</td>
                <td className="px-3 py-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</td>
                <td className="px-3 py-3"><Link href={`/admin/submissions/${r.id}`} className="underline text-gold hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">View details</Link></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="px-3 py-10 text-center text-stone">No matching submissions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
