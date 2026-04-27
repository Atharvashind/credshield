"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnectButton } from "@/components/WalletConnectButton";

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Vault", href: "/vault" },
  { label: "Product", href: "/product" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Admin", href: "/admin" },
];

export function TopNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="flex items-center justify-between px-8 py-5 border-b border-stone-900 shrink-0"
    >
      {/* Left — nav links */}
      <ul className="flex items-center gap-0" role="list">
        {NAV_LINKS.map((link, index) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href} className="flex items-center">
              <Link
                href={link.href}
                className={`
                  px-3 py-1 font-sans text-sm transition-colors duration-150
                  ${isActive
                    ? "text-beige"
                    : "text-stone-500 hover:text-stone-200"
                  }
                `}
              >
                {link.label}
              </Link>
              {index < NAV_LINKS.length - 1 && (
                <span aria-hidden="true" className="nav-divider" />
              )}
            </li>
          );
        })}
      </ul>

      {/* Right — wallet */}
      <WalletConnectButton />
    </nav>
  );
}
