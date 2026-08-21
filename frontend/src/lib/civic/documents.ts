const DISCLAIMER = "AI-generated draft — verify the details before submitting.";

function ph(value: unknown, placeholder: string): [string, boolean] {
  const text = value == null ? "" : String(value).trim();
  if (!text) return [placeholder, true];
  return [text, false];
}

export function generateGrievanceDraft(
  facts: Record<string, unknown>,
  jurisdiction: Record<string, unknown>
) {
  const placeholders: string[] = [];
  const [name, n1] = ph(facts.applicant_name, "[YOUR NAME]");
  if (n1) placeholders.push("[YOUR NAME]");
  const [address, n2] = ph(facts.applicant_address, "[YOUR ADDRESS]");
  if (n2) placeholders.push("[YOUR ADDRESS]");
  const city = jurisdiction.city || facts.city || "[CITY]";
  const state = jurisdiction.state || facts.state || "[STATE]";
  const issue = facts.issue_type || facts.issue_summary || "civic service issue";
  const authority =
    facts.authority || jurisdiction.local_authority || "[CONCERNED MUNICIPAL / LOCAL AUTHORITY]";

  const body = `To
The Commissioner / Competent Authority
${authority}
${city}, ${state}

Subject: Unresolved ${issue} — request for action

Respected Sir/Madam,

I, ${name}, resident of ${address}, wish to bring to your notice an unresolved ${issue} in ${city}, ${state}.

I request that the concerned department examine the matter and take necessary action as per applicable municipal / local body procedures, and inform me of the status.

Thank you.

Yours sincerely,
${name}
${address}`;

  return {
    doc_type: "grievance",
    title: "Municipal grievance letter",
    body,
    disclaimer: DISCLAIMER,
    placeholders_used: placeholders,
  };
}

export function generateRtiDraft(facts: Record<string, unknown>, jurisdiction: Record<string, unknown>) {
  const [name, n1] = ph(facts.applicant_name, "[YOUR NAME]");
  const placeholders: string[] = n1 ? ["[YOUR NAME]"] : [];
  const [address, n2] = ph(facts.applicant_address, "[YOUR ADDRESS]");
  if (n2) placeholders.push("[YOUR ADDRESS]");
  const city = jurisdiction.city || facts.city || "[CITY]";
  const state = jurisdiction.state || facts.state || "[STATE]";
  const info = facts.rti_objective || facts.user_goal || facts.issue_summary || "[DESCRIBE RECORDS SOUGHT]";

  const body = `To
The Public Information Officer
[NAME OF PUBLIC AUTHORITY]
${city}, ${state}

Subject: Application under Right to Information Act, 2005

Respected Sir/Madam,

I, ${name}, resident of ${address}, seek the following information under the RTI Act, 2005:

${info}

I request that the information be provided in accordance with Section 7 of the RTI Act.

Thank you.

Yours faithfully,
${name}
${address}`;

  return {
    doc_type: "rti",
    title: "RTI application draft",
    body,
    disclaimer: DISCLAIMER,
    placeholders_used: placeholders,
  };
}

export function generateFormDraft(facts: Record<string, unknown>, jurisdiction: Record<string, unknown>) {
  const formType = facts.form_type || "Official application form";
  const body = `Form type: ${formType}
Applicant: ${facts.applicant_name || "[YOUR NAME]"}
Address: ${facts.applicant_address || "[YOUR ADDRESS]"}
City/State: ${jurisdiction.city || "[CITY]"}, ${jurisdiction.state || "[STATE]"}

Purpose / request details:
${facts.issue_summary || facts.user_goal || "[DESCRIBE YOUR REQUEST]"}

(Verify the current official form version and submission address on the government portal before submitting.)`;

  return {
    doc_type: "form",
    title: `${formType} — filled draft`,
    body,
    disclaimer: DISCLAIMER,
    placeholders_used: ["[YOUR NAME]", "[YOUR ADDRESS]"],
  };
}
