"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Upload, AlertTriangle, FileCheck, Sparkles, ArrowLeft } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".md", ".txt"] as const;
const ACCEPTED_LABEL = "PDF, Word, Markdown & text files";

const FILE_EXT_MAP: Record<string, "pdf" | "docx" | "text"> = {
  ".pdf": "pdf",
  ".docx": "docx",
  ".md": "text",
  ".txt": "text",
};

const LOADING_MESSAGES = [
  "Reading your deck…",
  "Scanning slides for buzzwords…",
  "Stripping out 'synergy', 'disruptive', and 'AI-powered'…",
  "Evaluating LTV/CAC projections… dividing year-3 revenue by 100…",
  "Simulating partner eye-rolls and yawns on slide 4…",
  "Drafting pass email template with polite excuses…",
  "Consulting the Gemini investment committee…",
  "Finalizing verdict… summoning the grumpy lead partner to deliver news…"
];

export default function ReviewPage() {
  const router = useRouter();
  const [startupName, setStartupName] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the terminal logs as they are added
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  const activeText = extractedText || pastedText;
  const hasText = activeText.length > 0;

  useEffect(() => {
    if (!isAnalyzing) {
      setProgress(0);
      setLoadingMessageIndex(0);
      return;
    }

    const messageTimer = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 800);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const diff = 98 - prev;
        if (diff <= 0.1) return prev; // Stop incrementing at 98%
        // Increment proportional to the remaining distance to 98%
        const increment = Math.max(0.1, diff * 0.05 + Math.random() * 0.2);
        return Math.min(98, prev + increment);
      });
    }, 150);

    return () => {
      clearInterval(messageTimer);
      clearInterval(progressTimer);
    };
  }, [isAnalyzing]);

  const extractTextFromFile = async (file: File) => {
    setIsExtracting(true);
    setExtractionError(null);
    setExtractedText("");

    try {
      const type = getFileType(file);
      let fullText = "";

      if (type === "pdf") {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ");
          fullText += pageText + "\n\n";
        }
      } else if (type === "docx") {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        fullText = result.value;
      } else if (type === "text") {
        fullText = await file.text();
      }

      setExtractedText(fullText.trim());
      if (file.name) {
        const nameGuess = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setStartupName((prev) => prev || nameGuess);
      }
    } catch (error) {
      console.error("File extraction error:", error);
      setExtractionError(
        "Failed to extract text from the file. The file may be damaged or protected. Please paste your pitch text directly instead."
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const getFileType = useCallback((file: File): "pdf" | "docx" | "text" | null => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    return FILE_EXT_MAP[ext] ?? null;
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!getFileType(file)) {
      return `Please upload a supported file (${ACCEPTED_EXTENSIONS.join(", ")}).`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 10MB.";
    }
    return null;
  }, [getFileType]);

  const handleFile = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setExtractionError(error);
      return;
    }
    await extractTextFromFile(file);
  }, [validateFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePasteTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPastedText(e.target.value);
    if (extractedText) {
      setExtractedText("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasText) return;
    setIsAnalyzing(true);
    setTerminalLogs([]);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: activeText }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream found.");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim().startsWith("data: ")) {
            try {
              const payload = JSON.parse(line.trim().slice(6));
              if (payload.type === "status") {
                setProgress(payload.progress);
                const timestamp = new Date().toLocaleTimeString();
                setTerminalLogs((prev) => [...prev, `[${timestamp}] ${payload.message}`]);
              } else if (payload.type === "result") {
                sessionStorage.setItem("gemini_analysis", JSON.stringify(payload.data));
                router.push("/report");
                return;
              } else if (payload.type === "error") {
                throw new Error(payload.message);
              }
            } catch (err) {
              console.error("Failed to parse stream payload:", err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setIsAnalyzing(false);
      setExtractionError(
        err instanceof Error ? err.message : "Analysis failed. Please try again."
      );
    }
  };

  const handleReset = () => {
    setStartupName("");
    setPastedText("");
    setExtractedText("");
    setExtractionError(null);
    setIsAnalyzing(false);
    setProgress(0);
    setTerminalLogs([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink antialiased font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-hairline bg-canvas/85 backdrop-blur-md sticky top-0 z-50">
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
            <span className="font-display text-xl font-bold tracking-tight">
              Investable
            </span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-muted hover:text-ink flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-primary outline-none py-1 rounded">
            <ArrowLeft className="size-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-3xl">

          {/* Phase 1: Input Fields Form */}
          {!isAnalyzing && (
            <Card className="border border-hairline bg-canvas shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="p-6 md:p-8 border-b border-hairline bg-surface-soft">
                <div className="flex items-center gap-2 text-brand-indigo text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="size-3.5 fill-brand-indigo/20" />
                  <span>Honesty Engine v1.0</span>
                </div>
                <CardTitle className="font-display text-3xl md:text-4xl font-normal italic tracking-tight text-ink">
                  Initiate Pitch Analysis
                </CardTitle>
                <CardDescription className="text-body font-sans text-sm mt-1">
                  Upload a pitch deck (PDF, Word, Markdown, or text) or paste your summary to summon our simulated investment committee.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8 flex flex-col gap-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                  {/* Startup Metadata Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="startupName" className="text-xs font-bold uppercase tracking-wider text-muted">
                        Startup Name
                      </label>
                      <Input
                        id="startupName"
                        type="text"
                        placeholder="e.g., Acme Software"
                        value={startupName}
                        onChange={(e) => setStartupName(e.target.value)}
                        className="h-11 rounded-md border border-hairline bg-canvas px-4 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Drag and Drop File Area */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">
                      Upload PDF Pitch Deck
                    </span>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={handleClickUpload}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleClickUpload();
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label="Drag and drop your pitch deck file here, or click to browse. Supports PDF, Word, Markdown and text files. Max size 10 megabytes."
                      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none ${
                        isDragging
                          ? "border-primary bg-surface-card"
                          : "border-hairline bg-surface-soft/40 hover:bg-surface-soft/75"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.md,.txt"
                        onChange={handleInputChange}
                        className="sr-only"
                      />

                      <div className="size-12 rounded-full bg-canvas border border-hairline flex items-center justify-center mb-3 shadow-xs">
                        <Upload className="size-5 text-muted" />
                      </div>

                      <p className="font-semibold text-sm text-ink text-center">
                        {isExtracting
                          ? "Extracting text content…"
                          : extractedText
                          ? "Replace uploaded file"
                          : "Drag and drop your pitch deck here"}
                      </p>
                      <p className="mt-1 text-xs text-muted-soft text-center">
                        {isExtracting
                          ? "Parsing document…"
                          : "or click to select file. PDF, Word, Markdown & text supported, max 10 MB."}
                      </p>

                      {extractedText && !isExtracting && (
                        <div className="inline-flex items-center gap-1.5 bg-brand-mint/20 border border-brand-mint/40 px-3 py-1 rounded-pill text-[11px] font-semibold text-brand-teal mt-3">
                          <FileCheck className="size-3.5 text-brand-teal" />
                          <span>Text extracted ({extractedText.length.toLocaleString()}&nbsp;chars)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Extraction Error */}
                  {extractionError && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm" role="alert" aria-live="polite">
                      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      <p>{extractionError}</p>
                    </div>
                  )}

                  {/* Textarea Fallback */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="pitch-text" className="text-xs font-bold uppercase tracking-wider text-muted">
                      Or paste your pitch text directly
                    </label>
                    <textarea
                      id="pitch-text"
                      rows={5}
                      value={pastedText}
                      onChange={handlePasteTextChange}
                      placeholder="e.g., Slide 1: Problem. Outbound lead generation is manual and slow… Slide 2: Solution…"
                      className="w-full resize-none rounded-lg border border-hairline bg-canvas p-4 text-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent outline-none leading-relaxed text-ink"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!hasText || isExtracting}
                    className="h-12 w-full bg-primary text-primary-foreground font-semibold text-base rounded-md hover:bg-primary-active disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 mt-2"
                  >
                    Analyse My Pitch
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Phase 2: Animated Loading Simulation */}
          {isAnalyzing && (
            <Card className="border border-hairline bg-canvas shadow-sm rounded-xl overflow-hidden py-10 px-6 flex flex-col items-center justify-center text-center gap-6 min-h-[500px]">
              <div className="relative">
                <div className="size-16 rounded-full bg-surface-soft border border-hairline flex items-center justify-center shadow-inner animate-pulse-subtle">
                  <span className="text-2xl">🕵️‍♂️</span>
                </div>
                <div className="absolute top-0 right-0 size-5 bg-brand-indigo text-white rounded-full flex items-center justify-center text-[9px] font-bold animate-bounce">
                  !
                </div>
              </div>

              <div className="flex flex-col gap-1 max-w-md w-full">
                <h3 className="font-display text-xl md:text-2xl font-normal italic tracking-tight text-ink">
                  Running Agentic Valuation Loop
                </h3>
                <p className="text-[11px] font-semibold text-brand-coral uppercase tracking-wider h-5 animate-pulse" aria-live="polite">
                  {LOADING_MESSAGES[loadingMessageIndex]}
                </p>
              </div>

              {/* Real-time Agent Log Console */}
              <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-mono text-[10px] text-neutral-300 text-left h-48 overflow-y-auto shadow-inner flex flex-col gap-1.5 scrollbar-thin select-text">
                {terminalLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed whitespace-pre-wrap">
                    <span className="text-brand-indigo font-bold mr-1.5">{log.slice(0, 10)}</span>
                    <span className="text-emerald-400 font-medium">{log.slice(10)}</span>
                  </div>
                ))}
                {terminalLogs.length === 0 && (
                  <div className="text-neutral-500 italic animate-pulse">Establishing secure agentic node protocols...</div>
                )}
                <div ref={terminalEndRef} />
              </div>

              <div className="w-full max-w-xl flex flex-col gap-2">
                <div className="w-full bg-surface-strong h-2.5 rounded-full overflow-hidden border border-hairline shadow-inner">
                  <div
                    className="bg-brand-indigo h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-soft">
                  <span>AGENT PIPELINE</span>
                  <span>PROGRESS: {Math.floor(progress)}% COMPLETE</span>
                </div>
              </div>
            </Card>
          )}

        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="bg-surface-soft border-t border-hairline py-8 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-soft">
          <span>&copy; {new Date().getFullYear()} Investable. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Made by &#x1F9E1; @bydhruvil.
          </span>
        </div>
      </footer>
    </div>
  );
}
