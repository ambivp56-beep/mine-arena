
"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/lib/validation";

type Done = {
  id: string;
  createdAt: string;
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mc-field">
      <label className="mc-label">{label}</label>
      {children}
      {error && <p className="mc-error">{error}</p>}
    </div>
  );
}

function YesNo({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value?: "yes" | "no";
  onChange: (value: "yes" | "no") => void;
  error?: string;
}) {
  return (
    <div className="mc-field">
      <p className="mc-label">{label}</p>

      <div className="mc-choice-row">
        <button
          type="button"
          className={`mc-choice ${value === "yes" ? "active" : ""}`}
          onClick={() => onChange("yes")}
        >
          Yes
        </button>

        <button
          type="button"
          className={`mc-choice ${value === "no" ? "active" : ""}`}
          onClick={() => onChange("no")}
        >
          No
        </button>
      </div>

      {error && <p className="mc-error">{error}</p>}
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mc-section-title">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export default function RegistrationForm() {
  const [done, setDone] = useState<Done | null>(null);
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: "",
      team_name: "",
      contact_number: "",
      blood_group: undefined,
      state: "",
      city: "",
      college_name: "",
      emergency_contact_name: "",
      emergency_contact_number: "",
      emergency_contact_relationship: "",
      medical_condition_details: "",
      medication_support_details: "",
      website: "",
    } as DefaultValues<RegistrationInput>,
  });

  const hasCondition = watch("has_medical_condition");
  const takingMedication = watch("taking_medication");

  const onSubmit = async (values: RegistrationInput) => {
    setSubmitting(true);
    setServerError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(
          result.error || "Registration failed. Please try again."
        );
        return;
      }

      setDone({
        id: result.id,
        createdAt: result.createdAt,
      });

      reset();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch {
      setServerError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inv = (name: keyof RegistrationInput) => ({
    ...register(name),
    "aria-invalid": Boolean(errors[name]),
  });

  if (done) {
    return (
      <div className="mc-success">
        <div className="mc-success-icon">✓</div>

        <h2>Registration Successful!</h2>

        <p>
          Your MINE ARENA registration has been submitted successfully.
        </p>

        <div className="mc-success-details">
          <p>
            <strong>Registration ID:</strong> {done.id}
          </p>

          <p>
            <strong>Submitted:</strong>{" "}
            {new Date(done.createdAt).toLocaleString()}
          </p>
        </div>

        <button
          type="button"
          className="mc-submit"
          onClick={() => {
            setDone(null);
            setServerError("");
          }}
        >
          Back to Registration
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="mc-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <SectionTitle
        title="Player Registration"
        subtitle="Complete your medical details for MINE ARENA 1.0"
      />

      {/* BASIC INFORMATION */}
      <section className="mc-section">
        <SectionTitle title="Basic Information" />

        <Field
          label="Full Name"
          error={errors.full_name?.message}
        >
          <input
            className="mc-input"
            placeholder="Enter Your Full Name"
            {...inv("full_name")}
          />
        </Field>

        <Field
          label="Team Name"
          error={errors.team_name?.message}
        >
          <input
            className="mc-input"
            placeholder="Enter Your Team Name"
            {...inv("team_name")}
          />
        </Field>

        <Field
          label="Phone Number"
          error={errors.contact_number?.message}
        >
          <input
            className="mc-input"
            type="tel"
            placeholder="Enter Your Phone Number"
            {...inv("contact_number")}
          />
        </Field>

        <Field
          label="State"
          error={errors.state?.message}
        >
          <input
            className="mc-input"
            placeholder="Enter Your State"
            {...inv("state")}
          />
        </Field>

        <Field
          label="City"
          error={errors.city?.message}
        >
          <input
            className="mc-input"
            placeholder="Enter Your City"
            {...inv("city")}
          />
        </Field>

        <Field
          label="College Name"
          error={errors.college_name?.message}
        >
          <input
            className="mc-input"
            placeholder="Enter Your College Name"
            {...inv("college_name")}
          />
        </Field>
      </section>

      {/* EMERGENCY CONTACT */}
      <section className="mc-section">
        <SectionTitle
          title="Emergency Contact"
          subtitle="Provide someone the organizers can contact if needed."
        />

        <Field
          label="Emergency Contact Name"
          error={errors.emergency_contact_name?.message}
        >
          <input
            className="mc-input"
            placeholder="Enter Emergency Contact Name"
            {...inv("emergency_contact_name")}
          />
        </Field>

        <Field
          label="Emergency Contact Number"
          error={errors.emergency_contact_number?.message}
        >
          <input
            className="mc-input"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            {...inv("emergency_contact_number")}
          />
        </Field>

        <Field
          label="Relationship"
          error={errors.emergency_contact_relationship?.message}
        >
          <input
            className="mc-input"
            placeholder="e.g. Parent, Guardian, Friend"
            {...inv("emergency_contact_relationship")}
          />
        </Field>
      </section>

      {/* MEDICAL INFORMATION */}
      <section className="mc-section">
        <SectionTitle
          title="Medical Information"
          subtitle="Please provide accurate information."
        />

        <Field
          label="Blood Group"
          error={errors.blood_group?.message}
        >
          <select
            className="mc-input"
            defaultValue=""
            {...inv("blood_group")}
          >
            <option value="">Select Your Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </Field>

        <YesNo
          label="Do you have any medical conditions?"
          value={hasCondition}
          onChange={(value) =>
            setValue("has_medical_condition", value, {
              shouldValidate: true,
            })
          }
          error={errors.has_medical_condition?.message}
        />

        {hasCondition === "yes" && (
          <Field
            label="Medical Condition Details"
            error={errors.medical_condition_details?.message}
          >
            <textarea
              className="mc-input"
              rows={3}
              placeholder="Describe your medical condition"
              {...inv("medical_condition_details")}
            />
          </Field>
        )}

        <YesNo
          label="Are you currently taking any medication?"
          value={takingMedication}
          onChange={(value) =>
            setValue("taking_medication", value, {
              shouldValidate: true,
            })
          }
          error={errors.taking_medication?.message}
        />

        {takingMedication === "yes" && (
          <Field
            label="Medication Details"
            error={errors.medication_support_details?.message}
          >
            <textarea
              className="mc-input"
              rows={3}
              placeholder="Enter medication details or support required"
              {...inv("medication_support_details")}
            />
          </Field>
        )}
      </section>

      {/* CONSENT */}
      <section className="mc-section">
        <SectionTitle title="Consent & Declaration" />

        <label className="mc-consent">
          <input
            type="checkbox"
            {...register("consent")}
          />

          <span>
            I confirm that the information provided is accurate and
            authorize the event organizers to use it for event-related
            medical and safety purposes.
          </span>
        </label>

        {errors.consent?.message && (
          <p className="mc-error">
            {errors.consent.message}
          </p>
        )}

        <p className="mc-privacy">
          Your medical information should only be accessible to
          authorized event organizers who need it for participant
          safety. Please review the event's privacy notice before
          submitting.
        </p>
      </section>

      {/* HONEYPOT */}
      <div className="mc-honeypot" aria-hidden="true">
        <input
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      {serverError && (
        <p className="mc-error mc-server-error">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        className="mc-submit"
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
