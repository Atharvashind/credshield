import { NextResponse } from "next/server";

// Rebalance must be signed client-side via Freighter.
// Use /api/vault/rebalance-sign to get the unsigned XDR,
// then /api/vault/submit to submit the signed transaction.
export async function POST() {
  return NextResponse.json(
    { error: "Use /api/vault/rebalance-sign + /api/vault/submit for rebalance." },
    { status: 400 }
  );
}
