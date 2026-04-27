import { BrandingSidebar } from "@/components/BrandingSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { FooterActions } from "@/components/FooterActions";
import { MobileNav } from "@/components/MobileNav";

interface PageShellProps {
  children: React.ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <>
      {/* Mobile nav — fixed top bar + slide-out drawer (hidden on md+) */}
      <MobileNav />

      <div className="flex h-screen w-screen overflow-hidden">
        {/* Sidebar — hidden on mobile, visible on md+ */}
        <div className="hidden md:block">
          <BrandingSidebar />
        </div>

        <main
          aria-label="Monolith application"
          className="
            relative flex flex-col flex-1
            h-full md:h-screen
            bg-obsidian overflow-hidden
            pt-[57px] md:pt-0
          "
        >
          {/* Desktop nav — hidden on mobile */}
          <div className="hidden md:block">
            <TopNavigation />
          </div>

          <section className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-10">
            {children}
          </section>

          <FooterActions />
        </main>
      </div>
    </>
  );
}
