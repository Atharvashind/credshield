import { PageShell } from "@/components/PageShell";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

const TIERS = [
  {
    name: "Open",
    price: "Free",
    sub: "No minimum deposit",
    highlight: false,
    features: [
      "Unlimited deposits & withdrawals",
      "Real-time NAV tracking",
      "On-chain event history",
      "Freighter wallet integration",
      "Testnet access",
    ],
    cta: "Start on Testnet",
    href: "/",
  },
  {
    name: "Protocol",
    price: "0.10%",
    sub: "Performance fee on yield",
    highlight: true,
    features: [
      "Everything in Open",
      "Mainnet vault access",
      "Admin rebalance triggers",
      "Priority RPC endpoint",
      "Dedicated support channel",
    ],
    cta: "Connect Wallet",
    href: "/",
  },
  {
    name: "Institutional",
    price: "Custom",
    sub: "For funds & DAOs",
    highlight: false,
    features: [
      "Everything in Protocol",
      "Custom yield strategy",
      "Multi-sig admin keys",
      "White-label frontend",
      "SLA & audit support",
    ],
    cta: "Contact Us",
    href: "/contact",
  },
];

export default function PricingPage() {
  return (
    <PageShell>
      <div className="mb-12">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-stone-600 mb-4">
          Pricing
        </p>
        <h2 className="font-serif text-4xl font-normal text-stone-100 leading-tight max-w-lg">
          Simple, transparent fees.
        </h2>
        <p className="mt-4 font-sans text-sm text-stone-500 max-w-sm leading-relaxed">
          No hidden charges. Protocol fees are taken only on yield generated —
          never on principal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`
              relative flex flex-col rounded-xl p-8 gap-6
              ${tier.highlight
                ? "bg-beige text-obsidian"
                : "glass-panel text-stone-200"
              }
            `}
          >
            {tier.highlight && (
              <span className="absolute top-4 right-4 font-sans text-2xs tracking-widest uppercase bg-obsidian/10 text-obsidian/60 px-2 py-0.5 rounded">
                Most Popular
              </span>
            )}

            {/* Tier header */}
            <div>
              <p className={`font-sans text-xs tracking-widest uppercase mb-3 ${tier.highlight ? "text-obsidian/50" : "text-stone-600"}`}>
                {tier.name}
              </p>
              <p className={`font-serif text-4xl font-normal ${tier.highlight ? "text-obsidian" : "text-stone-100"}`}>
                {tier.price}
              </p>
              <p className={`font-sans text-xs mt-1 ${tier.highlight ? "text-obsidian/60" : "text-stone-600"}`}>
                {tier.sub}
              </p>
            </div>

            {/* Divider */}
            <div className={`h-px ${tier.highlight ? "bg-obsidian/10" : "bg-stone-900"}`} />

            {/* Features */}
            <ul className="flex flex-col gap-3 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className={`mt-0.5 text-xs ${tier.highlight ? "text-obsidian/40" : "text-stone-700"}`}>
                    ✦
                  </span>
                  <span className={`font-sans text-sm ${tier.highlight ? "text-obsidian/80" : "text-stone-400"}`}>
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href={tier.href}
              className={`
                inline-flex items-center justify-center gap-2
                px-5 py-2.5 rounded font-sans text-sm font-medium
                transition-all duration-200
                ${tier.highlight
                  ? "bg-obsidian text-beige hover:bg-stone-900"
                  : "border border-stone-800 text-stone-300 hover:border-beige hover:text-beige"
                }
              `}
            >
              {tier.cta}
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>

      {/* Fine print */}
      <p className="mt-10 font-sans text-xs text-stone-700 max-w-lg leading-relaxed">
        All fees are collected on-chain by the vault contract. The performance
        fee is deducted from yield accrued during each rebalance epoch, not from
        deposited principal. Stellar network transaction fees (~0.00001 XLM) are
        paid by the user's wallet.
      </p>
    </PageShell>
  );
}
