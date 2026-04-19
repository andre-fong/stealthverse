"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Typography from "@/components/Typography";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress } from "@/utils/wallet";
import useStealthTransaction from "@/hooks/useStealthTransaction";

interface TransferPageProps {
  onBack: () => void;
}

export function TransferPage({ onBack }: TransferPageProps) {
  const { account, isConnected } = useWallet();
  const { executeTransaction, isSending, error } = useStealthTransaction();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const [subtitleIn, setSubtitleIn] = useState(false);
  const [transferHovered, setTransferHovered] = useState(false);
  const [cancelHovered, setCancelHovered] = useState(false);
  const [transferFinished, setTransferFinished] = useState(false);

  useEffect(() => {
    // Animations
    const t1 = setTimeout(() => setSubtitleIn(true), 300);

    return () => {
      clearTimeout(t1);
    };
  }, []);

  useEffect(() => {
    if (!transferFinished) return;
    const tBack = setTimeout(() => onBack(), 1600);
    return () => {
      clearTimeout(tBack);
    };
  }, [transferFinished, onBack]);

  const handleSubmitTransaction = useCallback(async () => {
    try {
      const hash = await executeTransaction(recipient as `0x${string}`, amount);
      if (hash) {
        console.log("Transaction Hash:", hash);
        setTransferFinished(true);
      }
    } catch (e) {
      console.error("Submission failed:", e);
      // We don't set transferFinished if there's an error
    }
  }, [executeTransaction, recipient, amount]);

  return (
    <div className="relative min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-in-from-left {
          from { transform: translateX(-100vw); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
        @keyframes slide-in-from-right {
          from { transform: translateX(100vw); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
        @keyframes flip-reveal {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(180deg); }
        }
        @keyframes fly-off {
          0%   { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
          45%  { transform: translate(50vw, -25vh) rotate(20deg) scale(0.3); opacity: 1; }
          100% { transform: translate(300vw, -200vh) rotate(20deg) scale(0.1); opacity: 0; }
        }
      ` }} />
      <div className="ml-36 mt-30">
        <Typography
          shadow
          rollIn
          className="font-black text-7xl rotate-8"
          highlightArray={[0, 5]}
          rotateMap={{ 1: 6, 2: 5, 3: 13, 4: 5, 5: -4, 6: 11 }}
          scaleMap={{ 0: 1.4, 2: 1.1, 3: 0.85, 5: 0.9, 6: 1.05 }}
        >
          TRANSFER
        </Typography>

        <p
          className={`ml-28 font-inter font-bold text-xl tracking-tighter scale-y-[1.5] rotate-8 transition-all duration-100 ease-[cubic-bezier(.22,1,.36,1)] ${subtitleIn ? "translate-x-0 opacity-100" : "translate-x-[75vw] opacity-0"}`}
        >
          Send funds to a meta-address
        </p>
      </div>

      {/* TRANSFER BOX — 3D flip container */}
      <div
        className="px-24 md:px-48 mt-4"
        style={{
          perspective: "1200px",
          animation: transferFinished
            ? "fly-off 1.2s ease-in 0.5s forwards"
            : "",
        }}
      >
        <div
          className="w-full h-full relative transition-all duration-300 flex justify-center"
          style={{
            transformStyle: "preserve-3d",
            transform: transferFinished ? "rotateY(180deg)" : "",
          }}
        >
          {/* === FRONT FACE === */}
          <div
            className="w-[75%] h-116 absolute"
            style={{
              backfaceVisibility: "hidden",
              MozBackfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {/* Angled red accent strip behind the box */}
            <div
              className="absolute -inset-x-8 -inset-y-4 bg-primary-container -z-10"
              style={{
                clipPath: "polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%)",
                animation:
                  "slide-in-from-left 0.15s cubic-bezier(0.16, 1, 0.3, 1) 200ms both",
              }}
            />

            {/* Main form container */}
            <div
              className="relative bg-surface-container-lowest p-10 -skew-x-3 overflow-visible"
              style={{
                clipPath: "polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)",
                animation:
                  "slide-in-from-left 0.15s cubic-bezier(0.16, 1, 0.3, 1) 200ms both",
              }}
            >
              <div className="skew-x-3 space-y-8">
                {/* Meta-address field */}
                <div
                  style={{
                    animation:
                      "slide-in-from-right 0.15s cubic-bezier(0.16, 1, 0.3, 1) 400ms both",
                  }}
                >
                  <label className="font-headline font-black italic text-sm uppercase tracking-widest text-on-surface-variant block mb-3">
                    Transfer to meta-address...
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-container translate-x-1 translate-y-1 pointer-events-none" />
                    <input
                      id="transfer-recipient"
                      type="text"
                      placeholder="st:eth:0x..."
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value.trim())}
                      className={`relative w-full bg-black border-2 p-4 text-white font-mono text-lg focus:outline-none focus:border-primary-container transition-colors ${
                        error ? "border-red-500" : "border-white"
                      }`}
                    />
                  </div>
                </div>

                {/* Amount field */}
                <div
                  style={{
                    animation:
                      "slide-in-from-right 0.15s cubic-bezier(0.16, 1, 0.3, 1) 400ms both",
                  }}
                >
                  <label className="font-headline font-black italic text-sm uppercase tracking-widest text-on-surface-variant block mb-3">
                    An amount of...
                  </label>
                  <div className="relative flex items-stretch">
                    <div className="absolute inset-0 bg-primary-container translate-x-1 translate-y-1 pointer-events-none" />
                    <input
                      id="transfer-amount"
                      type="text"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`relative flex-1 bg-black border-2 border-white border-r-0 p-4 text-white font-mono text-lg focus:outline-none focus:border-primary-container transition-colors ${error ? "border-red-500" : "border-white"}`}
                    />
                    <div className="relative bg-black border-2 border-white border-l-0 px-5 flex items-center">
                      <span className="font-headline font-black italic text-xl text-cyan-400 -skew-x-6">
                        ETH
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decorative divider */}
                <div
                  className="h-1 bg-primary-container w-full"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 96% 100%, 4% 100%)",
                  }}
                />

                {/* Error text */}
                {error && (
                  <p className="text-red-400 font-label text-xs mt-2 italic">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div
              className="flex gap-6 mt-8 -skew-x-3"
              style={{
                animation:
                  "slide-in-from-right 0.15s cubic-bezier(0.16, 1, 0.3, 1) 400ms both",
              }}
            >
              {/* Transfer button */}
              <div
                className="relative flex-1 overflow-visible"
                onMouseEnter={() => setTransferHovered(true)}
                onMouseLeave={() => setTransferHovered(false)}
              >
                <div className="absolute inset-0 bg-surface-container-low translate-x-2 translate-y-2" />
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angleDeg = i * 45;
                    const angleRad = (angleDeg * Math.PI) / 180;
                    const radius = transferHovered ? -5 : 2000;
                    const size = transferHovered ? 45 : 1000;
                    const x = Math.cos(angleRad) * radius;
                    const y = Math.sin(angleRad) * radius;
                    return (
                      <div
                        key={i}
                        className="absolute bg-primary-container"
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                          top: `calc(50% + ${y}px)`,
                          left: `calc(50% + ${x}px)`,
                          clipPath: "polygon(0 0, 8% 0, 100% 100%, 0 8%)",
                          transform: `translate(-50%, -50%) rotate(${angleDeg + 135}deg)`,
                          transition: transferHovered
                            ? "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
                            : "none",
                        }}
                      />
                    );
                  })}
                </div>
                <button
                  id="send-transfer-btn"
                  onClick={handleSubmitTransaction}
                  className="relative w-full bg-white hover:bg-primary-container text-black hover:text-white font-headline font-black italic text-2xl py-5 px-8 transition-colors flex items-center justify-center gap-4 cursor-pointer clip-joker"
                  disabled={!!error || isSending}
                >
                  <span className="uppercase tracking-tighter">Transfer</span>
                  <span className="material-symbols-outlined text-3xl">
                    arrow_forward
                  </span>
                </button>
              </div>

              {/* Cancel button */}
              <div
                className="relative w-40 overflow-visible"
                onMouseEnter={() => setCancelHovered(true)}
                onMouseLeave={() => setCancelHovered(false)}
              >
                <div className="absolute inset-0 bg-surface-container-highest translate-x-2 translate-y-2" />
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angleDeg = i * 45;
                    const angleRad = (angleDeg * Math.PI) / 180;
                    const radius = cancelHovered ? 0 : 2000;
                    const size = cancelHovered ? 30 : 1000;
                    const x = Math.cos(angleRad) * radius;
                    const y = Math.sin(angleRad) * radius;
                    return (
                      <div
                        key={i}
                        className="absolute bg-primary-container"
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                          top: `calc(50% + ${y}px)`,
                          left: `calc(50% + ${x}px)`,
                          clipPath: "polygon(0 0, 8% 0, 100% 100%, 0 8%)",
                          transform: `translate(-50%, -50%) rotate(${angleDeg + 135}deg)`,
                          transition: cancelHovered
                            ? "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
                            : "none",
                        }}
                      />
                    );
                  })}
                </div>
                <button
                  onClick={onBack}
                  className="relative w-full bg-surface-container-high hover:bg-white text-on-surface hover:text-black font-headline font-black italic text-xl py-5 px-6 transition-colors flex items-center justify-center cursor-pointer clip-joker"
                >
                  <span className="uppercase tracking-tighter">Back</span>
                </button>
              </div>
            </div>
          </div>

          {/* === BACK FACE — Premium Envelope === */}
          <div
            className="w-[85%] h-120 absolute rotate-y-180"
            style={{
              backfaceVisibility: "hidden",
              MozBackfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div
              className="relative w-full h-full bg-[#f5f0e8] -skew-x-3 overflow-hidden shadow-2xl"
              style={{
                clipPath: "polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)",
              }}
            >
              {/* Left flap */}
              <div
                className="absolute inset-0 bg-[#ebe4d8] shadow-inner"
                style={{ clipPath: "polygon(0 0, 0 100%, 50% 50%)" }}
              />
              {/* Right flap */}
              <div
                className="absolute inset-0 bg-[#ebe4d8] shadow-inner"
                style={{ clipPath: "polygon(100% 0, 100% 100%, 50% 50%)" }}
              />
              {/* Bottom flap */}
              <div
                className="absolute inset-0 bg-[#dfd6c5] shadow-inner"
                style={{ clipPath: "polygon(0 100%, 100% 100%, 50% 50%)" }}
              />
              {/* Top flap (the fold) */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ filter: "drop-shadow(0 6px 6px rgba(0,0,0,0.3))" }}
              >
                <div
                  className="absolute inset-0 bg-[#f5f0e8] border-b border-black/5"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 50%)",
                  }}
                />
              </div>

              {/* Central Wax Seal */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-24 h-24 rounded-full bg-[#b91c1c] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_-4px_6px_rgba(0,0,0,0.3)] flex items-center justify-center relative overflow-hidden"
                  style={{
                    border: "2px solid #991b1b",
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)]" />
                  <img
                    src="/stealth-mask.png"
                    alt="Seal"
                    className="w-16 h-16 object-contain opacity-90 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* end 3D container */}
        </div>
      </div>

      {isConnected && (
        <div
          className={`fixed flex justify-end items-center top-28 right-0 w-fit pl-20 pr-10 py-4 bg-surface-container overflow-hidden transition-all duration-150 ease-in-out transform ${
            subtitleIn
              ? "translate-x-0 opacity-100"
              : "translate-x-[100vw] opacity-0 pointer-events-none"
          }`}
          style={{
            clipPath: "polygon(0 0, 100% 0%, 100% 100%, 5% 90%)",
          }}
        >
          <p className="font-bold text-lg z-10">
            Sending from {account ? formatAddress(account) : "null"}
          </p>
          <p className="absolute text-primary-container right-0 -rotate-15 font-black font-inter opacity-35 text-4xl scale-y-[1.7]">
            NEW
          </p>
        </div>
      )}
    </div>
  );
}

export default TransferPage;
