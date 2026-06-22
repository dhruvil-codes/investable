import { NextResponse } from "next/server";
import { callAI } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text content is required." },
        { status: 400 }
      );
    }

    const result = await callAI(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in AI analysis route:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred during analysis.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
