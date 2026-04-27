"use client";

import { useState, useMemo } from "react";
import { useMonolithVault } from "@/hooks/useMonolithVault";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

const QUICK_AMOUNTS = [10, 50, 100, 500, 1000];

export function VaultDeposit() {
  const [amount, setAmount] = useState("");
  const { walletAddress, vaultInfo, isTransacting, transactionError, transactionSuccess, deposit } =
    useMonolithVault();

  const amountNum = parseFloat(amount) || 0;

  const estimates = useMemo(() => {
    if (!vaultInfo || amountNum <= 0) return null;
    const totalShares = Number(vaultInfo.totalShares);
    const totalLiquidity = Number(vaultInfo.totalLiquidity);
    const amountStroops = amountNum * 10_000_000;

    let sharesToMint: number;
    if (totalShares === 0 || totalLiquidity === 0) {
      sharesToMint = amountStroops;
    } else {
      sharesToMint = (amountStroops * totalShares) / totalLiquidity;
    }

    const navPerShare = Number(vaultInfo.navPerShare) / 10_000_000;
    const yield12 = amountNum * (Math.pow(1.005, 12) - 1);
    const yield52 = amountNum * (Math.pow(1.005, 52) - 1);

    return {
      sharesToMint: (sharesToMint / 10_000_000).toFixed(4),
      navPerShare: navPerShare.toFixed(6),
      yield12: yield12.toFixed(4),
      yield52: yield52.toFixed(4),
    };
  }, [amount, vaultInfo, amountNum]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || amountNum <= 0) return;
    const stroops = Math.floor(amountNum * 10_000_000);
    await deposit(walletAddress, stroops);
    setAmount("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Left — form */}
      <div className="glass-panel rounded-xl p-7 space-y-6">
        <div>
          <p className="font-sans text-xs text-stone-600 uppercase tracking-wider mb-1">
            Deposit XLM
          </p>
          <p className="font-sans text-xs text-stone-700 leading-relaxed">
            Tokens are transferred to the vault contract. You receive MVLT
            shares proportional to your deposit.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Amount input */}
          <div>
            <label
              htmlFor="deposit-amount"
              className="block font-sans text-xs text-stone-600 mb-2 uppercase tracking-wider"
            >
              Amount (XLM)
            </label>
            <div className="relative">
              <input
                id="deposit-amount"
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={isTransacting || !walletAddress}
                className="
                  w-full bg-stone-900 border border-stone-800 rounded-lg
                  px-4 py-3.5 pr-16 font-mono text-sm text-stone-100
                  placeholder:text-stone-700
                  focus:outline-none focus:border-beige/50
                  disabled:opacity-50 transition-colors
                "
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-sans text-xs text-stone-600">
                XLM
              </span>
            </div>
          </div>

          {/* Quick amounts */}
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(String(q))}
                disabled={!walletAddress}
                className="
                  px-3 py-1.5 rounded font-sans text-xs text-stone-500
                  border border-stone-800 hover:border-beige/40 hover:text-beige
                  transition-colors disabled:opacity-30
                "
              >
                {q} XLM
              </button>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isTransacting || !walletAddress || amountNum <= 0}
            className="w-full btn-primary justify-center py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isTransacting ? (
              <>
                <span className="w-4 h-4 rounded-full border border-obsidian/30 border-t-obsidian animate-spin" />
                <span>Depositing…</span>
              </>
            ) : (
              <>
                <span>Deposit {amountNum > 0 ? `${amountNum} XLM` : ""}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>

          {!walletAddress && (
            <p className="font-sans text-xs text-stone-600 text-center">
              Connect your wallet to deposit
            </p>
          )}
          {transactionError && (
            <p role="alert" className="font-sans text-xs text-red-400">{transactionError}</p>
          )}
          {transactionSuccess && (
            <p role="status" className="font-sans text-xs text-green-400">{transactionSuccess}</p>
          )}
        </form>
      </div>

      {/* Right — estimates */}
      <div className="space-y-4">
        {/* You receive */}
        <div className="glass-panel rounded-xl p-6 space-y-4">
          <p className="font-sans text-xs text-stone-600 uppercase tracking-wider">
            You will receive
          </p>
          <div className="flex items-end gap-2">
            <p className="font-serif text-4xl text-stone-100">
              {estimates?.sharesToMint ?? "—"}
            </p>
            <p className="font-sans text-sm text-stone-500 mb-1">MVLT shares</p>
          </div>
          <div className="h-px bg-stone-900" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-sans text-xs text-stone-600">NAV per share</span>
              <span className="font-mono text-xs text-stone-400">
                {estimates?.navPerShare ?? "—"} XLM
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-xs text-stone-600">Exchange rate</span>
              <span className="font-mono text-xs text-stone-400">
                1 XLM ≈ {estimates ? (1 / parseFloat(estimates.navPerShare)).toFixed(4) : "—"} MVLT
              </span>
            </div>
          </div>
        </div>

        {/* Yield projections */}
        <div className="glass-panel rounded-xl p-6 space-y-4">
          <p className="font-sans text-xs text-stone-600 uppercase tracking-wider">
            Projected yield (0.5% / epoch)
          </p>
          <div className="space-y-3">
            {[
              { label: "After 12 epochs", value: estimates?.yield12 ?? "—", unit: "XLM" },
              { label: "After 52 epochs", value: estimates?.yield52 ?? "—", unit: "XLM" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="font-sans text-sm text-stone-500">{row.label}</span>
                <span className="font-mono text-sm text-green-500">
                  {row.value !== "—" ? `+${row.value}` : "—"}{" "}
                  <span className="text-xs text-stone-600">{row.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="glass-panel rounded-xl p-5 space-y-2">
          <p className="font-sans text-xs text-stone-600 uppercase tracking-wider">
            How it works
          </p>
          <ul className="space-y-1.5">
            {[
              "Your XLM is transferred to the vault contract",
              "You receive MVLT shares proportional to your deposit",
              "Yield accrues to NAV per share on each rebalance",
              "Withdraw anytime by burning your shares",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-beige/40 text-xs mt-0.5">✦</span>
                <span className="font-sans text-xs text-stone-600 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
