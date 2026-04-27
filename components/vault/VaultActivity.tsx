"use client";

import { useEffect, useState } from "react";
import { useMonolithVault } from "@/hooks/useMonolithVault";

interface TxRecord {
  type: "deposit" | "withdraw" | "rebalance";
  amount: string;
  shares: string;
  hash: string;
  time: string;
  status: "confirmed";
}

const TYPE_CONFIG = {
  deposit:   { label: "Deposit",   color: "text-green-500",  bg: "bg-green-500/10",  dot: "bg-green-500"  },
  withdraw:  { label: "Withdraw",  color: "text-red-400",    bg: "bg-red-400/10",    dot: "bg-red-400"    },
  rebalance: { label: "Rebalance", color: "text-beige",      bg: "bg-beige/10",      dot: "bg-beige"      },
};

export function VaultActivity() {
  const { walletAddress } = useMonolithVault();
  const [records, setRecords] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | TxRecord["type"]>("all");

  const load = async () => {
    setLoading(true);
    try {
      const url = walletAddress
        ? `/api/vault/events?address=${walletAddress}`
        : `/api/vault/events`;
      const res = await fetch(url);
      if (res.ok) setRecords(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [walletAddress]);

  const filtered = filter === "all" ? records : records.filter((r) => r.type === filter);

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <span className="font-sans text-xs text-stone-600 uppercase tracking-wider mr-2">
          Filter:
        </span>
        {(["all", "deposit", "withdraw", "rebalance"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`
              px-3 py-1.5 rounded font-sans text-xs capitalize transition-colors
              ${filter === f
                ? "bg-beige text-obsidian font-semibold"
                : "border border-stone-800 text-stone-500 hover:text-stone-300"
              }
            `}
          >
            {f}
          </button>
        ))}
        <button
          onClick={load}
          className="ml-auto font-sans text-xs text-stone-600 hover:text-stone-300 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Activity feed */}
      <div className="glass-panel rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-stone-900">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="w-2 h-2 rounded-full bg-stone-900 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-stone-900 rounded animate-pulse w-32" />
                  <div className="h-2 bg-stone-900 rounded animate-pulse w-48" />
                </div>
                <div className="h-3 bg-stone-900 rounded animate-pulse w-20" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center space-y-2">
            <p className="font-sans text-sm text-stone-600">
              {walletAddress
                ? filter !== "all"
                  ? `No ${filter} transactions found.`
                  : "No transactions yet for this vault."
                : "Connect your wallet to see your activity."}
            </p>
            {walletAddress && filter === "all" && (
              <p className="font-sans text-xs text-stone-700">
                Transactions appear here after your first deposit or withdrawal.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-stone-900">
            {filtered.map((tx, i) => {
              const cfg = TYPE_CONFIG[tx.type];
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-stone-900/30 transition-colors"
                >
                  {/* Type dot */}
                  <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`font-sans text-xs px-2 py-0.5 rounded ${cfg.color} ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                      <span className="font-mono text-sm text-stone-200 truncate">
                        {tx.amount}
                      </span>
                      {tx.shares !== "—" && (
                        <span className="font-mono text-xs text-stone-600 truncate">
                          · {tx.shares}
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-xs text-stone-700">{tx.time}</p>
                  </div>

                  {/* Tx hash link */}
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-stone-700 hover:text-beige transition-colors shrink-0"
                  >
                    {tx.hash.slice(0, 6)}…{tx.hash.slice(-4)}
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary row */}
      {!loading && records.length > 0 && (
        <div className="flex gap-6 px-1">
          {(["deposit", "withdraw", "rebalance"] as const).map((type) => {
            const count = records.filter((r) => r.type === type).length;
            const cfg = TYPE_CONFIG[type];
            return (
              <div key={type} className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                <span className="font-sans text-xs text-stone-600">
                  {count} {cfg.label.toLowerCase()}{count !== 1 ? "s" : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
