"""Evidence validation and claim checking."""

from __future__ import annotations

from typing import Any


ALLOWED_AUTHORITY = {"OFFICIAL", "STATUTORY", "COURT", "TRUSTED_SECONDARY"}


def validate_evidence(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    validated = []
    for item in items:
        level = (item.get("authority_level") or "UNKNOWN").upper()
        content = (item.get("content") or "").strip()
        if not content:
            continue
        if level == "UNKNOWN":
            continue
        if level not in ALLOWED_AUTHORITY:
            continue
        validated.append({**item, "authority_level": level})
    return validated


def evidence_level_for(items: list[dict[str, Any]]) -> str:
    if not items:
        return "insufficient"
    levels = {i.get("authority_level") for i in items}
    if "STATUTORY" in levels or "OFFICIAL" in levels:
        if len(items) >= 2:
            return "high"
        return "moderate"
    if "TRUSTED_SECONDARY" in levels:
        return "limited"
    return "insufficient"


def validate_claims_against_evidence(
    claims: list[str],
    evidence: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Keep only claims that have keyword overlap with evidence chunks."""
    results = []
    evidence_text = " ".join((e.get("content") or "") for e in evidence).lower()
    for claim in claims:
        tokens = [t for t in claim.lower().split() if len(t) > 4]
        hits = sum(1 for t in tokens if t in evidence_text)
        supported = hits >= max(1, len(tokens) // 4) if tokens else False
        chunk_ids = []
        if supported:
            for e in evidence:
                et = (e.get("content") or "").lower()
                if any(t in et for t in tokens[:6]):
                    chunk_ids.append(e.get("id") or e.get("source_id") or "")
        results.append(
            {
                "claim": claim,
                "supporting_chunk_ids": [c for c in chunk_ids if c],
                "supported": supported,
            }
        )
    return results


def filter_supported_texts(
    texts: list[str],
    evidence: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    checked = validate_claims_against_evidence(texts, evidence)
    out = []
    for c in checked:
        if not c["supported"]:
            continue
        out.append(
            {
                "text": c["claim"],
                "citation_ids": c["supporting_chunk_ids"],
            }
        )
    return out
