import { PageShell } from "@/components/PageShell";
import { MonolithLogo } from "@/components/MonolithLogo";

const TIMELINE = [
  {
    date: "Q1 2025",
    event: "Protocol conception",
    detail: "Research into Soroban's resource model and share-accounting primitives.",
  },
  {
    date: "Q2 2025",
    event: "Contract architecture",
    detail: "Finalised the deposit/withdraw/rebalance model with NAV-per-share accounting.",
  },
  {
    date: "Q3 2025",
    event: "Testnet deployment",
    detail: "Monolith Vault v0.1 deployed to Stellar Testnet. Open for community testing.",
  },
  {
    date: "Q4 2025",
    event: "Security audit",
    detail: "Independent audit of the Soroban contract codebase.",
  },
  {
    date: "2026",
    event: "Mainnet launch",
    detail: "Production deployment with institutional onboarding.",
  },
];

const VALUES = [
  {
    title: "Transparency first",
    body: "Every decision, every fee, every yield calculation is verifiable on-chain. We publish our contracts, our methodology, and our audit reports.",
  },
  {
    title: "Non-custodial by design",
    body: "We never hold your assets. The vault contract is the custodian — governed by code, not by a team.",
  },
  {
    title: "Minimal surface area",
    body: "The contract does one thing well: custody assets and account for yield. No governance tokens, no complex incentive structures.",
  },
];

export default function AboutPage() {
  return (
    <PageShell>
      {/* Header */}
      <div className="mb-14">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-stone-600 mb-4">
          About Monolith
        </p>
        <h2 className="font-serif text-4xl font-normal text-stone-100 leading-tight max-w-lg">
          Built for the next generation of on-chain institutions.
        </h2>
        <p className="mt-5 font-sans text-sm text-stone-500 max-w-md leading-relaxed">
          Monolith is a Stellar Rise In Level 5 protocol submission. It
          demonstrates that institutional-grade treasury infrastructure can be
          built on Stellar&apos;s Soroban platform without sacrificing simplicity,
          auditability, or user sovereignty.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
        {VALUES.map((v) => (
          <div key={v.title} className="glass-panel rounded-xl p-7 flex flex-col gap-3">
            <div className="w-6 h-px bg-beige/40" />
            <h3 className="font-sans text-sm font-semibold text-stone-200">{v.title}</h3>
            <p className="font-sans text-xs text-stone-500 leading-relaxed">{v.body}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="mb-14">
        <div className="flex items-center gap-4 mb-7">
          <span className="font-sans text-xs tracking-[0.18em] uppercase text-beige/70">
            Roadmap
          </span>
          <div className="flex-1 h-px bg-stone-900" />
        </div>

        <div className="relative pl-6 border-l border-stone-900 space-y-8">
          {TIMELINE.map((item, i) => (
            <div key={i} className="relative">
              {/* Dot */}
              <span className="absolute -left-[1.4rem] top-1 w-2 h-2 rounded-full bg-stone-800 border border-stone-700" />
              <p className="font-mono text-xs text-stone-700 mb-1">{item.date}</p>
              <p className="font-sans text-sm font-semibold text-stone-300">{item.event}</p>
              <p className="font-sans text-xs text-stone-600 mt-1 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Logo lockup */}
      <div className="flex items-center gap-4 pt-6 border-t border-stone-900">
        <MonolithLogo className="w-7 h-7 text-stone-700" />
        <p className="font-sans text-xs text-stone-700">
          Monolith Protocol · Stellar Rise In · Level 5 Blue Belt
        </p>
      </div>
    </PageShell>
  );
}
