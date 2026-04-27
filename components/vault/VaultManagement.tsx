"use client";

import { useState } from "react";
import { useMonolithVault } from "@/hooks/useMonolithVault";
import { VaultDeposit } from "@/components/vault/VaultDeposit";
import { VaultWithdraw } from "@/components/vault/VaultWithdraw";
import { VaultPosition } from "@/components/vault/VaultPosition";
import { VaultActivity } from "@/components/vault/VaultActivity";

type Tab = "position" | "deposit" | "withdraw" | "activity";

const TABS: { id: Tab; label: string }[] = [
  { id: "position", label: "Position" },
  { id: "deposit", label: "Deposit" },
  { id: "withdraw", label: "Withdraw" },
  { id: "activity", label: "Activity" },
];

export function VaultManagement() {
  const [activeTab, setActiveTab] = useState<Tab>("position");
  const { walletAddress } = useMonolithVault();

  return (
    <div className="space-y-6">
      {/* Wallet gate */}
      {!walletAddress && (
        <div className="glass-panel rounded-xl px-6 py-5 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-stone-700" />
          <p className="font-sans text-sm text-stone-500">
            Connect your Freighter wallet to manage your vault position.
          </p>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border border-stone-800 rounded-xl overflow-hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-3 font-sans text-sm transition-colors duration-150
              ${activeTab === tab.id
                ? "bg-beige text-obsidian font-semibold"
                : "text-stone-500 hover:text-stone-200 hover:bg-stone-900/40"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "position" && <VaultPosition />}
        {activeTab === "deposit"  && <VaultDeposit />}
        {activeTab === "withdraw" && <VaultWithdraw />}
        {activeTab === "activity" && <VaultActivity />}
      </div>
    </div>
  );
}
