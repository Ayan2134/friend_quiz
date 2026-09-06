import Link from "next/link";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { getAdminStats } from "@/lib/admin-actions";

export const metadata = {
  title: "Admin — KnowMe",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const configured = isAdminConfigured();
  const authed = configured ? await isAdminAuthenticated() : false;

  return (
    <main className="page-shell page-shell-wide">
      <header className="site-header">
        <Link href="/" className="brand-mark">
          KnowMe
        </Link>
      </header>

      {!configured ? (
        <div className="space-y-4 animate-rise">
          <h1 className="display text-4xl">Admin not configured</h1>
          <p className="text-[var(--ink-muted)] max-w-xl">
            Set the <code className="admin-code">ADMIN_PASSWORD</code> environment
            variable locally and on Vercel, then redeploy.
          </p>
        </div>
      ) : authed ? (
        <AdminDashboard stats={await getAdminStats()} />
      ) : (
        <AdminLoginForm />
      )}
    </main>
  );
}
