import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

// ---------------------------------------------------------------------------
// Font configuration
// ---------------------------------------------------------------------------

/**
 * Geometric sans-serif used for all UI chrome: navigation, labels, buttons.
 * Inter is a neutral, highly legible typeface that pairs well with a serif
 * display font without competing for attention.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

/**
 * High-contrast serif used exclusively for the hero headline.
 * Playfair Display's sharp contrast and elegant proportions reinforce the
 * institutional, premium aesthetic of the Monolith brand.
 */
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Monolith — Institutional Treasury Vault",
  description:
    "An institutional-grade treasury vault on the Stellar network. Deposit, earn yield, and redeem with full on-chain transparency.",
  keywords: ["Stellar", "Soroban", "DeFi", "Treasury", "Vault", "Web3"],
  authors: [{ name: "Monolith Protocol" }],
  openGraph: {
    title: "Monolith — Institutional Treasury Vault",
    description: "A new dimension of clarity in on-chain treasury management.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
