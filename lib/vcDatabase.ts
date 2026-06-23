export interface VcProfile {
  name: string;
  tier: "Tier 1 — Indian AI & VC" | "Tier 2 — SaaS Specialists" | "Tier 3 — AI & Early Stage" | "Global Panel";
  focusSectors: string[];
  stages: ("Pre-seed" | "Seed" | "Series A" | "Growth")[];
  thesis: string;
  portfolioCompanies: string[];
  antiThesis: string; // What makes them pass instantly
}

export const VC_DATABASE: VcProfile[] = [
  {
    name: "Lightspeed India",
    tier: "Tier 1 — Indian AI & VC",
    focusSectors: ["AI", "SaaS", "FinTech", "B2B", "Enterprise", "DeepTech"],
    stages: ["Seed", "Series A"],
    thesis: "Backing founders leveraging deep technology and AI to solve hard enterprise or consumer problems globally and locally. Focuses on strong technical moats and scalability.",
    portfolioCompanies: ["Sarvam AI", "Pocket FM", "Darwinbox", "Udaan", "Yellow.ai"],
    antiThesis: "Passes on 'thin API wrappers' that don't have proprietary data or workflows, or when local market unit economics don't scale without high customer acquisition costs."
  },
  {
    name: "Blume Ventures",
    tier: "Tier 1 — Indian AI & VC",
    focusSectors: ["SaaS", "FinTech", "DeepTech", "Consumer", "EdTech", "Climate"],
    stages: ["Pre-seed", "Seed"],
    thesis: "Early-stage conviction-led investing in Indian founders building for India and the world. Prefers strong founder-market fit, capital efficiency, and a clear distribution path.",
    portfolioCompanies: ["GreyOrange", "Spinny", "Kuku FM", "Slice", "Exotel", "Carbon Clean"],
    antiThesis: "Passes when GTM strategy depends entirely on global search ads without local distribution hacks, or when margins are low (less than 60%)."
  },
  {
    name: "Peak XV Partners / Surge",
    tier: "Tier 1 — Indian AI & VC",
    focusSectors: ["AI", "SaaS", "FinTech", "Consumer", "Web3", "HealthTech"],
    stages: ["Pre-seed", "Seed", "Series A"],
    thesis: "Leading early-to-mid stage partner in India & Southeast Asia. Surge is their rapid scale-up program. Believes in category-defining companies with massive TAM.",
    portfolioCompanies: ["Atlan", "Groww", "Mamaearth", "InVideo", "CleverTap", "Pixis"],
    antiThesis: "Passes when the target addressable market (TAM) is niche or limited to a small regional segment, or when the tech is easily copied by incumbents."
  },
  {
    name: "Together Fund",
    tier: "Tier 2 — SaaS Specialists",
    focusSectors: ["SaaS", "AI", "Developer Tools", "Enterprise", "B2B"],
    stages: ["Seed", "Series A"],
    thesis: "Founder-led venture fund backing SaaS and AI startups from India for the global market. Deep belief in community, product-led growth (PLG), and founder support.",
    portfolioCompanies: ["Toplyne", "Spry", "DhiWise", "MineOS", "Privado"],
    antiThesis: "Passes if the sales cycle is purely top-down enterprise without any PLG/self-serve motions, or if the product cannot expand inside an organization."
  },
  {
    name: "Accel India",
    tier: "Tier 2 — SaaS Specialists",
    focusSectors: ["SaaS", "AI", "Consumer", "FinTech", "B2B", "E-commerce"],
    stages: ["Seed", "Series A"],
    thesis: "First-partner for early-stage startups. Heavy emphasis on product excellence, repeatable sales playbooks, and large global market potential.",
    portfolioCompanies: ["Freshworks", "BrowserStack", "Chargebee", "Zenoti", "Rupifi"],
    antiThesis: "Passes if there's high customer churn early on, or if the founders are unable to build a repeatable sales motion or transition to the US market."
  },
  {
    name: "100X.VC",
    tier: "Tier 3 — AI & Early Stage",
    focusSectors: ["AI", "SaaS", "Consumer", "FinTech", "B2B", "DeepTech"],
    stages: ["Pre-seed", "Seed"],
    thesis: "First institutional check via iSAFE notes. Prefers fast execution, clear proof of concept, and scalability. Acts as a discovery platform for larger VCs.",
    portfolioCompanies: ["Keka", "DataSutra", "Fship", "Vidyakul", "Pickily"],
    antiThesis: "Passes if the founders are pre-product without a working prototype or if the time to hit $100k ARR is projected to be more than 18 months."
  },
  {
    name: "Y Combinator",
    tier: "Global Panel",
    focusSectors: ["AI", "SaaS", "DevTools", "FinTech", "Consumer", "BioTech", "Hardware"],
    stages: ["Pre-seed", "Seed"],
    thesis: "Backing outstanding founders at the absolute earliest stage. Values raw builder capability, rapid ship cycles, and high growth velocity over pre-existing revenue.",
    portfolioCompanies: ["Airbnb", "Stripe", "Dropbox", "Coinbase", "Rippling", "Brex"],
    antiThesis: "Passes when founders move too slowly, build features instead of products, fail to talk to users, or exhibit poor founder dynamics."
  },
  {
    name: "a16z (Andreessen Horowitz)",
    tier: "Global Panel",
    focusSectors: ["AI", "Enterprise", "Consumer", "FinTech", "Crypto", "Bio", "Gaming"],
    stages: ["Seed", "Series A", "Growth"],
    thesis: "Software is eating the world, and AI is eating software. Backs bold, vision-led founders building the future. Values network effects and deep technical moats.",
    portfolioCompanies: ["OpenAI", "Figma", "Databricks", "Substack", "GitHub", "Character.AI"],
    antiThesis: "Passes when the product lacks an AI-native architecture, relies entirely on third-party APIs with high margins markup, or lacks a strong moat."
  }
];

export function getMatchingVCs(sector: string = "", stage: string = ""): VcProfile[] {
  const lowerSector = sector.toLowerCase();
  
  // Filter VCs that focus on this sector
  const matched = VC_DATABASE.filter(vc => {
    return vc.focusSectors.some(s => lowerSector.includes(s.toLowerCase()));
  });

  // If we have at least 3 matching VCs, use them. Otherwise, mix in standard defaults.
  if (matched.length >= 3) {
    return matched.slice(0, 5);
  }

  // Fallback to a balanced representation
  return [
    VC_DATABASE.find(vc => vc.name === "Lightspeed India")!,
    VC_DATABASE.find(vc => vc.name === "Blume Ventures")!,
    VC_DATABASE.find(vc => vc.name === "Together Fund")!,
    VC_DATABASE.find(vc => vc.name === "Y Combinator")!,
    VC_DATABASE.find(vc => vc.name === "a16z (Andreessen Horowitz)")!
  ].filter(Boolean);
}
