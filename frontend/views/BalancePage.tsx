"use client";

import { useState, useEffect, useRef } from "react";
import Typography from "@/components/Typography";
import { useWallet } from "@/hooks/useWallet";
import useAnnouncements from "@/hooks/useAnnouncements";
import { formatAddress } from "@/utils/wallet";
import useStealthWithdraw from "@/hooks/useStealthWithdraw";

interface BalancePageProps {
  onBack: () => void;
}

export function BalancePage({ onBack }: BalancePageProps) {
  const [subtitleIn, setSubtitleIn] = useState(false);
  const [statusBoxIn, setStatusBoxIn] = useState(false);
  const [selectedWalletIndex, setSelectedWalletIndex] = useState<number | null>(
    null,
  );
  const {
    isGeneratingStealth,
    viewPrvKey,
    spendPrvKey,
    spendPubKey,
    generateStealthKeys,
  } = useWallet();
  const { fetchStealthWallets, stealthWallets, isSyncing } = useAnnouncements();

  const hasRequestedKeys = useRef(false);
  const [recipient, setRecipient] = useState<string>("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    withdrawFromStealth,
    isWithdrawing,
    error: withdrawError,
  } = useStealthWithdraw();

  const handleWithdraw = async () => {
    if (selectedWalletIndex === null || !recipient) return;
    const activeWallet = stealthWallets[selectedWalletIndex];

    setLocalError(null);
    setTxHash(null);

    try {
      const hash = await withdrawFromStealth(
        activeWallet.stealthAddress,
        activeWallet.ephemeralPubKey,
        recipient as `0x${string}`,
        activeWallet.amount,
      );
      setTxHash(hash);
    } catch (e: any) {
      console.error(e);
      setLocalError(e.message || "An error occurred during withdrawal.");
    }
  };

  useEffect(() => {
    setRecipient("");
    setTxHash(null);
    setLocalError(null);
  }, [selectedWalletIndex]);

  useEffect(() => {
    // Animations
    const t1 = setTimeout(() => setSubtitleIn(true), 300);
    const t2 = setTimeout(() => setStatusBoxIn(true), 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    // If we don't have keys, prompt for them once
    if (!viewPrvKey && !spendPrvKey && !hasRequestedKeys.current) {
      hasRequestedKeys.current = true;
      generateStealthKeys();
    }
  }, [viewPrvKey, spendPrvKey, generateStealthKeys]);

  useEffect(() => {
    // Whenever keys are available, go fetch wallets!
    if (viewPrvKey && spendPrvKey && spendPubKey) {
      fetchStealthWallets();
    }
  }, [viewPrvKey, spendPrvKey, spendPubKey, fetchStealthWallets]);

  return (
    <main className="flex">
      <style>{`
        @keyframes fly-up-in {
          from { transform: translateY(100vh); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
        @keyframes slide-in-from-left {
          from { transform: translateX(-100vw); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
        @keyframes slide-in-from-right {
          from { transform: translateX(100vw); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
      `}</style>
      <div className="flex flex-2 max-w-200 flex-col items-start min-h-screen pt-28 pl-10 md:pl-40 pr-8 gap-10">
        <div className="p-1 -ml-10 md:-ml-32 mt-1 -rotate-15">
          <Typography
            shadow
            rollIn
            className="font-black text-7xl"
            highlightArray={[0, 2]}
            rotateMap={{ 1: 6, 2: 5, 3: 13, 4: 5, 5: -4, 6: 11 }}
            scaleMap={{ 0: 1.4, 2: 1.1, 3: 0.85, 5: 0.9, 6: 1.05 }}
          >
            BALANCE
          </Typography>

          <p
            className={`font-inter font-bold text-xl tracking-tighter scale-y-[1.5] pl-3 pt-2 rotate-2 transition-all duration-100 ease-[cubic-bezier(.22,1,.36,1)] ${subtitleIn ? "translate-x-0 opacity-100" : "translate-x-[75vw] opacity-0"}`}
          >
            Check your funds
          </p>

          {/* STATUS BOX */}
          <div
            className={`transition-all duration-100 ease-[cubic-bezier(.22,1,.36,1)] ${statusBoxIn ? "translate-x-0 opacity-100" : "-translate-x-[50vw] opacity-0"}`}
          >
            <div className="relative scale-y-[1.3] scale-x-[0.9] translate-x-50 -translate-y-8 rotate-10">
              {/* White border layer (manually offset polygon) */}
              <div
                className="absolute inset-0 bg-white"
                style={{
                  clipPath:
                    "polygon(0 26%, 0 56%, 43% 56%, 40% 63%, 100% 62%, 100% 33%, 54% 33%, 57% 26%)",
                }}
              />
              {/* Fill layer */}
              <div
                className="w-full h-48 bg-surface-container-lowest"
                style={{
                  clipPath:
                    "polygon(2% 29%, 2% 53%, 46% 53%, 43% 61%, 98% 60%, 98% 36%, 51% 36%, 54% 29%)",
                }}
              />
              {/* Text (outside clip-path so it's not clipped) */}
              {isGeneratingStealth ? (
                <div className="font-black font-inter text-sm text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -translate-y-5 z-10 scale-x-[1.3] rotate-1">
                  Deriving stealth keys...
                </div>
              ) : isSyncing ? (
                <div className="font-black font-inter text-lg text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -translate-y-6 z-10 scale-x-[1.3]">
                  Syncing...
                </div>
              ) : (
                <div className="font-black font-inter text-sm text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -translate-y-5 z-10 scale-x-[1.3] rotate-1">
                  Ready to withdraw
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full items-start gap-12">
          {/* STEALTH WALLET LIST */}
          <div
            className="-ml-20 -mt-42 -rotate-3 w-full"
            style={{
              animation:
                "fly-up-in 0.15s cubic-bezier(0.16, 1, 0.3, 1) 300ms both",
            }}
          >
            {/* Row */}
            {stealthWallets.map((wallet, index) => (
              <button
                key={index}
                onClick={() =>
                  setSelectedWalletIndex((prev) =>
                    prev === index ? null : index,
                  )
                }
                className="w-full relative flex justify-between items-center px-6 py-2 bg-surface-container-lowest cursor-pointer group transition-all"
              >
                {/* Red pointed background on hover (stays on selected) */}
                <div
                  className={`absolute rotate-1 inset-0 bg-primary-container scale-y-[7] translate-y-6 -translate-x-10 origin-left transition-all duration-150 pointer-events-none z-10 ${
                    selectedWalletIndex === index
                      ? "opacity-100 scale-x-[1.5]"
                      : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-[1.5]"
                  }`}
                  style={{
                    clipPath: "polygon(6% 34%, 0 56%, 100% 41%)",
                  }}
                />

                <p className="font-bold text-lg relative z-20">
                  {formatAddress(wallet.stealthAddress)}
                </p>
                <div
                  className={`px-3 py-2 rounded-full flex gap-3 bg-black text-cyan-400 relative z-20 transition-all duration-150 ${
                    selectedWalletIndex === index
                      ? "text-white"
                      : "group-hover:text-white"
                  }`}
                >
                  <p className="font-black text-xl font-inter italic -skew-x-8">
                    {wallet.amount}
                  </p>{" "}
                  <p className="-rotate-4 font-inter font-black -skew-5 text-lg italic">
                    ETH
                  </p>
                </div>
              </button>
            ))}
            {/* Styled corner at end of list */}
            <div
              className="w-full h-10 bg-surface-container-lowest z-100"
              style={{
                clipPath: "polygon(0% 0%, 0% 100%, 100% 0%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* WITHDRAW AND INFO PANEL */}
      <div
        className={`flex-1 max-w-180 pt-56 pr-20 transition-all duration-150 ease-in-out transform ${
          selectedWalletIndex !== null
            ? "translate-x-0 opacity-100"
            : "translate-x-[100vw] opacity-0 pointer-events-none"
        }`}
      >
        {/* Withdraw to panel */}
        <div className="relative p-8 bg-surface-container-low border-r-8 border-primary-container skew-neg-3 -skew-x-5 shadow-2xl opacity-80">
          <Typography className="font-black text-3xl italic text-white highlight-primary">
            WITHDRAW&ensp;TO...
          </Typography>

          <div className="mt-5 space-y-6">
            <div>
              <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-2 italic">
                Recipient Address
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-primary-container translate-x-1 translate-y-1 block pointer-events-none" />
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="relative w-full bg-black border-2 border-white p-4 text-white font-mono text-lg focus:outline-none focus:border-primary-container transition-all"
                />
              </div>
            </div>

            {localError && (
              <div className="text-red-500 font-bold font-mono text-sm leading-tight px-1">
                ERROR: {localError}
              </div>
            )}

            <div className="relative w-full overflow-hidden">
              <div className="absolute inset-0 bg-primary-container translate-x-2 translate-y-2" />
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing || !recipient}
                className="relative w-full bg-white text-black font-headline font-black italic text-2xl py-4 transition-all active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-4 cursor-pointer clip-joker disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isWithdrawing ? "EXECUTING..." : "EXECUTE"}</span>
                <span className="material-symbols-outlined text-3xl animate-ticker">
                  keyboard_double_arrow_right
                </span>
              </button>
            </div>

            {txHash && (
              <p className="max-w-64 break-all">
                {/* <Typography className="text-2xl font-black">Success</Typography> */}
                Tx Hash: <br /> {txHash}
              </p>
            )}
          </div>
        </div>

        {/* WALLET INFO BOX */}
        {selectedWalletIndex !== null &&
          stealthWallets[selectedWalletIndex] && (
            <div className="mt-8 bg-surface-container-highest p-6 -skew-x-5 border-l-4 border-primary-container shadow-2xl opacity-90 drop-shadow-xl scale-[0.8] origin-bottom-right">
              <p className="font-label text-xs text-primary-fixed uppercase tracking-widest mb-4 border-b border-surface-variant pb-2">
                Transmission Data
              </p>

              <div className="space-y-5">
                <div>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                    Source Identity
                  </p>
                  <p className="font-headline font-bold text-white italic text-xl leading-none">
                    {stealthWallets[selectedWalletIndex].sender
                      ? formatAddress(
                          stealthWallets[selectedWalletIndex].sender,
                        )
                      : "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                    Timestamp Delivered
                  </p>
                  <p className="font-headline font-bold text-white italic text-xl leading-none">
                    {new Date(
                      stealthWallets[selectedWalletIndex].timestamp,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>

      <div
        className={`fixed flex justify-end items-center top-28 right-0 w-fit pl-20 pr-10 py-4 bg-surface-container overflow-hidden transition-all duration-150 delay-300 ease-in-out transform ${
          selectedWalletIndex !== null
            ? "translate-x-0 opacity-100"
            : "translate-x-[100vw] opacity-0 pointer-events-none"
        }`}
        style={{
          clipPath: "polygon(0 0, 100% 0%, 100% 100%, 5% 90%)",
        }}
      >
        <p className="font-bold text-lg z-10">
          Don't use your personal address!
        </p>
        <p className="absolute text-primary-container right-0 -rotate-15 font-black font-inter opacity-35 text-4xl scale-y-[1.7]">
          WARN
        </p>
      </div>
    </main>
  );
}

export default BalancePage;
