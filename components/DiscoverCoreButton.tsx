"use client";

import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

/**
 * DiscoverCoreButton
 *
 * Solid beige CTA button in the footer.  Scrolls the user to the vault
 * features section (or triggers the wallet connect flow if not yet
 * connected).  Kept as a Client Component so the onClick handler works.
 */
export function DiscoverCoreButton() {
  const handleClick = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn-primary"
      aria-label="Discover the core vault features"
    >
      <span>Discover the Core</span>
      <ArrowRightIcon className="w-3.5 h-3.5" aria-hidden="true" />
    </button>
  );
}
