use soroban_sdk::{contracttype, Address};

// ---------------------------------------------------------------------------
// Storage key namespaces
// ---------------------------------------------------------------------------
//
// Soroban uses a key-value store.  We partition the namespace into three
// categories so that iterating or expiring entries is straightforward:
//
//   • `DataKey`   – singleton values (admin, token, totals).
//   • `UserKey`   – per-address values (share balances).
//
// Using an enum with `#[contracttype]` ensures the keys are serialised
// deterministically and are human-readable in the XDR explorer.

/// Keys for singleton (global) storage entries.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    /// The administrator `Address` that controls privileged operations.
    Admin,

    /// The Stellar asset contract address whose tokens are held in the vault.
    TokenAddress,

    /// The total number of vault shares currently in circulation.
    TotalShares,

    /// The total amount of underlying tokens held by the vault (liquidity).
    TotalLiquidity,

    /// Whether the contract has been initialised.
    Initialized,
}

/// Keys for per-user storage entries.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum UserKey {
    /// The vault-share balance for a specific depositor.
    Shares(Address),
}

// ---------------------------------------------------------------------------
// Value types
// ---------------------------------------------------------------------------

/// A snapshot of the vault's aggregate state, returned by `get_vault_info`.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VaultInfo {
    /// Total vault shares in circulation.
    pub total_shares: i128,

    /// Total underlying token liquidity held by the vault.
    pub total_liquidity: i128,

    /// The current net-asset-value per share, expressed in token units
    /// (scaled by `SHARE_PRECISION`).
    pub nav_per_share: i128,
}

/// Precision multiplier used when computing NAV per share.
///
/// Using 1 × 10⁷ (seven decimal places) aligns with Stellar's native
/// stroops convention and avoids integer truncation on small balances.
pub const SHARE_PRECISION: i128 = 10_000_000;
