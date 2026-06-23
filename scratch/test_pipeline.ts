import { callAI } from "../lib/ai";

const samplePitch = `
We are building DentFlow, a specialized AI-powered patient workflow manager for dental clinics in urban India.
It automates patient intake via WhatsApp voice notes, schedules follow-ups automatically, and predicts clinic supply needs.
Indian competitor is Practo (which is generic and bloated) and local spreadsheets.
Globally, companies like Zendesk are too expensive and not customized.
We charge a flat subscription of 4,000 INR per clinic per month.
Our founder has 8 years of experience running dental chains in Mumbai.
`;

async function runTest() {
  console.log("=== STARTING AGENTIC PIPELINE LOCAL TEST ===");
  console.log("Input Pitch:\n", samplePitch.trim());
  console.log("\nInitiating Call...\n");

  try {
    const startTime = Date.now();
    const result = await callAI(samplePitch, (message, progress) => {
      console.log(`[${progress}% COMPLETE] -> ${message}`);
    });
    const endTime = Date.now();

    console.log("\n=== PIPELINE COMPLETED SUCCESSFULLY ===");
    console.log(`Total Time taken: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
    console.log("Raw Result:\n", JSON.stringify(result, null, 2));
    console.log("\nExtracted Startup Name:", result.startup_name);
    console.log("Summary:", result.summary);
    console.log("\nScorecard Composite Score:", result.scorecard.composite_score);
    console.log("\nMatched VC Decisions:");
    result.investors.forEach(inv => {
      console.log(`- ${inv.name} (${inv.tier}): ${inv.decision} (Conviction: ${inv.conviction}%)`);
    });
    console.log("\nLive Competitors Listed in Output:");
    console.log("Indian:", result.competitive.indian_competitors);
    console.log("Global:", result.competitive.global_competitors);
    console.log("AI Native:", result.competitive.ai_native_startups);
    console.log("\nGrumpy Partner Roast (Bear Case):");
    console.log(result.debate.bear_case);
    console.log("\nGrumpy Partner Closing Line:");
    console.log(`"${result.verdict.closing_line}"`);
  } catch (error) {
    console.error("\n*** PIPELINE TEST FAILED ***\n", error);
  }
}

runTest();
