import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResultView } from "@/components/ResultView";
import { getAttemptResult } from "@/lib/actions";
import { getTheme } from "@/lib/themes";

type Props = {
  params: Promise<{ slug: string; attemptId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug, attemptId } = await params;
  const data = await getAttemptResult(slug, attemptId);
  if (!data) return { title: "Result — KnowMe" };
  return {
    title: `${data.attempt.playerName} scored ${data.attempt.percent}% — KnowMe`,
    description: `Think you know ${data.quiz.creatorName} better? Take the quiz.`,
  };
}

export default async function ResultPage({ params }: Props) {
  const { slug, attemptId } = await params;
  const data = await getAttemptResult(slug, attemptId);
  if (!data) notFound();

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
      <ResultView {...data} />
    </main>
  );
}
