"use client";

import type { ApplicantDetails } from "@/lib/applicantDetails";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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
  const { t } = useLanguage();

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
          <p className="mt-1 text-xs text-red-600">{t.fieldRequired}</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">{field("applicant_name", t.fullName, t.namePlaceholder)}</div>
      <div className="sm:col-span-2">
        {field("applicant_address", t.address, t.addressPlaceholder)}
      </div>
      {field("city", t.city, t.cityPlaceholder)}
      {field("state", t.state, t.statePlaceholder)}
      {field("phone", t.phone, t.phonePlaceholder)}
      {field("email", t.email, t.emailPlaceholder, true, "email")}
      {field("date", t.documentDate, t.datePlaceholder, false, "date")}
    </div>
  );
}
