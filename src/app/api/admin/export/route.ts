import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const esc = (v: unknown) => {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // block spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await admin.sb.from("medical_registrations").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Export failed" }, { status: 500 });

  const cols = ["id","full_name","team_name","contact_number","emergency_contact_name","emergency_contact_number",
    "emergency_contact_relationship","has_medical_condition","medical_condition_details","taking_medication",
    "medication_support_details","consent","created_at"];
  const csv = "\uFEFF" + [cols.join(","), ...(data ?? []).map((r: any) => cols.map((c) => esc(r[c])).join(","))].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mine-arena-medical-${new Date().toISOString().slice(0,10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
