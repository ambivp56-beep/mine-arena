"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema, type RegistrationInput } from "@/lib/validation";

type Done = { id: string; createdAt: string };

function Field({ label, error, hint, children, id }: { label: string; error?: string; hint?: string; children: React.ReactNode; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="mc-label">{label}</label>
      {children}
      {hint && !error && <p className="mt-2 text-xs text-stone/80">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mc-error">{error}</p>}
    </div>
  );
}

function YesNo({ name, register, error, legend }: { name: "has_medical_condition" | "taking_medication"; register: any; error?: string; legend: string }) {
  return (
    <fieldset aria-describedby={error ? `${name}-err` : undefined}>
      <legend className="mc-label">{legend}</legend>
      <div className="flex gap-4 max-w-sm">
        {(["yes", "no"] as const).map((v) => (
          <label key={v} className="mc-choice">
            <input type="radio" value={v} className="sr-only" {...register(name)} />
            {v === "yes" ? "YES" : "NO"}
          </label>
        ))}
      </div>
      {error && <p id={`${name}-err`} role="alert" className="mc-error">{error}</p>}
    </fieldset>
  );
}

function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="font-pixel text-sm sm:text-base text-gold mb-6 flex items-center gap-3" style={{ textShadow: "3px 3px 0 #000" }}>
      <span className="grid place-items-center w-9 h-9 bg-ember text-white text-xs" style={{ boxShadow: "0 0 0 3px #000, inset 3px 3px 0 rgba(255,255,255,.35)" }}>{n}</span>
      {children}
    </h2>
  );
}

export default function RegistrationForm() {
  const [done, setDone] = useState<Done | null>(null);
  const [serverError, setServerError] = useState("");
  const submitting = useRef(false); // synchronous guard against double-clicks
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema), mode: "onTouched",
  });
  const hasCond = watch("has_medical_condition") === "yes";
  const takesMed = watch("taking_medication") === "yes";
  const inv = (k: keyof RegistrationInput) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-err` : undefined });

  async function onSubmit(values: RegistrationInput) {
    if (submitting.current) return;
    submitting.current = true; setServerError("");
    try {
      const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setServerError(json.error ?? "Something went wrong. Please try again."); return; }
      setDone(json);
    } catch { setServerError("Network error. Check your connection and try again."); }
    finally { submitting.current = false; }
  }

  if (done) {
    return (
      <section className="mc-panel mc-grass-top p-6 sm:p-10 text-center" aria-live="polite">
        <h2 className="font-pixel text-xl sm:text-3xl text-gold leading-relaxed" style={{ textShadow: "4px 4px 0 #000" }}>YOU&apos;RE REGISTERED!</h2>
        <p className="mt-6 max-w-xl mx-auto text-lg">Your medical information has been successfully submitted to the Mine Arena 1.0 organizing team.</p>
        <dl className="mt-8 mx-auto max-w-md text-left bg-black/50 p-4 space-y-3" style={{ boxShadow: "0 0 0 3px #000" }}>
          <div><dt className="text-gold text-sm font-semibold">Submission ID</dt><dd className="font-mono text-sm break-all select-all">{done.id}</dd></div>
          <div><dt className="text-gold text-sm font-semibold">Submitted</dt><dd>{new Date(done.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</dd></div>
        </dl>
        <p className="mt-6 text-sm text-stone">Keep your Submission ID. Share it with the organizers if you need to update your details.</p>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10" aria-busy={isSubmitting}>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("website")} />

      <section className="mc-panel mc-grass-top p-5 sm:p-8">
        <SectionTitle n={1}>BASIC INFO</SectionTitle>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="full_name" label="Full name" error={errors.full_name?.message}>
            <input id="full_name" autoComplete="name" className="mc-input" placeholder="Steve Alex" {...inv("full_name")} {...register("full_name")} />
          </Field>
          <Field id="team_name" label="Team name" error={errors.team_name?.message}>
            <input id="team_name" className="mc-input" placeholder="Creeper Crushers" {...inv("team_name")} {...register("team_name")} />
          </Field>
          <Field id="contact_number" label="Contact number" error={errors.contact_number?.message} hint="Indian numbers (+91) or international with country code.">
            <input id="contact_number" type="tel" inputMode="tel" autoComplete="tel" className="mc-input" placeholder="+91 98765 43210" {...inv("contact_number")} {...register("contact_number")} />
          </Field>
          <Field id="emergency_contact_name" label="Emergency contact person's name" error={errors.emergency_contact_name?.message}>
            <input id="emergency_contact_name" className="mc-input" placeholder="Parent, guardian or friend" {...inv("emergency_contact_name")} {...register("emergency_contact_name")} />
          </Field>
          <Field id="emergency_contact_number" label="Emergency contact number" error={errors.emergency_contact_number?.message}>
            <input id="emergency_contact_number" type="tel" inputMode="tel" className="mc-input" placeholder="+91 91234 56789" {...inv("emergency_contact_number")} {...register("emergency_contact_number")} />
          </Field>
          <Field id="emergency_contact_relationship" label="Relationship with emergency contact" error={errors.emergency_contact_relationship?.message}>
            <input id="emergency_contact_relationship" list="relations" className="mc-input" placeholder="Choose or type" {...inv("emergency_contact_relationship")} {...register("emergency_contact_relationship")} />
            <datalist id="relations">{["Mother", "Father", "Guardian", "Sibling", "Spouse", "Friend", "Relative"].map((r) => <option key={r} value={r} />)}</datalist>
          </Field>
        </div>
      </section>

      <section className="mc-panel mc-grass-top p-5 sm:p-8 space-y-8">
        <SectionTitle n={2}>MEDICAL INFO</SectionTitle>
        <YesNo name="has_medical_condition" register={register} error={errors.has_medical_condition?.message}
          legend="Do you have any existing medical conditions that organizers should be aware of?" />
        {hasCond && (
          <Field id="medical_condition_details" label="Please specify the condition (if comfortable sharing). Optional." error={errors.medical_condition_details?.message}>
            <textarea id="medical_condition_details" rows={4} className="mc-input" maxLength={1500} {...register("medical_condition_details")} />
          </Field>
        )}
        <YesNo name="taking_medication" register={register} error={errors.taking_medication?.message}
          legend="Are you currently taking any medication that you may need during the hackathon?" />
        {takesMed && (
          <Field id="medication_support_details" label="Is there anything organizers should know to support you? Optional." error={errors.medication_support_details?.message}>
            <textarea id="medication_support_details" rows={4} className="mc-input" maxLength={1500} {...register("medication_support_details")} />
          </Field>
        )}
      </section>

      <section className="mc-panel mc-grass-top p-5 sm:p-8">
        <SectionTitle n={3}>CONSENT</SectionTitle>
        <div className="mc-plank p-4 sm:p-5 mb-6 text-sm text-white" style={{ textShadow: "1px 1px 0 rgba(0,0,0,.6)" }}>
          <p className="font-semibold mb-2">Privacy notice</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>We collect this information only to keep you safe and to contact your emergency contact if needed.</li>
            <li>Only authorized Mine Arena 1.0 organizers can see it, after signing in. It is never public and never sold or shared with sponsors.</li>
            <li>Data is stored in an encrypted database and deleted within 30 days after the event ends.</li>
          </ul>
        </div>
        <label className="flex gap-4 items-start cursor-pointer">
          <input type="checkbox" className="mt-1 h-6 w-6 shrink-0 accent-[#5db136]" {...inv("consent")} {...register("consent")} />
          <span>I confirm that the information provided is accurate to the best of my knowledge. I understand that this information will be accessible only to authorized hackathon organizers for participant safety and emergency support.</span>
        </label>
        {errors.consent && <p role="alert" className="mc-error">{errors.consent.message as string}</p>}
      </section>

      {serverError && <p role="alert" className="bg-[#5a1414] p-4 text-[#ffb3b3]" style={{ boxShadow: "0 0 0 3px #000" }}>{serverError}</p>}

      <button type="submit" disabled={isSubmitting} className="mc-btn w-full sm:w-auto sm:min-w-[320px]">
        {isSubmitting ? <>SAVING<span className="blink">...</span></> : "SUBMIT "}
      </button>
    </form>
  );
}
