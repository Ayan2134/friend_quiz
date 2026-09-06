"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getTier } from "@/lib/scoring";

type LeaderboardEntry = {
  rank: number;
  id: string;
  playerName: string;
  score: number;
  total: number;
  percent: number;
  isYou: boolean;
};

type BreakdownItem = {
  prompt: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number;
  correct: boolean;
};

type Props = {
  quiz: {
    slug: string;
    creatorName: string;
    title: string;
  };
  attempt: {
    id: string;
    playerName: string;
    score: number;
    total: number;
    percent: number;
  };
  breakdown: BreakdownItem[];
  mostMissed: { prompt: string; misses: number } | null;
  leaderboard: LeaderboardEntry[];
  yourRank: number | null;
  totalAttempts: number;
};

export function ResultView({
  quiz,
  attempt,
  breakdown,
  mostMissed,
  leaderboard,
  yourRank,
  totalAttempts,
}: Props) {
  const tier = getTier(attempt.percent);
  const [displayScore, setDisplayScore] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(`${window.location.origin}/q/${quiz.slug}`);
  }, [quiz.slug]);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(attempt.percent * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [attempt.percent]);

  const shareText = `I scored ${attempt.percent}% on ${quiz.creatorName}'s KnowMe quiz (${tier.label}). Think you know them better?\n${shareUrl}`;

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "KnowMe", text: shareText, url: shareUrl });
        return;
      } catch {
        /* fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-10 animate-rise">
      <section className="result-hero">
        <p className="eyebrow">Results for {attempt.playerName}</p>
        <div className="score-ring mt-4" aria-label={`${attempt.percent} percent`}>
          <span className="score-number">{displayScore}%</span>
        </div>
        <h1 className="display mt-6 text-4xl sm:text-5xl">{tier.label}</h1>
        <p className="mt-3 max-w-lg text-[var(--ink-muted)]">{tier.blurb}</p>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          {attempt.score}/{attempt.total} correct
          {yourRank ? ` · Rank #${yourRank} of ${totalAttempts}` : null}
        </p>
      </section>

      <section className="share-panel">
        <h2 className="section-title">Share your score</h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Tag who would fail this. Only real friends clear 80%.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={share}>
            {copied ? "Copied" : "Share result"}
          </button>
          <a
            className="btn-secondary"
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <a
            className="btn-ghost"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Post on X
          </a>
        </div>
      </section>

      {mostMissed && mostMissed.misses > 0 ? (
        <section>
          <h2 className="section-title">Most missed question</h2>
          <p className="mt-2 text-[var(--ink-muted)]">
            &ldquo;{mostMissed.prompt}&rdquo; — missed by {mostMissed.misses} friend
            {mostMissed.misses === 1 ? "" : "s"}.
          </p>
        </section>
      ) : null}

      <section>
        <h2 className="section-title">Friend leaderboard</h2>
        <ol className="leaderboard mt-4">
          {leaderboard.map((row) => (
            <li key={row.id} className={row.isYou ? "you" : ""}>
              <span className="rank">#{row.rank}</span>
              <span className="name">
                {row.playerName}
                {row.isYou ? " (you)" : ""}
              </span>
              <span className="pct">{row.percent}%</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="section-title">Breakdown</h2>
        <div className="mt-4 space-y-3">
          {breakdown.map((item, i) => (
            <div key={i} className={`breakdown-row ${item.correct ? "ok" : "no"}`}>
              <p className="font-medium">{item.prompt}</p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                You: {item.options[item.selectedIndex] ?? "—"}
                {!item.correct
                  ? ` · Correct: ${item.options[item.correctIndex]}`
                  : " · Nailed it"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <h2 className="display text-3xl sm:text-4xl">Make your own KnowMe</h2>
        <p className="mt-2 max-w-md text-[var(--ink-muted)]">
          Turn the tables. Create a quiz about yourself and challenge the group chat.
        </p>
        <Link href="/create" className="btn-primary mt-5 inline-flex">
          Create your quiz
        </Link>
      </section>
    </div>
  );
}
