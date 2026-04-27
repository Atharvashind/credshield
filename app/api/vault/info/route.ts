import { NextResponse } from "next/server";
import { fetchVaultInfo } from "@/lib/stellar-service";

export async function GET() {
  try {
    const info = await fetchVaultInfo();
    return NextResponse.json({
      totalShares: info.totalShares.toString(),
      totalLiquidity: info.totalLiquidity.toString(),
      navPerShare: info.navPerShare.toString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch vault info" },
      { status: 500 }
    );
  }
}
