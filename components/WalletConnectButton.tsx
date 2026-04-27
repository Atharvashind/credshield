"use client";

import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { useMonolithVault } from "@/hooks/useMonolithVault";
import { VaultModal } from "@/components/VaultModal";
import { useState, useRef, useEffect } from "react";

export function WalletConnectButton() {
  const { walletAddress, isConnecting, connectWallet, disconnectWallet } =
    useMonolithVault();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!walletAddress) {
    return (
      <button
        type="button"
        onClick={connectWallet}
        disabled={isConnecting}
        aria-label="Connect Freighter wallet"
        className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <>
            <span className="w-3 h-3 rounded-full border border-stone-500 border-t-stone-200 animate-spin" />
            <span>Connecting…</span>
          </>
        ) : (
          <>
            <span>Connect Wallet</span>
            <ArrowRightIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </>
        )}
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Connected button — shows address, opens dropdown */}
      <button
        type="button"
        onClick={() => setShowMenu((v) => !v)}
        className="btn-ghost"
        aria-label="Wallet menu"
        aria-expanded={showMenu}
      >
        <span className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
        <span className="font-mono text-xs text-beige">
          {truncate(walletAddress)}
        </span>
        {/* Chevron */}
        <svg
          viewBox="0 0 10 6"
          className={`w-2.5 h-2.5 text-stone-500 transition-transform duration-150 ${showMenu ? "rotate-180" : ""}`}
          fill="none"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-52 glass-panel rounded-xl overflow-hidden z-50 animate-fade-in">
          {/* Address */}
          <div className="px-4 py-3 border-b border-stone-900">
            <p className="font-sans text-2xs text-stone-600 uppercase tracking-wider mb-1">Connected</p>
            <p className="font-mono text-xs text-stone-300 break-all">{walletAddress}</p>
          </div>

          {/* Open vault */}
          <button
            type="button"
            onClick={() => { setShowMenu(false); setIsModalOpen(true); }}
            className="w-full flex items-center gap-2 px-4 py-3 font-sans text-sm text-stone-300 hover:bg-stone-900/60 hover:text-beige transition-colors text-left"
          >
            <span>Open Vault</span>
          </button>

          {/* Disconnect */}
          <button
            type="button"
            onClick={() => { setShowMenu(false); disconnectWallet(); }}
            className="w-full flex items-center gap-2 px-4 py-3 font-sans text-sm text-red-400/80 hover:bg-stone-900/60 hover:text-red-400 transition-colors text-left border-t border-stone-900"
          >
            <span>Disconnect</span>
          </button>
        </div>
      )}

      {/* Vault modal */}
      <VaultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        walletAddress={walletAddress}
      />
    </div>
  );
}

function truncate(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
