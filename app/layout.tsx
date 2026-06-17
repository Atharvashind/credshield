import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stellar CredShield — Privacy-Preserving DeFi Compliance Portal',
  description: 'Verify your digital identity credentials and deposit into compliance-gated liquidity vaults on the Stellar Network using secure Zero-Knowledge Proof simulations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
