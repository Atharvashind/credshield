/**
 * POST /api/vault/build-tx
 *
 * Body: { caller: string, fn: "deposit" | "withdraw", amountInStroops: number }
 *
 * Builds and prepares (simulate + assemble) a vault transaction server-side.
 * Returns the unsigned XDR for the client to sign with Freighter.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  rpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Contract,
  nativeToScVal,
  Address,
} from "@stellar/stellar-sdk";

const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";
const VAULT_CONTRACT_ID = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID ?? "";

export async function POST(request: NextRequest) {
  if (!VAULT_CONTRACT_ID) {
    return NextResponse.json({ error: "VAULT_CONTRACT_ID not set" }, { status: 500 });
  }

  try {
    const body = await request.json() as {
      caller: string;
      fn: "deposit" | "withdraw";
      amountInStroops: number;
    };

    const { caller, fn, amountInStroops } = body;

    if (!caller || !fn || !amountInStroops) {
      return NextResponse.json(
        { error: "caller, fn, and amountInStroops are required" },
        { status: 400 }
      );
    }

    const server = new rpc.Server(SOROBAN_RPC_URL, { allowHttp: false });
    const account = await server.getAccount(caller);
    const contract = new Contract(VAULT_CONTRACT_ID);

    const args = [
      new Address(caller).toScVal(),
      nativeToScVal(amountInStroops, { type: "i128" }),
    ];

    const rawTx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(contract.call(fn, ...args))
      .setTimeout(300)
      .build();

    // Simulate + assemble in one step
    const preparedTx = await server.prepareTransaction(rawTx);

    return NextResponse.json({ unsignedXdr: preparedTx.toXDR() });
  } catch (error) {
    console.error("[/api/vault/build-tx]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to build transaction" },
      { status: 500 }
    );
  }
}
