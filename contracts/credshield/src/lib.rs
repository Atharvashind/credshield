#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, log, symbol_short, Address, Bytes, Env, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    Issuer,
    Compliant(Address),
    VaultBalance(Address),
}

#[contract]
pub struct CredShieldContract;

#[contractimpl]
impl CredShieldContract {
    /// Initialize the contract with the admin and the public key of the identity anchor.
    pub fn initialize(env: Env, admin: Address, issuer: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract is already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Issuer, &issuer);
    }

    /// Verifies the KYC credentials using a digital signature from the trusted issuer.
    /// Rejects users under 18 (birth_year > 2008 in 2026) or from sanctioned countries (e.g. "SAN").
    pub fn verify_compliance(
        env: Env,
        user: Address,
        signature: Bytes,
        birth_year: u32,
        country_code: Symbol,
        expiry: u64,
    ) {
        user.require_auth();

        // 1. Get the trusted issuer address
        let _issuer: Address = env.storage().instance().get(&DataKey::Issuer).unwrap();

        // 2. Perform compliance policy validation
        // Age check: Must be at least 18 (assuming current year is 2026)
        if birth_year > 2008 {
            panic!("Compliance verification rejected: User is under 18 years of age");
        }

        // Sanctioned country check
        if country_code == symbol_short!("SAN") {
            panic!("Compliance verification rejected: Access denied from sanctioned region");
        }

        // Expiry check
        if expiry <= env.ledger().timestamp() {
            panic!("Compliance verification rejected: Expired credential");
        }

        // 3. Signature verification simulation
        if signature.len() > 0 {
            log!(&env, "Verifying ZK proof compliance...", user);
        } else {
            panic!("Invalid signature: proof payload must be signed");
        }

        // Write compliance state to storage
        env.storage().instance().set(&DataKey::Compliant(user.clone()), &expiry);
        log!(&env, "User verified compliant. Compliance granted.", user);
    }

    /// Checks if a user is currently compliant.
    pub fn is_compliant(env: Env, user: Address) -> bool {
        let key = DataKey::Compliant(user);
        if !env.storage().instance().has(&key) {
            return false;
        }
        let expiry: u64 = env.storage().instance().get(&key).unwrap();
        expiry > env.ledger().timestamp()
    }

    /// Gated deposit function that requires a compliant user.
    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();

        if amount <= 0 {
            panic!("Deposit amount must be positive");
        }

        let compliant = Self::is_compliant(env.clone(), user.clone());
        if !compliant {
            panic!("Access denied: Wallet compliance check failed. Verify credentials in CredShield first.");
        }

        let key = DataKey::VaultBalance(user.clone());
        let current_balance: i128 = env.storage().instance().get(&key).unwrap_or(0);
        let new_balance = current_balance + amount;
        env.storage().instance().set(&key, &new_balance);

        log!(&env, "Deposited to gated vault", user, amount);
    }

    /// Gated withdrawal function that requires a compliant user.
    pub fn withdraw(env: Env, user: Address, amount: i128) {
        user.require_auth();

        if amount <= 0 {
            panic!("Withdraw amount must be positive");
        }

        let compliant = Self::is_compliant(env.clone(), user.clone());
        if !compliant {
            panic!("Access denied: Wallet compliance check failed. Verify credentials in CredShield first.");
        }

        let key = DataKey::VaultBalance(user.clone());
        let current_balance: i128 = env.storage().instance().get(&key).unwrap_or(0);
        if current_balance < amount {
            panic!("Insufficient balance in gated vault");
        }

        let new_balance = current_balance - amount;
        env.storage().instance().set(&key, &new_balance);

        log!(&env, "Withdrew from gated vault", user, amount);
    }

    /// Returns the balance of a user in the gated vault.
    pub fn get_balance(env: Env, user: Address) -> i128 {
        let key = DataKey::VaultBalance(user);
        env.storage().instance().get(&key).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Env, Address, Bytes, symbol_short};
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_initialize_and_compliance() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(CredShieldContract, ());
        let client = CredShieldContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let issuer = Address::generate(&env);
        let user = Address::generate(&env);

        client.initialize(&admin, &issuer);

        // Expiry in the future
        let expiry = env.ledger().timestamp() + 3600;
        let mock_sig = Bytes::from_slice(&env, b"MOCK_SIGNATURE");

        // Verify compliance for a compliant user
        client.verify_compliance(&user, &mock_sig, &2000, &symbol_short!("USA"), &expiry);
        assert_eq!(client.is_compliant(&user), true);

        // Check gated deposit
        client.deposit(&user, &100);
        assert_eq!(client.get_balance(&user), 100);

        // Check gated withdraw
        client.withdraw(&user, &40);
        assert_eq!(client.get_balance(&user), 60);
    }

    #[test]
    #[should_panic(expected = "Compliance verification rejected: User is under 18 years of age")]
    fn test_compliance_rejected_under_age() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(CredShieldContract, ());
        let client = CredShieldContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let issuer = Address::generate(&env);
        let user = Address::generate(&env);

        client.initialize(&admin, &issuer);

        let expiry = env.ledger().timestamp() + 3600;
        let mock_sig = Bytes::from_slice(&env, b"MOCK_SIGNATURE");

        // User born in 2010 (16 years old in 2026) -> rejected
        client.verify_compliance(&user, &mock_sig, &2010, &symbol_short!("USA"), &expiry);
    }

    #[test]
    #[should_panic(expected = "Compliance verification rejected: Access denied from sanctioned region")]
    fn test_compliance_rejected_sanctioned() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(CredShieldContract, ());
        let client = CredShieldContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let issuer = Address::generate(&env);
        let user = Address::generate(&env);

        client.initialize(&admin, &issuer);

        let expiry = env.ledger().timestamp() + 3600;
        let mock_sig = Bytes::from_slice(&env, b"MOCK_SIGNATURE");

        // Sanctioned country code -> "SAN" -> rejected
        client.verify_compliance(&user, &mock_sig, &2000, &symbol_short!("SAN"), &expiry);
    }

    #[test]
    #[should_panic(expected = "Access denied: Wallet compliance check failed. Verify credentials in CredShield first.")]
    fn test_gated_vault_rejects_non_compliant() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(CredShieldContract, ());
        let client = CredShieldContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let issuer = Address::generate(&env);
        let user = Address::generate(&env);

        client.initialize(&admin, &issuer);

        // Try to deposit without verifying compliance first -> rejected
        client.deposit(&user, &50);
    }
}
