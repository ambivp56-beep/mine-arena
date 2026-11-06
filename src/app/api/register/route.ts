import { NextResponse } from "next/server";
import { registrationSchema, normalizePhone } from "@/lib/validation";
import { supabaseService } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields" }, { status: 422 });
  const d = parsed.data;

  // Honeypot filled: pretend success so bots learn nothing.
  if (d.website) return NextResponse.json({ id: crypto.randomUUID(), createdAt: new Date().toISOString() });

  const hasCond = d.has_medical_condition === "yes";
  const takesMed = d.taking_medication === "yes";

  const { data, error } = await supabaseService()
    .from("medical_registrations")
    .insert({
      full_name: d.full_name,
      team_name: d.team_name,
      contact_number: normalizePhone(d.contact_number),
      emergency_contact_name: d.emergency_contact_name,
      emergency_contact_number: normalizePhone(d.emergency_contact_number),
      emergency_contact_relationship: d.emergency_contact_relationship,
      has_medical_condition: hasCond,
      medical_condition_details: hasCond ? d.medical_condition_details || null : null,
      taking_medication: takesMed,
      medication_support_details: takesMed ? d.medication_support_details || null : null,
      consent: true,
    })
    .select("id, created_at")
    .single();

  if (error) {
    // Log only the error code – never the submitted medical data.
    console.error("registration insert failed", error.code);
    if (error.code === "23505")
      return NextResponse.json({ error: "This contact number is already registered. Contact the organizers to change your details." }, { status: 409 });
    return NextResponse.json({ error: "Could not save your registration. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ id: data.id, createdAt: data.created_at });
}
