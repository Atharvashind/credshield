use soroban_sdk::{Address, Env, Symbol, symbol_short};

// ---------------------------------------------------------------------------
// Event topic constants
// ---------------------------------------------------------------------------
//
// Soroban events are indexed by a (contract_id, topics, data) triple.
// We use short symbols for the primary topic so that off-chain indexers can
// filter cheaply without deserialising the full data payload.

const DEPOSIT_TOPIC: Symbol = symbol_short!("deposit");
const WITHDRAW_TOPIC: Symbol = symbol_short!("withdraw");
const REBALANCE_TOPIC: Symbol = symbol_short!("rebalance");

// ---------------------------------------------------------------------------
// Typed event emitters
// ---------------------------------------------------------------------------

/// Emits a `deposit` event.
///
/// # Arguments
/// * `env`          – The Soroban execution environment.
/// * `depositor`    – The address that initiated the deposit.
/// * `token_amount` – The number of underlying tokens transferred in.
/// * `shares_minted`– The number of vault shares credited to the depositor.
pub fn emit_deposit(
    env: &Env,
    depositor: &Address,
    token_amount: i128,
    shares_minted: i128,
) {
    env.events().publish(
        (DEPOSIT_TOPIC, depositor.clone()),
        (token_amount, shares_minted),
    );
}

/// Emits a `withdraw` event.
///
/// # Arguments
/// * `env`             – The Soroban execution environment.
/// * `redeemer`        – The address that initiated the withdrawal.
/// * `shares_burned`   – The number of vault shares destroyed.
/// * `tokens_returned` – The number of underlying tokens sent back.
pub fn emit_withdraw(
    env: &Env,
    redeemer: &Address,
    shares_burned: i128,
    tokens_returned: i128,
) {
    env.events().publish(
        (WITHDRAW_TOPIC, redeemer.clone()),
        (shares_burned, tokens_returned),
    );
}

/// Emits a `rebalance` event.
///
/// # Arguments
/// * `env`            – The Soroban execution environment.
/// * `admin`          – The admin address that triggered the rebalance.
/// * `yield_accrued`  – The simulated yield added to total liquidity.
/// * `new_liquidity`  – The vault's total liquidity after the rebalance.
pub fn emit_rebalance(
    env: &Env,
    admin: &Address,
    yield_accrued: i128,
    new_liquidity: i128,
) {
    env.events().publish(
        (REBALANCE_TOPIC, admin.clone()),
        (yield_accrued, new_liquidity),
    );
}
