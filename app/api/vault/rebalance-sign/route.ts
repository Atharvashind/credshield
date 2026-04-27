import { NextRequest, NextResponse } from "next/server";
import { rpc, TransactionBuilder, Networks, BASE_FEE, Contract } from "@stellar/stellar-sdk";

const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";
const VAULT_CONTRACT_ID = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID ?? "";

export async function POST(request: NextRequest) {
  if (!VAULT_CONTRACT_ID) {
    return NextResponse.json({ error: "VAULT_CONTRACT_ID not set" }, { status: 500 });
  }
  try {
    const { caller } = await request.json() as { caller: string };
    if (!caller) {
      return NextResponse.json({ error: "caller address required" }, { status: 400 });
    }

    const server = new rpc.Server(SOROBAN_RPC_URL, { allowHttp: false });
    const account = await server.getAccount(caller);
    const contract = new Contract(VAULT_CONTRACT_ID);

    const rawTx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(contract.call("rebalance"))
      .setTimeout(300)
      .build();

    // prepareTransaction = simulate + assemble (v13)
    const preparedTx = await server.prepareTransaction(rawTx);

    return NextResponse.json({ unsignedXdr: preparedTx.toXDR() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Build failed" },
      { status: 500 }
    );
  }
}
