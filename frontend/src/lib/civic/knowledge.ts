/** Curated civic knowledge for grounded answers without external APIs. */

import { CITY_DIRECTORY, statePortalUrl } from "./india-geography";

export interface KnowledgeDoc {
  id: string;
  title: string;
  authority: string;
  authority_level: string;
  source_url: string;
  content: string;
  section?: string;
  last_verified: string;
  state?: string;
  city?: string;
  domains: string[];
  tags: string[];
}

const CORE_DOCS: KnowledgeDoc[] = [
  {
    id: "rti-act-2005-overview",
    title: "Right to Information Act, 2005 — Overview",
    authority: "Government of India",
    authority_level: "STATUTORY",
    source_url: "https://rti.gov.in/",
    section: "Section 6",
    last_verified: "2024-06-01",
    domains: ["rti", "form_filler"],
    tags: ["rti", "information", "public authority", "application", "records"],
    content:
      "The Right to Information Act, 2005 allows citizens to request recorded information from public authorities. An RTI application must specify the particulars of information sought and the relevant public authority.",
  },
  {
    id: "rti-section-7-timeline",
    title: "RTI Act Section 7 — Disposal of request",
    authority: "Government of India",
    authority_level: "STATUTORY",
    source_url: "https://rti.gov.in/",
    section: "Section 7",
    last_verified: "2024-06-01",
    domains: ["rti"],
    tags: ["rti", "timeline", "30 days", "appeal", "disposal"],
    content:
      "Section 7 of the RTI Act provides that information shall ordinarily be provided within thirty days of receipt of the request. Life or liberty matters must be answered within forty-eight hours.",
  },
  {
    id: "rti-public-authority-2h",
    title: "RTI Act Section 2(h) — Public authority",
    authority: "Government of India",
    authority_level: "STATUTORY",
    source_url: "https://rti.gov.in/",
    section: "Section 2(h)",
    last_verified: "2024-06-01",
    domains: ["rti", "bureaucracy"],
    tags: ["rti", "public authority", "section 2(h)", "bureaucracy", "definition"],
    content:
      "A public authority under the RTI Act means any authority or body established under the Constitution, law, or government notification. Section 2(h) defines public authority and helps identify where to file an RTI application.",
  },
  {
    id: "consumer-protection-act",
    title: "Consumer Protection Act, 2019 — Remedies",
    authority: "Department of Consumer Affairs",
    authority_level: "STATUTORY",
    source_url: "https://consumerhelpline.gov.in/",
    last_verified: "2024-06-01",
    domains: ["rights_navigator"],
    tags: ["consumer", "refund", "warranty", "defective", "shop", "product"],
    content:
      "The Consumer Protection Act, 2019 provides remedies for defective goods and deficient services. Consumers should first raise a written complaint with the seller, preserve invoices and warranty documents, and approach the appropriate consumer commission if unresolved.",
  },
  {
    id: "national-consumer-helpline",
    title: "National Consumer Helpline",
    authority: "Department of Consumer Affairs",
    authority_level: "OFFICIAL",
    source_url: "https://consumerhelpline.gov.in/",
    last_verified: "2024-08-01",
    domains: ["rights_navigator"],
    tags: ["consumer", "helpline", "complaint", "refund", "warranty"],
    content:
      "The National Consumer Helpline allows consumers to register grievances about defective products and deficient services and seek guidance on consumer commission procedures.",
  },
  {
    id: "cpgrams-overview",
    title: "CPGRAMS — Central Public Grievance Portal",
    authority: "DARPG",
    authority_level: "OFFICIAL",
    source_url: "https://pgportal.gov.in/",
    last_verified: "2024-08-01",
    domains: ["grievance"],
    tags: ["grievance", "complaint", "central government", "pg portal", "escalation"],
    content:
      "CPGRAMS is the Centralized Public Grievance Redress and Monitoring System where citizens can lodge grievances related to Central Government ministries and departments and track status online.",
  },
  {
    id: "municipal-grievance-general",
    title: "Municipal grievance redress — general guidance",
    authority: "Urban local bodies",
    authority_level: "OFFICIAL",
    source_url: "https://pgportal.gov.in/",
    last_verified: "2024-06-01",
    domains: ["grievance"],
    tags: ["municipal", "drainage", "garbage", "road", "complaint", "local body"],
    content:
      "Urban local bodies are responsible for local civic services such as drainage, garbage, roads, and water within their jurisdiction. Citizens should lodge complaints through the official municipal portal or helpline and keep the complaint reference number.",
  },
  {
    id: "pm-kisan-eligibility",
    title: "PM-KISAN — eligibility overview",
    authority: "Ministry of Agriculture & Farmers Welfare",
    authority_level: "OFFICIAL",
    source_url: "https://pmkisan.gov.in/",
    last_verified: "2024-06-01",
    domains: ["scheme_eligibility"],
    tags: ["pm-kisan", "scheme", "eligibility", "farmer", "farmland", "agriculture"],
    content:
      "PM-KISAN provides income support to eligible landholding farmer families. Eligibility criteria including landholding limits and exclusion categories are published on the official PM-KISAN portal. Apply only through official government channels.",
  },
  {
    id: "labour-wages-india",
    title: "Unpaid wages — labour department redress",
    authority: "Ministry of Labour & Employment",
    authority_level: "OFFICIAL",
    source_url: "https://labour.gov.in/",
    last_verified: "2024-06-01",
    domains: ["rights_navigator"],
    tags: ["employer", "salary", "wages", "workplace", "labour", "unpaid", "termination"],
    content:
      "Unpaid wages and employment disputes may be addressed through State labour departments and labour commissioner channels. Workers should keep employment records, pay slips, and written communications as evidence.",
  },
  {
    id: "tenancy-general-india",
    title: "Landlord-tenant and deposit disputes — general guidance",
    authority: "State rent / tenancy laws (verify locally)",
    authority_level: "OFFICIAL",
    source_url: "https://labour.gov.in/",
    last_verified: "2024-06-01",
    domains: ["rights_navigator"],
    tags: ["tenant", "landlord", "deposit", "rent", "lease", "eviction", "security"],
    content:
      "Landlord-tenant disputes including security deposits are governed by applicable State rent and tenancy laws. Tenants should document the tenancy agreement, notice period, and deposit payment before approaching the relevant rent authority or consumer forum.",
  },
];

function cityDocs(): KnowledgeDoc[] {
  return CITY_DIRECTORY.map((entry) => ({
    id: `municipal-${entry.city.toLowerCase().replace(/\s+/g, "-")}`,
    title: `${entry.localAuthority} — citizen services`,
    authority: entry.localAuthority,
    authority_level: "OFFICIAL",
    source_url: entry.portalUrl || statePortalUrl(entry.state) || "https://pgportal.gov.in/",
    last_verified: "2024-06-01",
    state: entry.state,
    city: entry.city,
    domains: ["grievance", "rti", "form_filler"],
    tags: [
      entry.city.toLowerCase(),
      entry.state.toLowerCase(),
      "municipal",
      "complaint",
      "grievance",
      "local body",
      ...(entry.aliases || []),
    ],
    content: `For civic issues in ${entry.city}, ${entry.state}, citizens may lodge and track complaints through ${entry.localAuthority} official channels or the applicable State municipal portal.`,
  }));
}

export const KNOWLEDGE_BASE: KnowledgeDoc[] = [...CORE_DOCS, ...cityDocs()];

const DOMAIN_TAGS: Record<string, string[]> = {
  rti: ["rti", "information", "public authority", "records", "application"],
  grievance: ["grievance", "municipal", "complaint", "drainage", "garbage", "road", "local body"],
  rights_navigator: ["consumer", "tenant", "landlord", "employer", "salary", "wages", "refund", "deposit"],
  scheme_eligibility: ["scheme", "pm-kisan", "eligibility", "farmer", "agriculture"],
  form_filler: ["rti", "application", "form", "records"],
  bureaucracy: ["public authority", "section 2(h)", "bureaucracy", "rti", "definition"],
};

const RIGHTS_AREA_TAGS: Record<string, string[]> = {
  tenant: ["tenant", "landlord", "deposit", "rent", "lease"],
  consumer: ["consumer", "refund", "warranty", "defective", "shop"],
  workplace: ["employer", "salary", "wages", "labour", "workplace"],
};

export function searchKnowledge(
  query: string,
  options?: {
    state?: string;
    city?: string;
    domain?: string;
    area?: string;
    topK?: number;
  }
): KnowledgeDoc[] {
  const topK = options?.topK ?? 5;
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  const domain = options?.domain || "";
  const area = options?.area || "";
  const domainTags = DOMAIN_TAGS[domain] || [];
  const areaTags = RIGHTS_AREA_TAGS[area] || [];

  const scored = KNOWLEDGE_BASE.map((doc) => {
    const hay = `${doc.title} ${doc.content} ${doc.tags.join(" ")} ${doc.city || ""} ${doc.state || ""}`.toLowerCase();
    let score = 0;

    for (const t of tokens) {
      if (hay.includes(t)) score += 1;
    }

    if (domain && doc.domains.includes(domain)) score += 4;
    for (const tag of domainTags) {
      if (doc.tags.includes(tag) || hay.includes(tag)) score += 2;
    }
    for (const tag of areaTags) {
      if (doc.tags.includes(tag) || hay.includes(tag)) score += 3;
    }

    if (options?.state && doc.state?.toLowerCase() === options.state.toLowerCase()) score += 3;
    if (options?.city && doc.city?.toLowerCase() === options.city.toLowerCase()) score += 5;

    return { doc, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    const fallback = KNOWLEDGE_BASE.filter((d) => !domain || d.domains.includes(domain));
    return fallback.slice(0, topK);
  }

  return scored.slice(0, topK).map((x) => x.doc);
}

export function isValidOfficialUrl(url: string): boolean {
  return /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}/i.test(url);
}
