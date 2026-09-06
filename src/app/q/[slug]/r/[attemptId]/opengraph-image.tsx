import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { getTier } from "@/lib/scoring";
import { getTheme } from "@/lib/themes";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string; attemptId: string }>;
};

export default async function ResultOgImage({ params }: Props) {
  const { slug, attemptId } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { slug } });
  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
  const theme = getTheme(quiz?.theme ?? "coral");
  const percent =
    attempt && attempt.total > 0
      ? Math.round((attempt.score / attempt.total) * 100)
      : 0;
  const tier = getTier(percent);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: `linear-gradient(160deg, ${theme.ink} 0%, #2a1c16 40%, ${theme.accent} 140%)`,
          color: "#fff",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>KnowMe</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 28, opacity: 0.8 }}>
            {attempt?.playerName ?? "Friend"} vs {quiz?.creatorName ?? "friend"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.05em",
              color: theme.accentSoft,
            }}
          >
            {percent}%
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>
            {tier.label}
          </div>
          <div style={{ display: "flex", fontSize: 26, opacity: 0.85, marginTop: 8 }}>
            Think you know them better? Take the quiz.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
