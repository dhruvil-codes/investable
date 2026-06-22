'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LiquidGlassCard } from "@/components/uilayouts/liquid-glass";

export function Navbar() {

  return (
    <div className="fixed top-6 left-0 right-0 z-50 w-full flex justify-center px-4 pointer-events-none">
      <LiquidGlassCard
        draggable={false}
        className="pointer-events-auto flex items-center justify-between w-full max-w-5xl h-14 px-5 bg-white/40 border border-white/30 shadow-lg backdrop-blur-md"
        borderRadius="9999px"
        blurIntensity="xl"
        glowIntensity="sm"
        shadowIntensity="xs"
      >
        <div className="relative z-30 w-full flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 mr-4">
              <div className="flex items-center justify-center text-slate-900 select-none">
                <svg className="size-5.5 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
                </svg>
              </div>
              <span className="font-display text-base font-semibold tracking-tight select-none text-slate-900">
                Investable
              </span>
            </Link>
            
            {/* Vertical Divider */}
            <div className="hidden md:block h-5 w-[1px] bg-slate-300/60 mx-2" />
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 ml-2 text-xs font-semibold text-slate-600">
              <a href="#features" className="transition-colors hover:text-slate-900">Features</a>
              <Link href="/review" className="transition-colors hover:text-slate-900">Simulator</Link>
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-4">
            {/* CTAs */}
            <div className="flex items-center gap-2">
              <Link href="/review" className="pointer-events-auto">
                <Button 
                  variant="ghost"
                  className="hidden sm:inline-flex h-9 px-4 text-xs font-semibold rounded-full hover:bg-slate-900/5 transition-all duration-300 text-slate-700"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/review" className="pointer-events-auto">
                <Button 
                  className="h-9 px-5 bg-slate-950 text-white font-semibold text-xs rounded-full hover:bg-slate-800 transition-all duration-300 shadow-sm"
                >
                  Upload Deck
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  );
}
