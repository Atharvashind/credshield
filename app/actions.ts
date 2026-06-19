'use server';

import { nativeToScVal } from '@stellar/stellar-sdk';
import { executeContractTransaction } from '../lib/stellar';

export async function mintMockUSDC(toAddress: string, amount: number) {
  const secretKey = process.env.SOROBAN_SECRET_KEY;
  if (!secretKey) {
    throw new Error('SOROBAN_SECRET_KEY is not configured in environment');
  }

  const tokenId = process.env.NEXT_PUBLIC_SOROBAN_TOKEN_ID || 'CA3DVPHLVJ2O5ZZ7W3U2QDQVDJVHC7QZOEF5ZOXN23ZE5GUSHKLEAUEW';
  
  // 1 USDC = 10,000,000 base units (7 decimals)
  const baseUnits = BigInt(amount) * BigInt(10000000);

  const scArgs = [
    nativeToScVal(toAddress, { type: 'address' }),
    nativeToScVal(baseUnits, { type: 'i128' }),
  ];

  console.log(`[Server Action] Minting ${amount} mock USDC to ${toAddress}...`);
  const result = await executeContractTransaction(
    tokenId,
    'mint',
    scArgs,
    secretKey
  );

  return {
    hash: result.hash,
  };
}
