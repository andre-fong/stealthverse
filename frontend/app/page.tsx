"use client";

import { useState, useEffect, useCallback } from "react";
import StealthEmblem, { type AppPage } from "@/components/StealthEmblem";
import { useWallet } from "@/hooks/useWallet";
import ConnectPage from "@/views/ConnectPage";
import MainPage from "@/views/MainPage";
import BalancePage from "@/views/BalancePage";
import TransferPage from "@/views/TransferPage";

export default function Home() {
  const { initWallets, isConnected, disconnectWallet } = useWallet();
  const [page, setPage] = useState<AppPage>("connect");

  useEffect(() => {
    if (isConnected) setPage("main");
    else setPage("connect");
  }, [isConnected]);

  const handleConnectWallet = useCallback(() => {
    if (isConnected) setPage("main");
    else initWallets();
  }, [isConnected]);

  return (
    <div className="relative min-h-screen overflow-hidden shattered-bg bg-background text-on-surface font-body">
      {/* ── Mask emblem (animates between pages) ── */}
      <StealthEmblem
        page={page}
        onClick={
          page !== "connect" && page !== "main"
            ? () => setPage("main")
            : undefined
        }
      />

      {/* ── Page content ── */}
      <div className="relative z-10 min-h-screen">
        {page === "connect" && <ConnectPage onConnect={handleConnectWallet} />}
        {page === "main" && (
          <MainPage
            onBalance={() => setPage("balance")}
            onTransfer={() => setPage("transfer")}
          />
        )}
        {page === "balance" && <BalancePage onBack={() => setPage("main")} />}
        {page === "transfer" && <TransferPage onBack={() => setPage("main")} />}
      </div>

      {/* ── Decorative background shards (fixed) ── */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-1 bg-primary-container skew-neg-12 opacity-30" />
        <div className="absolute bottom-20 right-20 w-64 h-2 bg-on-surface-variant skew-neg-5 opacity-10" />
        <div className="absolute top-1/2 -left-20 w-96 h-0.5 bg-primary-container rotate-45 opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 border-[20px] border-primary-container/10 rotate-12" />
      </div>

      {/* ── Bottom‑left status panel ── */}
      <div className="fixed bottom-8 left-8 flex flex-col gap-2 z-20 group">
        <div className="bg-surface-container-highest p-4 skew-neg-5 border-l-4 border-primary-container relative overflow-hidden transition-all duration-300">
          <p className="font-label text-[10px] text-primary-fixed uppercase tracking-widest mb-1 opacity-70">
            Status
          </p>
          <div className="flex flex-col gap-1">
            <p className="font-headline font-bold text-white italic text-md leading-none">
              {page === "connect" ? "WAITING_FOR_HANDSHAKE" : "CONNECTED"}
              {page === "connect" && (
                <span className="animate-ticker">...</span>
              )}
            </p>

            {page !== "connect" && (
              <button
                onClick={disconnectWallet}
                className="text-left font-headline font-black italic text-xs text-primary-container hover:text-red-500 transition-colors cursor-pointer uppercase tracking-tighter"
              >
                [ DISCONNECT_SESSION ]
              </button>
            )}
          </div>

          {/* Subtle background highlight on connect */}
          {page !== "connect" && (
            <div className="absolute -right-2 -bottom-2 font-inter font-black italic text-4xl opacity-5 pointer-events-none select-none">
              AUTH
            </div>
          )}
        </div>
      </div>

      {/* ── Top‑right branding ── */}
      <div className="fixed top-8 right-8 z-20">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-headline font-black italic text-primary-container text-2xl leading-none">
              STEALTHVERSE
            </p>
            <p className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
              Made by ANDRE, ARWIN, EDDY
            </p>
          </div>
          <div className="w-12 h-12 bg-primary-container skew-neg-12 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {page === "connect" ? "lock" : "lock_open"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
