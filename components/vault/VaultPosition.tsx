"use client";

import { useMonolithVault } from "@/hooks/useMonolithVault";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

export function VaultPosition() {
  const { walletAddress, vaultInfo, userShares } = useMonolithVault();

  if (!walletAddress) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center">
        <p className="font-sans text-sm text-stone-600">
          Connect your wallet to view your position.
        </p>
      </div>
    );
  }

  const userSharesNum = Number(userShares) / 10_000_000;
  const navPerShare = vaultInfo ? Number(vaultInfo.navPerShare) / 10_000_000 : 1;
  const positionValueXLM = (userSharesNum * navPerShare).toFixed(4);
  const totalLiquidityXLM = vaultInfo
    ? (Number(vaultInfo.totalLiquidity) / 10_000_000).toFixed(2)
    : "0.00";
  const totalSharesNum = vaultInfo ? Number(vaultInfo.totalShares) / 10_000_000 : 0;
  const poolShare =
    totalSharesNum > 0 ? ((userSharesNum / totalSharesNum) * 100).toFixed(4) : "0.0000";

  // Simulated yield earned (assuming initial deposit at NAV = 1.0)
  const initialValue = userSharesNum * 1.0;
  const currentValue = userSharesNum * navPerShare;
  const yieldEarned = (currentValue - initialValue).toFixed(4);
  const yieldPct =
    initialValue > 0 ? (((currentValue - initialValue) / initialValue) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* Hero stat */}
      <div className="glass-panel rounded-xl p-8 text-center">
        <p className="font-sans text-xs text-stone-600 uppercase tracking-wider mb-3">
          Total Position Value
        </p>
        <p className="font-serif text-5xl text-stone-100 mb-2">
          {positionValueXLM}{" "}
          <span className="font-sans text-xl text-stone-500">XLM</span>
        </p>
        <p className="font-sans text-sm text-green-500">
          +{yieldEarned} XLM yield ({yieldPct}%)
        </p>
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Shares Held", value: userSharesNum.toFixed(4), unit: "MVLT" },
          { label: "NAV per Share", value: navPerShare.toFixed(6), unit: "XLM" },
          { label: "Pool Share", value: poolShare, unit: "%" },
          { label: "Vault TVL", value: totalLiquidityXLM, unit: "XLM" },
        ].map((s) => (
          <div key={s.label} className="glass-panel rounded-xl p-5">
            <p className="font-sans text-2xs text-stone-700 uppercase tracking-wider mb-2">
              {s.label}
            </p>
            <p className="font-mono text-base text-stone-200">
              {s.value}{" "}
              <span className="text-xs text-stone-600">{s.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Performance */}
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <p className="font-sans text-xs text-stone-600 uppercase tracking-wider">
          Performance Breakdown
        </p>
        <div className="space-y-3">
          {[
            { label: "Initial deposit (est.)", value: `${initialValue.toFixed(4)} XLM` },
            { label: "Current value", value: `${currentValue.toFixed(4)} XLM` },
            { label: "Yield earned", value: `+${yieldEarned} XLM`, highlight: true },
            { label: "Return", value: `+${yieldPct}%`, highlight: true },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center">
              <span className="font-sans text-sm text-stone-500">{row.label}</span>
              <span
                className={`font-mono text-sm ${
                  row.highlight ? "text-green-500 font-semibold" : "text-stone-300"
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-4">
        <a
          href="/dashboard"
          className="flex-1 glass-panel rounded-xl px-5 py-4 flex items-center justify-between hover:border-beige/30 transition-colors group"
        >
          <span className="font-sans text-sm text-stone-300 group-hover:text-beige transition-colors">
            View full dashboard
          </span>
          <ArrowRightIcon className="w-4 h-4 text-stone-600 group-hover:text-beige transition-colors" />
        </a>
        <a
          href="https://stellar.expert/explorer/testnet/account/${walletAddress}"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 glass-panel rounded-xl px-5 py-4 flex items-center justify-between hover:border-beige/30 transition-colors group"
        >
          <span className="font-sans text-sm text-stone-300 group-hover:text-beige transition-colors">
            View on explorer
          </span>
          <ArrowRightIcon className="w-4 h-4 text-stone-600 group-hover:text-beige transition-colors" />
        </a>
      </div>
    </div>
  );
}
