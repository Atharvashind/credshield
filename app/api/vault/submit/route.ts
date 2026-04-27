import { NextRequest, NextResponse } from "next/server";

const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";

// Human-readable messages for each VaultError discriminant
const CONTRACT_ERRORS: Record<number, string> = {
  1: "Contract is already initialized.",
  2: "Invalid admin address.",
  3: "You are not authorized to perform this action.",
  4: "Deposit amount must be greater than zero.",
  5: "Share amount must be greater than zero.",
  6: "Insufficient shares — you don't have enough MVLT to withdraw that amount.",
  7: "Insufficient vault liquidity to process this withdrawal.",
  8: "Arithmetic overflow — the amount is too large.",
  9: "Contract has not been initialized yet.",
};

function humanizeError(resultXdr: string): string {
  try {
    const buf = Buffer.from(resultXdr, "base64");
    for (let i = 0; i <= buf.length - 8; i++) {
      if (buf.readUInt32BE(i) === 6) {
        const code = buf.readUInt32BE(i + 4);
        if (CONTRACT_ERRORS[code]) return CONTRACT_ERRORS[code];
      }
    }
  } catch { /* ignore */ }
  return "Transaction failed. Check your balance and try again.";
}

export async function POST(request: NextRequest) {
  try {
    const { signedXdr } = (await request.json()) as { signedXdr: string };

    if (!signedXdr || typeof signedXdr !== "string") {
      return NextResponse.json({ error: "signedXdr required" }, { status: 400 });
    }

    const sendRes = await fetch(SOROBAN_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1,
        method: "sendTransaction",
        params: { transaction: signedXdr },
      }),
    });

    const sendData = await sendRes.json() as {
      result?: { hash: string; status: string; errorResultXdr?: string };
      error?: { code: number; message: string };
    };

    if (sendData.error) {
      const msg = sendData.error.message ?? "";
      if (msg.toLowerCase().includes("insufficient")) {
        return NextResponse.json(
          { error: "Insufficient XLM balance to cover this transaction and fees." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: `Network error: ${msg}` }, { status: 400 });
    }

    const txHash = sendData.result?.hash;
    if (!txHash) {
      return NextResponse.json({ error: "No transaction hash returned." }, { status: 500 });
    }

    if (sendData.result?.status === "ERROR") {
      return NextResponse.json(
        { error: humanizeError(sendData.result?.errorResultXdr ?? "") },
        { status: 400 }
      );
    }

    const confirmed = await pollForConfirmation(txHash);

    if (confirmed.status === "SUCCESS") return NextResponse.json({ txHash });

    if (confirmed.status === "FAILED") {
      return NextResponse.json(
        { error: humanizeError(confirmed.resultXdr ?? "") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Transaction timed out. Check Stellar Expert for status." },
      { status: 408 }
    );
  } catch (error) {
    console.error("[/api/vault/submit]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Submit failed." },
      { status: 500 }
    );
  }
}

interface TxResult {
  status: "SUCCESS" | "FAILED" | "NOT_FOUND";
  resultXdr?: string;
}

async function pollForConfirmation(txHash: string, maxAttempts = 30, intervalMs = 2000): Promise<TxResult> {
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getTransaction", params: { hash: txHash } });
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    const res = await fetch(SOROBAN_RPC_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    const data = await res.json() as { result?: { status: string; resultXdr?: string } };
    const s = data.result?.status;
    if (s === "SUCCESS") return { status: "SUCCESS" };
    if (s === "FAILED") return { status: "FAILED", resultXdr: data.result?.resultXdr };
  }
  return { status: "NOT_FOUND" };
}
