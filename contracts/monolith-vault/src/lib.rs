//! # Monolith Vault — Soroban Smart Contract
//!
//! An institutional-grade treasury vault built on the Stellar network using
//! the Soroban smart-contract platform.
//!
//! ## Architecture
//!
//! The codebase is split into four focused modules:
//!
//! | Module            | Responsibility                                      |
//! |-------------------|-----------------------------------------------------|
//! | `contract`        | Public entry-points and core business logic         |
//! | `storage_types`   | Ledger key/value type definitions and constants     |
//! | `errors`          | Typed error enum with numeric discriminants         |
//! | `events`          | Strictly-typed Soroban event emitters               |
//!
//! ## Security Model
//!
//! * Every state-mutating function requires the caller to `require_auth()`.
//! * The `rebalance` function is additionally gated behind an admin check.
//! * All arithmetic uses `checked_*` operations; overflow returns
//!   `VaultError::ArithmeticError` rather than panicking.
//! * The withdraw function follows the checks-effects-interactions pattern to
//!   prevent re-entrancy.

#![no_std]

pub mod contract;
pub mod errors;
pub mod events;
pub mod storage_types;

pub use contract::MonolithVault;
pub use contract::MonolithVaultClient;
