import { z } from "zod";

/** Accepts Indian numbers (10 digits starting 6-9, optional +91/91/0) or other international E.164 numbers. */
export function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-().]/g, "");
  const indian = cleaned.match(/^(?:\+?91|0)?([6-9]\d{9})$/);
  if (indian) return `+91${indian[1]}`;
  if (/^\+[1-9]\d{7,14}$/.test(cleaned)) return cleaned;
  return null;
}

const phone = z
  .string().trim().min(1, "Enter a phone number")
  .refine((v) => normalizePhone(v) !== null, "Enter a valid number, e.g. +91 98765 43210");

const name = (label: string) =>
  z.string().trim().min(2, `${label} must be at least 2 characters`).max(100, `${label} is too long`);

export const registrationSchema = z
  .object({
    full_name: name("Full name"),
    team_name: name("Team name"),
    contact_number: phone,
    emergency_contact_name: name("Emergency contact name"),
    emergency_contact_number: phone,
    emergency_contact_relationship: name("Relationship"),
    has_medical_condition: z.enum(["yes", "no"], { required_error: "Choose Yes or No" }),
    medical_condition_details: z.string().trim().max(1500, "Keep this under 1500 characters").optional(),
    taking_medication: z.enum(["yes", "no"], { required_error: "Choose Yes or No" }),
    medication_support_details: z.string().trim().max(1500, "Keep this under 1500 characters").optional(),
    consent: z.literal(true, { errorMap: () => ({ message: "You must confirm to submit" }) }),
    website: z.string().max(0).optional(), // honeypot: bots fill it, humans never see it
  })
  .refine((d) => normalizePhone(d.contact_number) !== normalizePhone(d.emergency_contact_number), {
    path: ["emergency_contact_number"],
    message: "Emergency contact must be a different number from yours",
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;
