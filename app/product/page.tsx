import { PageShell } from "@/components/PageShell";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

const PILLARS = [
  {
    number: "01",
    title: "Non-Custodial Architecture",
    body:
      "Your assets never leave your control. The vault contract holds tokens on-chain; only your wallet signature can authorise a withdrawal. No multisig committee, no admin key, no counterparty risk.",
  },
  {
    number: "02",
    title: "Algorithmic Yield Engine",
    body:
      "The rebalance function applies a deterministic yield strategy on every epoch. Yield accrues directly to the NAV per share — no manual claiming, no compounding friction.",
  },
  {
    number: "03",
    title: "Soroban Smart Contracts",
    body:
      "Built on Stellar's Soroban VM. Contracts are written in Rust, compiled to WASM, and deployed with a fixed resource footprint — predictable fees, no gas surprises.",
  },
  {
    number: "04",
    title: "Institutional-Grade Auditability",
    body:
      "Every deposit, withdrawal, and rebalance emits a strictly-typed on-chain event. Off-chain indexers can reconstruct the full vault history from genesis without trusting any API.",
  },
];

export default function ProductPage() {
  return (
    <PageShell>
      {/* Hero */}
      <div className="mb-14">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-stone-600 mb-4">
          Product Overview
        </p>
        <h2 className="font-serif text-4xl font-normal text-stone-100 leading-tight max-w-lg">
          Treasury infrastructure built for institutions.
        </h2>
        <p className="mt-4 font-sans text-sm text-stone-500 max-w-md leading-relaxed">
          Monolith is a non-custodial vault protocol on the Stellar network.
          Deposit any Stellar asset, earn algorithmic yield, and redeem at any
          time — all governed by immutable Soroban contracts.
        </p>
      </div>

      {/* Pillars grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-stone-900 border border-stone-900 rounded-xl overflow-hidden">
        {PILLARS.map((pillar) => (
          <div
            key={pillar.number}
            className="bg-obsidian-muted p-8 flex flex-col gap-4 hover:bg-stone-950 transition-colors duration-200"
          >
            <span className="font-mono text-xs text-stone-700">
              {pillar.number}
            </span>
            <h3 className="font-sans text-base font-semibold text-stone-200">
              {pillar.title}
            </h3>
            <p className="font-sans text-sm text-stone-500 leading-relaxed">
              {pillar.body}
            </p>
          </div>
        ))}
      </div>

      {/* CTA row */}
      <div className="mt-12 flex items-center gap-6">
        <a
          href="/features"
          className="inline-flex items-center gap-2 font-sans text-sm text-beige hover:text-beige-light transition-colors"
        >
          Explore features
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </a>
        <a
          href="/pricing"
          className="inline-flex items-center gap-2 font-sans text-sm text-stone-500 hover:text-stone-300 transition-colors"
        >
          View pricing
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </a>
      </div>
    </PageShell>
  );
}
