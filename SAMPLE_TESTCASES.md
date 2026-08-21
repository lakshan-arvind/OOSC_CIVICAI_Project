# CivicAI — Sample Test Cases

These sample queries map to the five CivicAI agents plus the municipal grievance baseline.
Automated tests live in `backend/tests/test_workflows.py` (run with `python -m pytest -q`).

| Agent | Sample query | Follow-up (if asked) | Expected domain |
|-------|--------------|----------------------|-----------------|
| **RTI Drafting** | I want to know how much the municipality spent repairing the road on my street last year. | Mumbai, Maharashtra | `rti` |
| **Rights Navigator — tenant** | My landlord is refusing to return my security deposit after I moved out in Bangalore. | — | `rights_navigator` |
| **Rights Navigator — consumer** | I bought a defective phone and the shop is not giving a refund under warranty. | Delhi | `rights_navigator` |
| **Rights Navigator — workplace** | My employer has not paid my salary for two months. | Pune, Maharashtra | `rights_navigator` |
| **Scheme Eligibility Reader** | Am I eligible for PM-KISAN if I own 2 acres of farmland in rural Tamil Nadu? | — | `scheme_eligibility` |
| **Conversational Form-Filler** | Help me fill the RTI application form to ask about water supply complaints. | Chennai, Tamil Nadu | `form_filler` |
| **Bureaucracy Translator** | What does 'public authority under Section 2(h) of RTI Act' mean in simple words? | — | `bureaucracy` |
| **Municipal grievance** | My municipality hasn't fixed the drainage problem despite several complaints. | Chennai, Tamil Nadu | `grievance` |

## What “passing” means

For each case the backend should:

1. Classify the correct **domain**
2. Ask clarification only when location/details are missing
3. Return `status: ready` with **actions**, **sources**, and a plain-language **summary**
4. Generate drafts when applicable (`/drafts/rti`, `/drafts/grievance`, `/drafts/form`)

## Manual UI check

1. Open http://localhost:3000
2. Click any **sample workflow** chip on the homepage
3. Answer clarification questions if shown
4. Confirm sections: *Your situation*, *What official sources say*, *What you can do*, *Official sources*
5. Resize the browser to phone width — layout should stay readable (single column, large buttons)
