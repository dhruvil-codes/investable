import { NextRequest } from "next/server";
import { callAI } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Text content is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendUpdate = (msg: string, progress: number) => {
          const payload = { type: "status", message: msg, progress };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        };

        try {
          const result = await callAI(text, (msg, progress) => {
            sendUpdate(msg, progress);
          });

          // Stream the final completed analysis result
          const finalPayload = { type: "result", data: result };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(finalPayload)}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error("Error in streaming analysis:", error);
          const errMsg =
            error instanceof Error
              ? error.message
              : "An unexpected error occurred during analysis.";
          const errorPayload = { type: "error", message: errMsg };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorPayload)}\n\n`)
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive"
      }
    });
  } catch (error) {
    console.error("Error in analyze route POST handler:", error);
    return new Response(
      JSON.stringify({ error: "Failed to initialize analysis stream." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
