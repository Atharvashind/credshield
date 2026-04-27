import { PageShell } from "@/components/PageShell";

const FEATURES = [
  {
    category: "Security",
    items: [
      {
        title: "Auth-gated entry points",
        desc: "Every state-mutating function calls env.require_auth(). No transaction can execute without an explicit wallet signature.",
      },
      {
        title: "Checks-effects-interactions",
        desc: "State is updated before any external token transfer, eliminating re-entrancy vectors at the contract level.",
      },
      {
        title: "Overflow-safe arithmetic",
        desc: "All arithmetic uses Rust's checked_* methods. An overflow returns a typed VaultError rather than silently wrapping.",
      },
    ],
  },
  {
    category: "Yield",
    items: [
      {
        title: "NAV-per-share accounting",
        desc: "Shares represent a proportional claim on vault liquidity. Yield accrues to the NAV, not to individual balances — no rebasing required.",
      },
      {
        title: "Admin-triggered rebalance",
        desc: "The rebalance() function is callable only by the initialisation admin. It applies a deterministic 50 bps yield increment per epoch.",
      },
      {
        title: "Seed-deposit stability",
        desc: "The first deposit seeds the pool at 1 token = SHARE_PRECISION shares, preventing NAV manipulation on empty vaults.",
      },
    ],
  },
  {
    category: "Transparency",
    items: [
      {
        title: "Typed on-chain events",
        desc: "Deposit, Withdraw, and Rebalance events are emitted with structured payloads. Any indexer can reconstruct vault history from genesis.",
      },
      {
        title: "Read-only RPC queries",
        desc: "get_vault_info and get_user_shares are simulation-only calls — no transaction fee, instant response.",
      },
      {
        title: "Open-source contracts",
        desc: "The full Rust source is published. Anyone can verify the deployed WASM hash matches the audited source.",
      },
    ],
  },
  {
    category: "Developer Experience",
    items: [
      {
        title: "Next.js App Router",
        desc: "Server Components for static chrome, Client Components only where interactivity is needed. Zero unnecessary hydration.",
      },
      {
        title: "SDK server-isolation",
        desc: "The Stellar SDK runs exclusively in API routes. The browser bundle contains only Freighter API — no native addons, no WASM in the client.",
      },
      {
        title: "Typed hook API",
        desc: "useMonolithVault exposes a fully-typed interface for wallet state, vault info, and transaction lifecycle — no raw fetch calls in components.",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <PageShell>
      <div className="mb-12">
        <p className="font-sans text-xs tracking-[0.2em] uppercase text-stone-600 mb-4">
          Feature Set
        </p>
        <h2 className="font-serif text-4xl font-normal text-stone-100 leading-tight max-w-lg">
          Every layer engineered for production.
        </h2>
      </div>

      <div className="space-y-10">
        {FEATURES.map((group) => (
          <div key={group.category}>
            {/* Category label */}
            <div className="flex items-center gap-4 mb-5">
              <span className="font-sans text-xs tracking-[0.18em] uppercase text-beige/70">
                {group.category}
              </span>
              <div className="flex-1 h-px bg-stone-900" />
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {group.items.map((item) => (
                <div
                  key={item.title}
                  className="glass-panel rounded-xl p-6 flex flex-col gap-3"
                >
                  <h3 className="font-sans text-sm font-semibold text-stone-200">
                    {item.title}
                  </h3>
                  <p className="font-sans text-xs text-stone-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
