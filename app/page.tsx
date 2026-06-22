'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Upload,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Features } from "@/components/features";
import { motion } from "motion/react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 18,
      },
    },
  };

  const badgeContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.65,
      },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 8 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 16,
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink antialiased font-sans">
      {/* Top Floating Navigation Header */}
      <Navbar />

      {/* Centered Hero Section */}
      <section className="relative overflow-hidden min-h-[95vh] pt-36 pb-24 md:pt-48 md:pb-28 bg-gradient-to-b from-white via-slate-50/50 to-white flex flex-col items-center justify-center text-center">
        
        {/* Nature Landscape Background at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[280px] md:h-[420px] w-full pointer-events-none z-0">
          <div 
            className="absolute inset-0 bg-cover bg-bottom opacity-95"
            style={{ 
              backgroundImage: "url('/hero-nature.jpg')",
              maskImage: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)",
              WebkitMaskImage: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)"
            }}
          />
          {/* Subtle blend overlay (white fog mask) to blend with white background below */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
        </div>


        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-6 max-w-7xl relative z-10 flex flex-col items-center"
        >
          
          {/* Main Title */}
          <motion.h1 variants={itemVariants} className="font-display text-5xl md:text-6xl lg:text-[76px] font-normal tracking-tight leading-[1.08] text-slate-900 max-w-4xl">
            Upload your pitch deck. <br />
            <span className="italic text-brand-indigo font-light">Get a brutally honest review.</span>
          </motion.h1>
          
          {/* Description */}
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-500 font-sans max-w-2xl leading-relaxed mt-6">
            Our simulated investment committee strips away the polite VC smiles and tells you the raw truth about TAM, product depth, and unit economics before you waste months pitching.
          </motion.p>
          
          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mt-10">
            <Link href="/review">
              <Button className="h-12 px-8 bg-slate-900 text-white font-semibold text-base rounded-full hover:bg-slate-800 shadow-md flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                <Upload className="size-4" />
                Upload Your Pitch Deck
              </Button>
            </Link>
          </motion.div>
          
          {/* Confidentials badges */}
          <motion.div 
            variants={badgeContainerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium mt-12 relative z-10"
          >
            <motion.span variants={badgeVariants} className="flex items-center gap-1.5 bg-white/85 backdrop-blur-sm border border-slate-200/60 rounded-full px-4 py-1.5 shadow-xs text-slate-700 hover:bg-white/95 transition-all duration-300">
              <CheckCircle2 className="size-4 text-success" /> No signup required
            </motion.span>
            <motion.span variants={badgeVariants} className="flex items-center gap-1.5 bg-white/85 backdrop-blur-sm border border-slate-200/60 rounded-full px-4 py-1.5 shadow-xs text-slate-700 hover:bg-white/95 transition-all duration-300">
              <CheckCircle2 className="size-4 text-success" /> PDF/PPTX formats
            </motion.span>
            <motion.span variants={badgeVariants} className="flex items-center gap-1.5 bg-white/85 backdrop-blur-sm border border-slate-200/60 rounded-full px-4 py-1.5 shadow-xs text-slate-700 hover:bg-white/95 transition-all duration-300">
              <CheckCircle2 className="size-4 text-success" /> 100% Confidential
            </motion.span>
          </motion.div>

        </motion.div>
      </section>



      {/* Feature Bento Section */}
      <Features />

      {/* Pre-Footer Illustrated CTA Band */}
      <section className="py-24 bg-canvas border-b border-hairline">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="rounded-xl bg-surface-soft border border-hairline p-10 md:p-16 flex flex-col items-center text-center gap-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 size-32 bg-brand-peach/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 size-32 bg-brand-mint/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-ink">
                Will your startup survive the <span className="italic font-light text-brand-indigo">investment committee?</span>
              </h2>
              <p className="text-base text-body font-sans leading-relaxed">
                Stop pitching blind. Upload your deck now and receive a brutally honest review in less than 30 seconds. No email required.
              </p>
            </div>

            <div className="relative z-10">
              <Link href="/review">
                <Button className="h-12 px-8 bg-slate-900 text-white font-semibold text-base rounded-full hover:bg-slate-800 shadow-md flex items-center justify-center gap-2">
                  <Upload className="size-4" />
                  Upload Your Pitch Deck
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-surface-soft border-t border-hairline pt-16 pb-8 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex items-center justify-center text-brand-indigo select-none">
                  <svg className="size-5.5 text-brand-indigo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
                  </svg>
                </div>
                <span className="font-display text-lg font-bold tracking-tight">
                  Investable
                </span>
              </Link>
              <p className="text-xs text-muted max-w-xs leading-relaxed">
                Brutally honest investment committee simulation for startup founders.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 font-sans text-xs">
              <span className="font-semibold text-ink uppercase tracking-wider text-[10px]">Product</span>
              <a href="#features" className="text-muted hover:text-ink transition-colors">Features</a>
              <Link href="/review" className="text-muted hover:text-ink transition-colors">Simulator</Link>
              <a href="#" className="text-muted hover:text-ink transition-colors">Integrations</a>
            </div>
            
            <div className="flex flex-col gap-3 font-sans text-xs">
              <span className="font-semibold text-ink uppercase tracking-wider text-[10px]">Resources</span>
              <a href="#" className="text-muted hover:text-ink transition-colors">Pitch Deck Guide</a>
              <a href="#" className="text-muted hover:text-ink transition-colors">Brutal Truth blog</a>
              <a href="#" className="text-muted hover:text-ink transition-colors">FAQ</a>
            </div>

            <div className="flex flex-col gap-3 font-sans text-xs">
              <span className="font-semibold text-ink uppercase tracking-wider text-[10px]">Legal</span>
              <a href="#" className="text-muted hover:text-ink transition-colors">Privacy Policy</a>
              <a href="#" className="text-muted hover:text-ink transition-colors">Terms of Service</a>
              <a href="#" className="text-muted hover:text-ink transition-colors">Security</a>
            </div>
          </div>

          <div className="border-t border-hairline pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-soft">
            <span>© {new Date().getFullYear()} Investable. All rights reserved.</span>
            <span className="flex items-center gap-1">
              Made with 💖 for startup survival.
            </span>
          </div>
        </div>

        {/* Signature Claymation-style mountain vector background decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-10 w-full pointer-events-none opacity-20 select-none">
          <svg className="w-full h-full" viewBox="0 0 1440 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40 C 240 20, 360 30, 480 15 C 600 0, 720 10, 840 25 C 960 40, 1080 10, 1200 20 C 1320 30, 1380 15, 1440 40 Z" fill="#e2e8f0" />
            <path d="M0 40 C 180 30, 300 20, 420 35 C 540 50, 660 30, 780 20 C 900 10, 1020 35, 1140 25 C 1260 15, 1350 30, 1440 40 Z" fill="#c7d2fe" />
          </svg>
        </div>
      </footer>
    </div>
  );
}
