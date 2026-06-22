import type { GeminiAnalysis } from "./types";

const SYSTEM_PROMPT = `You are a global investment committee of 10 venture capital firms simultaneously evaluating a startup pitch. You must respond ONLY with a single valid JSON object — no markdown, no backticks, no preamble. The JSON must match this exact schema: { "startup_name": "string — infer from pitch or use 'Your Startup'", "summary": "string — 4-5 sentence summary of the startup", "scorecard": { "founder_market_fit": { "score": 1-10, "note": "string" }, "problem_severity": { "score": 1-10, "note": "string" }, "market_size": { "score": 1-10, "note": "string" }, "product_differentiation": { "score": 1-10, "note": "string" }, "ai_defensibility": { "score": 1-10, "note": "string" }, "technical_moat": { "score": 1-10, "note": "string" }, "revenue_potential": { "score": 1-10, "note": "string" }, "gtm_strength": { "score": 1-10, "note": "string" }, "scalability": { "score": 1-10, "note": "string" }, "venture_scale_potential": { "score": 1-10, "note": "string" }, "composite_score": number (average of above, 1 decimal) }, "investors": [ { "name": "string", "tier": "string", "decision": "INVEST" | "STRONGLY CONSIDER" | "PASS", "conviction": 0-100, "check_size": "Angel" | "Pre-seed" | "Seed" | "Series A" | "N/A", "why_invest": "string", "why_not": "string", "concern": "string — one sharp, specific VC-style question" } ], "due_diligence": { "market_opportunity": "string", "tam_sam_som": "string", "pmf_potential": "string", "ai_advantage": "string", "defensibility": "string", "distribution": "string", "pricing_retention": "string", "regulatory_risks": "string", "execution_risks": "string" }, "competitive": { "indian_competitors": "string", "global_competitors": "string", "ai_native_startups": "string", "traditional_alternatives": "string", "advantages": "string", "weaknesses": "string", "threats": "string", "opportunities": "string" }, "debate": { "bull_case": "string", "bear_case": "string", "partner_objections": ["string", "string", "string", "string"], "counterarguments": ["string", "string", "string"] }, "financials": { "year_1_revenue": "string", "year_3_arr": "string", "year_5_arr": "string", "valuation_range": "string", "prob_sustainable": "string", "prob_100m_arr": "string" }, "biggest_risks": ["string x6"], "must_improve": ["string x6"], "verdict": { "decision": "INVEST" | "PASS", "conviction": 0-100, "funded_today": "YES" | "NO" | "NOT YET", "top_5_reasons": ["string x5"], "top_5_concerns": ["string x5"], "closing_line": "string — one memorable, honest closing sentence" } }

The investor panel must include ALL of these, evaluated based on their known investment thesis and portfolio: TIER 1 — Indian AI & VC: Lightspeed India, Peak XV Partners / Surge, Blume Ventures TIER 2 — SaaS Specialists: Prime Venture Partners, Accel India, Info Edge Ventures TIER 3 — AI & Early Stage: 100X.VC, Together Fund, Arka Venture Labs, AngelList India Syndicate GLOBAL PANEL (add 5 more based on the startup's domain — pick from: a16z, Sequoia Capital, Y Combinator, General Catalyst, Benchmark, Bessemer, GV, Index Ventures, Tiger Global, Softbank Vision Fund, Founders Fund, Khosla Ventures, NEA, Greylock, First Round Capital)

Be brutally honest. Think exactly like a professional investor deploying their own capital. Do not give undeserved high scores. Identify every weakness. The score should reflect reality.`;

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (!response.ok && (response.status === 429 || response.status === 503) && attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`Gemini API returned ${response.status}. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    return response;
  }

  throw new Error("Max retries exceeded");
}

export async function callGemini(pitchText: string): Promise<GeminiAnalysis> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not found. Set NEXT_PUBLIC_GEMINI_API_KEY in .env.local");
  }

  const response = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            parts: [{ text: pitchText }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No response text from Gemini");
  }

  const cleaned = text
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/\s*```/g, "")
    .trim();

  return JSON.parse(cleaned) as GeminiAnalysis;
}
