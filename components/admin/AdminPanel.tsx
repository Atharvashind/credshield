"use client";

import { useState } from "react";
import { useMonolithVault } from "@/hooks/useMonolithVault";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

export function AdminPanel() {
  const {
    walletAddress,
    vaultInfo,
    refreshVaultState,
    isTransacting,
    transactionError,
    transactionSuccess,
    rebalance,
  } = useMonolithVault();

  const totalLiquidityXLM = vaultInfo
    ? (Number(vaultInfo.totalLiquidity) / 10_000_000).toFixed(4)
    : "—";
  const navPerShare = vaultInfo
    ? (Number(vaultInfo.navPerShare) / 10_000_000).toFixed(7)
    : "—";
  const totalShares = vaultInfo
    ? (Number(vaultInfo.totalShares) / 10_000_000).toFixed(4)
    : "—";

  return (
    <div className="space-y-6">
      {/* Auth status */}
      <div className="glass-panel rounded-xl p-6 flex items-center gap-4">
        <span className={`w-2 h-2 rounded-full ${walletAddress ? "bg-green-400" : "bg-stone-700"}`} />
        <div>
          <p className="font-sans text-sm text-stone-300">
            {walletAddress ? "Wallet connected" : "No wallet connected"}
          </p>
          {walletAddress && (
            <p className="font-mono text-xs text-stone-600 mt-0.5">{walletAddress}</p>
          )}
        </div>
      </div>

      {/* Live vault state */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Liquidity", value: `${totalLiquidityXLM} XLM` },
          { label: "Total Shares", value: `${totalShares} MVLT` },
          { label: "NAV / Share", value: navPerShare },
        ].map((s) => (
          <div key={s.label} className="glass-panel rounded-xl p-5">
            <p className="font-sans text-xs text-stone-600 uppercase tracking-wider mb-2">{s.label}</p>
            <p className="font-mono text-sm text-stone-200">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Rebalance */}
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <div>
          <p className="font-sans text-sm font-semibold text-stone-200 mb-1">
            Trigger Rebalance
          </p>
          <p className="font-sans text-xs text-stone-600 leading-relaxed max-w-lg">
            Applies a 0.5% yield increment to the vault&apos;s total liquidity.
            NAV per share increases proportionally. All share holders benefit
            immediately — no action required on their part.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={rebalance}
            disabled={isTransacting || !walletAddress}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isTransacting ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border border-obsidian/30 border-t-obsidian animate-spin" />
                <span>Rebalancing…</span>
              </>
            ) : (
              <>
                <span>Execute Rebalance</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </>
            )}
          </button>
          {!walletAddress && (
            <p className="font-sans text-xs text-stone-600">Connect your wallet first</p>
          )}
        </div>

        {transactionSuccess && (
          <p className="font-sans text-xs text-green-400">{transactionSuccess}</p>
        )}
        {transactionError && (
          <p className="font-sans text-xs text-red-400">{transactionError}</p>
        )}
      </div>

      {/* Contract info */}
      <div className="glass-panel rounded-xl p-6 space-y-3">
        <p className="font-sans text-xs text-stone-600 uppercase tracking-wider">
          Contract Details
        </p>
        <div className="space-y-2">
          {[
            { label: "Contract ID", value: process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID ?? "Not set", explorerUrl: `https://stellar.expert/explorer/testnet/contract/${process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID}` },
            { label: "Token", value: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ID ?? "Not set", explorerUrl: `https://stellar.expert/explorer/testnet/contract/${process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ID}` },
            { label: "Network", value: "Stellar Testnet", explorerUrl: "https://stellar.expert/explorer/testnet" },
            { label: "Admin", value: process.env.NEXT_PUBLIC_VAULT_ADMIN_ADDRESS ?? "Not set", explorerUrl: `https://stellar.expert/explorer/testnet/account/${process.env.NEXT_PUBLIC_VAULT_ADMIN_ADDRESS}` },
          ].map((row) => (
            <div key={row.label} className="flex items-start gap-4">
              <span className="font-sans text-xs text-stone-700 w-24 shrink-0">{row.label}</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="font-mono text-xs text-stone-400 break-all">{row.value}</span>
                <a
                  href={row.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 font-sans text-2xs text-stone-700 hover:text-beige transition-colors border border-stone-800 hover:border-beige/40 rounded px-1.5 py-0.5"
                >
                  Explorer ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
