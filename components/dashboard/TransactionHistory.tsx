"use client";

import { useEffect, useState } from "react";
import { useMonolithVault } from "@/hooks/useMonolithVault";

interface TxRecord {
  type: "deposit" | "withdraw" | "rebalance";
  amount: string;
  shares: string;
  hash: string;
  time: string;
  status: "confirmed" | "pending";
}

// Fetch real events from Soroban RPC via our API route
async function fetchVaultEvents(address: string | null): Promise<TxRecord[]> {
  try {
    const url = address
      ? `/api/vault/events?address=${address}`
      : `/api/vault/events`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

const TYPE_STYLES: Record<TxRecord["type"], string> = {
  deposit: "text-green-500 bg-green-500/10",
  withdraw: "text-red-400 bg-red-400/10",
  rebalance: "text-beige bg-beige/10",
};

export function TransactionHistory() {
  const { walletAddress } = useMonolithVault();
  const [records, setRecords] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchVaultEvents(walletAddress).then((data) => {
      setRecords(data);
      setLoading(false);
    });
  }, [walletAddress]);

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-900">
        <p className="font-sans text-xs text-stone-500 uppercase tracking-wider">
          Transaction History
        </p>
        <button
          onClick={() => {
            setLoading(true);
            fetchVaultEvents(walletAddress).then((d) => {
              setRecords(d);
              setLoading(false);
            });
          }}
          className="font-sans text-xs text-stone-600 hover:text-stone-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Table — horizontal scroll on mobile */}
      <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-900">
              {["Type", "Amount", "Shares", "Tx Hash", "Time", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left font-sans text-2xs text-stone-700 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-stone-900/50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-3 bg-stone-900 rounded animate-pulse w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="font-sans text-sm text-stone-600">
                    {walletAddress
                      ? "No transactions yet. Make a deposit to get started."
                      : "Connect your wallet to see transaction history."}
                  </p>
                  {walletAddress && (
                    <p className="font-sans text-xs text-stone-700 mt-1">
                      Activity appears here after your first deposit or withdrawal.
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              records.map((tx, i) => (
                <tr
                  key={i}
                  className="border-b border-stone-900/50 hover:bg-stone-900/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className={`font-sans text-xs px-2 py-1 rounded capitalize ${TYPE_STYLES[tx.type]}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-stone-300">
                    {tx.amount}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-stone-500">
                    {tx.shares}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-stone-600 hover:text-beige transition-colors"
                    >
                      {tx.hash.slice(0, 8)}…{tx.hash.slice(-4)}
                    </a>
                  </td>
                  <td className="px-6 py-4 font-sans text-xs text-stone-600">
                    {tx.time}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-sans text-xs ${
                      tx.status === "confirmed" ? "text-green-500" : "text-yellow-500"
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
