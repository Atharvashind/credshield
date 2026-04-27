"use client";

import { useState, useMemo } from "react";
import { useMonolithVault } from "@/hooks/useMonolithVault";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

export function VaultWithdraw() {
  const [shares, setShares] = useState("");
  const {
    walletAddress,
    vaultInfo,
    userShares,
    isTransacting,
    transactionError,
    transactionSuccess,
    withdraw,
  } = useMonolithVault();

  const userSharesNum = Number(userShares) / 10_000_000;
  const sharesNum = parseFloat(shares) || 0;

  const estimates = useMemo(() => {
    if (!vaultInfo || sharesNum <= 0) return null;
    const totalShares = Number(vaultInfo.totalShares);
    const totalLiquidity = Number(vaultInfo.totalLiquidity);
    if (totalShares === 0) return null;

    const sharesStroops = sharesNum * 10_000_000;
    const tokensToReturn = (sharesStroops * totalLiquidity) / totalShares;
    const navPerShare = Number(vaultInfo.navPerShare) / 10_000_000;

    return {
      tokensToReturn: (tokensToReturn / 10_000_000).toFixed(4),
      navPerShare: navPerShare.toFixed(6),
      remainingShares: Math.max(0, userSharesNum - sharesNum).toFixed(4),
    };
  }, [shares, vaultInfo, sharesNum, userSharesNum]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || sharesNum <= 0) return;
    const stroops = Math.floor(sharesNum * 10_000_000);
    await withdraw(walletAddress, stroops);
    setShares("");
  };

  const handleMaxClick = () => {
    setShares(userSharesNum.toFixed(7));
  };

  const pctButtons = [25, 50, 75, 100];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Left — form */}
      <div className="glass-panel rounded-xl p-7 space-y-6">
        <div>
          <p className="font-sans text-xs text-stone-600 uppercase tracking-wider mb-1">
            Withdraw XLM
          </p>
          <p className="font-sans text-xs text-stone-700 leading-relaxed">
            Burn MVLT shares to receive the proportional underlying XLM plus
            any accrued yield.
          </p>
        </div>

        {/* Balance display */}
        <div className="bg-stone-900/60 rounded-lg px-4 py-3 flex justify-between items-center">
          <span className="font-sans text-xs text-stone-600">Available shares</span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-stone-300">
              {userSharesNum.toFixed(4)} MVLT
            </span>
            <button
              type="button"
              onClick={handleMaxClick}
              disabled={!walletAddress || userSharesNum === 0}
              className="font-sans text-xs text-beige/70 hover:text-beige transition-colors disabled:opacity-30"
            >
              MAX
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Shares input */}
          <div>
            <label
              htmlFor="withdraw-shares"
              className="block font-sans text-xs text-stone-600 mb-2 uppercase tracking-wider"
            >
              Shares to burn (MVLT)
            </label>
            <div className="relative">
              <input
                id="withdraw-shares"
                type="number"
                min="0"
                step="any"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
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
                MVLT
              </span>
            </div>
          </div>

          {/* Percentage quick-select */}
          <div className="flex gap-2">
            {pctButtons.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() =>
                  setShares(((userSharesNum * pct) / 100).toFixed(7))
                }
                disabled={!walletAddress || userSharesNum === 0}
                className="
                  flex-1 py-1.5 rounded font-sans text-xs text-stone-500
                  border border-stone-800 hover:border-beige/40 hover:text-beige
                  transition-colors disabled:opacity-30
                "
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Validation warning */}
          {sharesNum > userSharesNum && userSharesNum > 0 && (
            <p className="font-sans text-xs text-red-400">
              Insufficient shares. You hold {userSharesNum.toFixed(4)} MVLT.
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={
              isTransacting ||
              !walletAddress ||
              sharesNum <= 0 ||
              sharesNum > userSharesNum
            }
            className="w-full btn-primary justify-center py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isTransacting ? (
              <>
                <span className="w-4 h-4 rounded-full border border-obsidian/30 border-t-obsidian animate-spin" />
                <span>Withdrawing…</span>
              </>
            ) : (
              <>
                <span>
                  Withdraw{" "}
                  {estimates ? `${estimates.tokensToReturn} XLM` : ""}
                </span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>

          {!walletAddress && (
            <p className="font-sans text-xs text-stone-600 text-center">
              Connect your wallet to withdraw
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
              {estimates?.tokensToReturn ?? "—"}
            </p>
            <p className="font-sans text-sm text-stone-500 mb-1">XLM</p>
          </div>
          <div className="h-px bg-stone-900" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-sans text-xs text-stone-600">Shares burned</span>
              <span className="font-mono text-xs text-stone-400">
                {sharesNum > 0 ? sharesNum.toFixed(4) : "—"} MVLT
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-xs text-stone-600">Remaining shares</span>
              <span className="font-mono text-xs text-stone-400">
                {estimates?.remainingShares ?? userSharesNum.toFixed(4)} MVLT
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-xs text-stone-600">NAV per share</span>
              <span className="font-mono text-xs text-stone-400">
                {estimates?.navPerShare ?? "—"} XLM
              </span>
            </div>
          </div>
        </div>

        {/* Full withdrawal preview */}
        {userSharesNum > 0 && (
          <div className="glass-panel rounded-xl p-6 space-y-3">
            <p className="font-sans text-xs text-stone-600 uppercase tracking-wider">
              Full withdrawal value
            </p>
            {(() => {
              const nav = vaultInfo ? Number(vaultInfo.navPerShare) / 10_000_000 : 1;
              const fullValue = (userSharesNum * nav).toFixed(4);
              return (
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm text-stone-500">
                    {userSharesNum.toFixed(4)} MVLT →
                  </span>
                  <span className="font-mono text-base text-beige font-semibold">
                    {fullValue} XLM
                  </span>
                </div>
              );
            })()}
          </div>
        )}

        {/* Warning */}
        <div className="glass-panel rounded-xl p-5 border-yellow-900/30">
          <p className="font-sans text-xs text-stone-600 uppercase tracking-wider mb-2">
            Note
          </p>
          <p className="font-sans text-xs text-stone-600 leading-relaxed">
            Withdrawals are processed immediately on-chain. There is no lock-up
            period. The amount you receive reflects the current NAV per share,
            including all yield accrued since your deposit.
          </p>
        </div>
      </div>
    </div>
  );
}
