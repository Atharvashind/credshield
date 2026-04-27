import { PageShell } from "@/components/PageShell";
import { VaultManagement } from "@/components/vault/VaultManagement";

export default function VaultPage() {
  return (
    <PageShell>
      <div className="space-y-8">
        <div>
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-stone-600 mb-4">
            Vault Management
          </p>
          <h2 className="font-serif text-4xl font-normal text-stone-100 leading-tight">
            Manage your position.
          </h2>
          <p className="mt-3 font-sans text-sm text-stone-500 max-w-md leading-relaxed">
            Deposit assets, withdraw your position, track your shares, and
            monitor vault performance — all in one place.
          </p>
        </div>
        <VaultManagement />
      </div>
    </PageShell>
  );
}
