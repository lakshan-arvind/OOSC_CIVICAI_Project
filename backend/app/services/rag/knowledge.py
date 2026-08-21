"""Curated authoritative civic knowledge for grounded answers without external APIs."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class KnowledgeDoc:
    id: str
    title: str
    authority: str
    authority_level: str  # OFFICIAL | STATUTORY | COURT | TRUSTED_SECONDARY | UNKNOWN
    source_url: str
    content: str
    section: Optional[str] = None
    page: Optional[str] = None
    last_verified: str = "2024-01-01"
    state: Optional[str] = None
    document_type: str = "guidance"
    government_level: str = "national"
    language: str = "en"
    tags: list[str] = field(default_factory=list)


KNOWLEDGE_BASE: list[KnowledgeDoc] = [
    KnowledgeDoc(
        id="rti-act-2005-overview",
        title="Right to Information Act, 2005 — Overview",
        authority="Government of India / India Code",
        authority_level="STATUTORY",
        source_url="https://www.indiacode.nic.in/handle/123456789/2063",
        section="Preamble & Section 6",
        last_verified="2024-06-01",
        document_type="statute",
        government_level="national",
        tags=["rti", "information", "public authority", "application"],
        content=(
            "The Right to Information Act, 2005 provides a practical regime of right to information "
            "for citizens to secure access to information under the control of public authorities. "
            "Under Section 6, a person seeking information shall make a request in writing or through "
            "electronic means in English or Hindi or in the official language of the area, specifying "
            "particulars of the information sought. The Act does not require the applicant to give "
            "reasons for requesting the information. Fees and submission channels vary by public "
            "authority; applicants should verify the current fee and address from the concerned "
            "public authority or State/Central Information Commission guidance."
        ),
    ),
    KnowledgeDoc(
        id="rti-section-7-timeline",
        title="RTI Act Section 7 — Disposal of request",
        authority="Government of India / India Code",
        authority_level="STATUTORY",
        source_url="https://www.indiacode.nic.in/handle/123456789/2063",
        section="Section 7",
        last_verified="2024-06-01",
        document_type="statute",
        government_level="national",
        tags=["rti", "timeline", "30 days", "appeal"],
        content=(
            "Section 7 of the RTI Act provides that the Central Public Information Officer or State "
            "Public Information Officer shall, as expeditiously as possible, and in any case within "
            "thirty days of the receipt of the request, either provide the information on payment of "
            "such fee as may be prescribed or reject the request for any of the reasons specified in "
            "sections 8 and 9. Where information concerns life or liberty of a person, it shall be "
            "provided within forty-eight hours. If no decision is given within the time, it may be "
            "deemed a refusal, and the applicant may pursue the appeal process under the Act."
        ),
    ),
    KnowledgeDoc(
        id="cpgrams-overview",
        title="Centralized Public Grievance Redress and Monitoring System (CPGRAMS)",
        authority="Department of Administrative Reforms & Public Grievances (DARPG)",
        authority_level="OFFICIAL",
        source_url="https://pgportal.gov.in/",
        section="About CPGRAMS",
        last_verified="2024-08-01",
        document_type="portal",
        government_level="national",
        tags=["grievance", "complaint", "cpgrams", "escalation", "municipality"],
        content=(
            "CPGRAMS is the Government of India's online grievance redress mechanism. Citizens can "
            "lodge grievances related to service delivery by Central Government ministries/departments "
            "and participating organisations through https://pgportal.gov.in/. Users should keep the "
            "registration/reference number for tracking. For purely local municipal issues, citizens "
            "should first use the relevant State or Municipal Corporation grievance portal where "
            "available, and may escalate through higher authorities or State grievance systems as "
            "applicable. Exact escalation paths depend on the State and local body."
        ),
    ),
    KnowledgeDoc(
        id="tamil-nadu-municipal-grievance",
        title="Tamil Nadu municipal / urban local body grievance guidance",
        authority="Government of Tamil Nadu / Greater Chennai Corporation public services",
        authority_level="OFFICIAL",
        source_url="https://chennaicorporation.gov.in/",
        section="Citizen services / complaints",
        last_verified="2024-08-01",
        state="Tamil Nadu",
        document_type="portal",
        government_level="local",
        tags=["chennai", "tamil nadu", "drainage", "garbage", "roads", "municipality", "complaint"],
        content=(
            "For civic issues in Chennai such as drainage blockage, garbage, roads, streetlights, and "
            "water supply, citizens may lodge complaints with Greater Chennai Corporation through its "
            "official citizen services channels (including the corporation website and designated "
            "helplines/apps as published by GCC). Keep the complaint reference number and date. If a "
            "complaint remains unresolved, citizens may follow up with the ward/zone office, use the "
            "corporation grievance tracking facility, and where appropriate escalate through Tamil Nadu "
            "State grievance mechanisms or seek recorded information under the RTI Act from the "
            "concerned public authority. Always verify current submission channels on the official "
            "GCC/State portal before filing."
        ),
    ),
    KnowledgeDoc(
        id="municipal-services-general",
        title="Municipal civic service complaints — general process",
        authority="Ministry of Housing and Urban Affairs / Urban Local Bodies (general guidance)",
        authority_level="TRUSTED_SECONDARY",
        source_url="https://mohua.gov.in/",
        section="Urban governance — citizen services",
        last_verified="2024-05-01",
        document_type="guidance",
        government_level="national",
        tags=["municipality", "drainage", "garbage", "roads", "streetlights", "water", "complaint"],
        content=(
            "Urban local bodies (municipal corporations/municipalities) are generally responsible for "
            "local civic services such as drainage, solid waste, roads, street lighting, and local "
            "water distribution within their jurisdiction. Typical citizen steps: (1) identify the "
            "correct local body for the location; (2) lodge a complaint through the official municipal "
            "portal/helpline and note the reference number; (3) follow up if unresolved within the "
            "published service timelines; (4) escalate within the municipal hierarchy or State urban "
            "development/grievance channels as applicable; (5) where needed, request recorded "
            "information under RTI about complaint status, works sanctioned, or expenditure. Exact "
            "portals, fees, and timelines vary by State and city and must be verified from official "
            "sources for that jurisdiction."
        ),
    ),
    KnowledgeDoc(
        id="rti-drafting-practice",
        title="Good practice for drafting RTI requests",
        authority="Central Information Commission / RTI Act practice notes (summary)",
        authority_level="TRUSTED_SECONDARY",
        source_url="https://cic.gov.in/",
        section="Filing RTI applications",
        last_verified="2024-06-01",
        document_type="guidance",
        government_level="national",
        tags=["rti", "draft", "records", "public authority"],
        content=(
            "Effective RTI requests seek recorded information held by a public authority rather than "
            "opinions or explanations. Applicants should identify the public authority likely to hold "
            "the records, state the information sought clearly (e.g., copies of work orders, sanction "
            "amounts, dates of complaints and action taken), specify the relevant period, and indicate "
            "preferred format (inspection/copies). Do not invent PIO addresses or fee amounts; obtain "
            "them from the public authority's RTI disclosures or official portal. Mark drafts clearly "
            "as drafts until verified."
        ),
    ),
    KnowledgeDoc(
        id="consumer-protection-act-2019",
        title="Consumer Protection Act, 2019 — remedies for defective goods and services",
        authority="Government of India / India Code",
        authority_level="STATUTORY",
        source_url="https://www.indiacode.nic.in/handle/123456789/13624",
        section="Consumer rights & commissions",
        last_verified="2024-06-01",
        document_type="statute",
        government_level="national",
        tags=["consumer", "warranty", "refund", "defective", "consumer forum", "rights"],
        content=(
            "The Consumer Protection Act, 2019 protects consumers against defective products and "
            "deficient services. Consumers may first complain to the seller or manufacturer in writing. "
            "If the dispute is not resolved, consumers may approach the appropriate Consumer Disputes "
            "Redressal Commission based on the value of the claim, as prescribed under the Act and rules. "
            "Consumers should preserve invoices, warranty cards, and communication records."
        ),
    ),
    KnowledgeDoc(
        id="tenant-rights-general",
        title="Tenant and landlord disputes — security deposit and State tenancy rules",
        authority="Ministry of Housing and Urban Affairs / State tenancy frameworks (summary)",
        authority_level="TRUSTED_SECONDARY",
        source_url="https://mohua.gov.in/",
        section="Urban housing — tenancy",
        last_verified="2024-05-01",
        document_type="guidance",
        government_level="national",
        tags=["tenant", "landlord", "rent", "security deposit", "eviction", "lease", "rights"],
        content=(
            "Landlord-tenant disputes including non-return of security deposits are governed by applicable "
            "State rent control or tenancy laws and rental agreements. Tenants should keep the rent agreement, "
            "deposit receipts, and evidence of handover condition. Many States provide dispute resolution "
            "through rent control authorities or applicable forums; exact procedures vary by State and must "
            "be verified on the official State portal."
        ),
    ),
    KnowledgeDoc(
        id="labour-wage-complaints",
        title="Unpaid wages — labour department grievance channels",
        authority="Ministry of Labour & Employment / State labour departments (summary)",
        authority_level="TRUSTED_SECONDARY",
        source_url="https://labour.gov.in/",
        section="Wage protection",
        last_verified="2024-05-01",
        document_type="guidance",
        government_level="national",
        tags=["workplace", "employer", "salary", "wages", "labour", "rights"],
        content=(
            "Workers facing unpaid wages may raise the matter with the employer in writing and preserve "
            "employment records, payslips, and bank statements. State labour departments and labour "
            "commissioners provide official channels for wage-related complaints under applicable labour "
            "laws. Industrial dispute procedures may apply depending on the nature of employment; verify "
            "the correct State labour portal before filing."
        ),
    ),
    KnowledgeDoc(
        id="pm-kisan-eligibility",
        title="PM-KISAN — eligibility overview",
        authority="Ministry of Agriculture & Farmers Welfare",
        authority_level="OFFICIAL",
        source_url="https://pmkisan.gov.in/",
        section="Scheme guidelines",
        last_verified="2024-08-01",
        document_type="scheme",
        government_level="national",
        state="Tamil Nadu",
        tags=["pm-kisan", "pm kisan", "scheme", "eligibility", "farmer", "agriculture"],
        content=(
            "PM-KISAN provides income support to eligible landholding farmer families subject to scheme "
            "exclusion criteria published on https://pmkisan.gov.in/. Eligibility depends on land records, "
            "farmer family definition, and exclusion categories such as certain institutional landholders "
            "and income tax payers in higher brackets as notified. Applicants must register through the "
            "official PM-KISAN portal or authorised channels and verify State-specific land record requirements."
        ),
    ),
    KnowledgeDoc(
        id="rti-section-2h-public-authority",
        title="RTI Act Section 2(h) — definition of public authority (plain summary)",
        authority="Government of India / India Code",
        authority_level="STATUTORY",
        source_url="https://www.indiacode.nic.in/handle/123456789/2063",
        section="Section 2(h)",
        last_verified="2024-06-01",
        document_type="statute",
        government_level="national",
        tags=["bureaucracy", "public authority", "section 2(h)", "rti", "explain", "plain language"],
        content=(
            "Section 2(h) of the Right to Information Act, 2005 defines 'public authority' to mean any "
            "authority or body or institution of self-government established or constituted by or under "
            "the Constitution, by any law made by Parliament or a State Legislature, or by notification "
            "issued by the appropriate Government. It also includes bodies owned, controlled, or substantially "
            "financed by the Government. In simple terms: if a government department, municipality, or "
            "government-controlled body holds the records you need, it is likely a public authority for RTI."
        ),
    ),
    KnowledgeDoc(
        id="official-form-filling-guidance",
        title="Filling official government application forms — general guidance",
        authority="Digital India / government citizen services (summary)",
        authority_level="TRUSTED_SECONDARY",
        source_url="https://www.india.gov.in/",
        section="Citizen services",
        last_verified="2024-05-01",
        document_type="guidance",
        government_level="national",
        tags=["form", "application form", "fill", "prefill", "rti application", "complaint form"],
        content=(
            "Official government forms should be completed with accurate personal details, a clear subject, "
            "and specific information requested. For RTI forms, describe records sought rather than opinions. "
            "For grievance forms, include location, dates, and prior reference numbers if any. Always use "
            "the latest form version from the official portal and verify submission address and fee before filing."
        ),
    ),
]


def search_knowledge(
    query: str,
    *,
    state: Optional[str] = None,
    top_k: int = 5,
) -> list[KnowledgeDoc]:
    q = query.lower()
    tokens = [t for t in q.replace(",", " ").split() if len(t) > 2]

    scored: list[tuple[float, KnowledgeDoc]] = []
    for doc in KNOWLEDGE_BASE:
        score = 0.0
        hay = f"{doc.title} {doc.content} {' '.join(doc.tags)}".lower()
        for t in tokens:
            if t in hay:
                score += 1.0
        for tag in doc.tags:
            if tag in q:
                score += 2.0
        if state and doc.state and state.lower() in doc.state.lower():
            score += 3.0
        if "chennai" in q and "chennai" in hay:
            score += 3.0
        if "rti" in q and "rti" in doc.tags:
            score += 2.0
        if any(w in q for w in ("consumer", "tenant", "landlord", "employer", "salary", "warranty")):
            if any(t in doc.tags for t in ("consumer", "tenant", "workplace", "rights")):
                score += 2.5
        if any(w in q for w in ("eligible", "eligibility", "pm-kisan", "pm kisan", "scheme")):
            if any(t in doc.tags for t in ("scheme", "eligibility", "pm-kisan", "pm kisan")):
                score += 2.5
        if any(w in q for w in ("public authority", "section 2", "bureaucracy", "plain language", "explain")):
            if any(t in doc.tags for t in ("bureaucracy", "public authority", "plain language")):
                score += 2.5
        if any(w in q for w in ("form", "fill", "application form")):
            if any(t in doc.tags for t in ("form", "application form", "fill")):
                score += 2.0
        if any(w in q for w in ("drainage", "garbage", "municip", "complaint", "grievance")):
            if any(t in doc.tags for t in ("drainage", "municipality", "grievance", "complaint", "chennai")):
                score += 2.0
        if score > 0:
            # Prefer higher authority
            boost = {
                "STATUTORY": 1.5,
                "OFFICIAL": 1.3,
                "COURT": 1.2,
                "TRUSTED_SECONDARY": 1.0,
                "UNKNOWN": 0.2,
            }.get(doc.authority_level, 0.5)
            scored.append((score * boost, doc))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [d for _, d in scored[:top_k]]
