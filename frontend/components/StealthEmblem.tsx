"use client";

import Image from "next/image";

export type AppPage = "connect" | "main" | "balance" | "transfer";

/**
 * Position / size configuration per page state.
 * Uses CSS classes so Tailwind can tree-shake properly.
 * The wrapper is `fixed` so it can float to any viewport position.
 */
const PAGE_STYLES: Record<
  AppPage,
  {
    wrapper: string; // position on screen
    circle: string; // size of the circle frame
    inner: string; // size of the inner image container
    glow: string; // glow element tweaks
  }
> = {
  /* ── Connect: big, centred ── */
  connect: {
    wrapper: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80%]",
    circle: "w-64 h-64 md:w-80 md:h-80 border-8 shadow-offset-red",
    inner: "w-48 h-48 md:w-60 md:h-60",
    glow: "scale-150 opacity-20",
  },

  /* ── Main: smaller, top-left corner ── */
  main: {
    // wrapper: "top-6 left-8",
    wrapper:
      "top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 -translate-x-72",
    circle: "w-48 h-48 md:w-48 md:h-48 border-4 shadow-offset-red-sm",
    inner: "w-32 h-32 md:w-36 md:h-36",
    glow: "scale-125 opacity-10",
  },

  /* ── Balance: medium, right side, vertically centred ── */
  balance: {
    wrapper: "top-6 left-8",
    circle: "w-20 h-20 md:w-24 md:h-24 border-4 shadow-offset-red-sm",
    inner: "w-14 h-14 md:w-18 md:h-18",
    glow: "scale-125 opacity-10",
  },

  /* ── Transfer: small, bottom-right ── */
  transfer: {
    wrapper: "top-6 left-8",
    circle: "w-20 h-20 md:w-24 md:h-24 border-4 shadow-offset-red-sm",
    inner: "w-14 h-14 md:w-18 md:h-18",
    glow: "scale-125 opacity-10",
  },
};

interface StealthEmblemProps {
  page: AppPage;
  onClick?: () => void;
}

export default function StealthEmblem({ page, onClick }: StealthEmblemProps) {
  const s = PAGE_STYLES[page];

  return (
    <div
      className={`fixed z-30 transition-all duration-250 ease-[cubic-bezier(.4,0,.2,1)] ${s.wrapper}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="relative group cursor-pointer">
        {/* glow */}
        <div
          className={`absolute inset-0 bg-primary-container blur-3xl rounded-full animate-pulse-glow transition-all duration-700 ${s.glow}`}
        />

        {/* circle frame */}
        <div
          className={`relative rounded-full border-on-surface flex items-center justify-center bg-background group-hover:-translate-x-1 group-hover:-translate-y-1 transition-all duration-700 ${s.circle}`}
        >
          <div
            className={`flex items-center justify-center transition-all duration-700 ${s.inner}`}
          >
            <Image
              src="/stealth-mask.png"
              alt="Stealth Mask"
              width={240}
              height={240}
              className="w-full h-full object-contain translate-y-0.5 scale-[1.1] -rotate-6"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
