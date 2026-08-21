"use client";

import { FormEvent, useState } from "react";
import { PastCases } from "@/components/PastCases";

export const WORKFLOW_EXAMPLES = [
  {
    label: "RTI drafting",
    query: "I want to know how much the municipality spent repairing the road on my street last year.",
  },
  {
    label: "Rights — tenant",
    query: "My landlord is refusing to return my security deposit after I moved out in Bangalore.",
  },
  {
    label: "Rights — consumer",
    query: "I bought a defective phone and the shop is not giving a refund under warranty.",
  },
  {
    label: "Rights — workplace",
    query: "My employer has not paid my salary for two months.",
  },
  {
    label: "Scheme eligibility",
    query: "Am I eligible for PM-KISAN if I own 2 acres of farmland in rural Tamil Nadu?",
  },
  {
    label: "Form-filler",
    query: "Help me fill the RTI application form to ask about water supply complaints.",
  },
  {
    label: "Bureaucracy translator",
    query: "What does 'public authority under Section 2(h) of RTI Act' mean in simple words?",
  },
  {
    label: "Municipal grievance",
    query: "My municipality hasn't fixed my drainage complaint.",
  },
];

interface HomeHeroProps {
  onSubmit: (query: string) => Promise<void>;
  onOpenCase: (caseId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function HomeHero({ onSubmit, onOpenCase, loading, error }: HomeHeroProps) {
  const [query, setQuery] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;
    await onSubmit(query.trim());
  }

  return (
    <section className="relative min-h-[100dvh] overflow-x-hidden overflow-y-auto">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(1200px 600px at 10% -10%, rgba(15, 118, 110, 0.18), transparent 55%), radial-gradient(900px 500px at 90% 10%, rgba(180, 83, 9, 0.12), transparent 50%), linear-gradient(180deg, #f7f4ef 0%, #eef3f1 45%, #f8faf9 100%)",
        }}
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-10 sm:px-8 sm:py-16 md:min-h-[100dvh] md:justify-center">
        <p className="animate-fade-up font-display text-3xl font-semibold tracking-tight text-teal-900 sm:text-5xl md:text-6xl">
          CivicAI
        </p>
        <h1 className="animate-fade-up mt-4 max-w-2xl font-display text-2xl leading-tight text-stone-900 sm:mt-6 sm:text-4xl md:text-[2.75rem] [animation-delay:80ms]">
          Understand your rights.
          <br />
          Know what to do next.
        </h1>
        <p className="animate-fade-up mt-4 max-w-xl text-sm leading-relaxed text-stone-600 sm:mt-5 sm:text-lg [animation-delay:140ms]">
          RTI drafting, rights guidance, scheme eligibility, form-filling, and plain-language
          bureaucracy help — grounded in official sources.
        </p>

        <form
          onSubmit={handleSubmit}
          className="animate-fade-up mt-8 sm:mt-10 [animation-delay:200ms]"
        >
          <label
            htmlFor="problem"
            className="mb-2 block text-sm font-medium text-stone-700 sm:mb-3"
          >
            What problem are you facing?
          </label>
          <textarea
            id="problem"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            placeholder="Describe your situation..."
            className="w-full min-h-[120px] resize-y rounded-md border border-stone-300/90 bg-white/80 px-3 py-3 text-base text-stone-900 shadow-sm outline-none backdrop-blur placeholder:text-stone-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 sm:px-4"
            disabled={loading}
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-teal-800 px-6 text-base font-medium text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading ? "Understanding your situation..." : "Get Help"}
            </button>
          </div>
        </form>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <div className="animate-fade-up mt-8 pb-8 sm:mt-10 [animation-delay:280ms]">
          <p className="text-sm font-medium text-stone-500">Try a sample workflow</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {WORKFLOW_EXAMPLES.map((ex) => (
              <li key={ex.label}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    setQuery(ex.query);
                    await onSubmit(ex.query);
                  }}
                  className="flex min-h-12 w-full flex-col rounded-md border border-stone-200/80 bg-white/60 px-3 py-2.5 text-left transition hover:border-teal-200 hover:bg-white/90 active:scale-[0.99]"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                    {ex.label}
                  </span>
                  <span className="mt-1 line-clamp-2 text-xs text-stone-600 sm:text-sm">
                    {ex.query}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <PastCases onOpenCase={onOpenCase} loading={loading} />
      </div>
    </section>
  );
}
