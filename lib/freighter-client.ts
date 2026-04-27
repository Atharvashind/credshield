"use client";

/**
 * freighter-client.ts
 *
 * Browser-only Freighter wallet utilities.
 * This module ONLY imports @stellar/freighter-api — which is a pure browser
 * extension bridge with no native Node.js dependencies.
 *
 * All Stellar SDK usage (transaction building, signing, RPC calls) stays in
 * lib/stellar-service.ts which runs exclusively on the server via API routes.
 */

import {
  isConnected,
  getPublicKey,
  requestAccess,
  getNetworkDetails,
} from "@stellar/freighter-api";

export const TESTNET_PASSPHRASE =
  "Test SDF Network ; September 2015";

export interface WalletConnectionResult {
  publicKey: string;
  network: string;
}

export async function isFreighterInstalled(): Promise<boolean> {
  try {
    return await isConnected();
  } catch {
    return false;
  }
}

export async function connectFreighterWallet(): Promise<WalletConnectionResult> {
  const installed = await isFreighterInstalled();
  if (!installed) {
    throw new Error(
      "Freighter wallet is not installed. " +
        "Get it at https://freighter.app then refresh."
    );
  }

  await requestAccess();
  const publicKey = await getPublicKey();
  const networkDetails = await getNetworkDetails();

  if (networkDetails.networkPassphrase !== TESTNET_PASSPHRASE) {
    throw new Error(
      `Please switch Freighter to Stellar Testnet. ` +
        `Current network: ${networkDetails.network}`
    );
  }

  return { publicKey, network: networkDetails.network };
}

export async function getConnectedPublicKey(): Promise<string | null> {
  try {
    const connected = await isConnected();
    if (!connected) return null;
    return await getPublicKey();
  } catch {
    return null;
  }
}
