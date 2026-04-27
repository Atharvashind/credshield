import { NextRequest, NextResponse } from "next/server";
import { fetchUserShares } from "@/lib/stellar-service";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }
  try {
    const shares = await fetchUserShares(address);
    return NextResponse.json({ shares: shares.toString() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch shares" },
      { status: 500 }
    );
  }
}
