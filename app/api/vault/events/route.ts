import { NextRequest, NextResponse } from "next/server";

const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";
const VAULT_CONTRACT_ID = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID ?? "";

interface TxRecord {
  type: "deposit" | "withdraw" | "rebalance";
  amount: string;
  shares: string;
  hash: string;
  time: string;
  status: "confirmed";
}

/**
 * Raw JSON-RPC call — bypasses stellar-sdk XDR parsing entirely.
 * This avoids "XDR Read Error: unknown ScAddressType member for value 4"
 * which occurs when the testnet protocol version is ahead of the SDK.
 */
async function rpcCall(method: string, params: unknown) {
  const res = await fetch(SOROBAN_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  return res.json();
}

export async function GET(request: NextRequest) {
  if (!VAULT_CONTRACT_ID) return NextResponse.json([]);

  const address = request.nextUrl.searchParams.get("address");

  try {
    // Get latest ledger via raw RPC
    const ledgerRes = await rpcCall("getLatestLedger", {});
    const latestLedger: number = ledgerRes.result?.sequence ?? 0;
    if (!latestLedger) return NextResponse.json([]);

    // The RPC retains ~120,960 ledgers but silently returns 0 events if
    // startLedger is below the actual minimum. Use a safe 10,000-ledger
    // window (~14 hours) which is always within the retention range.
    const startLedger = latestLedger - 10_000;

    // Fetch events via raw RPC — no XDR parsing
    const eventsRes = await rpcCall("getEvents", {
      startLedger,
      filters: [
        {
          type: "contract",
          contractIds: [VAULT_CONTRACT_ID],
        },
      ],
      pagination: { limit: 200 },
    });

    const rawEvents: any[] = eventsRes.result?.events ?? [];
    const records: TxRecord[] = [];

    for (const event of rawEvents) {
      try {
        // Topics come as base64-encoded XDR ScVal strings.
        // We decode them manually without stellar-sdk.
        const topics: string[] = event.topic ?? [];
        if (topics.length < 1) continue;

        // Decode topic[0] — it's a Symbol ScVal
        // ScVal symbol: type byte 0x0e (14) followed by length + bytes
        const topicStr = decodeScSymbol(topics[0]);
        if (!topicStr) continue;

        // Filter by address if provided
        if (address && topics[1]) {
          const eventAddr = decodeScAddress(topics[1]);
          if (eventAddr && eventAddr !== address) continue;
        }

        // Decode the value — it's a Vec of two i128 values
        const [val0, val1] = decodeScVecI128(event.value ?? "");

        const time = event.ledgerClosedAt
          ? new Date(event.ledgerClosedAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—";

        if (topicStr === "deposit") {
          records.push({
            type: "deposit",
            amount: `+${stroopsToXlm(val0)} XLM`,
            shares: `+${stroopsToXlm(val1)} MVLT`,
            hash: event.txHash ?? "",
            time,
            status: "confirmed",
          });
        } else if (topicStr === "withdraw") {
          records.push({
            type: "withdraw",
            amount: `-${stroopsToXlm(val1)} XLM`,
            shares: `-${stroopsToXlm(val0)} MVLT`,
            hash: event.txHash ?? "",
            time,
            status: "confirmed",
          });
        } else if (topicStr === "rebalance") {
          records.push({
            type: "rebalance",
            amount: `+${stroopsToXlm(val0)} XLM yield`,
            shares: "—",
            hash: event.txHash ?? "",
            time,
            status: "confirmed",
          });
        }
      } catch {
        continue;
      }
    }

    records.reverse();
    return NextResponse.json(records);
  } catch (error) {
    console.error("[/api/vault/events]", error);
    return NextResponse.json([]);
  }
}

// ---------------------------------------------------------------------------
// Manual XDR decoders — no stellar-sdk dependency
// ---------------------------------------------------------------------------

function stroopsToXlm(stroops: bigint): string {
  return (Number(stroops) / 10_000_000).toFixed(4);
}

/**
 * Decode a base64 ScVal that is a Symbol type.
 * ScVal wire format: 4-byte discriminant (big-endian) + payload
 * Symbol discriminant = 14 (0x0000000E)
 * Payload: 4-byte length + UTF-8 bytes
 */
function decodeScSymbol(base64: string): string | null {
  try {
    const buf = Buffer.from(base64, "base64");
    // First 4 bytes = discriminant
    const disc = buf.readUInt32BE(0);
    // Symbol discriminant = 15 in protocol 22+ (was 14 in older protocol)
    if (disc !== 15 && disc !== 14) return null;
    const len = buf.readUInt32BE(4);
    return buf.slice(8, 8 + len).toString("utf8");
  } catch {
    return null;
  }
}

/**
 * Decode a base64 ScVal that is an Address type and return the strkey.
 * We just need to check if it matches — we don't need the full decode.
 * Returns null if we can't decode.
 */
function decodeScAddress(base64: string): string | null {
  try {
    const buf = Buffer.from(base64, "base64");
    const disc = buf.readUInt32BE(0);
    if (disc !== 18) return null; // not an address ScVal
    // Address type: 4 bytes discriminant (0 = account, 1 = contract)
    const addrType = buf.readUInt32BE(4);
    if (addrType === 0) {
      // Account: 4-byte key type + 32-byte ed25519 key
      const keyType = buf.readUInt32BE(8);
      if (keyType !== 0) return null;
      const keyBytes = buf.slice(12, 44);
      return encodeEd25519PublicKey(keyBytes);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Decode a base64 ScVal Vec containing two i128 values.
 *
 * Wire format observed from Soroban testnet (protocol 22+):
 *   disc(4=16/Vec) + outer_len(4=1) + inner_len(4=2)
 *   + i128_disc(4=10) + hi(8) + lo(8)
 *   + i128_disc(4=10) + hi(8) + lo(8)
 *
 * Returns [val0, val1] as bigints.
 */
function decodeScVecI128(base64: string): [bigint, bigint] {
  try {
    const buf = Buffer.from(base64, "base64");
    if (buf.length < 12) return [BigInt(0), BigInt(0)];

    // offset 0: Vec discriminant (16)
    // offset 4: outer length (1)
    // offset 8: inner length (2) — number of i128 elements
    const innerLen = buf.readUInt32BE(8);
    if (innerLen < 1) return [BigInt(0), BigInt(0)];

    const vals: bigint[] = [];
    let offset = 12;

    for (let i = 0; i < Math.min(innerLen, 2); i++) {
      if (offset + 4 > buf.length) break;
      const elemDisc = buf.readUInt32BE(offset);
      offset += 4;

      if (elemDisc === 10) {
        // i128: 8-byte hi (signed) + 8-byte lo (unsigned)
        if (offset + 16 > buf.length) break;
        const hi = buf.readBigInt64BE(offset);
        const lo = buf.readBigUInt64BE(offset + 8);
        vals.push((hi < BigInt(0))
          ? -(((-hi - BigInt(1)) << BigInt(64)) | (BigInt("0xFFFFFFFFFFFFFFFF") - lo + BigInt(1)))
          : (hi << BigInt(64)) | lo
        );
        offset += 16;
      } else {
        vals.push(BigInt(0));
        offset += 16;
      }
    }

    return [vals[0] ?? BigInt(0), vals[1] ?? BigInt(0)];
  } catch {
    return [BigInt(0), BigInt(0)];
  }
}

/**
 * Encode a 32-byte ed25519 public key as a Stellar G... strkey.
 */
function encodeEd25519PublicKey(keyBytes: Buffer): string {
  // Version byte for ed25519 public key = 6 << 3 = 48
  const versionByte = 6 << 3;
  const payload = Buffer.concat([Buffer.from([versionByte]), keyBytes]);
  const checksum = crc16xmodem(payload);
  const checksumBuf = Buffer.alloc(2);
  checksumBuf.writeUInt16LE(checksum, 0);
  const full = Buffer.concat([payload, checksumBuf]);
  return base32Encode(full);
}

function crc16xmodem(buf: Buffer): number {
  let crc = 0x0000;
  for (const byte of buf) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
    crc &= 0xffff;
  }
  return crc;
}

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}
