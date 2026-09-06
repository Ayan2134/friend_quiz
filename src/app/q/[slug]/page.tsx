import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TakeQuizForm } from "@/components/TakeQuizForm";
import { getQuizForPlay } from "@/lib/actions";
import { getTheme } from "@/lib/themes";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const quiz = await getQuizForPlay(slug);
  if (!quiz) return { title: "Quiz not found — KnowMe" };
  return {
    title: `${quiz.title} — KnowMe`,
    description: `How well do you know ${quiz.creatorName}? Take the quiz.`,
    openGraph: {
      title: quiz.title,
      description: `Only real friends score above 80% on ${quiz.creatorName}'s quiz.`,
    },
  };
}

export default async function QuizPlayPage({ params }: Props) {
  const { slug } = await params;
  const quiz = await getQuizForPlay(slug);
  if (!quiz) notFound();

  const theme = getTheme(quiz.theme);

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
      <TakeQuizForm
        slug={quiz.slug}
        creatorName={quiz.creatorName}
        title={quiz.title}
        questions={quiz.questions}
      />
    </main>
  );
}
