import { PageShell } from "@/components/PageShell";
import { AdminPanel } from "@/components/admin/AdminPanel";

export default function AdminPage() {
  return (
    <PageShell>
      <div className="space-y-8">
        <div>
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-stone-600 mb-4">
            Admin
          </p>
          <h2 className="font-serif text-4xl font-normal text-stone-100 leading-tight">
            Protocol controls
          </h2>
          <p className="mt-3 font-sans text-sm text-stone-500 max-w-md leading-relaxed">
            Admin-only functions. Only the wallet that initialised the vault
            can execute these operations.
          </p>
        </div>
        <AdminPanel />
      </div>
    </PageShell>
  );
}
