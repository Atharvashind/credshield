'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { isFreighterConnected, getFreighterAddress, getFreighterAddressSilent } from '../../lib/stellar';

export default function OverviewPage() {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const connected = await isFreighterConnected();
      if (connected) {
        const addr = await getFreighterAddressSilent();
        if (addr) {
          setWalletAddress(addr);
          setWalletConnected(true);
        }
      }
    } catch (e) {
      // Wallet not connected yet
    }
  };

  const handleConnectWallet = async () => {
    try {
      const addr = await getFreighterAddress();
      setWalletAddress(addr);
      setWalletConnected(true);
    } catch (err: any) {
      console.warn(err);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Editorial Navigation Bar */}
      <header style={{ borderBottom: '2px solid var(--color-border-strong)', backgroundColor: '#FAFAFA' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="font-display" style={{ fontSize: '24px', letterSpacing: '-0.02em', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              CRED<span style={{ color: 'var(--color-secondary)' }}>SHIELD</span>
            </span>
          </Link>
          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <Link href="/overview" className="type-overline red-underline" style={{ textDecoration: 'none', color: 'inherit' }}>Overview</Link>
            <Link href="/" className="type-overline" style={{ textDecoration: 'none', color: 'inherit' }}>ZK-Prover</Link>
            <Link href="/vault" className="type-overline" style={{ textDecoration: 'none', color: 'inherit' }}>Gated Vault</Link>
            {!walletConnected ? (
              <button id="connect-wallet-btn" className="btn btn-sm btn-primary" onClick={handleConnectWallet}>
                Connect Wallet
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="type-code" style={{ padding: '6px 12px', border: '2px solid var(--color-border-strong)', backgroundColor: 'var(--color-surface)', fontSize: '11px' }}>
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                </span>
                <button className="btn btn-sm btn-destructive" onClick={handleDisconnectWallet}>
                  Disconnect
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Header */}
      <section className="section-spacing" style={{ borderBottom: '2px solid var(--color-border-strong)', backgroundColor: '#FAFAFA' }}>
        <div className="container">
          <span className="badge-overline">THE CRYPTOGRAPHIC INITIATIVE</span>
          <h1 className="type-display" style={{ marginTop: '8px', marginBottom: '24px' }}>
            COMPLIANCE WITHOUT<br />SURVEILLANCE.
          </h1>
          <div className="pull-quote">
            "CredShield is a privacy-first identity gatekeeper built on Stellar Soroban. It verifies credentials mathematically using zero-knowledge proofs to unlock compliant yield vaults without exposing sensitive identity documentation."
          </div>
          <div style={{ marginTop: '32px' }}>
            <Link href="/" className="btn btn-md btn-primary" style={{ marginRight: '16px', textDecoration: 'none' }}>
              Go To Prover
            </Link>
            <Link href="/vault" className="btn btn-md btn-secondary" style={{ textDecoration: 'none' }}>
              Enter Yield Vault
            </Link>
          </div>
        </div>
      </section>

      {/* Product Description */}
      <main className="container section-spacing" style={{ flex: '1' }}>
        {/* Editorial column blocks */}
        <div className="grid-cols-2" style={{ marginBottom: '64px' }}>
          <div>
            <span className="badge-overline" style={{ color: 'var(--color-text-secondary)' }}>01 / CONTEXT</span>
            <h2 className="type-subhead" style={{ marginTop: '8px', marginBottom: '16px' }}>THE KYC LIABILITY</h2>
            <p className="type-body" style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Every time you submit a passport photocopy or utility bill to join a DeFi protocol or anchor ramp, you risk your data being leaked. Traditional financial institutions house vast honeypots of customer records that are continually targeted by malicious actors.
            </p>
            <p className="type-body" style={{ color: 'var(--color-text-secondary)' }}>
              Furthermore, linking real identities directly to ledger addresses removes the transactional pseudonymity of blockchain, creating security profiles that threaten user sovereignty.
            </p>
          </div>

          <div>
            <span className="badge-overline" style={{ color: 'var(--color-text-secondary)' }}>02 / THE INNOVATION</span>
            <h2 className="type-subhead" style={{ marginTop: '8px', marginBottom: '16px' }}>THE CREDSHIELD FRAMEWORK</h2>
            <p className="type-body" style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              CredShield solves the privacy-compliance paradox by placing a zero-knowledge verification barrier between the identity provider and the on-chain registry.
            </p>
            <p className="type-body" style={{ color: 'var(--color-text-secondary)' }}>
              Using the **BN254 pairing host functions** natively available in Stellar Protocol 25, our verifier contract processes proof polynomials in milliseconds for minimal fees, making compliance cost-effective and completely private.
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div style={{ borderTop: '2px solid var(--color-border-strong)', paddingTop: '48px', marginBottom: '64px' }}>
          <span className="badge-overline">CORE CAPABILITIES</span>
          <h2 className="type-subhead" style={{ marginTop: '8px', marginBottom: '32px' }}>KEY PROTOCOL UTILITIES</h2>
          
          <div className="grid-cols-2">
            <div className="card-default" style={{ padding: '32px' }}>
              <div className="type-overline" style={{ color: 'var(--color-secondary)' }}>Privacy Shield</div>
              <h3 className="type-subhead" style={{ fontSize: '20px', marginTop: '8px', marginBottom: '12px' }}>Zero-Knowledge proofs</h3>
              <p className="type-body-small" style={{ color: 'var(--color-text-secondary)' }}>
                Generates SNARK proof vectors locally in the user's browser. Checks compliance criteria (Age &ge; 18, country of residence is valid) without exporting raw details to the node network.
              </p>
            </div>

            <div className="card-default" style={{ padding: '32px' }}>
              <div className="type-overline" style={{ color: 'var(--color-secondary)' }}>Ledger Security</div>
              <h3 className="type-subhead" style={{ fontSize: '20px', marginTop: '8px', marginBottom: '12px' }}>Soroban Gated Vault</h3>
              <p className="type-body-small" style={{ color: 'var(--color-text-secondary)' }}>
                Asset deposit and withdrawal gateways are verified strictly on-chain. If the user's wallet address lacks the verified compliance status flag in the contract instance storage, transactions revert immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Process Flow */}
        <div style={{ borderTop: '2px solid var(--color-border-strong)', paddingTop: '48px', marginBottom: '64px' }}>
          <span className="badge-overline">THE PROTOCOL LIFE-CYCLE</span>
          <h2 className="type-subhead" style={{ marginTop: '8px', marginBottom: '32px' }}>HOW IT WORKS</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '20px' }}>
              <span className="font-display" style={{ fontSize: '38px', lineHeight: '1', color: 'var(--color-secondary)' }}>01</span>
              <div>
                <h4 className="type-body-large" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>Request KYC Attestation</h4>
                <p className="type-body-small" style={{ color: 'var(--color-text-secondary)' }}>
                  User registers details with a regulated Identity Bureau. The Bureau signs a cryptographic attestation mapping user public parameters to birth year and residence country.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '20px' }}>
              <span className="font-display" style={{ fontSize: '38px', lineHeight: '1', color: 'var(--color-secondary)' }}>02</span>
              <div>
                <h4 className="type-body-large" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>Browser SNARK Generation</h4>
                <p className="type-body-small" style={{ color: 'var(--color-text-secondary)' }}>
                  CredShield client-side script compiles attestation hashes into a zero-knowledge arithmetic circuit proof asserting criteria validity without revealing the variables.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '20px' }}>
              <span className="font-display" style={{ fontSize: '38px', lineHeight: '1', color: 'var(--color-secondary)' }}>03</span>
              <div>
                <h4 className="type-body-large" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>Soroban Ledger Verification</h4>
                <p className="type-body-small" style={{ color: 'var(--color-text-secondary)' }}>
                  User submits the generated proof to the `verify_compliance` contract. The Soroban VM executes pairing checks, flags the wallet compliant, and updates ledger state.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <span className="font-display" style={{ fontSize: '38px', lineHeight: '1', color: 'var(--color-secondary)' }}>04</span>
              <div>
                <h4 className="type-body-large" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>Unlock Gated DeFi Vault</h4>
                <p className="type-body-small" style={{ color: 'var(--color-text-secondary)' }}>
                  The yield-earning vault unlocks. User executes deposits and withdrawals using Freighter wallet signatures on-chain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '2px solid var(--color-border-strong)', backgroundColor: '#FAFAFA', padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="type-caption" style={{ color: 'var(--color-text-secondary)' }}>
            © 2026 Stellar CredShield. All rights reserved. Deployed on Testnet.
          </span>
          <span className="type-code" style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            Stellar Network Protocol 25
          </span>
        </div>
      </footer>
    </div>
  );
}
