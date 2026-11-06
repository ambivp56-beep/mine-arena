import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase-server";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Submission – Mine Arena 1.0" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div><dt className="text-gold text-sm font-semibold">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{children || <span className="text-stone">Not provided</span>}</dd></div>);
}

export default async function SubmissionPage({ params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");
  if (!UUID.test(params.id)) notFound();

  const { data: r } = await admin.sb.from("medical_registrations").select("*").eq("id", params.id).maybeSingle();
  if (!r) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <Link href="/admin/dashboard" className="underline text-gold">Back to dashboard</Link>

      <section className="mc-plank p-6" aria-labelledby="ec">
        <h2 id="ec" className="font-pixel text-xs mb-4" style={{ textShadow: "2px 2px 0 #000" }}>EMERGENCY CONTACT</h2>
        <p className="text-2xl font-bold" style={{ textShadow: "2px 2px 0 rgba(0,0,0,.5)" }}>{r.emergency_contact_name} <span className="text-base font-normal">({r.emergency_contact_relationship})</span></p>
        <a href={`tel:${r.emergency_contact_number}`} className="mt-2 inline-block text-3xl font-bold underline" style={{ textShadow: "2px 2px 0 rgba(0,0,0,.5)" }}>{r.emergency_contact_number}</a>
      </section>

      <section className="mc-panel mc-grass-top p-6 space-y-5">
        <h1 className="font-pixel text-sm text-gold" style={{ textShadow: "3px 3px 0 #000" }}>{r.full_name}</h1>
        <dl className="grid gap-5 sm:grid-cols-2">
          <Item label="Team">{r.team_name}</Item>
          <Item label="Contact number">{r.contact_number}</Item>
          <Item label="Submission ID"><span className="font-mono text-sm">{r.id}</span></Item>
          <Item label="Submitted">{new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "medium", timeZone: "Asia/Kolkata" })}</Item>
        </dl>
      </section>

      <section className="mc-panel mc-grass-top p-6">
        <h2 className="font-pixel text-xs text-gold mb-5">MEDICAL INFORMATION</h2>
        <dl className="space-y-5">
          <Item label="Existing medical condition">{r.has_medical_condition ? "Yes" : "No"}</Item>
          {r.has_medical_condition && <Item label="Condition details">{r.medical_condition_details}</Item>}
          <Item label="Taking medication needed during the hackathon">{r.taking_medication ? "Yes" : "No"}</Item>
          {r.taking_medication && <Item label="How organizers can support">{r.medication_support_details}</Item>}
          <Item label="Consent given">{r.consent ? "Yes" : "No"}</Item>
        </dl>
      </section>
      <DeleteButton id={r.id} />
    </main>
  );
}
