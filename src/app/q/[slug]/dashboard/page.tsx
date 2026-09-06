import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareBar } from "@/components/ShareBar";
import { getDashboard } from "@/lib/actions";
import { getTheme } from "@/lib/themes";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
};

export const metadata = {
  title: "Dashboard — KnowMe",
  robots: { index: false, follow: false },
};

export default async function DashboardPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="page-shell">
        <header className="site-header">
          <Link href="/" className="brand-mark">
            KnowMe
          </Link>
        </header>
        <div className="space-y-4 animate-rise">
          <h1 className="display text-4xl">Creator link required</h1>
          <p className="text-[var(--ink-muted)]">
            Open your private dashboard URL (the one with the token) to see who played.
          </p>
          <div className="btn-row">
            <Link href="/" className="btn-primary">
              Back home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const data = await getDashboard(slug, token);
  if (!data.ok) {
    if (data.error === "Quiz not found.") notFound();
    return (
      <main className="page-shell">
        <header className="site-header">
          <Link href="/" className="brand-mark">
            KnowMe
          </Link>
        </header>
        <div className="space-y-4 animate-rise">
          <h1 className="display text-4xl">Invalid creator link</h1>
          <p className="text-[var(--ink-muted)]">{data.error}</p>
        </div>
      </main>
    );
  }

  const theme = getTheme(data.quiz.theme);

  return (
    <main
      className="page-shell"
      style={
        {
          ["--accent" as string]: theme.accent,
          ["--accent-soft" as string]: theme.accentSoft,
          ["--glow" as string]: theme.glow,
          ["--paper" as string]: theme.paper,
          ["--ink" as string]: theme.ink,
        } as CSSProperties
      }
    >
      <header className="site-header">
        <Link href="/" className="brand-mark">
          KnowMe
        </Link>
      </header>

      <div className="space-y-10 animate-rise">
        <div>
          <p className="eyebrow">Creator dashboard</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">{data.quiz.title}</h1>
          <p className="mt-3 text-[var(--ink-muted)]">
            {data.totalAttempts} attempt{data.totalAttempts === 1 ? "" : "s"} · avg{" "}
            {data.averagePercent}%
          </p>
        </div>

        <section className="share-panel">
          <h2 className="section-title">Share again</h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Challenge more friends — keep your dashboard link private.
          </p>
          <div className="mt-4">
            <ShareBar
              slug={data.quiz.slug}
              title={data.quiz.title}
              creatorName={data.quiz.creatorName}
            />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="stat-tile">
            <p className="label">Attempts</p>
            <p className="stat-value">{data.totalAttempts}</p>
          </div>
          <div className="stat-tile">
            <p className="label">Average score</p>
            <p className="stat-value">{data.averagePercent}%</p>
          </div>
          <div className="stat-tile">
            <p className="label">Top score</p>
            <p className="stat-value">
              {data.attempts.length
                ? `${Math.max(...data.attempts.map((a) => a.percent))}%`
                : "—"}
            </p>
          </div>
        </section>

        <section>
          <h2 className="section-title">Who played</h2>
          {data.attempts.length === 0 ? (
            <p className="mt-3 text-[var(--ink-muted)]">
              Nobody yet. Share your link to get the first score.
            </p>
          ) : (
            <ol className="leaderboard mt-4">
              {[...data.attempts]
                .sort((a, b) => b.percent - a.percent || a.playerName.localeCompare(b.playerName))
                .map((a, i) => (
                  <li key={a.id}>
                    <span className="rank">#{i + 1}</span>
                    <span className="name">{a.playerName}</span>
                    <span className="pct">
                      {a.percent}% · {a.score}/{a.total}
                    </span>
                  </li>
                ))}
            </ol>
          )}
        </section>

        <section>
          <h2 className="section-title">Weakest questions</h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Where friends trip up most — great gossip fuel.
          </p>
          <div className="mt-4 space-y-3">
            {data.weakest.map((q, i) => (
              <div key={i} className="breakdown-row no">
                <p className="font-medium">{q.prompt}</p>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  Missed {q.misses} time{q.misses === 1 ? "" : "s"} ({q.rate}% miss rate)
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
