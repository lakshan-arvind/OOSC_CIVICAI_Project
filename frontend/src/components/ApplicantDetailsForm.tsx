"use client";

import type { ApplicantDetails } from "@/lib/applicantDetails";

interface ApplicantDetailsFormProps {
  details: ApplicantDetails;
  onChange: (details: ApplicantDetails) => void;
  showErrors?: boolean;
}

export function ApplicantDetailsForm({
  details,
  onChange,
  showErrors = false,
}: ApplicantDetailsFormProps) {
  function field(
    id: keyof ApplicantDetails,
    label: string,
    placeholder: string,
    required = true,
    type: "text" | "email" | "date" = "text"
  ) {
    const empty = required && !details[id].trim();
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-stone-700">
          {label}
          {required && <span className="text-red-600"> *</span>}
        </label>
        <input
          id={id}
          type={type}
          value={details[id]}
          onChange={(e) => onChange({ ...details, [id]: e.target.value })}
          placeholder={placeholder}
          className={`mt-1 w-full rounded-md border bg-white px-3 py-2.5 text-base outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 ${
            showErrors && empty ? "border-red-300" : "border-stone-300"
          }`}
        />
        {showErrors && empty && (
          <p className="mt-1 text-xs text-red-600">This field is required.</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">{field("applicant_name", "Full name", "Your full name")}</div>
      <div className="sm:col-span-2">
        {field("applicant_address", "Address", "House no., street, area, PIN")}
      </div>
      {field("city", "City", "e.g. Chennai")}
      {field("state", "State", "e.g. Tamil Nadu")}
      {field("phone", "Phone", "+91 ...")}
      {field("email", "Email", "you@example.com", true, "email")}
      {field("date", "Date for the document", "YYYY-MM-DD", false, "date")}
    </div>
  );
}
