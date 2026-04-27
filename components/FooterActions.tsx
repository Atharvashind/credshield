import { DiscoverCoreButton } from "@/components/DiscoverCoreButton";

export function FooterActions() {
  return (
    <footer
      aria-label="Footer actions"
      className="
        flex flex-col gap-3 md:flex-row md:items-end md:justify-between
        px-5 py-5 md:px-8 md:py-7
        border-t border-stone-900 shrink-0
      "
    >
      <p className="font-sans text-xs text-stone-600 max-w-[220px] leading-relaxed">
        Discover the core engine that brings clarity to institutional
        on-chain treasury operations.
      </p>
      <DiscoverCoreButton />
    </footer>
  );
}
