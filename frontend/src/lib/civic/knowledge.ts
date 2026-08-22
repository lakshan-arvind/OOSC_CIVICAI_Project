/** Curated civic knowledge for grounded answers without external APIs. */

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
  tags: string[];
}

export const KNOWLEDGE_BASE: KnowledgeDoc[] = [
  {
    id: "rti-act-2005-overview",
    title: "Right to Information Act, 2005 — Overview",
    authority: "Government of India / India Code",
    authority_level: "STATUTORY",
    source_url: "https://www.indiacode.nic.in/handle/123456789/2063",
    section: "Preamble & Section 6",
    last_verified: "2024-06-01",
    tags: ["rti", "information", "public authority", "application"],
    content:
      "The Right to Information Act, 2005 provides a practical regime of right to information for citizens to secure access to information under the control of public authorities. Under Section 6, a person seeking information shall make a request specifying particulars of the information sought.",
  },
  {
    id: "rti-section-7-timeline",
    title: "RTI Act Section 7 — Disposal of request",
    authority: "Government of India / India Code",
    authority_level: "STATUTORY",
    source_url: "https://www.indiacode.nic.in/handle/123456789/2063",
    section: "Section 7",
    last_verified: "2024-06-01",
    tags: ["rti", "timeline", "30 days", "appeal"],
    content:
      "Section 7 of the RTI Act provides that information shall be provided within thirty days of receipt of the request, subject to the Act. Where information concerns life or liberty, it shall be provided within forty-eight hours.",
  },
  {
    id: "consumer-protection-act",
    title: "Consumer Protection Act, 2019 — Remedies",
    authority: "Government of India",
    authority_level: "STATUTORY",
    source_url: "https://consumeraffairs.nic.in/",
    last_verified: "2024-06-01",
    tags: ["consumer", "refund", "warranty", "defective"],
    content:
      "The Consumer Protection Act, 2019 provides remedies for defective goods and deficient services through consumer commissions. Consumers may first raise a written complaint with the seller and preserve invoices and warranty documents.",
  },
  {
    id: "karnataka-tenancy-overview",
    title: "Karnataka tenancy and deposit disputes — general guidance",
    authority: "Karnataka State portals (verify locally)",
    authority_level: "OFFICIAL",
    source_url: "https://www.karnataka.gov.in/",
    last_verified: "2024-06-01",
    state: "Karnataka",
    tags: ["tenant", "landlord", "deposit", "rent", "bangalore", "bengaluru"],
    content:
      "Landlord-tenant disputes including security deposits in Karnataka are governed by applicable rent and tenancy laws. Tenants should document the tenancy, notice period, and deposit payment before approaching the relevant rent authority or consumer forum as applicable.",
  },
  {
    id: "cpgrams-overview",
    title: "CPGRAMS — Central Public Grievance Portal",
    authority: "DARPG",
    authority_level: "OFFICIAL",
    source_url: "https://pgportal.gov.in/",
    last_verified: "2024-08-01",
    tags: ["grievance", "complaint", "municipal", "pg portal"],
    content:
      "CPGRAMS is the Centralized Public Grievance Redress and Monitoring System where citizens can lodge grievances related to Central Government ministries and departments and track status online.",
  },
  {
    id: "municipal-grievance-general",
    title: "Municipal grievance redress — general guidance",
    authority: "Urban local bodies (verify locally)",
    authority_level: "OFFICIAL",
    source_url: "https://www.india.gov.in/",
    last_verified: "2024-06-01",
    tags: ["municipal", "drainage", "garbage", "road", "complaint"],
    content:
      "Urban local bodies are generally responsible for local civic services such as drainage within their jurisdiction. Citizens should lodge municipal complaints through official municipal channels and keep the complaint reference number.",
  },
  {
    id: "chennai-corp-citizen",
    title: "Greater Chennai Corporation — citizen services",
    authority: "Greater Chennai Corporation",
    authority_level: "OFFICIAL",
    source_url: "https://chennaicorporation.gov.in/",
    last_verified: "2024-06-01",
    state: "Tamil Nadu",
    tags: ["chennai", "municipal", "complaint", "grievance"],
    content:
      "For civic issues in Chennai, citizens may use Greater Chennai Corporation official citizen service channels to lodge and track complaints.",
  },
  {
    id: "pm-kisan-eligibility",
    title: "PM-KISAN — eligibility overview",
    authority: "Ministry of Agriculture & Farmers Welfare",
    authority_level: "OFFICIAL",
    source_url: "https://pmkisan.gov.in/",
    last_verified: "2024-06-01",
    state: "Tamil Nadu",
    tags: ["pm-kisan", "scheme", "eligibility", "farmer", "farmland"],
    content:
      "PM-KISAN provides income support to eligible landholding farmer families. Eligibility criteria including landholding limits and exclusion categories are published on the official PM-KISAN portal. Applicants should verify criteria for their State and apply only through official channels.",
  },
  {
    id: "labour-wages-india",
    title: "Unpaid wages — labour department redress",
    authority: "Ministry of Labour & Employment",
    authority_level: "OFFICIAL",
    source_url: "https://labour.gov.in/",
    last_verified: "2024-06-01",
    tags: ["employer", "salary", "wages", "workplace", "labour", "unpaid"],
    content:
      "Unpaid wages and certain employment disputes may be addressed through labour department mechanisms and industrial dispute procedures under applicable labour laws. Workers should keep employment records, pay slips, and written communications as evidence.",
  },
  {
    id: "rti-public-authority-2h",
    title: "RTI Act Section 2(h) — Public authority",
    authority: "Government of India / India Code",
    authority_level: "STATUTORY",
    source_url: "https://www.indiacode.nic.in/handle/123456789/2063",
    section: "Section 2(h)",
    last_verified: "2024-06-01",
    tags: ["rti", "public authority", "section 2(h)", "bureaucracy"],
    content:
      "Under the RTI Act, a public authority means any authority or body established or constituted by or under the Constitution, law, or government notification. Section 2(h) defines public authority and is key to knowing where an RTI application can be filed.",
  },
];

export function searchKnowledge(query: string, state?: string, topK = 5): KnowledgeDoc[] {
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter((t) => t.length > 3);

  const scored = KNOWLEDGE_BASE.map((doc) => {
    const hay = `${doc.title} ${doc.content} ${doc.tags.join(" ")}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (hay.includes(t)) score += 1;
    }
    if (state && doc.state && doc.state.toLowerCase() === state.toLowerCase()) score += 2;
    return { doc, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return KNOWLEDGE_BASE.slice(0, Math.min(topK, KNOWLEDGE_BASE.length));
  }
  return scored.slice(0, topK).map((x) => x.doc);
}
