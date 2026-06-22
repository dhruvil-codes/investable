export interface MetricScore {
  score: number;
  note: string;
}

export interface Scorecard {
  founder_market_fit: MetricScore;
  problem_severity: MetricScore;
  market_size: MetricScore;
  product_differentiation: MetricScore;
  ai_defensibility: MetricScore;
  technical_moat: MetricScore;
  revenue_potential: MetricScore;
  gtm_strength: MetricScore;
  scalability: MetricScore;
  venture_scale_potential: MetricScore;
  composite_score: number;
}

export interface Investor {
  name: string;
  tier: string;
  decision: "INVEST" | "STRONGLY CONSIDER" | "PASS";
  conviction: number;
  check_size: "Angel" | "Pre-seed" | "Seed" | "Series A" | "N/A";
  why_invest: string;
  why_not: string;
  concern: string;
}

export interface DueDiligence {
  market_opportunity: string;
  tam_sam_som: string;
  pmf_potential: string;
  ai_advantage: string;
  defensibility: string;
  distribution: string;
  pricing_retention: string;
  regulatory_risks: string;
  execution_risks: string;
}

export interface Competitive {
  indian_competitors: string;
  global_competitors: string;
  ai_native_startups: string;
  traditional_alternatives: string;
  advantages: string;
  weaknesses: string;
  threats: string;
  opportunities: string;
}

export interface Debate {
  bull_case: string;
  bear_case: string;
  partner_objections: string[];
  counterarguments: string[];
}

export interface Financials {
  year_1_revenue: string;
  year_3_arr: string;
  year_5_arr: string;
  valuation_range: string;
  prob_sustainable: string;
  prob_100m_arr: string;
}

export interface Verdict {
  decision: "INVEST" | "PASS";
  conviction: number;
  funded_today: "YES" | "NO" | "NOT YET";
  top_5_reasons: string[];
  top_5_concerns: string[];
  closing_line: string;
}

export interface GeminiAnalysis {
  startup_name: string;
  summary: string;
  scorecard: Scorecard;
  investors: Investor[];
  due_diligence: DueDiligence;
  competitive: Competitive;
  debate: Debate;
  financials: Financials;
  biggest_risks: string[];
  must_improve: string[];
  verdict: Verdict;
}
