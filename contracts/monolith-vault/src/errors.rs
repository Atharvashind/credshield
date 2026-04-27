use soroban_sdk::contracterror;

/// Canonical error codes for the Monolith Vault contract.
///
/// Each variant maps to a unique `u32` discriminant so that callers
/// (both on-chain and off-chain indexers) can pattern-match on the
/// numeric code without depending on the Rust type system.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VaultError {
    /// The contract has already been initialised; `initialize` may only be
    /// called once.
    AlreadyInitialized = 1,

    /// The caller did not supply a valid admin address during initialisation.
    InvalidAdmin = 2,

    /// The requested operation requires admin privileges that the caller does
    /// not possess.
    Unauthorized = 3,

    /// The deposit amount is zero or negative, which is economically invalid.
    InvalidDepositAmount = 4,

    /// The share quantity supplied for withdrawal is zero or negative.
    InvalidShareAmount = 5,

    /// The caller's share balance is lower than the requested withdrawal
    /// quantity.
    InsufficientShares = 6,

    /// The vault's total liquidity is insufficient to honour the redemption
    /// (e.g. after a rebalance that reduced on-chain reserves).
    InsufficientLiquidity = 7,

    /// An arithmetic operation produced an overflow or underflow.
    ArithmeticError = 8,

    /// The contract has not yet been initialised; state is unavailable.
    NotInitialized = 9,
}
