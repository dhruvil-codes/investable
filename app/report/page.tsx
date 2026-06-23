"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  HelpCircle,
} from "lucide-react";
import type { GeminiAnalysis, Investor } from "@/lib/types";

const DECISION_COLORS: Record<string, string> = {
  INVEST: "bg-success/15 text-success border-success/30",
  "STRONGLY CONSIDER": "bg-brand-ochre/15 text-brand-ochre border-brand-ochre/30",
  PASS: "bg-error/15 text-error border-error/30",
};

const CHECK_SIZE_COLORS: Record<string, string> = {
  Angel: "bg-brand-lavender/20 text-brand-lavender border-brand-lavender/30",
  "Pre-seed": "bg-brand-peach/20 text-brand-peach border-brand-peach/30",
  Seed: "bg-brand-indigo/20 text-brand-indigo border-brand-indigo/30",
  "Series A": "bg-brand-teal/20 text-brand-teal border-brand-teal/30",
  "N/A": "bg-surface-strong text-muted border-hairline",
};

const SCORE_LABELS: Record<string, string> = {
  founder_market_fit: "Founder-Market Fit",
  problem_severity: "Problem Severity",
  market_size: "Market Size",
  product_differentiation: "Product Differentiation",
  ai_defensibility: "AI Defensibility",
  technical_moat: "Technical Moat",
  revenue_potential: "Revenue Potential",
  gtm_strength: "GTM Strength",
  scalability: "Scalability",
  venture_scale_potential: "Venture Scale Potential",
};

const DD_LABELS: Record<string, string> = {
  market_opportunity: "Market Opportunity",
  tam_sam_som: "TAM / SAM / SOM",
  pmf_potential: "PMF Potential",
  ai_advantage: "AI Advantage",
  defensibility: "Defensibility",
  distribution: "Distribution",
  pricing_retention: "Pricing & Retention",
  regulatory_risks: "Regulatory Risks",
  execution_risks: "Execution Risks",
};

const COMP_LABELS: Record<string, string> = {
  indian_competitors: "Indian Competitors",
  global_competitors: "Global Competitors",
  ai_native_startups: "AI-Native Startups",
  traditional_alternatives: "Traditional Alternatives",
  advantages: "Advantages",
  weaknesses: "Weaknesses",
  threats: "Threats",
  opportunities: "Opportunities",
};

function ScoreBar({ score }: { score: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setWidth((score / 10) * 100), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const pct = (score / 10) * 100;
  const color =
    pct >= 70 ? "bg-success" : pct >= 40 ? "bg-brand-ochre" : "bg-error";

  return (
    <div className="w-full bg-surface-strong h-2.5 rounded-full overflow-hidden border border-hairline/50" ref={ref}>
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function ConvictionBar({ value }: { value: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const color =
    value >= 70 ? "bg-success" : value >= 40 ? "bg-brand-ochre" : "bg-error";

  return (
    <div className="w-full bg-surface-strong h-2 rounded-full overflow-hidden border border-hairline/50">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function DecisionStamp({ decision }: { decision: string }) {
  const color =
    decision === "INVEST"
      ? "text-success border-success/40 bg-success/5"
      : decision === "STRONGLY CONSIDER"
      ? "text-brand-ochre border-brand-ochre/40 bg-brand-ochre/5"
      : "text-error border-error/40 bg-error/5";

  return (
    <div
      className={`-rotate-6 text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded border ${color} shrink-0 select-none`}
    >
      {decision}
    </div>
  );
}

function SectionDivider() {
  return <hr className="border-hairline my-12" />;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl md:text-3xl font-normal italic tracking-tight text-ink mb-6">
      {children}
    </h2>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem("gemini_analysis");
    if (!data) {
      router.replace("/");
      return;
    }
    try {
      setAnalysis(JSON.parse(data) as GeminiAnalysis);
    } catch {
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleAnalyseAnother = () => {
    sessionStorage.removeItem("gemini_analysis");
    router.push("/review");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-2 border-hairline border-t-brand-indigo" />
          <span className="text-sm text-muted">Loading report…</span>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const isInvest = analysis.verdict.decision === "INVEST";
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink antialiased font-sans">
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .report-content { max-width: 100% !important; padding: 0 !important; }
          .print-section { break-inside: avoid; page-break-inside: avoid; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Header */}
      <header className="h-16 border-b border-hairline bg-canvas/85 backdrop-blur-md sticky top-0 z-50 no-print">
        <div className="container mx-auto px-6 h-full flex items-center justify-between max-w-7xl">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center text-brand-indigo select-none">
              <svg className="size-6 text-brand-indigo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold tracking-tight">Investable</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="h-9 px-4 border-hairline bg-canvas text-ink font-semibold text-xs rounded-md hover:bg-surface-soft flex items-center gap-1.5"
            >
              <Download className="size-3.5" />
              Download Report
            </Button>
            <Button
              onClick={handleAnalyseAnother}
              className="h-9 px-4 bg-primary text-primary-foreground font-semibold text-xs rounded-md hover:bg-primary-active shadow-sm flex items-center gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              Analyse Another Deck
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10 px-6">
        <div className="report-content mx-auto max-w-5xl flex flex-col gap-0">

          {/* 1. HEADER */}
          <section className="print-section">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-hairline pb-8">
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="size-12 rounded-xl bg-brand-teal flex items-center justify-center font-display text-white font-bold text-xl select-none">
                    {analysis.startup_name.charAt(0).toUpperCase()}
                  </div>
                  <h1 className="font-display text-4xl md:text-5xl font-normal italic tracking-tight text-ink">
                    {analysis.startup_name}
                  </h1>
                </div>
                <p className="text-sm font-semibold text-muted uppercase tracking-wider mt-1">
                  Investment Committee Memorandum
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-soft mt-1">
                  <span>{today}</span>
                  <span className="size-1 rounded-full bg-muted-soft" />
                  <span>Stage: N/A</span>
                  <span className="size-1 rounded-full bg-muted-soft" />
                  <span>Sector: N/A</span>
                </div>
              </div>
              <div className="shrink-0">
                <div
                  className={`-rotate-6 text-sm font-bold uppercase tracking-[0.2em] px-6 py-3 rounded-lg border-2 ${
                    isInvest
                      ? "text-success border-success/40 bg-success/5"
                      : "text-error border-error/40 bg-error/5"
                  }`}
                >
                  {analysis.verdict.decision}
                </div>
              </div>
            </div>
          </section>

          {/* 2. REVISION BANNER */}
          <section className="print-section mt-8">
            <div className="p-4 rounded-lg bg-brand-ochre/10 border border-brand-ochre/30 flex items-start gap-3">
              <AlertTriangle className="size-5 text-brand-ochre shrink-0 mt-0.5" />
              <p className="text-xs text-body leading-relaxed">
                <strong className="text-brand-ochre">Disclaimer:</strong> This report was generated by an AI simulation panel. Treat it as a directional signal, not a guarantee.
              </p>
            </div>
          </section>

          {/* 3. SUMMARY & ROAST CORNER */}
          <section className="print-section mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <SectionHeading>Executive Summary</SectionHeading>
              <p className="text-sm text-body leading-relaxed">
                {analysis.summary}
              </p>
            </div>
            <div className="bg-error/5 border border-error/20 rounded-xl p-5 shadow-xs relative overflow-hidden">
              <div className="absolute -right-3 -top-3 text-7xl opacity-5 select-none font-bold text-error">🔥</div>
              <div className="flex items-center gap-2 text-error text-xs font-bold uppercase tracking-wider mb-3">
                <span className="size-1.5 rounded-full bg-error animate-pulse" />
                <span>Grumpy Partner's Roast Corner</span>
              </div>
              <h4 className="font-display text-sm font-semibold italic text-ink mb-2">
                "Let's be completely real..."
              </h4>
              <p className="text-xs text-body leading-relaxed italic text-muted">
                {analysis.debate.bear_case}
              </p>
            </div>
          </section>

          <SectionDivider />

          {/* 4. SCORECARD */}
          <section className="print-section">
            <SectionHeading>Scorecard</SectionHeading>
            <div className="flex flex-col gap-5">
              {Object.entries(analysis.scorecard).map(([key, val]) => {
                if (key === "composite_score") return null;
                const metric = val as { score: number; note: string };
                return (
                  <div key={key} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">
                        {SCORE_LABELS[key] || key.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          (metric.score / 10) * 100 >= 70
                            ? "bg-success/10 text-success"
                            : (metric.score / 10) * 100 >= 40
                            ? "bg-brand-ochre/10 text-brand-ochre"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {metric.score}/10
                      </span>
                    </div>
                    <ScoreBar score={metric.score} />
                    <p className="text-xs text-muted leading-relaxed">{metric.note}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 p-6 rounded-lg bg-surface-soft border border-hairline flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-wider text-muted">
                Composite Score
              </span>
              <span className="font-display text-4xl font-semibold text-ink tabular-nums">
                {analysis.scorecard.composite_score.toFixed(1)}
              </span>
            </div>
          </section>

          <SectionDivider />

          {/* 5. INVESTOR PANEL */}
          <section className="print-section">
            <SectionHeading>Investor Panel</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.investors.map((investor: Investor, i: number) => (
                <div
                  key={i}
                  className="border border-hairline rounded-lg p-5 bg-canvas flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-8 rounded-full bg-surface-soft border border-hairline flex items-center justify-center font-bold text-xs shrink-0 text-brand-indigo select-none">
                        {investor.name.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-ink truncate">
                          {investor.name}
                        </span>
                        <span className="text-[10px] text-muted-soft uppercase tracking-wider">
                          {investor.tier}
                        </span>
                      </div>
                    </div>
                    <DecisionStamp decision={investor.decision} />
                  </div>

                  <ConvictionBar value={investor.conviction} />
                  <div className="flex items-center justify-between text-[10px] text-muted-soft">
                    <span>{investor.conviction}% conviction</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded border ${
                        CHECK_SIZE_COLORS[investor.check_size] || ""
                      }`}
                    >
                      {investor.check_size}
                    </span>
                  </div>

                  {investor.why_invest && (
                    <div className="flex items-start gap-2 text-xs pt-1">
                      <TrendingUp className="size-3.5 text-success shrink-0 mt-0.5" />
                      <span className="text-body">{investor.why_invest}</span>
                    </div>
                  )}
                  {investor.why_not && (
                    <div className="flex items-start gap-2 text-xs">
                      <TrendingDown className="size-3.5 text-error shrink-0 mt-0.5" />
                      <span className="text-body">{investor.why_not}</span>
                    </div>
                  )}
                  {investor.concern && (
                    <div className="flex items-start gap-2 text-xs p-3 rounded bg-surface-soft border border-hairline mt-1">
                      <HelpCircle className="size-3.5 text-brand-ochre shrink-0 mt-0.5" />
                      <span className="text-body italic">
                        &ldquo;{investor.concern}&rdquo;
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* 6. DUE DILIGENCE */}
          <section className="print-section">
            <SectionHeading>Due Diligence</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysis.due_diligence).map(([key, val]) => (
                <div
                  key={key}
                  className="border border-hairline rounded-lg p-5 bg-canvas flex flex-col gap-2"
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                    {DD_LABELS[key] || key.replace(/_/g, " ")}
                  </span>
                  <p className="text-xs text-body leading-relaxed">{val as string}</p>
                </div>
              ))}
            </div>
          </section>

          <SectionDivider />

          {/* 7. COMPETITIVE ANALYSIS */}
          <section className="print-section">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <SectionHeading>Competitive Analysis</SectionHeading>
              <span className="inline-flex items-center gap-1.5 bg-brand-teal/10 border border-brand-teal/20 px-2.5 py-1 rounded-pill text-[9px] font-bold text-brand-teal uppercase tracking-wider">
                <span className="size-1.5 rounded-full bg-brand-teal animate-pulse" />
                Live 2026 RAG Verified
              </span>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">
              Competitor Landscape
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {(["indian_competitors", "global_competitors", "ai_native_startups", "traditional_alternatives"] as const).map((key) => (
                <div
                  key={key}
                  className="border border-hairline rounded-lg p-5 bg-canvas flex flex-col gap-2"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    {COMP_LABELS[key]}
                  </span>
                  <p className="text-xs text-body leading-relaxed">
                    {analysis.competitive[key] as string}
                  </p>
                </div>
              ))}
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">
              SWOT Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["advantages", "weaknesses", "threats", "opportunities"] as const).map((key) => {
                const isPositive = key === "advantages" || key === "opportunities";
                return (
                  <div
                    key={key}
                    className={`border rounded-lg p-5 flex flex-col gap-2 ${
                      isPositive
                        ? "bg-success/5 border-success/20"
                        : "bg-error/5 border-error/20"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isPositive ? "text-success" : "text-error"
                      }`}
                    >
                      {COMP_LABELS[key]}
                    </span>
                    <p className="text-xs text-body leading-relaxed">
                      {analysis.competitive[key] as string}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <SectionDivider />

          {/* 8. DEBATE */}
          <section className="print-section">
            <SectionHeading>Committee Debate</SectionHeading>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="border border-success/20 rounded-lg p-5 bg-success/5 flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-success flex items-center gap-1.5">
                  <TrendingUp className="size-3.5" /> Bull Case
                </span>
                <p className="text-xs text-body leading-relaxed">
                  {analysis.debate.bull_case}
                </p>
              </div>
              <div className="border border-error/20 rounded-lg p-5 bg-error/5 flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-error flex items-center gap-1.5">
                  <TrendingDown className="size-3.5" /> Bear Case
                </span>
                <p className="text-xs text-body leading-relaxed">
                  {analysis.debate.bear_case}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">
                Partner Objections
              </h3>
              <div className="flex flex-col gap-3">
                {analysis.debate.partner_objections.map((obj, i) => (
                  <blockquote
                    key={i}
                    className="pl-4 border-l-2 border-error/40 italic text-xs text-body leading-relaxed"
                  >
                    &ldquo;{obj}&rdquo;
                  </blockquote>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">
                Counterarguments
              </h3>
              <div className="flex flex-col gap-3">
                {analysis.debate.counterarguments.map((arg, i) => (
                  <blockquote
                    key={i}
                    className="pl-4 border-l-2 border-brand-indigo/40 italic text-xs text-body leading-relaxed"
                  >
                    &ldquo;{arg}&rdquo;
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          <SectionDivider />

          {/* 9. FINANCIALS */}
          <section className="print-section">
            <SectionHeading>Financial Projections</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="border border-hairline rounded-lg p-5 bg-canvas flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  1Y Revenue
                </span>
                <span className="font-display text-xl font-semibold text-ink">
                  {analysis.financials.year_1_revenue}
                </span>
              </div>
              <div className="border border-hairline rounded-lg p-5 bg-canvas flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  3Y ARR
                </span>
                <span className="font-display text-xl font-semibold text-ink">
                  {analysis.financials.year_3_arr}
                </span>
              </div>
              <div className="border border-hairline rounded-lg p-5 bg-canvas flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  5Y ARR
                </span>
                <span className="font-display text-xl font-semibold text-ink">
                  {analysis.financials.year_5_arr}
                </span>
              </div>
              <div className="border border-hairline rounded-lg p-5 bg-canvas flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Valuation Range
                </span>
                <span className="font-display text-xl font-semibold text-ink">
                  {analysis.financials.valuation_range}
                </span>
              </div>
              <div className="border border-hairline rounded-lg p-5 bg-canvas flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  P(Sustainable)
                </span>
                <span className="font-display text-xl font-semibold text-ink">
                  {analysis.financials.prob_sustainable}
                </span>
              </div>
              <div className="border border-hairline rounded-lg p-5 bg-canvas flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  P($100M ARR)
                </span>
                <span className="font-display text-xl font-semibold text-ink">
                  {analysis.financials.prob_100m_arr}
                </span>
              </div>
            </div>
          </section>

          <SectionDivider />

          {/* 10. RISKS */}
          <section className="print-section">
            <SectionHeading>Risks & Improvements</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-error">
                  Biggest Risks
                </h3>
                <ul className="flex flex-col gap-2">
                  {analysis.biggest_risks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-error/5 border border-error/15">
                      <span className="size-5 rounded-full bg-error/20 text-error flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                        &bull;
                      </span>
                      <span className="text-xs text-body leading-relaxed">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-ochre">
                  Must Improve
                </h3>
                <ul className="flex flex-col gap-2">
                  {analysis.must_improve.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-brand-ochre/5 border border-brand-ochre/20">
                      <span className="size-5 rounded-full bg-brand-ochre/20 text-brand-ochre flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-xs text-body leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <SectionDivider />

          {/* 11. VERDICT */}
          <section className="print-section">
            <SectionHeading>Final Verdict</SectionHeading>

            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
              <div
                className={`-rotate-3 text-lg font-bold uppercase tracking-[0.25em] px-8 py-4 rounded-xl border-2 shrink-0 ${
                  isInvest
                    ? "text-success border-success/40 bg-success/5"
                    : "text-error border-error/40 bg-error/5"
                }`}
              >
                {analysis.verdict.decision}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Conviction
                  </span>
                  <span
                    className={`font-display text-3xl font-semibold ${
                      analysis.verdict.conviction >= 70
                        ? "text-success"
                        : analysis.verdict.conviction >= 40
                        ? "text-brand-ochre"
                        : "text-error"
                    }`}
                  >
                    {analysis.verdict.conviction}%
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                    analysis.verdict.funded_today === "YES"
                      ? "bg-success/10 text-success border-success/30"
                      : analysis.verdict.funded_today === "NOT YET"
                      ? "bg-brand-ochre/10 text-brand-ochre border-brand-ochre/30"
                      : "bg-error/10 text-error border-error/30"
                  }`}
                >
                  Funded Today: {analysis.verdict.funded_today}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-success flex items-center gap-1.5">
                  <TrendingUp className="size-3.5" /> Top 5 Reasons
                </h3>
                <div className="flex flex-col gap-2">
                  {analysis.verdict.top_5_reasons.map((reason, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-lg bg-success/5 border border-success/15"
                    >
                      <span className="size-5 rounded-full bg-success/20 text-success flex items-center justify-center text-[9px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs text-body leading-relaxed">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-error flex items-center gap-1.5">
                  <TrendingDown className="size-3.5" /> Top 5 Concerns
                </h3>
                <div className="flex flex-col gap-2">
                  {analysis.verdict.top_5_concerns.map((concern, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-lg bg-error/5 border border-error/15"
                    >
                      <span className="size-5 rounded-full bg-error/20 text-error flex items-center justify-center text-[9px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs text-body leading-relaxed">{concern}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 rounded-xl bg-brand-indigo/5 border border-brand-indigo/20 text-center">
              <p className="font-display text-xl md:text-2xl font-normal italic text-brand-indigo leading-relaxed max-w-2xl mx-auto">
                &ldquo;{analysis.verdict.closing_line}&rdquo;
              </p>
            </div>
          </section>

          {/* Footer actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-hairline no-print">
            <Link href="/review">
              <Button
                variant="outline"
                className="h-10 px-5 border-hairline bg-canvas text-ink font-semibold text-xs rounded-md hover:bg-surface-soft flex items-center gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                Back to Review
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="h-10 px-5 border-hairline bg-canvas text-ink font-semibold text-xs rounded-md hover:bg-surface-soft flex items-center gap-1.5"
              >
                <Download className="size-3.5" />
                Download Report
              </Button>
              <Button
                onClick={handleAnalyseAnother}
                className="h-10 px-5 bg-primary text-primary-foreground font-semibold text-xs rounded-md hover:bg-primary-active shadow-sm flex items-center gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                Analyse Another Deck
              </Button>
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-surface-soft border-t border-hairline py-8 relative overflow-hidden no-print">
        <div className="container mx-auto px-6 max-w-7xl relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-soft">
          <span>&copy; {new Date().getFullYear()} Investable. All rights reserved.</span>
          <span className="flex items-center gap-1">
            AI-powered investment simulation
          </span>
        </div>
      </footer>
    </div>
  );
}
