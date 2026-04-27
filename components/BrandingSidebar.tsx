import { MonolithLogo } from "@/components/MonolithLogo";
import { GeometricTexture } from "@/components/GeometricTexture";

/**
 * BrandingSidebar
 *
 * The left column of the two-column layout.  Renders on the server — no
 * interactivity required here.
 *
 * Visual hierarchy:
 *   1. Logo lockup (top-left)
 *   2. Geometric SVG texture overlay (full bleed, low opacity)
 *   3. Hero headline (bottom-left, large serif)
 */
export function BrandingSidebar() {
  return (
    <aside
      aria-label="Monolith brand panel"
      className="
        relative flex flex-col justify-between
        w-[42%] min-w-[320px] h-full
        bg-beige overflow-hidden
        px-10 py-10
      "
    >
      {/* ------------------------------------------------------------------ */}
      {/* Geometric texture overlay                                           */}
      {/* ------------------------------------------------------------------ */}
      <GeometricTexture />

      {/* ------------------------------------------------------------------ */}
      {/* Logo lockup                                                         */}
      {/* ------------------------------------------------------------------ */}
      <header className="relative z-10 flex items-center gap-3">
        <MonolithLogo className="w-8 h-8 text-obsidian" />
        <span className="font-sans text-base font-semibold tracking-widest uppercase text-obsidian/80">
          Monolith
        </span>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Hero headline                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10 space-y-4">
        {/* Eyebrow label */}
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-obsidian/50">
          Stellar Network · Soroban
        </p>

        {/* Primary headline */}
        <h1
          className="
            font-serif font-normal text-obsidian
            text-[2.75rem] leading-[1.1] tracking-tight
          "
        >
          A new dimension
          <br />
          <em className="not-italic font-medium">of clarity.</em>
        </h1>

        {/* Supporting descriptor */}
        <p className="font-sans text-sm text-obsidian/60 max-w-xs leading-relaxed">
          Institutional-grade treasury management, fully on-chain and
          non-custodial.
        </p>
      </div>
    </aside>
  );
}
