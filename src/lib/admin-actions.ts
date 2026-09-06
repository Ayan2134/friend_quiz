"use server";

import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  isAdminConfigured,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export type AdminLoginResult = { ok: true } | { ok: false; error: string };

function passwordsMatch(submitted: string, expected: string): boolean {
  const a = Buffer.from(submitted);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Still do a dummy compare to reduce timing leaks on length
    timingSafeEqual(Buffer.from(expected), Buffer.from(expected));
    return false;
  }
  return timingSafeEqual(a, b);
}

export async function adminLogin(password: string): Promise<AdminLoginResult> {
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!expectedPassword || !isAdminConfigured()) {
    return {
      ok: false,
      error: "ADMIN_PASSWORD is not set on the server.",
    };
  }

  if (!passwordsMatch(password.trim(), expectedPassword)) {
    return { ok: false, error: "Wrong password." };
  }

  const token = createAdminSessionToken();
  if (!token) {
    return { ok: false, error: "Admin is not configured." };
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return { ok: true };
}

export async function adminLogout() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin");
}

export type AdminStats = {
  totals: {
    quizzes: number;
    attempts: number;
    avgScorePercent: number;
  };
  recentQuizzes: Array<{
    id: string;
    slug: string;
    creatorName: string;
    title: string;
    theme: string;
    createdAt: string;
    attemptCount: number;
  }>;
  topQuizzes: Array<{
    id: string;
    slug: string;
    creatorName: string;
    title: string;
    attemptCount: number;
    avgPercent: number;
  }>;
  recentAttempts: Array<{
    id: string;
    playerName: string;
    score: number;
    total: number;
    percent: number;
    createdAt: string;
    quizTitle: string;
    quizSlug: string;
    creatorName: string;
  }>;
  daily: Array<{
    date: string;
    quizzes: number;
    attempts: number;
  }>;
};

export async function getAdminStats(): Promise<AdminStats> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 13);
  since.setUTCHours(0, 0, 0, 0);

  const [quizCount, attemptCount, allScores, quizzes, attemptsLast, quizzesWindow, attemptsWindow, ranked] =
    await Promise.all([
      prisma.quiz.count(),
      prisma.attempt.count(),
      prisma.attempt.findMany({ select: { score: true, total: true } }),
      prisma.quiz.findMany({
        orderBy: { createdAt: "desc" },
        take: 25,
        include: { _count: { select: { attempts: true } } },
      }),
      prisma.attempt.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          quiz: { select: { title: true, slug: true, creatorName: true } },
        },
      }),
      prisma.quiz.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.attempt.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.quiz.findMany({
        include: {
          _count: { select: { attempts: true } },
          attempts: { select: { score: true, total: true } },
        },
      }),
    ]);

  const avgScorePercent =
    allScores.length === 0
      ? 0
      : Math.round(
          allScores.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) /
            allScores.length,
        );

  const topQuizzes = [...ranked]
    .sort((a, b) => b._count.attempts - a._count.attempts)
    .slice(0, 10)
    .map((q) => {
      const avgPercent =
        q.attempts.length === 0
          ? 0
          : Math.round(
              q.attempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) /
                q.attempts.length,
            );
      return {
        id: q.id,
        slug: q.slug,
        creatorName: q.creatorName,
        title: q.title,
        attemptCount: q._count.attempts,
        avgPercent,
      };
    });

  const dayKeys: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    dayKeys.push(d.toISOString().slice(0, 10));
  }

  const quizBuckets = Object.fromEntries(dayKeys.map((k) => [k, 0]));
  const attemptBuckets = Object.fromEntries(dayKeys.map((k) => [k, 0]));

  for (const q of quizzesWindow) {
    const key = q.createdAt.toISOString().slice(0, 10);
    if (key in quizBuckets) quizBuckets[key] += 1;
  }
  for (const a of attemptsWindow) {
    const key = a.createdAt.toISOString().slice(0, 10);
    if (key in attemptBuckets) attemptBuckets[key] += 1;
  }

  return {
    totals: {
      quizzes: quizCount,
      attempts: attemptCount,
      avgScorePercent,
    },
    recentQuizzes: quizzes.map((q) => ({
      id: q.id,
      slug: q.slug,
      creatorName: q.creatorName,
      title: q.title,
      theme: q.theme,
      createdAt: q.createdAt.toISOString(),
      attemptCount: q._count.attempts,
    })),
    topQuizzes,
    recentAttempts: attemptsLast.map((a) => ({
      id: a.id,
      playerName: a.playerName,
      score: a.score,
      total: a.total,
      percent: Math.round((a.score / a.total) * 100),
      createdAt: a.createdAt.toISOString(),
      quizTitle: a.quiz.title,
      quizSlug: a.quiz.slug,
      creatorName: a.quiz.creatorName,
    })),
    daily: dayKeys.map((date) => ({
      date,
      quizzes: quizBuckets[date],
      attempts: attemptBuckets[date],
    })),
  };
}
