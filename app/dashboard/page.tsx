import { PageShell } from "@/components/PageShell";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { TransactionHistory } from "@/components/dashboard/TransactionHistory";
import { YieldCalculator } from "@/components/dashboard/YieldCalculator";

export default function DashboardPage() {
  return (
    <PageShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-stone-600 mb-4">
            Dashboard
          </p>
          <h2 className="font-serif text-4xl font-normal text-stone-100 leading-tight">
            Your vault position
          </h2>
        </div>

        {/* Stats grid */}
        <DashboardStats />

        {/* Chart + Calculator row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            <PortfolioChart />
          </div>
          <div>
            <YieldCalculator />
          </div>
        </div>

        {/* Transaction history */}
        <TransactionHistory />
      </div>
    </PageShell>
  );
}
