export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  
  if (tavilyKey && tavilyKey.trim() !== "") {
    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: query,
          search_depth: "basic",
          max_results: 5
        })
      });
      if (response.ok) {
        const data = await response.json();
        return (data.results || []).map((r: any) => ({
          title: r.title || "",
          url: r.url || "",
          content: r.content || ""
        }));
      } else {
        console.warn(`Tavily API responded with status ${response.status}. Falling back...`);
      }
    } catch (e) {
      console.error("Tavily search failed, falling back to Gemini Research...", e);
    }
  }

  // Fallback to Gemini 2.5 Flash Search Grounding
  const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!geminiKey) {
    console.warn("No Tavily API key or Gemini API key found for search grounding.");
    return [];
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Search the web and list competitor startups, their products, and URLs (if available) for: "${query}". Provide a direct, factual summary of who they are and what they do. Keep your response short and highly focused on the actual startups.`
                }
              ]
            }
          ],
          tools: [
            {
              google_search: {}
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini Search API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    return [
      {
        title: `Google Search Grounding Results for: ${query}`,
        url: "https://www.google.com",
        content: text
      }
    ];
  } catch (error) {
    console.error("Gemini search fallback failed:", error);
    return [];
  }
}
