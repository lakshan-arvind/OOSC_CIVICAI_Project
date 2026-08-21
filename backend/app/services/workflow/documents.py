"""Complaint and RTI draft generation from collected facts only."""

from __future__ import annotations

from typing import Any


DISCLAIMER = "AI-generated draft — verify the details before submitting."


def _contact_line(facts: dict[str, Any]) -> tuple[str, list[str]]:
    placeholders: list[str] = []
    phone = str(facts.get("phone") or "").strip()
    email = str(facts.get("email") or "").strip()
    if phone and email:
        return f"{phone} / {email}", placeholders
    if phone:
        return phone, placeholders
    if email:
        return email, placeholders
    return "[YOUR PHONE / EMAIL]", ["[YOUR PHONE / EMAIL]"]


def _ph(value: Any, placeholder: str) -> tuple[str, bool]:
    if value is None:
        return placeholder, True
    text = str(value).strip()
    if not text:
        return placeholder, True
    return text, False


def generate_grievance_draft(facts: dict[str, Any], jurisdiction: dict[str, Any]) -> dict[str, Any]:
    placeholders: list[str] = []

    name, used = _ph(facts.get("applicant_name"), "[YOUR NAME]")
    if used:
        placeholders.append("[YOUR NAME]")
    address, used = _ph(facts.get("applicant_address"), "[YOUR ADDRESS]")
    if used:
        placeholders.append("[YOUR ADDRESS]")
    complaint_no, used = _ph(facts.get("complaint_number"), "[COMPLAINT NUMBER]")
    if used:
        placeholders.append("[COMPLAINT NUMBER]")
    date, used = _ph(facts.get("complaint_date"), "[DATE OF ORIGINAL COMPLAINT]")
    if used:
        placeholders.append("[DATE OF ORIGINAL COMPLAINT]")

    city = jurisdiction.get("city") or facts.get("city") or "[CITY]"
    state = jurisdiction.get("state") or facts.get("state") or "[STATE]"
    if city == "[CITY]":
        placeholders.append("[CITY]")
    if state == "[STATE]":
        placeholders.append("[STATE]")

    issue = facts.get("issue_type") or facts.get("issue_summary") or "civic service issue"
    location = facts.get("location") or f"{city}, {state}"
    authority = (
        facts.get("authority")
        or jurisdiction.get("local_authority")
        or "[CONCERNED MUNICIPAL / LOCAL AUTHORITY]"
    )
    if "AUTHORITY" in authority:
        placeholders.append(authority)

    contact, contact_ph = _contact_line(facts)
    placeholders.extend(contact_ph)
    doc_date, used = _ph(facts.get("date"), "[DATE]")
    if used:
        placeholders.append("[DATE]")

    body = f"""To
The Commissioner / Competent Authority
{authority}
{city}, {state}

Subject: Unresolved {issue} — request for action

Respected Sir/Madam,

I, {name}, resident of {address}, wish to bring to your notice an unresolved {issue} at {location}.

Details available:
- Nature of issue: {issue}
- Location: {location}
- City / State: {city}, {state}
- Earlier complaint reference (if any): {complaint_no}
- Date of earlier complaint (if any): {date}

I have raised this matter earlier, but the issue remains unresolved. I request that the concerned department examine the matter and take necessary action as per applicable municipal / local body procedures, and inform me of the status.

I am ready to provide any additional information required.

Thank you.

Yours sincerely,
{name}
{address}
Contact: {contact}
Date: {doc_date}
"""

    return {
        "doc_type": "grievance",
        "title": f"Draft municipal complaint — {issue}",
        "body": body.strip(),
        "disclaimer": DISCLAIMER,
        "placeholders_used": sorted(set(placeholders)),
    }


def generate_rti_draft(facts: dict[str, Any], jurisdiction: dict[str, Any]) -> dict[str, Any]:
    placeholders: list[str] = []

    name, used = _ph(facts.get("applicant_name"), "[YOUR NAME]")
    if used:
        placeholders.append("[YOUR NAME]")
    address, used = _ph(facts.get("applicant_address"), "[YOUR ADDRESS]")
    if used:
        placeholders.append("[YOUR ADDRESS]")

    city = jurisdiction.get("city") or facts.get("city") or "[CITY]"
    state = jurisdiction.get("state") or facts.get("state") or "[STATE]"
    if city == "[CITY]":
        placeholders.append("[CITY]")
    if state == "[STATE]":
        placeholders.append("[STATE]")

    authority = (
        facts.get("public_authority")
        or jurisdiction.get("local_authority")
        or facts.get("authority")
        or "[NAME OF PUBLIC AUTHORITY / PIO OFFICE]"
    )
    if authority.startswith("["):
        placeholders.append(authority)

    objective = facts.get("rti_objective") or facts.get("issue_summary") or facts.get("user_goal")
    if not objective:
        objective = "[DESCRIBE THE RECORDED INFORMATION YOU SEEK]"
        placeholders.append(objective)

    period = facts.get("relevant_period") or "[RELEVANT PERIOD, e.g. April 2023 – March 2024]"
    if period.startswith("["):
        placeholders.append(period)

    # Convert objective into record-oriented points
    info_points = facts.get("information_requested")
    if isinstance(info_points, list) and info_points:
        bullets = "\n".join(f"{i+1}. {p}" for i, p in enumerate(info_points))
    else:
        bullets = (
            f"1. Copies of records relating to: {objective}\n"
            f"2. Details of any work orders / sanctions / expenditure related to the above for {period}, if available on record.\n"
            f"3. Status and action-taken records on related complaints, if any, for the same matter and period."
        )

    contact, contact_ph = _contact_line(facts)
    placeholders.extend(contact_ph)
    doc_date, used = _ph(facts.get("date"), "[DATE]")
    if used:
        placeholders.append("[DATE]")

    body = f"""To
The Public Information Officer
{authority}
{city}, {state}

Subject: Request for information under the Right to Information Act, 2005

Respected Sir/Madam,

I, {name}, resident of {address}, hereby request the following information under the RTI Act, 2005.

1. Particulars of the public authority: {authority}

2. Information sought (recorded information):
{bullets}

3. Relevant period: {period}

4. Preferred format: Certified copies / electronic copies, as available.

5. I am a citizen of India. Please intimate any applicable fee as prescribed by the public authority.
   [DO NOT invent fee amount — verify from the authority's RTI rules / portal]

Applicant details:
Name: {name}
Address: {address}
Contact: {contact}

Place: {city}
Date: {doc_date}

Signature: ____________________
"""

    return {
        "doc_type": "rti",
        "title": "Draft RTI application",
        "body": body.strip(),
        "disclaimer": DISCLAIMER,
        "placeholders_used": sorted(set(placeholders)),
    }


def generate_form_draft(facts: dict[str, Any], jurisdiction: dict[str, Any]) -> dict[str, Any]:
    placeholders: list[str] = []
    name, used = _ph(facts.get("applicant_name"), "[YOUR NAME]")
    if used:
        placeholders.append("[YOUR NAME]")
    address, used = _ph(facts.get("applicant_address"), "[YOUR ADDRESS]")
    if used:
        placeholders.append("[YOUR ADDRESS]")
    phone, used = _ph(facts.get("phone"), "[YOUR PHONE]")
    if used:
        placeholders.append("[YOUR PHONE]")
    email, used = _ph(facts.get("email"), "[YOUR EMAIL]")
    if used:
        placeholders.append("[YOUR EMAIL]")

    city = jurisdiction.get("city") or facts.get("city") or "[CITY]"
    state = jurisdiction.get("state") or facts.get("state") or "[STATE]"
    form_type = facts.get("form_type") or facts.get("issue_summary") or "[FORM NAME]"
    if form_type.startswith("["):
        placeholders.append(form_type)

    doc_date, used = _ph(facts.get("date"), "[DATE]")
    if used:
        placeholders.append("[DATE]")

    subject = facts.get("issue_summary") or facts.get("rti_objective") or "[SUBJECT OF REQUEST]"
    if str(subject).startswith("["):
        placeholders.append(str(subject))

    description = facts.get("issue_summary") or facts.get("rti_objective") or "[DESCRIBE YOUR REQUEST IN CLEAR WORDS]"
    if str(description).startswith("["):
        placeholders.append(str(description))

    body = f"""OFFICIAL FORM — PRE-FILLED DRAFT
Form: {form_type}
Jurisdiction: {city}, {state}

────────────────────────────────────────
SECTION A — APPLICANT DETAILS
────────────────────────────────────────
Full name:        {name}
Address:          {address}
City / State:     {city}, {state}
Phone:            {phone}
Email:            {email}

────────────────────────────────────────
SECTION B — REQUEST / COMPLAINT DETAILS
────────────────────────────────────────
Subject:          {subject}

Description:
{description}

Prior reference (if any): {facts.get('complaint_number') or '[REFERENCE NUMBER IF ANY]'}

────────────────────────────────────────
SECTION C — DECLARATION
────────────────────────────────────────
I declare that the information provided above is true to the best of my knowledge.

Place: {city}
Date:  {doc_date}
Signature: ____________________

NOTE: Verify the latest official form, fee, and submission address on the government portal before filing.
"""
    ref = facts.get("complaint_number") or "[REFERENCE NUMBER IF ANY]"
    if str(ref).startswith("["):
        placeholders.append(str(ref))

    return {
        "doc_type": "form",
        "title": f"Pre-filled draft — {form_type}",
        "body": body.strip(),
        "disclaimer": DISCLAIMER,
        "placeholders_used": sorted(set(placeholders)),
    }
