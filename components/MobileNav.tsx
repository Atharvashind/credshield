"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MonolithLogo } from "@/components/MonolithLogo";
import { WalletConnectButton } from "@/components/WalletConnectButton";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Vault", href: "/vault" },
  { label: "Product", href: "/product" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Admin", href: "/admin" },
  { label: "Contact", href: "/contact" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Mobile top bar */}
      <header className="
        md:hidden fixed top-0 left-0 right-0 z-50
        flex items-center justify-between
        px-5 py-4
        bg-obsidian border-b border-stone-900
      ">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <MonolithLogo className="w-6 h-6 text-beige" />
          <span className="font-sans text-sm font-semibold tracking-widest uppercase text-stone-200">
            Monolith
          </span>
        </Link>

        {/* Right side — wallet + hamburger */}
        <div className="flex items-center gap-3">
          <WalletConnectButton />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          >
            <span className={`block w-5 h-px bg-stone-400 transition-all duration-200 origin-center
              ${isOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
            <span className={`block w-5 h-px bg-stone-400 transition-all duration-200
              ${isOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block w-5 h-px bg-stone-400 transition-all duration-200 origin-center
              ${isOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
          </button>
        </div>
      </header>

      {/* Drawer overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <nav
        aria-label="Mobile navigation"
        className={`
          md:hidden fixed top-0 right-0 bottom-0 z-50
          w-72 bg-obsidian-muted border-l border-stone-900
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-900">
          <span className="font-sans text-xs text-stone-600 uppercase tracking-widest">
            Navigation
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="text-stone-600 hover:text-stone-200 transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <ul className="flex-1 overflow-y-auto py-4" role="list">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`
                    flex items-center px-6 py-3.5
                    font-sans text-sm transition-colors duration-150
                    border-l-2
                    ${isActive
                      ? "text-beige border-beige bg-beige/5"
                      : "text-stone-400 border-transparent hover:text-stone-100 hover:bg-stone-900/40"
                    }
                  `}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Drawer footer */}
        <div className="px-6 py-5 border-t border-stone-900">
          <p className="font-sans text-2xs text-stone-700">
            Stellar Testnet · Soroban
          </p>
        </div>
      </nav>
    </>
  );
}
