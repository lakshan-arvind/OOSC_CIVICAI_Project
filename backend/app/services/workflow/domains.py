"""Domain detection and workflow helpers for CivicAI agents."""

from __future__ import annotations

import re
from typing import Any, Optional

DOMAIN_LABELS: dict[str, str] = {
    "grievance": "Municipal service complaint",
    "rti": "RTI drafting",
    "rights_navigator": "Rights navigator",
    "scheme_eligibility": "Scheme eligibility",
    "form_filler": "Conversational form-filler",
    "bureaucracy": "Bureaucracy translator",
    "other": "Civic query",
}

VALID_DOMAINS = set(DOMAIN_LABELS.keys()) - {"other"}


def detect_rights_area(text: str) -> str:
    lower = text.lower()
    if any(w in lower for w in ("landlord", "tenant", "rent", "lease", "security deposit", "eviction")):
        return "tenant"
    if any(w in lower for w in ("employer", "salary", "workplace", "wages", "labour", "labor", "termination", "fired")):
        return "workplace"
    if any(w in lower for w in ("consumer", "warranty", "refund", "defective", "shop", "seller", "product")):
        return "consumer"
    return "general"


def heuristic_domain(text: str) -> str:
    lower = text.lower()

    if any(
        w in lower
        for w in (
            "what does",
            "mean in simple",
            "plain language",
            "plain words",
            "simple words",
            "explain this",
            "bureaucracy",
            "section 2(h)",
            "translate this",
            "in simple terms",
        )
    ):
        return "bureaucracy"

    if any(
        w in lower
        for w in (
            "fill the form",
            "fill out",
            "application form",
            "help me fill",
            "auto-populate",
            "form-filler",
            "prefill",
            "pre-fill",
        )
    ):
        return "form_filler"

    if any(
        w in lower
        for w in (
            "eligible",
            "eligibility",
            "am i eligible",
            "can i get",
            "pm-kisan",
            "pm kisan",
            "ayushman",
            "mgnrega",
            "pension scheme",
            "government scheme",
        )
    ):
        return "scheme_eligibility"

    if any(
        w in lower
        for w in (
            "landlord",
            "tenant",
            "security deposit",
            "eviction",
            "consumer forum",
            "warranty",
            "refund",
            "defective",
            "employer",
            "salary",
            "workplace",
            "wrongful termination",
            "not paid my salary",
        )
    ):
        return "rights_navigator"

    if "rti" in lower or "right to information" in lower:
        return "rti"
    if ("how much" in lower or "spent" in lower or "expenditure" in lower) and any(
        w in lower for w in ("municipality", "municipal", "road", "government", "department")
    ):
        return "rti"

    return "grievance"


def enrich_facts(text: str, facts: dict[str, Any]) -> dict[str, Any]:
    lower = text.lower()
    out = dict(facts)

    area = detect_rights_area(text)
    if area != "general":
        out["rights_area"] = area

    if "pm-kisan" in lower or "pm kisan" in lower:
        out["scheme_name"] = "PM-KISAN"
    elif "ayushman" in lower:
        out["scheme_name"] = "Ayushman Bharat"
    elif "mgnrega" in lower or "nrega" in lower:
        out["scheme_name"] = "MGNREGA"

    if "form_filler" in out.get("domain", "") or any(w in lower for w in ("fill", "form")):
        if "rti" in lower:
            out["form_type"] = "RTI application"
        elif "grievance" in lower or "complaint" in lower:
            out["form_type"] = "Grievance / complaint form"

    if "bureaucracy" in lower or "section 2(h)" in lower or "public authority" in lower:
        out["term_to_explain"] = text.strip()[:300]

    return out


def clarification_needed(
    domain: str,
    jurisdiction: dict[str, Any],
    facts: dict[str, Any],
    *,
    language: str = "en",
) -> tuple[bool, Optional[str], list[str]]:
    missing: list[str] = []
    jur = jurisdiction or {}

    if domain == "bureaucracy":
        return False, None, []

    if domain in {"scheme_eligibility", "rights_navigator", "rti"}:
        if not jur.get("state"):
            missing.append("state")
            q = (
                "Which state is this about?"
                if language != "hi"
                else "यह किस राज्य से संबंधित है?"
            )
            return True, q, missing
        return False, None, []

    if domain == "form_filler":
        if not jur.get("state") or not jur.get("city"):
            missing.extend([m for m in ("state", "city") if not jur.get(m)])
            q = (
                "Which city and state should this form be filed in?"
                if language != "hi"
                else "यह फॉर्म किस शहर और राज्य में दाखिल करना है?"
            )
            return True, q, missing
        if not facts.get("form_type"):
            missing.append("form_type")
            q = "Which official form do you need help with (e.g., RTI application, grievance form)?"
            return True, q, missing
        return False, None, []

    # grievance and default
    if not jur.get("state") or not jur.get("city"):
        missing.extend([m for m in ("state", "city") if not jur.get(m)])
        q = (
            "Which city and state is this issue about?"
            if language != "hi"
            else "यह समस्या किस शहर और राज्य में है?"
        )
        return True, q, missing
    return False, None, []


def search_query(domain: str, facts: dict[str, Any], jurisdiction: dict[str, Any], user_query: str) -> str:
    city = jurisdiction.get("city") or ""
    state = jurisdiction.get("state") or ""
    issue = facts.get("issue_type") or facts.get("scheme_name") or facts.get("rights_area") or ""

    queries = {
        "rti": f"RTI Act India public authority records {issue} {city} {state} official",
        "rights_navigator": f"India {facts.get('rights_area', 'consumer')} rights dispute {issue} {state} official gov.in",
        "scheme_eligibility": f"India {facts.get('scheme_name', 'government scheme')} eligibility criteria {state} official portal",
        "form_filler": f"India {facts.get('form_type', 'application form')} official format {city} {state}",
        "bureaucracy": f"RTI Act India public authority section explanation official indiacode",
        "grievance": f"{issue} complaint municipal corporation {city} {state} India official",
    }
    base = queries.get(domain, queries["grievance"])
    return re.sub(r"\s+", " ", f"{base} {user_query[:120]}").strip()


def candidate_claims(domain: str, facts: dict[str, Any], jurisdiction: dict[str, Any]) -> list[str]:
    city = jurisdiction.get("city")
    state = jurisdiction.get("state")
    area = facts.get("rights_area", "general")

    if domain == "rti":
        return [
            "Citizens can request recorded information from public authorities under the Right to Information Act, 2005.",
            "An RTI request should specify the particulars of the information sought and the relevant public authority.",
            "Under Section 7 of the RTI Act, requests are generally to be disposed of within thirty days of receipt, subject to the Act.",
        ]

    if domain == "rights_navigator":
        if area == "tenant":
            return [
                "State rent control and tenancy laws govern landlord-tenant disputes including security deposits in many States.",
                "Tenants may document the tenancy, notice period, and deposit payment before approaching the relevant rent authority or consumer forum as applicable.",
                "Citizens should verify the applicable State tenancy rules and official dispute resolution channels before taking action.",
            ]
        if area == "workplace":
            return [
                "Unpaid wages and certain employment disputes may be addressed through labour department mechanisms and industrial dispute procedures under applicable labour laws.",
                "Workers should keep employment records, pay slips, and written communications as evidence.",
                "Official labour commissioner / labour department channels exist at State level for wage-related complaints.",
            ]
        if area == "consumer":
            return [
                "The Consumer Protection Act, 2019 provides remedies for defective goods and deficient services through consumer commissions.",
                "Consumers may first raise a written complaint with the seller/manufacturer and preserve invoices and warranty documents.",
                "If unresolved, consumers may approach the appropriate consumer commission based on the value of the claim, as per official rules.",
            ]
        return [
            "Citizens facing disputes should identify the applicable law and the official redress channel for that subject.",
            "Keeping written records and official receipts helps in any complaint or legal process.",
        ]

    if domain == "scheme_eligibility":
        scheme = facts.get("scheme_name") or "the scheme"
        return [
            f"Government schemes such as {scheme} publish eligibility criteria on official ministry or State portals.",
            "Eligibility often depends on factors such as landholding, income, age, occupation, and residence — verify on the official scheme portal.",
            "Applicants should apply only through official government channels and avoid sharing sensitive data with unofficial agents.",
        ]

    if domain == "form_filler":
        return [
            "Official application forms should be filled using accurate personal details and clear descriptions of the request or complaint.",
            "For RTI applications, applicants must seek recorded information and identify the public authority likely to hold the records.",
            "Verify the current form format, fee, and submission address from the official portal before submitting.",
        ]

    if domain == "bureaucracy":
        return [
            "Under the RTI Act, a 'public authority' means any authority or body established or constituted by or under the Constitution, law, or government notification.",
            "Section 2(h) of the RTI Act defines public authority and is key to knowing where an RTI application can be filed.",
            "Citizens do not need legal training — they need to identify which government body holds the records they want.",
        ]

    claims = [
        "Urban local bodies are generally responsible for local civic services such as drainage within their jurisdiction.",
        "Citizens should lodge municipal complaints through official municipal channels and keep the complaint reference number.",
        "If a municipal complaint remains unresolved, citizens may follow up with the local body and may use applicable State or Central grievance mechanisms.",
    ]
    if city == "Chennai":
        claims.insert(
            1,
            "For civic issues in Chennai, citizens may use Greater Chennai Corporation official citizen service channels to lodge and track complaints.",
        )
    return claims


def build_summary(domain: str, facts: dict[str, Any], jurisdiction: dict[str, Any]) -> str:
    city = jurisdiction.get("city") or "your area"
    state = jurisdiction.get("state") or "your state"

    if domain == "rti":
        obj = facts.get("rti_objective") or facts.get("issue_summary") or "recorded information"
        return f"You want to request recorded information about: {obj} ({city}, {state})."

    if domain == "rights_navigator":
        area = facts.get("rights_area", "general")
        labels = {"tenant": "tenant/landlord", "consumer": "consumer", "workplace": "workplace", "general": "rights"}
        return f"You asked what you can do about a {labels.get(area, 'rights')} dispute in {state}."

    if domain == "scheme_eligibility":
        scheme = facts.get("scheme_name") or "a government scheme"
        return f"You asked whether you are eligible for {scheme} in {state}."

    if domain == "form_filler":
        form = facts.get("form_type") or "an official form"
        return f"You need help filling {form} for {city}, {state}."

    if domain == "bureaucracy":
        term = facts.get("term_to_explain") or "a government term"
        short = term[:120] + ("..." if len(term) > 120 else "")
        return f"You asked for a plain-language explanation of: {short}"

    issue = facts.get("issue_type") or "civic issue"
    prior = "unresolved " if facts.get("has_prior_complaint") else ""
    return f"You reported an {prior}{issue} complaint to a municipal authority in {city}, {state}."


def action_plan(domain: str, facts: dict[str, Any], jurisdiction: dict[str, Any]) -> tuple[list[str], list[str]]:
    area = facts.get("rights_area", "general")

    if domain == "rti":
        return (
            [
                "Identify the public authority that is likely to hold the records you need.",
                "Write clear requests for recorded information (not opinions or explanations).",
                "Verify the PIO address and applicable fee from the authority's official RTI page before submitting.",
                "Keep a copy of your application and proof of submission for follow-up or appeal timelines under the RTI Act.",
            ],
            [
                "Your full name and postal address",
                "Clear description of records sought",
                "Relevant period (dates)",
                "Any known file/complaint/work reference numbers",
            ],
        )

    if domain == "rights_navigator":
        if area == "tenant":
            actions = [
                "Collect your rent agreement, deposit receipt, and move-out evidence.",
                "Send a written request to the landlord for deposit return with a reasonable timeline.",
                "Check your State's tenancy / rent control rules on the official State portal.",
                "If unresolved, approach the applicable rent authority or consumer forum as per State rules.",
            ]
            docs = ["Rent agreement", "Deposit payment proof", "Move-out photos/messages", "Identity proof"]
        elif area == "workplace":
            actions = [
                "Document unpaid salary periods with payslips, bank records, or employment letters.",
                "Raise a written complaint to your employer requesting payment.",
                "Approach the State labour department / labour commissioner through official channels.",
                "Keep copies of all complaints for any further labour dispute process.",
            ]
            docs = ["Employment proof", "Payslips or bank statements", "Written complaint copy", "Appointment letter if available"]
        elif area == "consumer":
            actions = [
                "Keep the invoice, warranty card, and all communication with the seller.",
                "Send a written complaint to the shop/manufacturer asking for repair, replacement, or refund.",
                "Use the National Consumer Helpline or official consumer portal to register the grievance.",
                "If unresolved, file before the appropriate Consumer Commission as per claim value rules.",
            ]
            docs = ["Invoice / bill", "Warranty card", "Product photos", "Complaint emails or messages"]
        else:
            actions = ["Identify the type of dispute and the official redress body.", "Gather written evidence.", "Use official complaint channels."]
            docs = ["Identity proof", "Written records", "Receipts or agreements"]
        return actions, docs

    if domain == "scheme_eligibility":
        scheme = facts.get("scheme_name") or "the scheme"
        return (
            [
                f"Check the official {scheme} portal for eligibility criteria applicable in your State.",
                "Gather land/income/identity documents listed on the official portal.",
                "Apply only through the official government website or designated Common Service Centre.",
                "Track application status using the official reference number — avoid unofficial agents.",
            ],
            [
                "Aadhaar / identity proof",
                "Land or income records as required by the scheme",
                "Bank account details for benefit transfer",
                "Residence proof if required on the official portal",
            ],
        )

    if domain == "form_filler":
        return (
            [
                "Answer CivicAI's questions so each form field can be filled accurately.",
                "Review every field marked with a placeholder before submitting.",
                "Verify the official form version and submission address on the government portal.",
                "Attach supporting documents listed on the official form instructions.",
            ],
            [
                "Full name and address",
                "Contact phone / email",
                "Details of your request or complaint",
                "Supporting documents listed on the official form",
            ],
        )

    if domain == "bureaucracy":
        return (
            [
                "Use the plain-language explanation alongside the official source linked below.",
                "If you need records from that body, prepare an RTI request naming the public authority clearly.",
                "Verify any fee, address, or timeline on the official portal before acting.",
            ],
            [
                "The official source or statute section (if applicable)",
                "Your specific question in simple words",
            ],
        )

    authority = jurisdiction.get("local_authority") or "your municipal / local body"
    actions = [
        f"Check the status of your existing complaint with {authority}, if you already filed one.",
        "Collect your complaint/reference number, date, and any screenshots or acknowledgements.",
        "Submit or escalate through the applicable official grievance process for your city/State.",
        "If appropriate, prepare an RTI application to request recorded information about action taken or related works.",
    ]
    if facts.get("has_prior_complaint"):
        actions.insert(
            2,
            "If the complaint remains unresolved beyond the local body's published timelines, escalate within the municipal hierarchy or State grievance channels as applicable.",
        )
    return actions, [
        "Complaint/reference number",
        "Date of original complaint",
        "Copy/screenshot of complaint acknowledgement",
        "Exact location of the issue",
        "Your contact details for follow-up",
    ]
