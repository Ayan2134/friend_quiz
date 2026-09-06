import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { getTheme } from "@/lib/themes";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OgImage({ params }: Props) {
  const { slug } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { slug } });
  const theme = getTheme(quiz?.theme ?? "coral");
  const title = quiz?.title ?? "How well do you know me?";
  const creator = quiz?.creatorName ?? "a friend";

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
          background: `linear-gradient(145deg, ${theme.paper} 0%, ${theme.accentSoft} 45%, ${theme.glow} 100%)`,
          color: theme.ink,
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: "-0.04em",
          }}
        >
          KnowMe
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              opacity: 0.75,
            }}
          >
            Quiz by {creator}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 12,
              fontSize: 28,
              fontWeight: 600,
              color: theme.accent,
            }}
          >
            Only real friends score above 80%
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
