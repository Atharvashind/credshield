'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { nativeToScVal, scValToNative, Contract, TransactionBuilder, Networks, rpc } from '@stellar/stellar-sdk';
import { isFreighterConnected, getFreighterAddress, getFreighterAddressSilent, executeContractTransactionWithFreighter, rpcServer, fetchTokenBalance } from '../../lib/stellar';

export default function VaultPage() {
  // Connection and Wallet State
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isFunding, setIsFunding] = useState<boolean>(false);

  // Vault state
  const [vaultBalance, setVaultBalance] = useState<number>(0);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>('');
  const [vaultLog, setVaultLog] = useState<string>('System initialized on Stellar Testnet.\nPlease connect your Freighter wallet to manage custody.');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Yield Calculator state
  const [calcAmount, setCalcAmount] = useState<string>('1000');
  const [calcPeriod, setCalcPeriod] = useState<number>(12); // months
  const [projectedYield, setProjectedYield] = useState<number>(55); // 5.5% APY

  const contractId = process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID || 'CCKXR3HQSMBQDHRQR7MP2QP4DS6SDGFNAHU47ONNJDJSTAP3BJPSKBU3';
  const tokenId = process.env.NEXT_PUBLIC_SOROBAN_TOKEN_ID || 'CA3DVPHLVJ2O5ZZ7W3U2QDQVDJVHC7QZOEF5ZOXN23ZE5GUSHKLEAUEW';

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    calculateYield();
  }, [calcAmount, calcPeriod]);

  const checkWalletConnection = async () => {
    try {
      const connected = await isFreighterConnected();
      if (connected) {
        const addr = await getFreighterAddressSilent();
        if (addr) {
          setWalletAddress(addr);
          setWalletConnected(true);
          setVaultLog((prev) => `${prev}\n[Wallet] Reconnected: ${addr}\n[Info] To mint mock USDC to your wallet, run:\nstellar contract invoke --id ${tokenId} --source-account deployer --network testnet -- mint --to ${addr} --amount 1000`);
          
          // Check compliance on-chain
          const compliant = await checkComplianceOnChain(addr);
          setIsVerified(compliant);
          setVaultLog((prev) => `${prev}\n[Compliance] On-chain compliance status: ${compliant ? 'VERIFIED COMPLIANT' : 'NON-COMPLIANT'}`);

          // Pull balance
          const balance = await fetchContractBalance(addr);
          setVaultBalance(balance);

          const tokenBal = await fetchTokenBalance(tokenId, addr);
          setTokenBalance(tokenBal);
        }
      }
    } catch (e) {
      // Wallet not connected
    }
  };

  const handleConnectWallet = async () => {
    setErrorMessage('');
    try {
      const connected = await isFreighterConnected();
      if (!connected) {
        setErrorMessage('Freighter extension not found. Please install the Freighter extension to connect.');
        return;
      }
      const addr = await getFreighterAddress();
      setWalletAddress(addr);
      setWalletConnected(true);
      setVaultLog((prev) => `${prev}\n[Wallet] Connected real wallet: ${addr}\n[Info] To mint mock USDC to your wallet, run:\nstellar contract invoke --id ${tokenId} --source-account deployer --network testnet -- mint --to ${addr} --amount 1000`);
      
      const compliant = await checkComplianceOnChain(addr);
      setIsVerified(compliant);
      
      const balance = await fetchContractBalance(addr);
      setVaultBalance(balance);

      const tokenBal = await fetchTokenBalance(tokenId, addr);
      setTokenBalance(tokenBal);
    } catch (err: any) {
      setErrorMessage(`Freighter connection failed: ${err.message}`);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setIsVerified(false);
    setVaultBalance(0);
    setTokenBalance(0);
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

  // Check compliance on-chain using simulateTransaction
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
      console.warn('On-chain check failed, defaulting to false:', e);
    }
    return false;
  };

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
      console.warn('Balance check failed:', e);
    }
    return 0;
  };

  const handleDeposit = async () => {
    if (!isVerified) {
      setErrorMessage('Access denied: Wallet compliance check failed. Verify compliance in ZK-Prover first.');
      return;
    }
    const val = parseInt(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMessage('Please enter a valid positive deposit amount.');
      return;
    }
    setErrorMessage('');

    try {
      setVaultLog((prev) => `${prev}\n[Vault] Initiating on-chain deposit of ${val} USDC...`);
      const scArgs = [
        nativeToScVal(walletAddress, { type: 'address' }),
        nativeToScVal(BigInt(val), { type: 'i128' }),
      ];
      const result = await executeContractTransactionWithFreighter(contractId, 'deposit', scArgs, walletAddress);
      
      const updatedBalance = await fetchContractBalance(walletAddress);
      setVaultBalance(updatedBalance);
      
      const updatedTokenBal = await fetchTokenBalance(tokenId, walletAddress);
      setTokenBalance(updatedTokenBal);

      setVaultLog((prev) => `${prev}\n[Vault] Deposit complete!\nTx Hash: ${result.hash}`);
      setAmount('');
    } catch (err: any) {
      setErrorMessage(`Deposit failed: ${err.message}`);
      setVaultLog((prev) => `${prev}\n[Error] Deposit failed: ${err.message}`);
    }
  };

  const handleWithdraw = async () => {
    if (!isVerified) {
      setErrorMessage('Access denied: Wallet compliance check failed. Verify compliance in ZK-Prover first.');
      return;
    }
    const val = parseInt(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMessage('Please enter a valid positive withdrawal amount.');
      return;
    }
    setErrorMessage('');

    try {
      setVaultLog((prev) => `${prev}\n[Vault] Initiating on-chain withdraw of ${val} USDC...`);
      const scArgs = [
        nativeToScVal(walletAddress, { type: 'address' }),
        nativeToScVal(BigInt(val), { type: 'i128' }),
      ];
      const result = await executeContractTransactionWithFreighter(contractId, 'withdraw', scArgs, walletAddress);
      
      const updatedBalance = await fetchContractBalance(walletAddress);
      setVaultBalance(updatedBalance);

      const updatedTokenBal = await fetchTokenBalance(tokenId, walletAddress);
      setTokenBalance(updatedTokenBal);

      setVaultLog((prev) => `${prev}\n[Vault] Withdrawal complete!\nTx Hash: ${result.hash}`);
      setAmount('');
    } catch (err: any) {
      setErrorMessage(`Withdraw failed: ${err.message}`);
      setVaultLog((prev) => `${prev}\n[Error] Withdraw failed: ${err.message}`);
    }
  };

  const calculateYield = () => {
    const principal = parseFloat(calcAmount);
    if (isNaN(principal) || principal <= 0) return;
    const apy = 0.055; // 5.5% APY
    const timeInYears = calcPeriod / 12;
    const compoundValue = principal * Math.pow(1 + apy, timeInYears) - principal;
    setProjectedYield(parseFloat(compoundValue.toFixed(2)));
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
            <Link href="/overview" className="type-overline" style={{ textDecoration: 'none', color: 'inherit' }}>Overview</Link>
            <Link href="/" className="type-overline" style={{ textDecoration: 'none', color: 'inherit' }}>ZK-Prover</Link>
            <Link href="/vault" className="type-overline red-underline" style={{ textDecoration: 'none', color: 'inherit' }}>Gated Vault</Link>
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
          <span className="badge-overline">COMPLIANT ASSET CUSTODY</span>
          <h1 className="type-display" style={{ marginTop: '8px', marginBottom: '24px' }}>
            GATED YIELD<br />TREASURY.
          </h1>
          <div className="pull-quote">
            "Deposit stablecoins into the 5.5% APY yield vault. The gateway automatically halts all non-compliant actions. Keep compliance status checked by updating credentials regularly."
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

      {/* Workspace */}
      <main className="container section-spacing" style={{ flex: '1' }}>
        <div className="grid-cols-2">
          {/* Column 1: Deposit / Withdraw */}
          <div className="card-default" id="defi-vault-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span className="type-overline">REAL-TIME PORTFOLIO</span>
              <span className={`chip-status ${isVerified ? 'success' : 'error'}`}>
                {isVerified ? 'Gate Unlocked' : 'Gate Locked'}
              </span>
            </div>

            <div style={{ padding: '24px', backgroundColor: 'var(--color-surface)', border: '2px solid var(--color-border-medium)', textAlign: 'center', marginBottom: '24px' }}>
              <span className="type-overline">Total Deposited Vault Balance</span>
              <div className="font-display" style={{ fontSize: '48px', margin: '8px 0', letterSpacing: '-0.02em' }}>
                {vaultBalance} <span style={{ fontSize: '24px', fontFamily: 'var(--font-body)', fontWeight: 400 }}>USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
                <span className="type-overline">Wallet Balance:</span>
                <span className="type-code" style={{ fontWeight: 'bold' }}>{tokenBalance} USDC</span>
              </div>
              <span className="type-caption" style={{ color: 'var(--color-text-secondary)', display: 'block', marginTop: '8px' }}>Verifiable under Soroban Contract {contractId.substring(0, 8)}...</span>
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
              <button id="deposit-btn" className="btn btn-md btn-primary" style={{ flex: '1' }} onClick={handleDeposit}>Deposit</button>
              <button id="withdraw-btn" className="btn btn-md btn-secondary" style={{ flex: '1' }} onClick={handleWithdraw}>Withdraw</button>
            </div>

            {/* Event Logs console */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
              <span className="form-label">On-Chain Event Logs</span>
              <pre
                className="type-code"
                style={{
                  minHeight: '120px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-tertiary)',
                  padding: '16px',
                  fontSize: '12px',
                  whiteSpace: 'pre-wrap',
                  overflowY: 'auto'
                }}
              >
                {vaultLog}
              </pre>
            </div>
          </div>

          {/* Column 2: Yield Calculator */}
          <div className="card-elevated" id="yield-calculator-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="type-overline" style={{ color: 'var(--color-secondary)' }}>Calculators</span>
            <h2 className="type-subhead" style={{ marginTop: '8px', marginBottom: '24px' }}>YIELD CALCULATOR</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="calc-amount-input">Principal Amount (USDC)</label>
              <input
                id="calc-amount-input"
                type="number"
                className="input-text"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="calc-period-select">Lock Period</label>
              <select
                id="calc-period-select"
                className="input-text"
                value={calcPeriod}
                onChange={(e) => setCalcPeriod(parseInt(e.target.value) || 12)}
              >
                <option value={3}>3 Months (Short Term)</option>
                <option value={6}>6 Months (Mid Term)</option>
                <option value={12}>12 Months (1 Year)</option>
                <option value={24}>24 Months (2 Years)</option>
              </select>
            </div>

            <div style={{ marginTop: '24px', padding: '24px', border: '2px solid var(--color-border-strong)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="type-overline">Projected Yield (5.5% APY)</span>
                <div className="font-display" style={{ fontSize: '32px', margin: '4px 0', letterSpacing: '-0.01em' }}>
                  +{projectedYield} <span style={{ fontSize: '18px', fontFamily: 'var(--font-body)', fontWeight: 400 }}>USDC</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="type-overline">Estimated Maturity Value</span>
                <div className="type-code" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {Number(calcAmount) + projectedYield} USDC
                </div>
              </div>
            </div>

            <p className="type-caption" style={{ marginTop: '24px', color: 'var(--color-text-secondary)' }}>
              *Yield values are compounded monthly and are subjects to contract compliance rules. Withdrawal actions during non-compliant states are held until updated verified proofs are submitted.
            </p>
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
            Protocol Version: 25 (BN254 Elliptic Curve Native support)
          </span>
        </div>
      </footer>
    </div>
  );
}
