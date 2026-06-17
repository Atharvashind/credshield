---
name: soroban-human-fullstack
description: Guidelines for building, testing, and deploying human-readable, minimal full-stack Soroban applications.
---

# Intent
Apply these rules to all tasks involving Soroban smart contracts, Rust logic, TypeScript frontends, backend indexing, integration testing, and deployment automation.

# Rules

## 1. Smart Contract Layer (Soroban & Rust)
- **Zero Hidden Abstractions**: Write explicit Rust. Avoid complex macros or deep trait nesting unless requested.
- **Readable Types**: Use Soroban built-in types (`Symbol`, `Bytes`, `Address`) transparently. Do not hide them behind unnecessary custom wrappers.
- **Clear Panic States**: Use `panic!` or `Symbol` errors with clear, readable human text instead of abstract error codes.
- **State Minimalism**: Explicitly group your storage keys into a clean, scannable enum.

## 2. Testing & Integration Layer
- **Verifiable Contracts**: Write native Rust unit tests using `Env::default()` inside a `mod test` block to verify contract states instantly.
- **Full-Stack Integration Tests**: Use a unified TypeScript test script to run end-to-end flows. It must spin up a local network, deploy the contract, and call it via the SDK.
- **Deterministic Assertions**: Every test must assert specific balances or event payloads. Never use broad try/catch ignores.

## 3. Backend & Client SDK Layer
- **Explicit SDK Instances**: Instantiate `SorobanRpc.Server` and `StellarSdk.Horizon` clearly. Do not use opaque wrapper libraries.
- **Transaction Pipeline**: Write a single, linear human-readable utility function to build, simulate, sign (via private key or wallet connection), and submit transactions.
- **Event Polling**: Implement clean async pollers using `getEvents` to track contract states on the backend instead of bulky, stateful web sockets where simple polling suffices.

## 4. Frontend Layer (React / Next.js)
- **Vanilla State Management**: Use React's native `useState` and `useEffect` hooks for wallet and contract state. Avoid massive Redux boilerplate for small actions.
- **Pure Component Logic**: Keep UI components dumb. Pass contract data down as simple primitives rather than passing raw SDK response objects.

## 5. Deployment Automation
- **Linear Scripts**: Use explicit Bash or Node.js deployment scripts. Avoid complex CI/CD marketplace actions that hide the underlying CLI commands.
- **Environment Parity**: Always use an explicit `.env` file mapping `SOROBAN_NETWORK_ADDRESS`, `SOROBAN_SECRET_KEY`, and `SOROBAN_CONTRACT_ID`.

---

# Implementation Examples

## Example A: Smart Contract & Rust Test
### Input: Create a simple counter contract with an increment function.
### Output:
```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, log, Address, Env, Symbol};

const COUNTER_KEY: Symbol = Symbol::short("COUNTER");

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    // Human style: Clear, readable state management without heavy abstract macros
    pub fn increment(env: Env, caller: Address) -> u32 {
        caller.require_auth();
        
        let mut count: u32 = env.storage().instance().get(&COUNTER_KEY).unwrap_or(0);
        count += 1;
        
        env.storage().instance().set(&COUNTER_KEY, &count);
        log!(&env, "Counter incremented by user", caller);
        
        count
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Env, Address};

    #[test]
    fn test_increment() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CounterContract);
        let client = CounterContractClient::new(&env, &contract_id);
        
        let user = Address::generate(&env);
        env.mock_all_auths();

        assert_eq!(client.increment(&user), 1);
        assert_eq!(client.increment(&user), 2);
    }
}
```

## Example B: Integration & Deployment Script
### Input: Deploy the contract and invoke it using TypeScript.
### Output:
```typescript
import { Contract, Horizon, rpc, Keypair, Networks } from "@stellar/stellar-sdk";
import * as fs from "fs";

// Human style: Linear execution steps that read like a checklist
async function runIntegrationWorkflow() {
  const server = new rpc.Server(process.env.SOROBAN_RPC_URL!);
  const submitter = Keypair.fromSecret(process.env.SOROBAN_SECRET_KEY!);
  const contractId = process.env.SOROBAN_CONTRACT_ID!;

  console.log("🛠️ Simulating contract transaction...");
  const contract = new Contract(contractId);
  const tx = contract.call("increment", submitter.address());

  // Simulate, sign, and send explicitly
  const account = await server.getAccount(submitter.publicKey());
  const preparedTx = await server.prepareTransaction(tx, account);
  preparedTx.sign(submitter);
  
  const response = await server.sendTransaction(preparedTx);
  console.log(`✅ Transaction submitted. Status: ${response.status}`);
}
```
