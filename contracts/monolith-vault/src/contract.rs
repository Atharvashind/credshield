use soroban_sdk::{
    contract, contractimpl, token, Address, Env,
};

use crate::{
    errors::VaultError,
    events,
    storage_types::{DataKey, UserKey, VaultInfo, SHARE_PRECISION},
};

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------
//
// These private functions centralise all reads and writes to the Soroban
// ledger so that the public interface remains clean and testable.

fn is_initialized(env: &Env) -> bool {
    env.storage()
        .instance()
        .get::<DataKey, bool>(&DataKey::Initialized)
        .unwrap_or(false)
}

fn get_admin(env: &Env) -> Address {
    env.storage()
        .instance()
        .get::<DataKey, Address>(&DataKey::Admin)
        .expect("admin not set")
}

fn get_token_address(env: &Env) -> Address {
    env.storage()
        .instance()
        .get::<DataKey, Address>(&DataKey::TokenAddress)
        .expect("token address not set")
}

fn get_total_shares(env: &Env) -> i128 {
    env.storage()
        .instance()
        .get::<DataKey, i128>(&DataKey::TotalShares)
        .unwrap_or(0)
}

fn set_total_shares(env: &Env, value: i128) {
    env.storage()
        .instance()
        .set(&DataKey::TotalShares, &value);
}

fn get_total_liquidity(env: &Env) -> i128 {
    env.storage()
        .instance()
        .get::<DataKey, i128>(&DataKey::TotalLiquidity)
        .unwrap_or(0)
}

fn set_total_liquidity(env: &Env, value: i128) {
    env.storage()
        .instance()
        .set(&DataKey::TotalLiquidity, &value);
}

fn get_user_shares(env: &Env, user: &Address) -> i128 {
    env.storage()
        .persistent()
        .get::<UserKey, i128>(&UserKey::Shares(user.clone()))
        .unwrap_or(0)
}

fn set_user_shares(env: &Env, user: &Address, shares: i128) {
    env.storage()
        .persistent()
        .set(&UserKey::Shares(user.clone()), &shares);
}

// ---------------------------------------------------------------------------
// Share / token conversion helpers
// ---------------------------------------------------------------------------

/// Calculates how many vault shares to mint for a given token deposit.
///
/// On the first deposit (total_shares == 0) we seed the pool at a 1:1 ratio
/// scaled by `SHARE_PRECISION` so that subsequent NAV calculations are
/// numerically stable.
///
/// For subsequent deposits we use the standard proportional formula:
///   shares_to_mint = (token_amount × total_shares) / total_liquidity
fn calculate_shares_to_mint(
    token_amount: i128,
    total_shares: i128,
    total_liquidity: i128,
) -> Result<i128, VaultError> {
    if total_shares == 0 || total_liquidity == 0 {
        // Seed deposit: 1 token unit → SHARE_PRECISION shares.
        token_amount
            .checked_mul(SHARE_PRECISION)
            .ok_or(VaultError::ArithmeticError)
    } else {
        token_amount
            .checked_mul(total_shares)
            .and_then(|n| n.checked_div(total_liquidity))
            .ok_or(VaultError::ArithmeticError)
    }
}

/// Calculates how many underlying tokens to return for a given share
/// redemption.
///
///   tokens_to_return = (shares × total_liquidity) / total_shares
fn calculate_tokens_to_return(
    shares: i128,
    total_shares: i128,
    total_liquidity: i128,
) -> Result<i128, VaultError> {
    shares
        .checked_mul(total_liquidity)
        .and_then(|n| n.checked_div(total_shares))
        .ok_or(VaultError::ArithmeticError)
}

// ---------------------------------------------------------------------------
// Contract definition
// ---------------------------------------------------------------------------

#[contract]
pub struct MonolithVault;

#[contractimpl]
impl MonolithVault {
    // -----------------------------------------------------------------------
    // Initialisation
    // -----------------------------------------------------------------------

    /// Initialises the vault with an administrator and the underlying token.
    ///
    /// This function is idempotent-guarded: calling it a second time returns
    /// `VaultError::AlreadyInitialized`.  The admin address is stored in
    /// instance storage so it persists for the lifetime of the contract.
    ///
    /// # Arguments
    /// * `admin`         – The address that will hold privileged access.
    /// * `token_address` – The Stellar asset contract (SAC) address whose
    ///                     tokens the vault will custody.
    pub fn initialize(
        env: Env,
        admin: Address,
        token_address: Address,
    ) -> Result<(), VaultError> {
        if is_initialized(&env) {
            return Err(VaultError::AlreadyInitialized);
        }

        // Require the admin to authorise the initialisation call so that
        // no third party can front-run the deployment.
        admin.require_auth();

        env.storage()
            .instance()
            .set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TokenAddress, &token_address);
        env.storage()
            .instance()
            .set(&DataKey::TotalShares, &0_i128);
        env.storage()
            .instance()
            .set(&DataKey::TotalLiquidity, &0_i128);
        env.storage()
            .instance()
            .set(&DataKey::Initialized, &true);

        Ok(())
    }

    // -----------------------------------------------------------------------
    // Deposit
    // -----------------------------------------------------------------------

    /// Transfers `amount` tokens from `from` into the vault and mints the
    /// proportional number of vault shares to the depositor.
    ///
    /// The caller must have pre-approved the vault contract to spend at least
    /// `amount` tokens via the token contract's `approve` function.
    ///
    /// # Arguments
    /// * `from`   – The depositor's address (must authorise this call).
    /// * `amount` – The number of underlying tokens to deposit (must be > 0).
    ///
    /// # Errors
    /// * `NotInitialized`      – Contract has not been initialised.
    /// * `InvalidDepositAmount`– `amount` is ≤ 0.
    /// * `ArithmeticError`     – Share calculation overflowed.
    pub fn deposit(env: Env, from: Address, amount: i128) -> Result<i128, VaultError> {
        if !is_initialized(&env) {
            return Err(VaultError::NotInitialized);
        }
        if amount <= 0 {
            return Err(VaultError::InvalidDepositAmount);
        }

        // Require the depositor to sign this transaction.
        from.require_auth();

        let total_shares = get_total_shares(&env);
        let total_liquidity = get_total_liquidity(&env);

        let shares_to_mint =
            calculate_shares_to_mint(amount, total_shares, total_liquidity)?;

        // Pull tokens from the depositor into the vault contract.
        let token_client = token::Client::new(&env, &get_token_address(&env));
        token_client.transfer(&from, &env.current_contract_address(), &amount);

        // Update global state.
        let new_total_shares = total_shares
            .checked_add(shares_to_mint)
            .ok_or(VaultError::ArithmeticError)?;
        let new_total_liquidity = total_liquidity
            .checked_add(amount)
            .ok_or(VaultError::ArithmeticError)?;

        set_total_shares(&env, new_total_shares);
        set_total_liquidity(&env, new_total_liquidity);

        // Update the depositor's share balance.
        let current_user_shares = get_user_shares(&env, &from);
        let new_user_shares = current_user_shares
            .checked_add(shares_to_mint)
            .ok_or(VaultError::ArithmeticError)?;
        set_user_shares(&env, &from, new_user_shares);

        events::emit_deposit(&env, &from, amount, shares_to_mint);

        Ok(shares_to_mint)
    }

    // -----------------------------------------------------------------------
    // Withdraw
    // -----------------------------------------------------------------------

    /// Burns `shares` from `to`'s balance and returns the proportional
    /// underlying tokens to that address.
    ///
    /// # Arguments
    /// * `to`     – The redeemer's address (must authorise this call).
    /// * `shares` – The number of vault shares to burn (must be > 0).
    ///
    /// # Errors
    /// * `NotInitialized`    – Contract has not been initialised.
    /// * `InvalidShareAmount`– `shares` is ≤ 0.
    /// * `InsufficientShares`– Caller holds fewer shares than requested.
    /// * `InsufficientLiquidity` – Vault cannot cover the redemption.
    /// * `ArithmeticError`   – Token calculation overflowed.
    pub fn withdraw(env: Env, to: Address, shares: i128) -> Result<i128, VaultError> {
        if !is_initialized(&env) {
            return Err(VaultError::NotInitialized);
        }
        if shares <= 0 {
            return Err(VaultError::InvalidShareAmount);
        }

        // Require the redeemer to sign this transaction.
        to.require_auth();

        let user_shares = get_user_shares(&env, &to);
        if user_shares < shares {
            return Err(VaultError::InsufficientShares);
        }

        let total_shares = get_total_shares(&env);
        let total_liquidity = get_total_liquidity(&env);

        let tokens_to_return =
            calculate_tokens_to_return(shares, total_shares, total_liquidity)?;

        if tokens_to_return > total_liquidity {
            return Err(VaultError::InsufficientLiquidity);
        }

        // Update global state before the external call (checks-effects-interactions).
        let new_total_shares = total_shares
            .checked_sub(shares)
            .ok_or(VaultError::ArithmeticError)?;
        let new_total_liquidity = total_liquidity
            .checked_sub(tokens_to_return)
            .ok_or(VaultError::ArithmeticError)?;

        set_total_shares(&env, new_total_shares);
        set_total_liquidity(&env, new_total_liquidity);

        let new_user_shares = user_shares
            .checked_sub(shares)
            .ok_or(VaultError::ArithmeticError)?;
        set_user_shares(&env, &to, new_user_shares);

        // Transfer tokens from the vault to the redeemer.
        let token_client = token::Client::new(&env, &get_token_address(&env));
        token_client.transfer(&env.current_contract_address(), &to, &tokens_to_return);

        events::emit_withdraw(&env, &to, shares, tokens_to_return);

        Ok(tokens_to_return)
    }

    // -----------------------------------------------------------------------
    // Rebalance (admin-only)
    // -----------------------------------------------------------------------

    /// Simulates yield accrual by crediting a fixed basis-point return to the
    /// vault's total liquidity.  In a production deployment this function
    /// would invoke an external yield strategy contract; here it applies a
    /// deterministic 0.5 % (50 bps) increment to demonstrate the accounting
    /// mechanics.
    ///
    /// Only the admin address stored at initialisation may call this function.
    ///
    /// # Errors
    /// * `NotInitialized` – Contract has not been initialised.
    /// * `Unauthorized`   – Caller is not the admin.
    /// * `ArithmeticError`– Yield calculation overflowed.
    pub fn rebalance(env: Env) -> Result<i128, VaultError> {
        if !is_initialized(&env) {
            return Err(VaultError::NotInitialized);
        }

        let admin = get_admin(&env);
        admin.require_auth();

        let total_liquidity = get_total_liquidity(&env);

        // Apply a 50 basis-point (0.5 %) yield increment.
        // yield = total_liquidity × 50 / 10_000
        let yield_accrued = total_liquidity
            .checked_mul(50)
            .and_then(|n| n.checked_div(10_000))
            .ok_or(VaultError::ArithmeticError)?;

        let new_liquidity = total_liquidity
            .checked_add(yield_accrued)
            .ok_or(VaultError::ArithmeticError)?;

        set_total_liquidity(&env, new_liquidity);

        events::emit_rebalance(&env, &admin, yield_accrued, new_liquidity);

        Ok(yield_accrued)
    }

    // -----------------------------------------------------------------------
    // Read-only queries
    // -----------------------------------------------------------------------

    /// Returns the vault's aggregate state snapshot.
    pub fn get_vault_info(env: Env) -> Result<VaultInfo, VaultError> {
        if !is_initialized(&env) {
            return Err(VaultError::NotInitialized);
        }

        let total_shares = get_total_shares(&env);
        let total_liquidity = get_total_liquidity(&env);

        let nav_per_share = if total_shares == 0 {
            SHARE_PRECISION
        } else {
            total_liquidity
                .checked_mul(SHARE_PRECISION)
                .and_then(|n| n.checked_div(total_shares))
                .ok_or(VaultError::ArithmeticError)?
        };

        Ok(VaultInfo {
            total_shares,
            total_liquidity,
            nav_per_share,
        })
    }

    /// Returns the vault-share balance for a specific user.
    pub fn get_user_shares(env: Env, user: Address) -> i128 {
        get_user_shares(&env, &user)
    }

    /// Returns the admin address.
    pub fn get_admin(env: Env) -> Result<Address, VaultError> {
        if !is_initialized(&env) {
            return Err(VaultError::NotInitialized);
        }
        Ok(get_admin(&env))
    }
}
