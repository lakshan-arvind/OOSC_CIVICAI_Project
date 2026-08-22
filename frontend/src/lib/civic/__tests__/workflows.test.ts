import { describe, expect, it } from "vitest";
import { WORKFLOW_EXAMPLES } from "@/components/HomeHero";
import { parseJurisdiction } from "../domains";
import { generateFormDraft, generateRtiDraft } from "../documents";
import { parseIndianJurisdiction, resolveLocalAuthority } from "../india-geography";
import { isValidOfficialUrl, searchKnowledge } from "../knowledge";
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

function expectRelevantResponse(
  state: ReturnType<typeof runCase>,
  opts: {
    domain: string;
    keywords: RegExp;
    city?: string;
    state?: string;
  }
) {
  expect(state.domain).toBe(opts.domain);
  expect(state.status).toBe("ready");
  expect(state.action_plan.length).toBeGreaterThan(0);
  expect(state.citations.length).toBeGreaterThan(0);

  const blob = [
    state.summary,
    state.message,
    ...state.supported_information.map((s) => s.text),
    ...state.action_plan,
  ].join(" ");
  expect(blob).toMatch(opts.keywords);

  if (opts.city) expect(String(state.jurisdiction.city)).toBe(opts.city);
  if (opts.state) expect(String(state.jurisdiction.state)).toBe(opts.state);

  for (const c of state.citations) {
    expect(c.source_url).toMatch(/^https:\/\//);
    expect(isValidOfficialUrl(String(c.source_url))).toBe(true);
  }
}

describe("India geography parsing", () => {
  const places: Array<{ input: string; city?: string; state: string }> = [
    { input: "Jaipur, Rajasthan", city: "Jaipur", state: "Rajasthan" },
    { input: "Kochi, Kerala", city: "Kochi", state: "Kerala" },
    { input: "Lucknow, Uttar Pradesh", city: "Lucknow", state: "Uttar Pradesh" },
    { input: "Bhopal, Madhya Pradesh", city: "Bhopal", state: "Madhya Pradesh" },
    { input: "Guwahati, Assam", city: "Guwahati", state: "Assam" },
    { input: "Ranchi, Jharkhand", city: "Ranchi", state: "Jharkhand" },
    { input: "Kerala", state: "Kerala" },
    { input: "Rajasthan", state: "Rajasthan" },
  ];

  for (const p of places) {
    it(`parses ${p.input}`, () => {
      const j = parseIndianJurisdiction(p.input);
      expect(j.state).toBe(p.state);
      if (p.city) expect(j.city).toBe(p.city);
    });
  }

  it("resolves local authority for major cities", () => {
    const mumbai = resolveLocalAuthority("Mumbai", "Maharashtra");
    expect(mumbai.localAuthority).toMatch(/BMC|Brihanmumbai/i);
    const jaipur = resolveLocalAuthority("Jaipur", "Rajasthan");
    expect(jaipur.localAuthority).toMatch(/Jaipur/i);
  });
});

describe("Knowledge search relevance", () => {
  it("returns RTI sources for RTI queries", () => {
    const docs = searchKnowledge("rti public authority application", { domain: "rti" });
    expect(docs.some((d) => d.tags.includes("rti"))).toBe(true);
    expect(docs[0].source_url.startsWith("https://")).toBe(true);
  });

  it("returns city-specific municipal source for Jaipur grievance", () => {
    const docs = searchKnowledge("drainage complaint jaipur rajasthan", {
      domain: "grievance",
      city: "Jaipur",
      state: "Rajasthan",
    });
    expect(docs.some((d) => d.city === "Jaipur" || d.tags.includes("jaipur"))).toBe(true);
  });
});

describe("All 8 workflow agents — response relevance", () => {
  const cases: Array<{
    key: string;
    query: string;
    followUp?: string;
    domain: string;
    keywords: RegExp;
    city?: string;
    state?: string;
  }> = [
    {
      key: "rti",
      query: WORKFLOW_EXAMPLES[0].query,
      followUp: "Mumbai, Maharashtra",
      domain: "rti",
      keywords: /rti|information|public authority|records/i,
      city: "Mumbai",
      state: "Maharashtra",
    },
    {
      key: "tenant",
      query: WORKFLOW_EXAMPLES[1].query,
      domain: "rights_navigator",
      keywords: /tenant|landlord|deposit|rent/i,
      city: "Bengaluru",
      state: "Karnataka",
    },
    {
      key: "consumer",
      query: WORKFLOW_EXAMPLES[2].query,
      followUp: "Delhi",
      domain: "rights_navigator",
      keywords: /consumer|refund|warranty|defective/i,
      state: "Delhi",
    },
    {
      key: "workplace",
      query: WORKFLOW_EXAMPLES[3].query,
      followUp: "Pune, Maharashtra",
      domain: "rights_navigator",
      keywords: /salary|employer|labour|wages/i,
      city: "Pune",
      state: "Maharashtra",
    },
    {
      key: "scheme",
      query: WORKFLOW_EXAMPLES[4].query,
      domain: "scheme_eligibility",
      keywords: /pm-kisan|scheme|eligibility|farmer/i,
      state: "Tamil Nadu",
    },
    {
      key: "form",
      query: WORKFLOW_EXAMPLES[5].query,
      followUp: "Chennai, Tamil Nadu",
      domain: "form_filler",
      keywords: /form|rti|application/i,
      city: "Chennai",
      state: "Tamil Nadu",
    },
    {
      key: "bureaucracy",
      query: WORKFLOW_EXAMPLES[6].query,
      domain: "bureaucracy",
      keywords: /public authority|section 2\(h\)|rti/i,
    },
    {
      key: "grievance",
      query: WORKFLOW_EXAMPLES[7].query,
      followUp: "Chennai, Tamil Nadu",
      domain: "grievance",
      keywords: /drainage|municipal|complaint|grievance/i,
      city: "Chennai",
      state: "Tamil Nadu",
    },
  ];

  for (const c of cases) {
    it(`${c.key} agent returns relevant guidance`, () => {
      const state = runCase(c.query, c.followUp);
      expectRelevantResponse(state, c);
    });
  }
});

describe("Multi-state grievance agents", () => {
  const cities = [
    { followUp: "Jaipur, Rajasthan", city: "Jaipur", state: "Rajasthan" },
    { followUp: "Kochi, Kerala", city: "Kochi", state: "Kerala" },
    { followUp: "Lucknow, Uttar Pradesh", city: "Lucknow", state: "Uttar Pradesh" },
    { followUp: "Bhopal, Madhya Pradesh", city: "Bhopal", state: "Madhya Pradesh" },
  ];

  for (const loc of cities) {
    it(`handles drainage complaint in ${loc.city}`, () => {
      const state = runCase(
        "My municipality hasn't fixed my drainage complaint.",
        loc.followUp
      );
      expectRelevantResponse(state, {
        domain: "grievance",
        keywords: /drainage|municipal|complaint/i,
        city: loc.city,
        state: loc.state,
      });
      expect(String(state.jurisdiction.local_authority)).toMatch(
        new RegExp(loc.city.split(" ")[0], "i")
      );
    });
  }
});

describe("RTI across states", () => {
  it("handles RTI in Gujarat", () => {
    const state = runCase(
      "I want RTI information about road repair spending in my area.",
      "Ahmedabad, Gujarat"
    );
    expectRelevantResponse(state, {
      domain: "rti",
      keywords: /rti|information|records/i,
      city: "Ahmedabad",
      state: "Gujarat",
    });
  });
});

describe("Localized document drafts", () => {
  it("generates Hindi RTI draft", () => {
    const state = runCase(WORKFLOW_EXAMPLES[0].query, "Mumbai, Maharashtra", "hi");
    const draft = generateRtiDraft(state.facts, state.jurisdiction, "hi");
    expect(draft.title).toMatch(/आरटीआई/);
    expect(draft.body).toContain("सूचना का अधिकार");
  });

  it("generates Tamil form draft", () => {
    const state = runCase(WORKFLOW_EXAMPLES[5].query, "Chennai, Tamil Nadu", "ta");
    const draft = generateFormDraft(state.facts, state.jurisdiction, "ta");
    expect(draft.body).toContain("விண்ணப்பதாரர் விவரங்கள்");
  });
});

describe("Multilingual queries", () => {
  it("classifies Tamil tenant query", () => {
    const ta = getTranslations("ta");
    const state = runCase(ta.sampleQueries.tenant);
    expect(state.domain).toBe("rights_navigator");
    expect(state.facts.rights_area).toBe("tenant");
  });

  it("classifies Hindi grievance with Jaipur follow-up", () => {
    const hi = getTranslations("hi");
    const state = runCase(hi.sampleQueries.grievance, "Jaipur, Rajasthan");
    expectRelevantResponse(state, {
      domain: "grievance",
      keywords: /शिकायत|municipal|drainage|complaint/i,
      city: "Jaipur",
      state: "Rajasthan",
    });
  });
});

describe("User-friendly clarification flow", () => {
  it("asks for city and state with examples", () => {
    const state = runCase("My municipality hasn't fixed my drainage complaint.");
    expect(state.status).toBe("collecting");
    expect(state.pending_question).toMatch(/city and state|Lucknow|Jaipur|India/i);
  });

  it("accepts follow-up for any Indian city", () => {
    const first = runCase("My municipality hasn't fixed my drainage complaint.");
    const second = runWorkflow({
      caseId: "test-case",
      userQuery: first.user_query,
      latestMessage: "Guwahati, Assam",
      prior: first,
    });
    expect(second.status).toBe("ready");
    expect(second.jurisdiction.city).toBe("Guwahati");
    expect(second.jurisdiction.state).toBe("Assam");
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
});

describe("Jurisdiction helper", () => {
  it("parseJurisdiction delegates to India geography", () => {
    const j = parseJurisdiction("Indore, Madhya Pradesh");
    expect(j.city).toBe("Indore");
    expect(j.state).toBe("Madhya Pradesh");
  });
});
