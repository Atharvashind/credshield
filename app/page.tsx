import { BrandingSidebar } from "@/components/BrandingSidebar";
import { MainContent } from "@/components/MainContent";
import { MobileNav } from "@/components/MobileNav";

export default function HomePage() {
  return (
    <>
      {/* Mobile nav overlay */}
      <MobileNav />

      <div className="flex h-screen w-screen overflow-hidden">
        {/* Sidebar — desktop only */}
        <div className="hidden md:block">
          <BrandingSidebar />
        </div>

        {/* Main content — full width on mobile */}
        <div className="flex-1 pt-[57px] md:pt-0">
          <MainContent />
        </div>
      </div>
    </>
  );
}
