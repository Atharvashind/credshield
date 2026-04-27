import { TopNavigation } from "@/components/TopNavigation";
import { PyramidHero } from "@/components/PyramidHero";
import { FooterActions } from "@/components/FooterActions";

export function MainContent() {
  return (
    <main
      aria-label="Monolith application"
      className="relative flex flex-col h-full bg-obsidian overflow-hidden"
    >
      {/* Desktop nav only */}
      <div className="hidden md:block">
        <TopNavigation />
      </div>

      {/* Pyramid hero */}
      <section className="flex-1 flex items-center justify-center relative">
        <PyramidHero />
      </section>

      <FooterActions />
    </main>
  );
}
