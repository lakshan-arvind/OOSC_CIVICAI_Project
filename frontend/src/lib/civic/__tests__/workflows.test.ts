import { describe, expect, it } from "vitest";
import { WORKFLOW_EXAMPLES } from "@/components/HomeHero";
import { generateFormDraft, generateGrievanceDraft, generateRtiDraft } from "../documents";
import { getTranslations } from "../../i18n/translations";
import { LOCALES } from "../../i18n/types";
import { runWorkflow } from "../workflow";

function runCase(query: string, followUp?: string, language: "en" | "hi" | "ta" = "en") {
  const first = runWorkflow({
    caseId: "test-case",
    userQuery: query,
    latestMessage: query,
    language,
  });
  if (followUp && first.status === "collecting") {
    return runWorkflow({
      caseId: "test-case",
      userQuery: query,
      latestMessage: followUp,
      language,
      prior: first,
    });
  }
  return first;
}

describe("All 8 workflow agents", () => {
  const cases: Array<{
    key: string;
    query: string;
    followUp?: string;
    domain: string;
    extra?: (state: ReturnType<typeof runCase>) => void;
  }> = [
    {
      key: "rti",
      query: WORKFLOW_EXAMPLES[0].query,
      followUp: "Mumbai, Maharashtra",
      domain: "rti",
    },
    {
      key: "tenant",
      query: WORKFLOW_EXAMPLES[1].query,
      domain: "rights_navigator",
      extra: (s) => expect(s.facts.rights_area).toBe("tenant"),
    },
    {
      key: "consumer",
      query: WORKFLOW_EXAMPLES[2].query,
      followUp: "Delhi",
      domain: "rights_navigator",
      extra: (s) => expect(s.facts.rights_area).toBe("consumer"),
    },
    {
      key: "workplace",
      query: WORKFLOW_EXAMPLES[3].query,
      followUp: "Pune, Maharashtra",
      domain: "rights_navigator",
      extra: (s) => expect(s.facts.rights_area).toBe("workplace"),
    },
    {
      key: "scheme",
      query: WORKFLOW_EXAMPLES[4].query,
      domain: "scheme_eligibility",
      extra: (s) => expect(s.facts.scheme_name).toBe("PM-KISAN"),
    },
    {
      key: "form",
      query: WORKFLOW_EXAMPLES[5].query,
      followUp: "Chennai, Tamil Nadu",
      domain: "form_filler",
    },
    {
      key: "bureaucracy",
      query: WORKFLOW_EXAMPLES[6].query,
      domain: "bureaucracy",
    },
    {
      key: "grievance",
      query: WORKFLOW_EXAMPLES[7].query,
      followUp: "Chennai, Tamil Nadu",
      domain: "grievance",
    },
  ];

  for (const c of cases) {
    it(`classifies and responds for ${c.key}`, () => {
      const state = runCase(c.query, c.followUp);
      expect(state.domain).toBe(c.domain);
      expect(state.status).toBe("ready");
      expect(state.action_plan.length).toBeGreaterThan(0);
      if (c.extra) c.extra(state);
    });
  }
});

describe("RTI Drafting Agent", () => {
  it("returns Hindi response when language is hi", () => {
    const state = runCase(
      WORKFLOW_EXAMPLES[0].query,
      "Mumbai, Maharashtra",
      "hi"
    );
    expect(state.language).toBe("hi");
    expect(state.message).toMatch(/आधिकारिक|CivicAI/);
  });
});

describe("Rights Navigator", () => {
  it("handles workplace dispute with localized actions", () => {
    const state = runCase(WORKFLOW_EXAMPLES[3].query, "Pune, Maharashtra");
    expect(state.action_plan.some((a) => /labour|salary|employer|श्रम|சம்பள/i.test(a))).toBe(
      true
    );
  });
});

describe("Scheme Eligibility Reader", () => {
  it("answers PM-KISAN eligibility in Tamil Nadu", () => {
    const state = runCase(WORKFLOW_EXAMPLES[4].query);
    expect(state.summary.toLowerCase()).toMatch(/pm-kisan|scheme|योजना|திட்டம்/);
  });
});

describe("Conversational Form-Filler", () => {
  it("guides form filling and generates draft with applicant section", () => {
    const state = runCase(WORKFLOW_EXAMPLES[5].query, "Chennai, Tamil Nadu");
    const draft = generateFormDraft(state.facts, state.jurisdiction);
    expect(draft.body).toContain("APPLICANT DETAILS");
    expect(draft.body).toContain("[YOUR NAME]");
  });

  it("generates Tamil form draft when language is ta", () => {
    const state = runCase(WORKFLOW_EXAMPLES[5].query, "Chennai, Tamil Nadu", "ta");
    const draft = generateFormDraft(state.facts, state.jurisdiction, "ta");
    expect(draft.body).toContain("விண்ணப்பதாரர் விவரங்கள்");
    expect(draft.title).toMatch(/நிரப்பப்பட்ட வரைவு/);
  });
});

describe("Bureaucracy Translator", () => {
  it("explains public authority in plain language", () => {
    const state = runCase(WORKFLOW_EXAMPLES[6].query);
    expect(
      state.supported_information.some((s) => /public authority/i.test(s.text)) ||
        /public authority/i.test(state.summary)
    ).toBe(true);
  });

  it("returns Tamil response when language is ta", () => {
    const state = runCase(WORKFLOW_EXAMPLES[6].query, undefined, "ta");
    expect(state.language).toBe("ta");
    expect(state.action_plan.length).toBeGreaterThan(0);
  });
});

describe("Municipal Grievance Agent", () => {
  it("handles drainage complaint and generates localized draft", () => {
    const state = runCase(WORKFLOW_EXAMPLES[7].query, "Chennai, Tamil Nadu");
    expect(state.domain).toBe("grievance");
    expect(state.facts.issue_type).toBe("drainage");
    const draft = generateGrievanceDraft(state.facts, state.jurisdiction, "ta");
    expect(draft.title).toMatch(/நகராட்சி/);
    expect(draft.body).toMatch(/நகராட்சி/);
  });
});

describe("Localized document drafts", () => {
  it("generates Hindi RTI draft", () => {
    const state = runCase(WORKFLOW_EXAMPLES[0].query, "Mumbai, Maharashtra", "hi");
    const draft = generateRtiDraft(state.facts, state.jurisdiction, "hi");
    expect(draft.title).toMatch(/आरटीआई/);
    expect(draft.body).toContain("सूचना का अधिकार");
  });
});

describe("Multilingual sample queries", () => {
  it("classifies Tamil tenant query", () => {
    const ta = getTranslations("ta");
    const state = runCase(ta.sampleQueries.tenant);
    expect(state.domain).toBe("rights_navigator");
    expect(state.facts.rights_area).toBe("tenant");
  });

  it("classifies Hindi grievance query", () => {
    const hi = getTranslations("hi");
    const state = runCase(hi.sampleQueries.grievance, "Chennai, Tamil Nadu");
    expect(state.domain).toBe("grievance");
  });
});

describe("Translation completeness", () => {
  it("provides localized sample queries for every workflow example in all locales", () => {
    for (const { code } of LOCALES) {
      const t = getTranslations(code);
      for (const ex of WORKFLOW_EXAMPLES) {
        expect(t.samples[ex.key]).toBeTruthy();
        expect(t.sampleQueries[ex.key]).toBeTruthy();
        expect(t.sampleQueries[ex.key].length).toBeGreaterThan(10);
      }
    }
  });

  it("provides status labels for all workflow statuses", () => {
    for (const { code } of LOCALES) {
      const t = getTranslations(code);
      expect(t.statusLabels.collecting).toBeTruthy();
      expect(t.statusLabels.ready).toBeTruthy();
      expect(t.statusLabels.researching).toBeTruthy();
      expect(t.statusLabels.error).toBeTruthy();
    }
  });
});
