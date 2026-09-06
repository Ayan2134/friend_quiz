"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createCreatorToken, hashToken, verifyToken } from "@/lib/tokens";

export type CreateQuestionInput = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type CreateQuizInput = {
  creatorName: string;
  title: string;
  theme: string;
  questions: CreateQuestionInput[];
};

export type CreateQuizResult =
  | { ok: true; slug: string; token: string }
  | { ok: false; error: string };

export async function createQuiz(input: CreateQuizInput): Promise<CreateQuizResult> {
  const creatorName = input.creatorName.trim();
  const title = input.title.trim();

  if (!creatorName || creatorName.length > 40) {
    return { ok: false, error: "Enter a display name (max 40 characters)." };
  }
  if (!title || title.length > 80) {
    return { ok: false, error: "Enter a quiz title (max 80 characters)." };
  }
  if (!input.questions.length || input.questions.length > 12) {
    return { ok: false, error: "Add between 1 and 12 questions." };
  }

  for (const [i, q] of input.questions.entries()) {
    if (!q.prompt.trim()) {
      return { ok: false, error: `Question ${i + 1} needs a prompt.` };
    }
    if (q.options.length < 2 || q.options.length > 6) {
      return { ok: false, error: `Question ${i + 1} needs 2–6 options.` };
    }
    if (q.options.some((o) => !o.trim())) {
      return { ok: false, error: `Question ${i + 1} has an empty option.` };
    }
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      return { ok: false, error: `Pick a correct answer for question ${i + 1}.` };
    }
  }

  const token = createCreatorToken();
  const slug = nanoid(10);

  await prisma.quiz.create({
    data: {
      slug,
      creatorName,
      creatorTokenHash: hashToken(token),
      title,
      theme: input.theme || "coral",
      questions: {
        create: input.questions.map((q, order) => ({
          prompt: q.prompt.trim(),
          options: JSON.stringify(q.options.map((o) => o.trim())),
          correctIndex: q.correctIndex,
          order,
        })),
      },
    },
  });

  return { ok: true, slug, token };
}

export type SubmitAttemptInput = {
  slug: string;
  playerName: string;
  answers: number[];
};

export type SubmitAttemptResult =
  | { ok: true; attemptId: string }
  | { ok: false; error: string };

export async function submitAttempt(
  input: SubmitAttemptInput,
): Promise<SubmitAttemptResult> {
  const playerName = input.playerName.trim();
  if (!playerName || playerName.length > 40) {
    return { ok: false, error: "Enter your name (max 40 characters)." };
  }

  const quiz = await prisma.quiz.findUnique({
    where: { slug: input.slug },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!quiz) {
    return { ok: false, error: "Quiz not found." };
  }

  if (input.answers.length !== quiz.questions.length) {
    return { ok: false, error: "Answer every question." };
  }

  let score = 0;
  quiz.questions.forEach((q, i) => {
    const options = JSON.parse(q.options) as string[];
    const answer = input.answers[i];
    if (answer >= 0 && answer < options.length && answer === q.correctIndex) {
      score += 1;
    }
  });

  const attempt = await prisma.attempt.create({
    data: {
      quizId: quiz.id,
      playerName,
      score,
      total: quiz.questions.length,
      answers: JSON.stringify(input.answers),
    },
  });

  revalidatePath(`/q/${quiz.slug}`);
  revalidatePath(`/q/${quiz.slug}/dashboard`);

  return { ok: true, attemptId: attempt.id };
}

export async function getQuizForPlay(slug: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { slug },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) return null;

  return {
    slug: quiz.slug,
    creatorName: quiz.creatorName,
    title: quiz.title,
    theme: quiz.theme,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: JSON.parse(q.options) as string[],
    })),
  };
}

export async function getAttemptResult(slug: string, attemptId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { slug },
    include: {
      questions: { orderBy: { order: "asc" } },
      attempts: { orderBy: [{ score: "desc" }, { createdAt: "asc" }] },
    },
  });
  if (!quiz) return null;

  const attempt = quiz.attempts.find((a) => a.id === attemptId);
  if (!attempt) return null;

  const answers = JSON.parse(attempt.answers) as number[];
  const breakdown = quiz.questions.map((q, i) => {
    const options = JSON.parse(q.options) as string[];
    const selected = answers[i];
    return {
      prompt: q.prompt,
      options,
      correctIndex: q.correctIndex,
      selectedIndex: selected,
      correct: selected === q.correctIndex,
    };
  });

  const missCounts = quiz.questions.map((q, i) => {
    let misses = 0;
    for (const a of quiz.attempts) {
      const ans = JSON.parse(a.answers) as number[];
      if (ans[i] !== q.correctIndex) misses += 1;
    }
    return { prompt: q.prompt, misses, index: i };
  });
  const mostMissed = [...missCounts].sort((a, b) => b.misses - a.misses)[0];

  const leaderboard = quiz.attempts.slice(0, 10).map((a, rank) => ({
    rank: rank + 1,
    id: a.id,
    playerName: a.playerName,
    score: a.score,
    total: a.total,
    percent: Math.round((a.score / a.total) * 100),
    isYou: a.id === attemptId,
  }));

  const yourRank =
    quiz.attempts.findIndex((a) => a.id === attemptId) + 1 || null;

  return {
    quiz: {
      slug: quiz.slug,
      creatorName: quiz.creatorName,
      title: quiz.title,
      theme: quiz.theme,
    },
    attempt: {
      id: attempt.id,
      playerName: attempt.playerName,
      score: attempt.score,
      total: attempt.total,
      percent: Math.round((attempt.score / attempt.total) * 100),
    },
    breakdown,
    mostMissed:
      mostMissed && quiz.attempts.length > 0
        ? { prompt: mostMissed.prompt, misses: mostMissed.misses }
        : null,
    leaderboard,
    yourRank,
    totalAttempts: quiz.attempts.length,
  };
}

export async function getDashboard(slug: string, token: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { slug },
    include: {
      questions: { orderBy: { order: "asc" } },
      attempts: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!quiz) return { ok: false as const, error: "Quiz not found." };
  if (!verifyToken(token, quiz.creatorTokenHash)) {
    return { ok: false as const, error: "Invalid creator link." };
  }

  const missCounts = quiz.questions.map((q, i) => {
    let misses = 0;
    for (const a of quiz.attempts) {
      const ans = JSON.parse(a.answers) as number[];
      if (ans[i] !== q.correctIndex) misses += 1;
    }
    const rate =
      quiz.attempts.length === 0
        ? 0
        : Math.round((misses / quiz.attempts.length) * 100);
    return { prompt: q.prompt, misses, rate };
  });

  const weakest = [...missCounts].sort((a, b) => b.misses - a.misses);

  return {
    ok: true as const,
    quiz: {
      slug: quiz.slug,
      creatorName: quiz.creatorName,
      title: quiz.title,
      theme: quiz.theme,
      createdAt: quiz.createdAt.toISOString(),
    },
    attempts: quiz.attempts.map((a) => ({
      id: a.id,
      playerName: a.playerName,
      score: a.score,
      total: a.total,
      percent: Math.round((a.score / a.total) * 100),
      createdAt: a.createdAt.toISOString(),
    })),
    weakest,
    totalAttempts: quiz.attempts.length,
    averagePercent:
      quiz.attempts.length === 0
        ? 0
        : Math.round(
            quiz.attempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) /
              quiz.attempts.length,
          ),
  };
}
