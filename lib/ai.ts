import type { GeminiAnalysis } from "./types";
import { searchWeb } from "./search";
import { getMatchingVCs } from "./vcDatabase";

// Helper for parsing raw JSON from LLM responses, stripping out markdown formatting
function parseResponse(text: string): any {
  const cleaned = text
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/\s*```/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON response. Raw text was:", text);
    throw new Error("Invalid JSON response from AI provider.");
  }
}

// Fetch helper with retries for resilience against 429/503 errors
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 2
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (
      !response.ok &&
      (response.status === 429 || response.status === 503) &&
      attempt < maxRetries
    ) {
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    return response;
  }

  throw new Error("Max retries exceeded for API request");
}

// Core LLM invocation wrapper that falls back across providers
async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  jsonMode = false
): Promise<string> {
  const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  const openRouterKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

  // 1. Try Gemini (Primary)
  if (geminiKey) {
    try {
      const response = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                parts: [{ text: userPrompt }],
              },
            ],
            ...(jsonMode ? { generationConfig: { responseMimeType: "application/json" } } : {})
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      console.warn("Primary Gemini call failed, trying Groq fallback...", e);
    }
  }

  // 2. Try Groq (Fallback 1)
  if (groqKey) {
    try {
      const response = await fetchWithRetry(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            ...(jsonMode ? { response_format: { type: "json_object" } } : {})
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (e) {
      console.warn("Groq fallback call failed, trying OpenRouter fallback...", e);
    }
  }

  // 3. Try OpenRouter (Fallback 2)
  if (openRouterKey) {
    try {
      const response = await fetchWithRetry(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openRouterKey}`,
          },
          body: JSON.stringify({
            model: "openrouter/auto",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (e) {
      console.error("OpenRouter fallback failed:", e);
    }
  }

  throw new Error("All AI providers failed to return a response.");
}

// Orchestrator for the multi-stage analysis pipeline
export async function callAI(
  pitchText: string,
  onProgress?: (message: string, percent: number) => void
): Promise<GeminiAnalysis> {
  
  // Phase 1: Digest the Pitch
  onProgress?.("Ingesting pitch and analyzing core thesis...", 10);
  const digestSystemPrompt = `You are a Pitch Ingestion Agent. Your job is to extract basic metadata from a startup pitch.
Extract the startup name, the main sector (e.g., SaaS, FinTech, DeepTech, AI, Consumer, Developer Tools), and write exactly two target search queries for finding real-world competitors or similar funded startups in 2025/2026.
You must respond with ONLY a valid JSON object matching this schema:
{
  "startup_name": "string",
  "sector": "string",
  "queries": ["string", "string"]
}`;
  
  const digestRaw = await callLLM(digestSystemPrompt, pitchText, true);
  const digest = parseResponse(digestRaw);
  const startupName = digest.startup_name || "Your Startup";
  const sector = digest.sector || "General Tech";
  const queries = digest.queries || [];

  // Phase 2: Live Competitive Research
  onProgress?.("Formulating queries for real-time market validation...", 25);
  let competitorContent = "No live research data available.";
  if (queries.length > 0) {
    onProgress?.(`Querying web search for live 2025/2026 market intelligence...`, 40);
    const searchPromises = queries.map((q: string) => searchWeb(q));
    const searchResultsList = await Promise.all(searchPromises);
    const searchResults = searchResultsList.flat();
    
    if (searchResults.length > 0) {
      competitorContent = searchResults.map((r, idx) => {
        return `Result ${idx + 1}: ${r.title}\nURL: ${r.url}\nSummary: ${r.content}\n`;
      }).join("\n---\n");
    }
  }

  // Phase 3: VC Database Match
  onProgress?.("Matching pitch sectors with active VC portfolio matrices...", 60);
  const matchedVCs = getMatchingVCs(sector);
  const vcContext = matchedVCs.map(vc => {
    return `VC Name: ${vc.name}\nTier: ${vc.tier}\nThesis: ${vc.thesis}\nPortfolio Companies: ${vc.portfolioCompanies.join(", ")}\nTypical pass reasons (anti-thesis): ${vc.antiThesis}\n`;
  }).join("\n---\n");

  // Phase 4: Simulated Committee Debate & Synthesis
  onProgress?.("Orchestrating investment committee debate & drafting brutal roast...", 80);

  const committeeSystemPrompt = `You are a global investment committee of venture capital firms and one grumpy, cynical Lead Partner evaluating a startup pitch.
You MUST analyze the pitch using:
1. The raw pitch text.
2. The live 2025/2026 competitor research data provided.
3. The specific investment thesis and actual portfolios of the simulated VCs.

The simulated VCs in this meeting are:
${vcContext}

Additionally, there is a "Grumpy Lead Partner" whose role is to deliver a brutal, un-sugarcoated "Roast" of the idea. They hate buzzwords, call out thin wrappers immediately, analyze CAC/LTV risks, and highlight the cold, hard truths of startup failure.

You must respond ONLY with a single valid JSON object — no markdown, no backticks, no preamble. The JSON must match this exact schema:
{
  "startup_name": "${startupName}",
  "summary": "string — 4-5 sentence professional summary of the startup",
  "scorecard": {
    "founder_market_fit": { "score": 1-10, "note": "string" },
    "problem_severity": { "score": 1-10, "note": "string" },
    "market_size": { "score": 1-10, "note": "string" },
    "product_differentiation": { "score": 1-10, "note": "string" },
    "ai_defensibility": { "score": 1-10, "note": "string" },
    "technical_moat": { "score": 1-10, "note": "string" },
    "revenue_potential": { "score": 1-10, "note": "string" },
    "gtm_strength": { "score": 1-10, "note": "string" },
    "scalability": { "score": 1-10, "note": "string" },
    "venture_scale_potential": { "score": 1-10, "note": "string" },
    "composite_score": number (average of above, 1 decimal)
  },
  "investors": [
    {
      "name": "string (MUST use the names of the matched VCs, e.g. Lightspeed India, Blume Ventures, Y Combinator, etc.)",
      "tier": "string (use their tier)",
      "decision": "INVEST" | "STRONGLY CONSIDER" | "PASS",
      "conviction": 0-100,
      "check_size": "Angel" | "Pre-seed" | "Seed" | "Series A" | "N/A",
      "why_invest": "string (why they might invest based on their thesis)",
      "why_not": "string (specific concern, citing their portfolio or anti-thesis)",
      "concern": "string — one sharp, specific VC-style question"
    }
  ],
  "due_diligence": {
    "market_opportunity": "string",
    "tam_sam_som": "string",
    "pmf_potential": "string",
    "ai_advantage": "string",
    "defensibility": "string",
    "distribution": "string",
    "pricing_retention": "string",
    "regulatory_risks": "string",
    "execution_risks": "string"
  },
  "competitive": {
    "indian_competitors": "string (be realistic, mention real competitors found in research)",
    "global_competitors": "string (mention real competitors found in research)",
    "ai_native_startups": "string (mention real competitors found in research)",
    "traditional_alternatives": "string",
    "advantages": "string",
    "weaknesses": "string",
    "threats": "string",
    "opportunities": "string"
  },
  "debate": {
    "bull_case": "string (what the optimistic VCs argue)",
    "bear_case": "string (the brutal, cynical roast delivered by the Grumpy Partner)",
    "partner_objections": ["string x4 (cynical objections made by the Grumpy Partner or other VCs)"],
    "counterarguments": ["string x3 (how the bull-case partners defend the idea)"]
  },
  "financials": {
    "year_1_revenue": "string",
    "year_3_arr": "string",
    "year_5_arr": "string",
    "valuation_range": "string",
    "prob_sustainable": "string",
    "prob_100m_arr": "string"
  },
  "biggest_risks": ["string x6"],
  "must_improve": ["string x6"],
  "verdict": {
    "decision": "INVEST" | "PASS",
    "conviction": 0-100,
    "funded_today": "YES" | "NO" | "NOT YET",
    "top_5_reasons": ["string x5"],
    "top_5_concerns": ["string x5"],
    "closing_line": "string — one memorable, extremely honest, roasting closing sentence by the Grumpy Partner"
  }
}

Be brutally honest. Think exactly like professional investors deploying their own capital. Do not sugarcoat. If the idea is a thin wrapper or has structural flaws, make sure the scorecard and the Grumpy Partner's feedback reflect that. The investors list MUST contain exactly the matched VCs listed above.`;

  const userPrompt = `Startup Pitch Content:
${pitchText}

Live Competitor & Market Research Context (2026):
${competitorContent}`;

  onProgress?.("Synthesizing final consensus report and validating JSON structures...", 95);
  const finalRaw = await callLLM(committeeSystemPrompt, userPrompt, true);
  const finalAnalysis = parseResponse(finalRaw) as GeminiAnalysis;

  // Final check to make sure name matches what we digested
  if (!finalAnalysis.startup_name || finalAnalysis.startup_name === "Your Startup") {
    finalAnalysis.startup_name = startupName;
  }

  // Defensive validation & fallback defaults to prevent TypeError on frontend
  finalAnalysis.summary = finalAnalysis.summary || "";
  if (!finalAnalysis.scorecard) {
    finalAnalysis.scorecard = {
      founder_market_fit: { score: 5, note: "" },
      problem_severity: { score: 5, note: "" },
      market_size: { score: 5, note: "" },
      product_differentiation: { score: 5, note: "" },
      ai_defensibility: { score: 5, note: "" },
      technical_moat: { score: 5, note: "" },
      revenue_potential: { score: 5, note: "" },
      gtm_strength: { score: 5, note: "" },
      scalability: { score: 5, note: "" },
      venture_scale_potential: { score: 5, note: "" },
      composite_score: 5.0
    };
  }
  if (!finalAnalysis.investors) finalAnalysis.investors = [];
  if (!finalAnalysis.due_diligence) {
    finalAnalysis.due_diligence = {
      market_opportunity: "",
      tam_sam_som: "",
      pmf_potential: "",
      ai_advantage: "",
      defensibility: "",
      distribution: "",
      pricing_retention: "",
      regulatory_risks: "",
      execution_risks: ""
    };
  }
  if (!finalAnalysis.competitive) {
    finalAnalysis.competitive = {
      indian_competitors: "",
      global_competitors: "",
      ai_native_startups: "",
      traditional_alternatives: "",
      advantages: "",
      weaknesses: "",
      threats: "",
      opportunities: ""
    };
  }
  if (!finalAnalysis.debate) {
    finalAnalysis.debate = {
      bull_case: "",
      bear_case: "",
      partner_objections: [],
      counterarguments: []
    };
  }
  if (!finalAnalysis.financials) {
    finalAnalysis.financials = {
      year_1_revenue: "N/A",
      year_3_arr: "N/A",
      year_5_arr: "N/A",
      valuation_range: "N/A",
      prob_sustainable: "N/A",
      prob_100m_arr: "N/A"
    };
  }
  if (!finalAnalysis.biggest_risks) finalAnalysis.biggest_risks = [];
  if (!finalAnalysis.must_improve) finalAnalysis.must_improve = [];
  if (!finalAnalysis.verdict) {
    finalAnalysis.verdict = {
      decision: "PASS",
      conviction: 50,
      funded_today: "NOT YET",
      top_5_reasons: [],
      top_5_concerns: [],
      closing_line: "Analysis completed."
    };
  } else {
    finalAnalysis.verdict.decision = finalAnalysis.verdict.decision || "PASS";
    finalAnalysis.verdict.conviction = finalAnalysis.verdict.conviction || 50;
    finalAnalysis.verdict.funded_today = finalAnalysis.verdict.funded_today || "NOT YET";
    finalAnalysis.verdict.top_5_reasons = finalAnalysis.verdict.top_5_reasons || [];
    finalAnalysis.verdict.top_5_concerns = finalAnalysis.verdict.top_5_concerns || [];
    finalAnalysis.verdict.closing_line = finalAnalysis.verdict.closing_line || "Analysis completed.";
  }

  return finalAnalysis;
}
