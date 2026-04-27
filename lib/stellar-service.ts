/**
 * stellar-service.ts
 *
 * Low-level Stellar / Soroban integration utilities — server-side only.
 *
 * Compatible with @stellar/stellar-sdk v13.
 * Key API changes from v12 → v13:
 *   • SorobanRpc namespace  → rpc
 *   • SorobanRpc.Api        → rpc.Api
 *   • assembleTransaction   → rpc.assembleTransaction (or server.prepareTransaction)
 *   • manual poll loop      → server.pollTransaction()
 *   • dummy account trick   → must use a real funded account for simulations
 */

import {
  rpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Contract,
  Address,
  scValToNative,
} from "@stellar/stellar-sdk";

import {
  isConnected,
  getPublicKey,
  requestAccess,
  getNetworkDetails,
} from "@stellar/freighter-api";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ??
  "https://soroban-testnet.stellar.org";

export const VAULT_CONTRACT_ID =
  process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID ?? "";

export const NETWORK_PASSPHRASE = Networks.TESTNET;

/** A funded testnet account used as the source for read-only simulations. */
const SIMULATION_SOURCE =
  process.env.VAULT_ADMIN_ADDRESS ??
  "GC5HL2KXTCEXGZU4N6QIDQLIXW6HSFYEZV7ELAEEHDL4EHUMVSTZCPX6";

const TX_TIMEOUT = 300;

// ---------------------------------------------------------------------------
// RPC client
// ---------------------------------------------------------------------------

export function createRpcClient(): rpc.Server {
  return new rpc.Server(SOROBAN_RPC_URL, { allowHttp: false });
}

// ---------------------------------------------------------------------------
// Wallet utilities (Freighter API v2 — plain return values)
// ---------------------------------------------------------------------------

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
  if (!(await isFreighterInstalled())) {
    throw new Error(
      "Freighter is not installed. Get it at https://freighter.app"
    );
  }
  await requestAccess();
  const publicKey = await getPublicKey();
  const networkDetails = await getNetworkDetails();
  if (networkDetails.networkPassphrase !== NETWORK_PASSPHRASE) {
    throw new Error(
      `Switch Freighter to Stellar Testnet. Current: ${networkDetails.network}`
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

// ---------------------------------------------------------------------------
// Vault contract invocations — signing happens client-side via Freighter.
// Use /api/vault/build-tx to get unsigned XDR, then /api/vault/submit.
// ---------------------------------------------------------------------------

export async function depositToVault(
  _callerPublicKey: string,
  _amountInStroops: number
): Promise<string> {
  throw new Error("Use /api/vault/build-tx + /api/vault/submit instead.");
}

export async function withdrawFromVault(
  _callerPublicKey: string,
  _sharesInStroops: number
): Promise<string> {
  throw new Error("Use /api/vault/build-tx + /api/vault/submit instead.");
}

// ---------------------------------------------------------------------------
// Read-only queries
// ---------------------------------------------------------------------------

export interface VaultInfoResult {
  totalShares: bigint;
  totalLiquidity: bigint;
  navPerShare: bigint;
}

/**
 * Fetches vault state via a read-only simulation.
 * v13: must use a real funded account as the simulation source.
 */
export async function fetchVaultInfo(): Promise<VaultInfoResult> {
  if (!VAULT_CONTRACT_ID) {
    return {
      totalShares: BigInt(0),
      totalLiquidity: BigInt(0),
      navPerShare: BigInt(10_000_000),
    };
  }

  const server = createRpcClient();
  const account = await server.getAccount(SIMULATION_SOURCE);
  const contract = new Contract(VAULT_CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("get_vault_info"))
    .setTimeout(TX_TIMEOUT)
    .build();

  const simulation = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Vault info query failed: ${simulation.error}`);
  }

  const retval = (simulation as rpc.Api.SimulateTransactionSuccessResponse)
    .result?.retval;

  if (!retval) throw new Error("No return value from get_vault_info.");

  const native = scValToNative(retval) as {
    nav_per_share: bigint;
    total_liquidity: bigint;
    total_shares: bigint;
  };

  return {
    totalShares: native.total_shares,
    totalLiquidity: native.total_liquidity,
    navPerShare: native.nav_per_share,
  };
}

export async function fetchUserShares(publicKey: string): Promise<bigint> {
  if (!VAULT_CONTRACT_ID) return BigInt(0);

  const server = createRpcClient();
  const account = await server.getAccount(SIMULATION_SOURCE);
  const contract = new Contract(VAULT_CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("get_user_shares", new Address(publicKey).toScVal()))
    .setTimeout(TX_TIMEOUT)
    .build();

  const simulation = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simulation)) return BigInt(0);

  const retval = (simulation as rpc.Api.SimulateTransactionSuccessResponse)
    .result?.retval;

  if (!retval) return BigInt(0);

  return BigInt(scValToNative(retval) as number);
}
