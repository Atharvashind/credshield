"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  connectFreighterWallet,
  getConnectedPublicKey,
} from "@/lib/freighter-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VaultInfo {
  totalShares: bigint;
  totalLiquidity: bigint;
  navPerShare: bigint;
}

interface UseMonolithVaultState {
  walletAddress: string | null;
  isConnecting: boolean;
  isTransacting: boolean;
  transactionError: string | null;
  transactionSuccess: string | null;
  vaultInfo: VaultInfo | null;
  userShares: bigint;
}

interface UseMonolithVaultActions {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  deposit: (from: string, amountInStroops: number) => Promise<void>;
  withdraw: (to: string, sharesInStroops: number) => Promise<void>;
  rebalance: () => Promise<void>;
  refreshVaultState: () => Promise<void>;
}

export type UseMonolithVaultReturn = UseMonolithVaultState & UseMonolithVaultActions;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useMonolithVault
 *
 * Manages wallet connection via Freighter (browser-safe) and communicates
 * with the Soroban contract through Next.js API routes (server-side) so that
 * the heavy @stellar/stellar-sdk never enters the browser bundle.
 */
export function useMonolithVault(): UseMonolithVaultReturn {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionSuccess, setTransactionSuccess] = useState<string | null>(null);
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  const [userShares, setUserShares] = useState<bigint>(BigInt(0));

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Restore session on mount.
  useEffect(() => {
    getConnectedPublicKey().then((key) => {
      if (key && isMountedRef.current) setWalletAddress(key);
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Wallet
  // ---------------------------------------------------------------------------

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setTransactionError(null);
    try {
      const { publicKey } = await connectFreighterWallet();
      if (isMountedRef.current) setWalletAddress(publicKey);
    } catch (error) {
      if (isMountedRef.current) {
        setTransactionError(
          error instanceof Error ? error.message : "Failed to connect wallet."
        );
      }
    } finally {
      if (isMountedRef.current) setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setVaultInfo(null);
    setUserShares(BigInt(0));
    setTransactionError(null);
    setTransactionSuccess(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Vault state (fetched via API routes — SDK stays server-side)
  // ---------------------------------------------------------------------------

  const refreshVaultState = useCallback(async () => {
    try {
      const [infoRes, sharesRes] = await Promise.all([
        fetch("/api/vault/info"),
        walletAddress
          ? fetch(`/api/vault/shares?address=${walletAddress}`)
          : Promise.resolve(null),
      ]);

      if (infoRes.ok) {
        const data = await infoRes.json();
        if (isMountedRef.current) {
          setVaultInfo({
            totalShares: BigInt(data.totalShares),
            totalLiquidity: BigInt(data.totalLiquidity),
            navPerShare: BigInt(data.navPerShare),
          });
        }
      }

      if (sharesRes && sharesRes.ok) {
        const data = await sharesRes.json();
        if (isMountedRef.current) {
          setUserShares(BigInt(data.shares));
        }
      }
    } catch (error) {
      console.warn("[useMonolithVault] refreshVaultState failed:", error);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) refreshVaultState();
  }, [walletAddress, refreshVaultState]);

  // ---------------------------------------------------------------------------
  // Transactions — 3-step: build (server) → sign (Freighter) → submit (server)
  // ---------------------------------------------------------------------------

  const deposit = useCallback(
    async (from: string, amountInStroops: number) => {
      setIsTransacting(true);
      setTransactionError(null);
      setTransactionSuccess(null);
      try {
        // Step 1: build unsigned tx server-side
        const buildRes = await fetch("/api/vault/build-tx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caller: from, fn: "deposit", amountInStroops }),
        });
        const buildData = await buildRes.json();
        if (!buildRes.ok) throw new Error(buildData.error ?? "Build failed");

        // Step 2: sign with Freighter in the browser
        const { signTransaction } = await import("@stellar/freighter-api");
        const signedXdr = await signTransaction(buildData.unsignedXdr, {
          networkPassphrase: "Test SDF Network ; September 2015",
        });

        // Step 3: submit signed tx server-side
        const submitRes = await fetch("/api/vault/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedXdr }),
        });
        const submitData = await submitRes.json();
        if (!submitRes.ok) throw new Error(submitData.error ?? "Submit failed");

        if (isMountedRef.current) {
          setTransactionSuccess(
            `Deposit confirmed. Tx: ${submitData.txHash?.slice(0, 8)}…${submitData.txHash?.slice(-4)}`
          );
          await refreshVaultState();
        }
      } catch (error) {
        if (isMountedRef.current) {
          setTransactionError(
            error instanceof Error ? error.message : "Deposit failed."
          );
        }
      } finally {
        if (isMountedRef.current) setIsTransacting(false);
      }
    },
    [refreshVaultState]
  );

  const withdraw = useCallback(
    async (to: string, sharesInStroops: number) => {
      setIsTransacting(true);
      setTransactionError(null);
      setTransactionSuccess(null);
      try {
        // Step 1: build unsigned tx server-side
        const buildRes = await fetch("/api/vault/build-tx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caller: to, fn: "withdraw", amountInStroops: sharesInStroops }),
        });
        const buildData = await buildRes.json();
        if (!buildRes.ok) throw new Error(buildData.error ?? "Build failed");

        // Step 2: sign with Freighter in the browser
        const { signTransaction } = await import("@stellar/freighter-api");
        const signedXdr = await signTransaction(buildData.unsignedXdr, {
          networkPassphrase: "Test SDF Network ; September 2015",
        });

        // Step 3: submit signed tx server-side
        const submitRes = await fetch("/api/vault/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedXdr }),
        });
        const submitData = await submitRes.json();
        if (!submitRes.ok) throw new Error(submitData.error ?? "Submit failed");

        if (isMountedRef.current) {
          setTransactionSuccess(
            `Withdrawal confirmed. Tx: ${submitData.txHash?.slice(0, 8)}…${submitData.txHash?.slice(-4)}`
          );
          await refreshVaultState();
        }
      } catch (error) {
        if (isMountedRef.current) {
          setTransactionError(
            error instanceof Error ? error.message : "Withdrawal failed."
          );
        }
      } finally {
        if (isMountedRef.current) setIsTransacting(false);
      }
    },
    [refreshVaultState]
  );

  const rebalance = useCallback(async () => {
    if (!walletAddress) return;
    setIsTransacting(true);
    setTransactionError(null);
    setTransactionSuccess(null);
    try {
      // Step 1: build unsigned tx server-side
      const buildRes = await fetch("/api/vault/rebalance-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caller: walletAddress }),
      });
      const buildData = await buildRes.json();
      if (!buildRes.ok) throw new Error(buildData.error ?? "Build failed");

      // Step 2: sign with Freighter in the browser
      const { signTransaction } = await import("@stellar/freighter-api");
      const signedXdr = await signTransaction(buildData.unsignedXdr, {
        networkPassphrase: "Test SDF Network ; September 2015",
      });

      // Step 3: submit signed tx server-side
      const submitRes = await fetch("/api/vault/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXdr }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.error ?? "Submit failed");

      if (isMountedRef.current) {
        setTransactionSuccess(
          `Rebalance confirmed. Yield accrued. Tx: ${submitData.txHash?.slice(0, 8)}…`
        );
        await refreshVaultState();
      }
    } catch (error) {
      if (isMountedRef.current) {
        setTransactionError(
          error instanceof Error ? error.message : "Rebalance failed."
        );
      }
    } finally {
      if (isMountedRef.current) setIsTransacting(false);
    }
  }, [walletAddress, refreshVaultState]);

  return {
    walletAddress,
    isConnecting,
    isTransacting,
    transactionError,
    transactionSuccess,
    vaultInfo,
    userShares,
    connectWallet,
    disconnectWallet,
    deposit,
    withdraw,
    rebalance,
    refreshVaultState,
  };
}
