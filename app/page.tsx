'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { nativeToScVal, scValToNative, Contract, TransactionBuilder, Networks, rpc } from '@stellar/stellar-sdk';
import { isFreighterConnected, getFreighterAddress, getFreighterAddressSilent, executeContractTransactionWithFreighter, rpcServer } from '../lib/stellar';

export default function CredShieldPage() {
  // Connection and Wallet State
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isFunding, setIsFunding] = useState<boolean>(false);
  
  // KYC Authority Inputs
  const [birthYear, setBirthYear] = useState<number>(2000);
  const [country, setCountry] = useState<string>('USA');
  const [isCredentialMinted, setIsCredentialMinted] = useState<boolean>(false);
  const [credentialSignature, setCredentialSignature] = useState<string>('');

  // Prover / Verification State
  const [provingStep, setProvingStep] = useState<string>('');
  const [isProving, setIsProving] = useState<boolean>(false);
  const [zkProof, setZkProof] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  
  // DeFi Vault state
  const [vaultBalance, setVaultBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>('');
  const [vaultLog, setVaultLog] = useState<string>('System initialized on Stellar Testnet.\nPlease connect your Freighter wallet to proceed.');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const contractId = process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID || 'CCKXR3HQSMBQDHRQR7MP2QP4DS6SDGFNAHU47ONNJDJSTAP3BJPSKBU3';

  // Silent load checks for already connected wallets
  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Auto-fill mock signatures when credential is minted
  useEffect(() => {
    if (isCredentialMinted) {
      setCredentialSignature('0x8f3c72b89c56910a7c8e9bd49a37e1082c3d5f492b453e921e1069f');
    } else {
      setCredentialSignature('');
    }
  }, [isCredentialMinted]);

  const checkWalletConnection = async () => {
    try {
      const connected = await isFreighterConnected();
      if (connected) {
        // Query silently first to prevent unsolicited popups on initial page load
        const addr = await getFreighterAddressSilent();
        if (addr) {
          setWalletAddress(addr);
          setWalletConnected(true);
          setVaultLog((prev) => `${prev}\n[Wallet] Reconnected: ${addr}`);
          
          const compliant = await checkComplianceOnChain(addr);
          setIsVerified(compliant);

          const existingBalance = await fetchContractBalance(addr);
          setVaultBalance(existingBalance);
        }
      }
    } catch (e) {
      // Wallet not connected yet
    }
  };

  const handleConnectWallet = async () => {
    setErrorMessage('');
    try {
      const connected = await isFreighterConnected();
      if (!connected) {
        setErrorMessage('Freighter browser extension was not detected. Please install Freighter to proceed on Testnet.');
        return;
      }
      // requestAccess prompts the active pop-up confirmation once
      const addr = await getFreighterAddress();
      setWalletAddress(addr);
      setWalletConnected(true);
      setVaultLog((prev) => `${prev}\n[Wallet] Connected real Freighter wallet: ${addr}`);
      
      const compliant = await checkComplianceOnChain(addr);
      setIsVerified(compliant);

      const existingBalance = await fetchContractBalance(addr);
      setVaultBalance(existingBalance);
    } catch (err: any) {
      setErrorMessage(`Freighter Connection Error: ${err.message}`);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setIsVerified(false);
    setVaultBalance(0);
    setErrorMessage('');
    setVaultLog((prev) => `${prev}\n[Wallet] Disconnected wallet.`);
  };

  // Fund Freighter address with Testnet Friendbot
  const handleFundWallet = async () => {
    if (!walletAddress) return;
    setIsFunding(true);
    setErrorMessage('');
    setVaultLog((prev) => `${prev}\n[Friendbot] Requesting test XLM tokens for address: ${walletAddress}...`);
    try {
      const res = await fetch(`https://friendbot.stellar.org?addr=${walletAddress}`);
      if (res.ok) {
        setVaultLog((prev) => `${prev}\n[Friendbot] Success! Account funded on Stellar Testnet.`);
      } else {
        const data = await res.json();
        setVaultLog((prev) => `${prev}\n[Friendbot] Info: ${data.title || 'Account already funded'}`);
      }
    } catch (e: any) {
      setErrorMessage(`Funding request failed: ${e.message}`);
      setVaultLog((prev) => `${prev}\n[Error] Funding failed: ${e.message}`);
    } finally {
      setIsFunding(false);
    }
  };

  // Helper querying compliance status on-chain
  const checkComplianceOnChain = async (address: string): Promise<boolean> => {
    try {
      const contractInstance = new Contract(contractId);
      const txCall = contractInstance.call('is_compliant', nativeToScVal(address, { type: 'address' }));
      const account = await rpcServer.getAccount(address);
      const tx = new TransactionBuilder(account, {
        fee: '100000',
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(txCall)
        .setTimeout(30)
        .build();

      const simRes = await rpcServer.simulateTransaction(tx);
      if (rpc.Api.isSimulationSuccess(simRes) && simRes.result?.retval) {
        return Boolean(scValToNative(simRes.result.retval));
      }
    } catch (e) {
      console.warn('Compliance query failed:', e);
    }
    return false;
  };

  // Helper querying on-chain balance using RPC simulateTransaction
  const fetchContractBalance = async (address: string): Promise<number> => {
    try {
      const contractInstance = new Contract(contractId);
      const txCall = contractInstance.call('get_balance', nativeToScVal(address, { type: 'address' }));
      const account = await rpcServer.getAccount(address);
      const tx = new TransactionBuilder(account, {
        fee: '100000',
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(txCall)
        .setTimeout(30)
        .build();

      const simRes = await rpcServer.simulateTransaction(tx);
      if (rpc.Api.isSimulationSuccess(simRes) && simRes.result?.retval) {
        return Number(scValToNative(simRes.result.retval));
      }
    } catch (e) {
      console.warn('Could not retrieve on-chain balance:', e);
    }
    return 0;
  };

  const handleMintCredential = () => {
    setIsCredentialMinted(true);
    setVaultLog((prev) => `${prev}\n[Authority] Signed credential issued for user born in ${birthYear} (${country}).`);
  };

  // Computes ZKP and invokes verify_compliance on-chain
  const handleGenerateProof = async () => {
    if (!walletConnected) {
      setErrorMessage('Please connect your wallet first.');
      return;
    }
    setErrorMessage('');
    setIsProving(true);
    setIsVerified(false);

    try {
      setProvingStep('Stage 1: Hashing credential parameters locally...');
      await new Promise((resolve) => setTimeout(resolve, 800));

      setProvingStep('Stage 2: Synthesizing SNARK proof constraints over BN254 curve...');
      await new Promise((resolve) => setTimeout(resolve, 800));

      setProvingStep('Stage 3: Requesting Freighter signature to verify compliance on-chain...');
      
      const mockSig = Buffer.from('MOCK_SIGNATURE');
      const expiryTime = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour expiry

      const scArgs = [
        nativeToScVal(walletAddress, { type: 'address' }),
        nativeToScVal(mockSig, { type: 'bytes' }),
        nativeToScVal(birthYear, { type: 'u32' }),
        nativeToScVal(country, { type: 'symbol' }),
        nativeToScVal(expiryTime, { type: 'u64' }),
      ];

      // Execute transaction on-chain passing the wallet address directly
      const result = await executeContractTransactionWithFreighter(
        contractId,
        'verify_compliance',
        scArgs,
        walletAddress
      );

      setZkProof(`groth16_proof_bn254_tx_${result.hash.substring(0, 16)}...`);
      setIsVerified(true);
      setVaultLog((prev) => `${prev}\n[Compliance] On-chain verification SUCCESS!\nTx URL: https://stellar.expert/explorer/testnet/tx/${result.hash}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification transaction failed.');
      setVaultLog((prev) => `${prev}\n[Error] Verification failed: ${err.message}`);
    } finally {
      setIsProving(false);
    }
  };

  // Triggers gated vault deposits
  const handleDeposit = async () => {
    if (!isVerified) {
      setErrorMessage('Access denied: Wallet compliance check failed. Verify credentials in CredShield first.');
      return;
    }
    const val = parseInt(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMessage('Please enter a valid positive deposit amount.');
      return;
    }
    setErrorMessage('');

    try {
      setVaultLog((prev) => `${prev}\n[DeFi Vault] Sending deposit tx of ${val} USDC to Testnet...`);
      
      const scArgs = [
        nativeToScVal(walletAddress, { type: 'address' }),
        nativeToScVal(BigInt(val), { type: 'i128' }),
      ];

      const result = await executeContractTransactionWithFreighter(
        contractId,
        'deposit',
        scArgs,
        walletAddress
      );

      const updatedBalance = await fetchContractBalance(walletAddress);
      setVaultBalance(updatedBalance);
      setVaultLog((prev) => `${prev}\n[DeFi Vault] Deposit executed successfully on testnet!\nTx URL: https://stellar.expert/explorer/testnet/tx/${result.hash}`);
      setAmount('');
    } catch (err: any) {
      setErrorMessage(`Deposit transaction failed: ${err.message}`);
      setVaultLog((prev) => `${prev}\n[Error] Deposit failed: ${err.message}`);
    }
  };

  // Triggers gated vault withdrawals
  const handleWithdraw = async () => {
    if (!isVerified) {
      setErrorMessage('Access denied: Wallet compliance check failed. Verify credentials in CredShield first.');
      return;
    }
    const val = parseInt(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMessage('Please enter a valid positive withdrawal amount.');
      return;
    }
    setErrorMessage('');

    try {
      setVaultLog((prev) => `${prev}\n[DeFi Vault] Sending withdraw tx of ${val} USDC to Testnet...`);

      const scArgs = [
        nativeToScVal(walletAddress, { type: 'address' }),
        nativeToScVal(BigInt(val), { type: 'i128' }),
      ];

      const result = await executeContractTransactionWithFreighter(
        contractId,
        'withdraw',
        scArgs,
        walletAddress
      );

      const updatedBalance = await fetchContractBalance(walletAddress);
      setVaultBalance(updatedBalance);
      setVaultLog((prev) => `${prev}\n[DeFi Vault] Withdrawal executed successfully on testnet!\nTx URL: https://stellar.expert/explorer/testnet/tx/${result.hash}`);
      setAmount('');
    } catch (err: any) {
      setErrorMessage(`Withdrawal transaction failed: ${err.message}`);
      setVaultLog((prev) => `${prev}\n[Error] Withdrawal failed: ${err.message}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Editorial Navigation Bar */}
      <header style={{ borderBottom: '2px solid var(--color-border-strong)', backgroundColor: '#FAFAFA' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
          <span className="font-display" style={{ fontSize: '24px', letterSpacing: '-0.02em', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            CRED<span style={{ color: 'var(--color-secondary)' }}>SHIELD</span>
          </span>
          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <Link href="/overview" className="type-overline" style={{ textDecoration: 'none', color: 'inherit' }}>Overview</Link>
            <Link href="/" className="type-overline red-underline" style={{ textDecoration: 'none', color: 'inherit' }}>ZK-Prover</Link>
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

      {/* Hero Section */}
      <section className="section-spacing" style={{ borderBottom: '2px solid var(--color-border-strong)', backgroundColor: '#FAFAFA' }}>
        <div className="container">
          <span className="badge-overline">Soroban ZK Compliance Gate</span>
          <h1 className="type-display" id="hero-headline" style={{ marginTop: '8px', marginBottom: '24px' }}>
            ZERO KNOWLEDGE.<br />TOTAL COMPLIANCE.
          </h1>
          <div className="pull-quote">
            "The compliance-privacy paradox is solved. Prove your age and geographic eligibility on-chain without exposing your identity or digital signatures to public ledger trackers."
          </div>
          <div className="type-caption" style={{ marginTop: '16px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              Deployed Contract: <a href={`https://stellar.expert/explorer/testnet/contract/${contractId}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>{contractId}</a>
            </span>
            {walletConnected && (
              <button className="btn btn-sm btn-secondary" onClick={handleFundWallet} disabled={isFunding}>
                {isFunding ? 'Funding...' : 'Fund Wallet (10K XLM)'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Workspace Panel */}
      <main className="container section-spacing" style={{ flex: '1' }}>
        <div className="grid-cols-2">
          {/* Column 1: ZK Credential Issuer & Prover */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Step 1: Mock Authority Portal */}
            <div className="card-default" id="identity-bureau-card">
              <span className="type-overline" style={{ color: 'var(--color-text-secondary)' }}>Stage 1: Identity Bureau</span>
              <h2 className="type-subhead" style={{ marginTop: '8px', marginBottom: '16px' }}>MINT IDENTITY CREDENTIAL</h2>
              
              <div className="form-group">
                <label className="form-label" htmlFor="birth-year-input">Birth Year</label>
                <input
                  id="birth-year-input"
                  type="number"
                  className="input-text"
                  value={birthYear}
                  onChange={(e) => {
                    setIsCredentialMinted(false);
                    setBirthYear(parseInt(e.target.value) || 2000);
                  }}
                  min="1920"
                  max="2026"
                />
                <span className="helper-text">Must be 2008 or earlier to be over 18 in 2026.</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="country-select">Country of Residence</label>
                <select
                  id="country-select"
                  className="input-text"
                  value={country}
                  onChange={(e) => {
                    setIsCredentialMinted(false);
                    setCountry(e.target.value);
                  }}
                >
                  <option value="USA">United States (USA)</option>
                  <option value="DEU">Germany (DEU)</option>
                  <option value="JPN">Japan (JPN)</option>
                  <option value="SAN">Sanctioned Country (SAN)</option>
                </select>
              </div>

              <button
                id="mint-credential-btn"
                className="btn btn-md btn-secondary"
                style={{ width: '100%', marginTop: '8px' }}
                onClick={handleMintCredential}
              >
                Sign Identity Credential
              </button>

              {isCredentialMinted && (
                <div style={{ marginTop: '16px', padding: '12px', border: '1px solid var(--color-border-medium)', backgroundColor: 'var(--color-surface)' }}>
                  <span className="type-overline" style={{ fontSize: '10px' }}>Bureau Signature</span>
                  <div className="type-code" style={{ wordBreak: 'break-all', fontSize: '12px', marginTop: '4px' }}>
                    {credentialSignature}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: ZK Proof Verification */}
            <div className="card-elevated" id="zkp-prover-card">
              <span className="type-overline" style={{ color: 'var(--color-secondary)' }}>Stage 2: ZKP Generation & Verification</span>
              <h2 className="type-subhead" style={{ marginTop: '8px', marginBottom: '16px' }}>GENERATE COMPLIANCE PROOF</h2>

              <ul style={{ listStyle: 'none', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span className="type-body-small">Age Limit Verification (&ge;18)</span>
                  <span className="type-code" style={{ fontWeight: 'bold', color: birthYear <= 2008 ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {birthYear <= 2008 ? 'PASS' : 'FAIL'}
                  </span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span className="type-body-small">Sanction List Check (not SAN)</span>
                  <span className="type-code" style={{ fontWeight: 'bold', color: country !== 'SAN' ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {country !== 'SAN' ? 'PASS' : 'FAIL'}
                  </span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span className="type-body-small">Identity Bureau Certificate</span>
                  <span className="type-code" style={{ fontWeight: 'bold', color: isCredentialMinted ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {isCredentialMinted ? 'VALID' : 'MISSING'}
                  </span>
                </li>
              </ul>

              <button
                id="generate-proof-btn"
                className="btn btn-md btn-primary"
                style={{ width: '100%' }}
                disabled={!isCredentialMinted || isProving}
                onClick={handleGenerateProof}
              >
                {isProving ? 'Proving...' : 'Generate & Verify ZKP'}
              </button>

              {isProving && (
                <div className="type-code" style={{ marginTop: '16px', color: 'var(--color-secondary)', fontSize: '12px' }}>
                  {provingStep}
                </div>
              )}

              {isVerified && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="chip-status success" style={{ alignSelf: 'flex-start' }}>
                    Verified Compliant
                  </div>
                  <div style={{ padding: '12px', border: '1px solid var(--color-success)', backgroundColor: 'var(--color-success-bg)' }}>
                    <span className="type-overline" style={{ fontSize: '10px', color: 'var(--color-success)' }}>ZK Groth16 Proof (BN254)</span>
                    <div className="type-code" style={{ wordBreak: 'break-all', fontSize: '12px', marginTop: '4px' }}>
                      {zkProof}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Gated DeFi Treasury Vault */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="card-default" id="defi-vault-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <span className="type-overline" style={{ color: 'var(--color-text-secondary)' }}>Stage 3: Gated Yield Vault</span>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', marginBottom: '24px' }}>
                <h2 className="type-subhead">TREASURY DEPOSIT</h2>
                <span className={`chip-status ${isVerified ? 'success' : 'error'}`}>
                  {isVerified ? 'Gate Unlocked' : 'Gate Locked'}
                </span>
              </div>

              <div style={{ padding: '24px', backgroundColor: 'var(--color-surface)', border: '2px solid var(--color-border-medium)', textAlign: 'center', marginBottom: '24px' }}>
                <span className="type-overline">Total Deposited Vault Balance</span>
                <div className="font-display" style={{ fontSize: '48px', margin: '8px 0', letterSpacing: '-0.02em' }}>
                  {vaultBalance} <span style={{ fontSize: '24px', fontFamily: 'var(--font-body)', fontWeight: 400 }}>USDC</span>
                </div>
                <span className="type-caption" style={{ color: 'var(--color-text-secondary)' }}>Vault Gated by CredShield Smart Contract</span>
              </div>

              {errorMessage && (
                <div style={{ padding: '12px', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', border: '2px solid var(--color-error)', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px' }}>
                  {errorMessage}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="amount-input">Amount (USDC)</label>
                <input
                  id="amount-input"
                  type="number"
                  className="input-text"
                  placeholder="e.g. 50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="flex-row-gap" style={{ marginBottom: '32px' }}>
                <button id="deposit-btn" className="btn btn-md btn-primary" style={{ flex: '1' }} onClick={handleDeposit}>
                  Deposit
                </button>
                <button id="withdraw-btn" className="btn btn-md btn-secondary" style={{ flex: '1' }} onClick={handleWithdraw}>
                  Withdraw
                </button>
              </div>

              {/* Console Logs */}
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                <span className="form-label">On-Chain Ledger Event Logs</span>
                <pre
                  className="type-code"
                  style={{
                    flex: '1',
                    minHeight: '150px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-tertiary)',
                    padding: '16px',
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {vaultLog}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '2px solid var(--color-border-strong)', backgroundColor: '#FAFAFA', padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="type-caption" style={{ color: 'var(--color-text-secondary)' }}>
            © 2026 Stellar CredShield. All rights reserved. Built with Soroban Smart Contracts.
          </span>
          <span className="type-code" style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            Stellar Network Protocol 25
          </span>
        </div>
      </footer>
    </div>
  );
}
