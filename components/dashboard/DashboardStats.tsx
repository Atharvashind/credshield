"use client";

import { useEffect, useState } from "react";
import { useMonolithVault } from "@/hooks/useMonolithVault";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}

function StatCard({ label, value, sub, trend, loading }: StatCardProps) {
  return (
    <div className="glass-panel rounded-xl p-6 flex flex-col gap-3">
      <p className="font-sans text-xs text-stone-600 uppercase tracking-wider">{label}</p>
      {loading ? (
        <div className="h-8 w-24 bg-stone-900 rounded animate-pulse" />
      ) : (
        <p className="font-serif text-3xl text-stone-100">{value}</p>
      )}
      {sub && (
        <p className={`font-sans text-xs ${
          trend === "up" ? "text-green-500" :
          trend === "down" ? "text-red-500" :
          "text-stone-600"
        }`}>
          {trend === "up" && "↑ "}
          {trend === "down" && "↓ "}
          {sub}
        </p>
      )}
    </div>
  );
}

export function DashboardStats() {
  const { walletAddress, vaultInfo, userShares } = useMonolithVault();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vaultInfo !== null) setLoading(false);
    // If no wallet, still stop loading after a moment
    const t = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(t);
  }, [vaultInfo]);

  const totalLiquidityXLM = vaultInfo
    ? (Number(vaultInfo.totalLiquidity) / 10_000_000).toFixed(2)
    : "0.00";

  const userSharesXLM = vaultInfo && vaultInfo.totalShares > BigInt(0)
    ? (
        (Number(userShares) * Number(vaultInfo.totalLiquidity)) /
        Number(vaultInfo.totalShares) /
        10_000_000
      ).toFixed(4)
    : "0.0000";

  const navPerShare = vaultInfo
    ? (Number(vaultInfo.navPerShare) / 10_000_000).toFixed(6)
    : "1.000000";

  const userSharesFormatted = (Number(userShares) / 10_000_000).toFixed(4);

  // Simulated APY based on 0.5% per rebalance epoch
  const simulatedAPY = "18.50%";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <StatCard
        label="Total Vault Liquidity"
        value={`${totalLiquidityXLM} XLM`}
        sub="Total assets under management"
        trend="neutral"
        loading={loading}
      />
      <StatCard
        label="Your Position"
        value={walletAddress ? `${userSharesXLM} XLM` : "—"}
        sub={walletAddress ? `${userSharesFormatted} MVLT shares` : "Connect wallet"}
        trend={walletAddress && Number(userSharesXLM) > 0 ? "up" : "neutral"}
        loading={loading && !!walletAddress}
      />
      <StatCard
        label="NAV per Share"
        value={navPerShare}
        sub="XLM per MVLT share"
        trend={Number(navPerShare) > 1 ? "up" : "neutral"}
        loading={loading}
      />
      <StatCard
        label="Simulated APY"
        value={simulatedAPY}
        sub="Based on 0.5% per epoch"
        trend="up"
        loading={false}
      />
    </div>
  );
}
