"use client";

import { useState, useEffect, useCallback } from "react";
import { useMonolithVault } from "@/hooks/useMonolithVault";
import { XMarkIcon } from "@/components/icons/XMarkIcon";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import Link from "next/link";

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

type ActiveTab = "deposit" | "withdraw";

export function VaultModal({ isOpen, onClose, walletAddress }: VaultModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("deposit");
  const [inputValue, setInputValue] = useState("");

  const {
    vaultInfo,
    userShares,
    isTransacting,
    transactionError,
    transactionSuccess,
    deposit,
    withdraw,
    refreshVaultState,
  } = useMonolithVault();

  useEffect(() => {
    if (isOpen) {
      refreshVaultState();
      setInputValue("");
    }
  }, [isOpen, refreshVaultState]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const num = parseFloat(inputValue);
      if (isNaN(num) || num <= 0) return;
      const stroops = Math.floor(num * 10_000_000);
      if (activeTab === "deposit") {
        await deposit(walletAddress, stroops);
      } else {
        await withdraw(walletAddress, stroops);
      }
      setInputValue("");
    },
    [activeTab, deposit, inputValue, walletAddress, withdraw]
  );

  if (!isOpen) return null;

  // Derived values
  const userSharesNum = Number(userShares) / 10_000_000;
  const navPerShare = vaultInfo
    ? Number(vaultInfo.navPerShare) / 10_000_000
    : 1;
  const positionValueXLM = (userSharesNum * navPerShare).toFixed(4);
  const totalLiquidityXLM = vaultInfo
    ? (Number(vaultInfo.totalLiquidity) / 10_000_000).toFixed(2)
    : "0.00";
  const totalSharesNum = vaultInfo
    ? Number(vaultInfo.totalShares) / 10_000_000
    : 0;
  const poolShare =
    totalSharesNum > 0
      ? ((userSharesNum / totalSharesNum) * 100).toFixed(2)
      : "0.00";

  // Estimated yield on input amount
  const inputNum = parseFloat(inputValue) || 0;
  const estimatedYield12 = (inputNum * (Math.pow(1.005, 12) - 1)).toFixed(4);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg mx-4 glass-panel rounded-2xl p-0 overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-stone-900">
          <div>
            <h2 className="font-sans text-sm font-semibold text-stone-100">Monolith Vault</h2>
            <p className="font-mono text-xs text-stone-600 mt-0.5">
              {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-600 hover:text-stone-200 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Position summary */}
        <div className="grid grid-cols-3 gap-px bg-stone-900 border-b border-stone-900">
          {[
            { label: "Your Position", value: `${positionValueXLM} XLM` },
            { label: "Shares Held", value: `${userSharesNum.toFixed(4)} MVLT` },
            { label: "Pool Share", value: `${poolShare}%` },
          ].map((s) => (
            <div key={s.label} className="bg-obsidian px-5 py-4">
              <p className="font-sans text-2xs text-stone-700 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="font-mono text-sm text-stone-200">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Vault stats */}
        <div className="grid grid-cols-2 gap-px bg-stone-900 border-b border-stone-900">
          {[
            { label: "Total Vault Liquidity", value: `${totalLiquidityXLM} XLM` },
            { label: "NAV per Share", value: navPerShare.toFixed(6) },
          ].map((s) => (
            <div key={s.label} className="bg-obsidian px-5 py-3">
              <p className="font-sans text-2xs text-stone-700 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="font-mono text-sm text-stone-400">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs + form */}
        <div className="px-7 py-6 space-y-5">
          {/* Tabs */}
          <div role="tablist" className="flex border border-stone-800 rounded-lg overflow-hidden">
            {(["deposit", "withdraw"] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                type="button"
                onClick={() => { setActiveTab(tab); setInputValue(""); }}
                className={`flex-1 py-2.5 text-sm font-sans capitalize transition-colors duration-150
                  ${activeTab === tab ? "bg-beige text-obsidian font-medium" : "text-stone-500 hover:text-stone-300"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div>
              <label htmlFor="vault-amount" className="block font-sans text-xs text-stone-600 mb-2 uppercase tracking-wider">
                {activeTab === "deposit" ? "Amount (XLM)" : "Shares to burn (MVLT)"}
              </label>
              <div className="flex gap-3">
                <input
                  id="vault-amount"
                  type="number"
                  min="0"
                  step="any"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="0.00"
                  disabled={isTransacting}
                  className="flex-1 bg-stone-900 border border-stone-800 rounded-lg px-4 py-3
                    font-mono text-sm text-stone-100 placeholder:text-stone-700
                    focus:outline-none focus:border-beige/50 disabled:opacity-50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isTransacting || !inputValue || parseFloat(inputValue) <= 0}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isTransacting ? (
                    <span className="w-4 h-4 rounded-full border border-obsidian/30 border-t-obsidian animate-spin" />
                  ) : (
                    <ArrowRightIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Yield estimate */}
            {activeTab === "deposit" && inputNum > 0 && (
              <div className="bg-stone-900/60 rounded-lg px-4 py-3 flex justify-between items-center">
                <span className="font-sans text-xs text-stone-600">Est. yield after 12 epochs</span>
                <span className="font-mono text-xs text-green-500">+{estimatedYield12} XLM</span>
              </div>
            )}

            {transactionError && (
              <p role="alert" className="text-xs text-red-400 font-sans">{transactionError}</p>
            )}
            {transactionSuccess && (
              <p role="status" className="text-xs text-green-400 font-sans">{transactionSuccess}</p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-stone-900 flex items-center justify-between">
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-xs text-stone-600 hover:text-beige transition-colors flex items-center gap-1"
          >
            View on Stellar Expert ↗
          </a>
          <Link
            href="/dashboard"
            onClick={onClose}
            className="font-sans text-xs text-stone-600 hover:text-beige transition-colors flex items-center gap-1"
          >
            Full dashboard
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
