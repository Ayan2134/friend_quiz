import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <header className="site-header">
        <Link href="/" className="brand-mark">
          KnowMe
        </Link>
      </header>
      <div className="space-y-4 animate-rise">
        <h1 className="display text-4xl">Not found</h1>
        <p className="text-[var(--ink-muted)]">
          That quiz link doesn&apos;t exist — or it wandered off.
        </p>
        <div className="btn-row">
          <Link href="/create" className="btn-primary">
            Make your own
          </Link>
        </div>
      </div>
    </main>
  );
}
