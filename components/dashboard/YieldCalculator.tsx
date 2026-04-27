"use client";

import { useState, useMemo } from "react";

export function YieldCalculator() {
  const [principal, setPrincipal] = useState("1000");
  const [epochs, setEpochs] = useState("12");

  const result = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const e = parseInt(epochs) || 0;
    const finalValue = p * Math.pow(1.005, e);
    const yield_ = finalValue - p;
    const pct = p > 0 ? ((yield_ / p) * 100).toFixed(2) : "0.00";
    return {
      finalValue: finalValue.toFixed(4),
      yield: yield_.toFixed(4),
      pct,
    };
  }, [principal, epochs]);

  const inputClass = `
    w-full bg-stone-900 border border-stone-800 rounded-lg
    px-3 py-2.5 font-mono text-sm text-stone-200
    placeholder:text-stone-700
    focus:outline-none focus:border-beige/40
    transition-colors duration-150
  `;

  return (
    <div className="glass-panel rounded-xl p-6 flex flex-col gap-5 h-full">
      <div>
        <p className="font-sans text-xs text-stone-600 uppercase tracking-wider mb-1">
          Yield Calculator
        </p>
        <p className="font-sans text-xs text-stone-700 leading-relaxed">
          Project your earnings at 0.5% per epoch.
        </p>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <div>
          <label className="block font-sans text-xs text-stone-600 mb-1.5 uppercase tracking-wider">
            Deposit amount (XLM)
          </label>
          <input
            type="number"
            min="0"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="1000"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block font-sans text-xs text-stone-600 mb-1.5 uppercase tracking-wider">
            Epochs (rebalances)
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={epochs}
            onChange={(e) => setEpochs(e.target.value)}
            placeholder="12"
            className={inputClass}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-stone-900" />

      {/* Results */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-sans text-xs text-stone-600">Principal</span>
          <span className="font-mono text-sm text-stone-400">
            {parseFloat(principal || "0").toFixed(4)} XLM
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-sans text-xs text-stone-600">Yield earned</span>
          <span className="font-mono text-sm text-green-500">
            +{result.yield} XLM
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-sans text-xs text-stone-600">Return</span>
          <span className="font-mono text-sm text-green-500">
            +{result.pct}%
          </span>
        </div>
        <div className="h-px bg-stone-900" />
        <div className="flex justify-between items-center">
          <span className="font-sans text-xs text-stone-500 font-semibold">Final value</span>
          <span className="font-mono text-base text-beige font-semibold">
            {result.finalValue} XLM
          </span>
        </div>
      </div>

      <p className="font-sans text-2xs text-stone-700 mt-auto">
        Estimates only. Actual yield depends on rebalance frequency.
      </p>
    </div>
  );
}
