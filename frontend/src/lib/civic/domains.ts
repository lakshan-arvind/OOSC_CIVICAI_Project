/** Domain detection and workflow helpers (ported from backend). */

export const DOMAIN_LABELS: Record<string, string> = {
  grievance: "Municipal service complaint",
  rti: "RTI drafting",
  rights_navigator: "Rights navigator",
  scheme_eligibility: "Scheme eligibility",
  form_filler: "Conversational form-filler",
  bureaucracy: "Bureaucracy translator",
  other: "Civic query",
};

export function detectRightsArea(text: string): string {
  const lower = text.toLowerCase();
  if (/(landlord|tenant|rent|lease|security deposit|eviction)/.test(lower)) return "tenant";
  if (/(employer|salary|workplace|wages|labour|labor|termination|fired)/.test(lower))
    return "workplace";
  if (/(consumer|warranty|refund|defective|shop|seller|product)/.test(lower)) return "consumer";
  return "general";
}

export function heuristicDomain(text: string): string {
  const lower = text.toLowerCase();
  if (
    /(what does|mean in simple|plain language|plain words|simple words|explain this|bureaucracy|section 2\(h\)|translate this|in simple terms)/.test(
      lower
    )
  )
    return "bureaucracy";
  if (/(fill the form|fill out|application form|help me fill|auto-populate|form-filler|prefill|pre-fill)/.test(lower))
    return "form_filler";
  if (/(eligible|eligibility|am i eligible|can i get|pm-kisan|pm kisan|ayushman|mgnrega|pension scheme|government scheme)/.test(lower))
    return "scheme_eligibility";
  if (/(landlord|tenant|security deposit|eviction|consumer forum|warranty|refund|defective|employer|salary|workplace|wrongful termination|not paid my salary)/.test(lower))
    return "rights_navigator";
  if (/rti|right to information/.test(lower)) return "rti";
  if (/(how much|spent|expenditure)/.test(lower) && /(municipality|municipal|road|government|department)/.test(lower))
    return "rti";
  return "grievance";
}

export function enrichFacts(text: string, facts: Record<string, unknown>): Record<string, unknown> {
  const lower = text.toLowerCase();
  const out = { ...facts };
  const area = detectRightsArea(text);
  if (area !== "general") out.rights_area = area;
  if (/pm-kisan|pm kisan/.test(lower)) out.scheme_name = "PM-KISAN";
  else if (/ayushman/.test(lower)) out.scheme_name = "Ayushman Bharat";
  else if (/mgnrega|nrega/.test(lower)) out.scheme_name = "MGNREGA";
  if (/rti/.test(lower)) out.form_type = "RTI application";
  else if (/grievance|complaint/.test(lower)) out.form_type = "Grievance / complaint form";
  if (/section 2\(h\)|public authority|bureaucracy/.test(lower))
    out.term_to_explain = text.trim().slice(0, 300);
  return out;
}

const CITY_STATE: [RegExp, string, string][] = [
  [/\bchennai\b/i, "Chennai", "Tamil Nadu"],
  [/\bmumbai\b|\bbombay\b/i, "Mumbai", "Maharashtra"],
  [/\bdelhi\b|\bnew delhi\b/i, "New Delhi", "Delhi"],
  [/\bbengaluru\b|\bbangalore\b/i, "Bengaluru", "Karnataka"],
  [/\bhyderabad\b/i, "Hyderabad", "Telangana"],
  [/\bkolkata\b/i, "Kolkata", "West Bengal"],
  [/\bpune\b/i, "Pune", "Maharashtra"],
  [/\bahmedabad\b/i, "Ahmedabad", "Gujarat"],
];

const STATE_ONLY: [RegExp, string][] = [
  [/\btamil\s*nadu\b|\btn\b/i, "Tamil Nadu"],
  [/\bmaharashtra\b/i, "Maharashtra"],
  [/\bkarnataka\b/i, "Karnataka"],
  [/\bdelhi\b/i, "Delhi"],
  [/\btelangana\b/i, "Telangana"],
  [/\bwest\s*bengal\b/i, "West Bengal"],
  [/\bgujarat\b/i, "Gujarat"],
];

export function parseJurisdiction(text: string): Record<string, string> {
  let city: string | undefined;
  let state: string | undefined;
  for (const [re, c, s] of CITY_STATE) {
    if (re.test(text)) {
      city = c;
      state = s;
      break;
    }
  }
  if (!state) {
    for (const [re, s] of STATE_ONLY) {
      if (re.test(text)) {
        state = s;
        break;
      }
    }
  }
  const m = text.match(/([A-Za-z][A-Za-z\s]+?),\s*([A-Za-z][A-Za-z\s]+)/);
  if (m && !city) {
    const maybeCity = m[1].trim();
    const maybeState = m[2].trim();
    if (maybeCity.length < 40 && maybeState.length < 40) {
      city = city || maybeCity.replace(/\b\w/g, (c) => c.toUpperCase());
      state = state || maybeState.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }
  const result: Record<string, string> = { country: "India" };
  if (city) result.city = city;
  if (state) result.state = state;
  if (city?.toLowerCase() === "chennai" && state?.toLowerCase().includes("tamil")) {
    result.local_authority = "Greater Chennai Corporation";
    result.government_level = "local";
  }
  return result;
}

export function heuristicFacts(text: string, existing: Record<string, unknown> = {}): Record<string, unknown> {
  const facts = { ...existing };
  const lower = text.toLowerCase();
  if (/drainage|drain/.test(lower)) facts.issue_type = "drainage";
  else if (/garbage|waste/.test(lower)) facts.issue_type = "garbage";
  else if (/streetlight|street light/.test(lower)) facts.issue_type = "streetlight";
  else if (/water/.test(lower)) facts.issue_type = "water supply";
  else if (/road/.test(lower)) facts.issue_type = "road repair";
  else if (!facts.issue_type && !/rti/.test(lower)) facts.issue_type = "municipal service";
  if (/(several|multiple|despite|again|no response|nothing happened)/.test(lower))
    facts.has_prior_complaint = true;
  if (/rti|spent|expenditure|how much/.test(lower)) {
    facts.rti_objective = text.trim();
    facts.user_goal = text.trim();
  }
  if (!facts.issue_summary) facts.issue_summary = text.trim().slice(0, 500);
  return enrichFacts(text, facts);
}

export function clarificationNeeded(
  domain: string,
  jurisdiction: Record<string, unknown>,
  facts: Record<string, unknown>
): { awaiting: boolean; question: string | null; missing: string[] } {
  const missing: string[] = [];
  const jur = jurisdiction || {};

  if (domain === "bureaucracy") return { awaiting: false, question: null, missing: [] };

  if (["scheme_eligibility", "rights_navigator", "rti"].includes(domain)) {
    if (!jur.state) {
      missing.push("state");
      return {
        awaiting: true,
        question: "Which state is this about?",
        missing,
      };
    }
    return { awaiting: false, question: null, missing: [] };
  }

  if (domain === "form_filler") {
    if (!jur.state || !jur.city) {
      for (const k of ["state", "city"]) {
        if (!jur[k]) missing.push(k);
      }
      return {
        awaiting: true,
        question: "Which city and state should this form be filed in?",
        missing,
      };
    }
    if (!facts.form_type) {
      missing.push("form_type");
      return {
        awaiting: true,
        question: "Which official form do you need help with (e.g., RTI application, grievance form)?",
        missing,
      };
    }
    return { awaiting: false, question: null, missing: [] };
  }

  if (!jur.state || !jur.city) {
    for (const k of ["state", "city"]) {
      if (!jur[k]) missing.push(k);
    }
    return {
      awaiting: true,
      question: "Which city and state is this issue about?",
      missing,
    };
  }
  return { awaiting: false, question: null, missing: [] };
}

export function candidateClaims(
  domain: string,
  facts: Record<string, unknown>,
  jurisdiction: Record<string, unknown>
): string[] {
  const city = jurisdiction.city as string | undefined;
  const area = (facts.rights_area as string) || "general";

  if (domain === "rti") {
    return [
      "Citizens can request recorded information from public authorities under the Right to Information Act, 2005.",
      "An RTI request should specify the particulars of the information sought and the relevant public authority.",
      "Under Section 7 of the RTI Act, requests are generally to be disposed of within thirty days of receipt, subject to the Act.",
    ];
  }
  if (domain === "rights_navigator") {
    if (area === "tenant") {
      return [
        "State rent control and tenancy laws govern landlord-tenant disputes including security deposits in many States.",
        "Tenants may document the tenancy, notice period, and deposit payment before approaching the relevant rent authority or consumer forum as applicable.",
        "Citizens should verify the applicable State tenancy rules and official dispute resolution channels before taking action.",
      ];
    }
    if (area === "workplace") {
      return [
        "Unpaid wages and certain employment disputes may be addressed through labour department mechanisms under applicable labour laws.",
        "Workers should keep employment records, pay slips, and written communications as evidence.",
        "Official labour commissioner channels exist at State level for wage-related complaints.",
      ];
    }
    if (area === "consumer") {
      return [
        "The Consumer Protection Act, 2019 provides remedies for defective goods and deficient services through consumer commissions.",
        "Consumers may first raise a written complaint with the seller/manufacturer and preserve invoices and warranty documents.",
        "If unresolved, consumers may approach the appropriate consumer commission based on the value of the claim.",
      ];
    }
  }
  if (domain === "bureaucracy") {
    return [
      "Under the RTI Act, a 'public authority' means any authority or body established or constituted under the Constitution, law, or government notification.",
      "Section 2(h) of the RTI Act defines public authority and is key to knowing where an RTI application can be filed.",
    ];
  }
  const claims = [
    "Urban local bodies are generally responsible for local civic services such as drainage within their jurisdiction.",
    "Citizens should lodge municipal complaints through official municipal channels and keep the complaint reference number.",
    "If a municipal complaint remains unresolved, citizens may follow up with the local body and use applicable grievance mechanisms.",
  ];
  if (city === "Chennai") {
    claims.splice(
      1,
      0,
      "For civic issues in Chennai, citizens may use Greater Chennai Corporation official citizen service channels to lodge and track complaints."
    );
  }
  return claims;
}

export function buildSummary(
  domain: string,
  facts: Record<string, unknown>,
  jurisdiction: Record<string, unknown>
): string {
  const city = (jurisdiction.city as string) || "your area";
  const state = (jurisdiction.state as string) || "your state";
  if (domain === "rti") {
    const obj = facts.rti_objective || facts.issue_summary || "recorded information";
    return `You want to request recorded information about: ${obj} (${city}, ${state}).`;
  }
  if (domain === "rights_navigator") {
    const area = (facts.rights_area as string) || "general";
    const labels: Record<string, string> = {
      tenant: "tenant/landlord",
      consumer: "consumer",
      workplace: "workplace",
      general: "rights",
    };
    return `You asked what you can do about a ${labels[area] || "rights"} dispute in ${state}.`;
  }
  if (domain === "bureaucracy") {
    const term = (facts.term_to_explain as string) || "a government term";
    return `You asked for a plain-language explanation of: ${term.slice(0, 120)}${term.length > 120 ? "..." : ""}`;
  }
  const issue = facts.issue_type || "civic issue";
  const prior = facts.has_prior_complaint ? "unresolved " : "";
  return `You reported an ${prior}${issue} complaint to a municipal authority in ${city}, ${state}.`;
}

export function actionPlan(
  domain: string,
  facts: Record<string, unknown>,
  jurisdiction: Record<string, unknown>
): { actions: string[]; documents: string[] } {
  const area = (facts.rights_area as string) || "general";

  if (domain === "rti") {
    return {
      actions: [
        "Identify the public authority that is likely to hold the records you need.",
        "Write clear requests for recorded information (not opinions or explanations).",
        "Verify the PIO address and applicable fee from the authority's official RTI page before submitting.",
        "Keep a copy of your application and proof of submission for follow-up or appeal timelines under the RTI Act.",
      ],
      documents: [
        "Your full name and postal address",
        "Clear description of records sought",
        "Relevant period (dates)",
        "Any known file/complaint/work reference numbers",
      ],
    };
  }
  if (domain === "rights_navigator" && area === "tenant") {
    return {
      actions: [
        "Collect your rent agreement, deposit receipt, and move-out evidence.",
        "Send a written request to the landlord for deposit return with a reasonable timeline.",
        "Check your State's tenancy / rent control rules on the official State portal.",
        "If unresolved, approach the applicable rent authority or consumer forum as per State rules.",
      ],
      documents: ["Rent agreement", "Deposit payment proof", "Move-out photos/messages", "Identity proof"],
    };
  }
  if (domain === "rights_navigator" && area === "consumer") {
    return {
      actions: [
        "Keep the invoice, warranty card, and all communication with the seller.",
        "Send a written complaint to the shop/manufacturer asking for repair, replacement, or refund.",
        "Use the National Consumer Helpline or official consumer portal to register the grievance.",
        "If unresolved, file before the appropriate Consumer Commission as per claim value rules.",
      ],
      documents: ["Invoice / bill", "Warranty card", "Product photos", "Complaint emails or messages"],
    };
  }
  if (domain === "bureaucracy") {
    return {
      actions: [
        "Use the plain-language explanation alongside the official source linked below.",
        "If you need records from that body, prepare an RTI request naming the public authority clearly.",
        "Verify any fee, address, or timeline on the official portal before acting.",
      ],
      documents: ["The official source or statute section (if applicable)", "Your specific question in simple words"],
    };
  }
  const authority = (jurisdiction.local_authority as string) || "your municipal / local body";
  return {
    actions: [
      `Check the status of your existing complaint with ${authority}, if you already filed one.`,
      "Collect your complaint/reference number, date, and any screenshots or acknowledgements.",
      "Submit or escalate through the applicable official grievance process for your city/State.",
      "If appropriate, prepare an RTI application to request recorded information about action taken.",
    ],
    documents: [
      "Complaint/reference number",
      "Date of original complaint",
      "Copy/screenshot of complaint acknowledgement",
      "Exact location of the issue",
      "Your contact details for follow-up",
    ],
  };
}

export function factsList(facts: Record<string, unknown>): string[] {
  return Object.entries(facts)
    .filter(([, v]) => v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);
}

export function searchQuery(
  domain: string,
  facts: Record<string, unknown>,
  jurisdiction: Record<string, unknown>,
  userQuery: string
): string {
  const city = jurisdiction.city || "";
  const state = jurisdiction.state || "";
  const issue = facts.issue_type || facts.scheme_name || facts.rights_area || "";
  const parts = [domain, String(issue), String(city), String(state), userQuery.slice(0, 120)];
  return parts.filter(Boolean).join(" ");
}
