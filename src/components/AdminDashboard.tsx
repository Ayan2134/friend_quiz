import Link from "next/link";
import { adminLogout, type AdminStats } from "@/lib/admin-actions";

function formatDay(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminDashboard({ stats }: { stats: AdminStats }) {
  const maxDaily = Math.max(
    1,
    ...stats.daily.map((d) => Math.max(d.quizzes, d.attempts)),
  );

  return (
    <div className="admin-dash animate-rise space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">KnowMe admin</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">Site analytics</h1>
          <p className="mt-2 text-[var(--ink-muted)]">
            Quizzes, plays, and activity across the whole product.
          </p>
        </div>
        <form action={adminLogout}>
          <button type="submit" className="btn-ghost">
            Log out
          </button>
        </form>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="stat-tile">
          <p className="label">Quizzes</p>
          <p className="stat-value">{stats.totals.quizzes}</p>
        </div>
        <div className="stat-tile">
          <p className="label">Attempts</p>
          <p className="stat-value">{stats.totals.attempts}</p>
        </div>
        <div className="stat-tile">
          <p className="label">Avg score</p>
          <p className="stat-value">{stats.totals.avgScorePercent}%</p>
        </div>
      </section>

      <section>
        <h2 className="section-title">Last 14 days</h2>
        <div className="admin-chart mt-4">
          {stats.daily.map((day) => (
            <div key={day.date} className="admin-chart-col" title={day.date}>
              <div className="admin-bars">
                <div
                  className="admin-bar quizzes"
                  style={{ height: `${(day.quizzes / maxDaily) * 100}%` }}
                />
                <div
                  className="admin-bar attempts"
                  style={{ height: `${(day.attempts / maxDaily) * 100}%` }}
                />
              </div>
              <span className="admin-chart-label">{formatDay(day.date)}</span>
              <span className="admin-chart-nums">
                {day.quizzes}/{day.attempts}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--ink-muted)]">
          Bars: quizzes created (coral) · attempts (teal). Labels show
          quizzes/attempts.
        </p>
      </section>

      <section>
        <h2 className="section-title">Top quizzes</h2>
        {stats.topQuizzes.length === 0 ? (
          <p className="mt-3 text-[var(--ink-muted)]">No quizzes yet.</p>
        ) : (
          <div className="admin-table-wrap mt-4">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Creator</th>
                  <th>Plays</th>
                  <th>Avg</th>
                </tr>
              </thead>
              <tbody>
                {stats.topQuizzes.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <Link href={`/q/${q.slug}`} className="admin-link">
                        {q.title}
                      </Link>
                    </td>
                    <td>{q.creatorName}</td>
                    <td>{q.attemptCount}</td>
                    <td>{q.avgPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">Recent quizzes</h2>
        {stats.recentQuizzes.length === 0 ? (
          <p className="mt-3 text-[var(--ink-muted)]">Nothing created yet.</p>
        ) : (
          <div className="admin-table-wrap mt-4">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Quiz</th>
                  <th>Creator</th>
                  <th>Plays</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentQuizzes.map((q) => (
                  <tr key={q.id}>
                    <td>{formatWhen(q.createdAt)}</td>
                    <td>
                      <Link href={`/q/${q.slug}`} className="admin-link">
                        {q.title}
                      </Link>
                    </td>
                    <td>{q.creatorName}</td>
                    <td>{q.attemptCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">Recent attempts</h2>
        {stats.recentAttempts.length === 0 ? (
          <p className="mt-3 text-[var(--ink-muted)]">No plays yet.</p>
        ) : (
          <div className="admin-table-wrap mt-4">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Player</th>
                  <th>Quiz</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAttempts.map((a) => (
                  <tr key={a.id}>
                    <td>{formatWhen(a.createdAt)}</td>
                    <td>{a.playerName}</td>
                    <td>
                      <Link href={`/q/${a.quizSlug}`} className="admin-link">
                        {a.quizTitle}
                      </Link>
                      <span className="admin-muted"> · {a.creatorName}</span>
                    </td>
                    <td>
                      {a.percent}% ({a.score}/{a.total})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
