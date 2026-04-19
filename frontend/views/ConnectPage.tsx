"use client";

import React from "react";

interface ConnectPageProps {
  onConnect: () => void;
}

export function ConnectPage({ onConnect }: ConnectPageProps) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-12 p-8">
      {/* Spacer to push CTA below the centred emblem */}
      <div className="h-64 md:h-80" />

      {/* CTA */}
      <div className="flex flex-col items-center gap-8 w-full max-w-md animate-fade-up">
        <div className="relative w-full">
          <div className="absolute inset-0 bg-primary-container translate-x-3 translate-y-3" />
          <button
            id="connect-wallet-btn"
            onClick={onConnect}
            className="relative w-full bg-on-surface hover:bg-white text-background font-headline font-black italic text-3xl py-6 px-12 transition-all active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-4 clip-joker cursor-pointer"
          >
            <span className="uppercase tracking-tighter">Connect Wallet</span>
            <span className="material-symbols-outlined text-4xl transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default ConnectPage;
