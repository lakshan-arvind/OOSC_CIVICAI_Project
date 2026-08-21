export interface ApplicantDetails {
  applicant_name: string;
  applicant_address: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  date: string;
}

export const EMPTY_APPLICANT_DETAILS: ApplicantDetails = {
  applicant_name: "",
  applicant_address: "",
  phone: "",
  email: "",
  city: "",
  state: "",
  date: "",
};

export function detailsFromFacts(
  facts: string[],
  jurisdiction: Record<string, unknown>
): ApplicantDetails {
  const map: Record<string, string> = {};
  for (const line of facts) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase().replace(/\s+/g, "_");
    map[key] = line.slice(idx + 1).trim();
  }

  return {
    applicant_name: map.applicant_name || map.name || "",
    applicant_address: map.applicant_address || map.address || "",
    phone: map.phone || "",
    email: map.email || "",
    city: (jurisdiction.city as string) || map.city || "",
    state: (jurisdiction.state as string) || map.state || "",
    date: map.date || new Date().toISOString().slice(0, 10),
  };
}

export function isApplicantDetailsComplete(details: ApplicantDetails): boolean {
  return Boolean(
    details.applicant_name.trim() &&
      details.applicant_address.trim() &&
      details.phone.trim() &&
      details.email.trim() &&
      details.city.trim() &&
      details.state.trim()
  );
}

export function toExtraDetails(details: ApplicantDetails): Record<string, string> {
  const out: Record<string, string> = {
    applicant_name: details.applicant_name.trim(),
    applicant_address: details.applicant_address.trim(),
    phone: details.phone.trim(),
    email: details.email.trim(),
    city: details.city.trim(),
    state: details.state.trim(),
  };
  if (details.date.trim()) {
    out.date = details.date.trim();
  }
  return out;
}
