import { rpc, Horizon, Keypair, TransactionBuilder, Networks, Contract } from '@stellar/stellar-sdk';
import { isConnected, getAddress, signTransaction, requestAccess, isAllowed } from '@stellar/freighter-api';

// Initialize RPC and Horizon endpoints explicitly as required by SKILL.md
const SOROBAN_RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';

export const rpcServer = new rpc.Server(SOROBAN_RPC_URL);
export const horizonServer = new Horizon.Server(HORIZON_URL);

/**
 * Checks if the Freighter browser extension is installed.
 */
export async function isFreighterConnected(): Promise<boolean> {
  try {
    const status = await isConnected();
    return status.isConnected;
  } catch {
    return false;
  }
}

/**
 * Fetches the user's public address silently without triggering permission popups.
 */
export async function getFreighterAddressSilent(): Promise<string> {
  try {
    const allowed = await isAllowed();
    if (allowed.isAllowed) {
      const res = await getAddress();
      if (!res.error && res.address) {
        return res.address;
      }
    }
  } catch (e) {
    console.warn('Silent address fetch failed:', e);
  }
  return '';
}

/**
 * Fetches the user's public address from Freighter.
 */
export async function getFreighterAddress(): Promise<string> {
  try {
    // Trigger Freighter access request permission prompt popup first
    const access = await requestAccess();
    if (access.address) {
      return access.address;
    }
    if ((access as any).publicKey) {
      return (access as any).publicKey;
    }
    if (access.error) {
      throw new Error(access.error.message || 'Permission denied by user');
    }
    
    // Fallback if already allowed
    const res = await getAddress();
    if (res.error) {
      throw new Error(res.error.message || 'Access declined by user');
    }
    return res.address;
  } catch (error: any) {
    throw new Error(`Freighter connection error: ${error.message}`);
  }
}

/**
 * Custom fetch-based poller to bypass the JS SDK's XDR deserialization bug ("Bad union switch: 4")
 * on newer Soroban network protocol versions.
 */
async function pollTransactionStatus(hash: string): Promise<string> {
  const payload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'getTransaction',
    params: { hash }
  };

  let attempts = 0;
  while (attempts < 15) {
    try {
      const res = await fetch(SOROBAN_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result && json.result.status) {
          const status = json.result.status;
          if (status === 'SUCCESS' || status === 'FAILED') {
            return status;
          }
        }
      }
    } catch (e) {
      console.warn('Error polling transaction status:', e);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    attempts++;
  }
  return 'NOT_FOUND';
}

/**
 * Standard utility function representing a linear transaction execution pipeline
 * signing and submitting using the Freighter extension.
 */
export async function executeContractTransactionWithFreighter(
  contractId: string,
  functionName: string,
  args: any[],
  userPublicKey: string
) {
  console.log(`[Freighter Pipeline] Starting pipeline for ${functionName}...`);

  const contract = new Contract(contractId);

  // 1. Build the transaction call
  const txCall = contract.call(functionName, ...args);

  // 2. Fetch the account sequence from RPC
  const account = await rpcServer.getAccount(userPublicKey);
  
  // 3. Build linear transaction
  const tx = new TransactionBuilder(account, {
    fee: '100000', // max fee buffer
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(txCall)
    .setTimeout(30)
    .build();

  // 4. Simulate transaction to calculate resource footprints
  console.log('[Freighter Pipeline] Simulating transaction...');
  const preparedTx = await rpcServer.prepareTransaction(tx);

  // 5. Sign transaction via Freighter
  console.log('[Freighter Pipeline] Requesting wallet signature via Freighter API...');
  const xdr = preparedTx.toXDR();
  const res = await signTransaction(xdr, {
    networkPassphrase: Networks.TESTNET,
  });

  if (res.error) {
    throw new Error(`Signing transaction failed: ${res.error.message}`);
  }

  const signedTx = TransactionBuilder.fromXDR(res.signedTxXdr, Networks.TESTNET);

  // 6. Submit transaction to Soroban RPC
  console.log('[Freighter Pipeline] Submitting signed transaction to Soroban RPC...');
  const response = await rpcServer.sendTransaction(signedTx);

  if (response.status === 'ERROR') {
    throw new Error(`Transaction submission failed: ${JSON.stringify(response.errorResult)}`);
  }

  // 7. Poll for transaction completion status using custom fetch bypass
  console.log('[Freighter Pipeline] Polling transaction status...');
  const txStatus = await pollTransactionStatus(response.hash);

  if (txStatus !== 'SUCCESS') {
    throw new Error(`Transaction execution failed with status: ${txStatus}`);
  }

  console.log('[Freighter Pipeline] Transaction executed successfully!');
  return {
    hash: response.hash,
    result: '', // bypassed parsing result XDR
  };
}

/**
 * Standard utility function representing a linear transaction execution pipeline
 * signing using a local secret key (for administrative/mock setup actions).
 */
export async function executeContractTransaction(
  contractId: string,
  functionName: string,
  args: any[],
  secretKey: string
) {
  console.log(`[Private Key Pipeline] Starting pipeline for ${functionName}...`);

  const submitter = Keypair.fromSecret(secretKey);
  const contract = new Contract(contractId);

  // 1. Build the transaction call
  const txCall = contract.call(functionName, ...args);

  // 2. Fetch the account sequence
  const account = await rpcServer.getAccount(submitter.publicKey());
  
  // 3. Build linear transaction
  const tx = new TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(txCall)
    .setTimeout(30)
    .build();

  // 4. Simulate transaction to calculate resource fees
  const preparedTx = await rpcServer.prepareTransaction(tx);

  // 5. Sign the transaction
  preparedTx.sign(submitter);

  // 6. Submit transaction to Soroban RPC
  const response = await rpcServer.sendTransaction(preparedTx);

  if (response.status === 'ERROR') {
    throw new Error(`Transaction submission failed: ${JSON.stringify(response.errorResult)}`);
  }

  // 7. Poll for completion status using custom fetch bypass
  console.log('[Private Key Pipeline] Polling transaction status...');
  const txStatus = await pollTransactionStatus(response.hash);

  if (txStatus !== 'SUCCESS') {
    throw new Error(`Transaction execution failed with status: ${txStatus}`);
  }

  return {
    hash: response.hash,
    result: '',
  };
}
