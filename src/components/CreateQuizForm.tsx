"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createQuiz } from "@/lib/actions";
import { STARTER_PACKS, type StarterPack } from "@/lib/templates";
import { THEMES, type ThemeId } from "@/lib/themes";

type DraftQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

type Step = "pack" | "edit" | "done";

function packToDraft(pack: StarterPack): DraftQuestion[] {
  return pack.questions.map((q) => ({
    prompt: q.prompt,
    options: [...q.options],
    correctIndex: 0,
  }));
}

export function CreateQuizForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("pack");
  const [packId, setPackId] = useState(STARTER_PACKS[0].id);
  const [creatorName, setCreatorName] = useState("");
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState<ThemeId>("coral");
  const [questions, setQuestions] = useState<DraftQuestion[]>(() =>
    packToDraft(STARTER_PACKS[0]),
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ slug: string; token: string } | null>(
    null,
  );
  const [copied, setCopied] = useState<"link" | "dash" | null>(null);
  const [pending, startTransition] = useTransition();

  const pack = useMemo(
    () => STARTER_PACKS.find((p) => p.id === packId) ?? STARTER_PACKS[0],
    [packId],
  );

  function selectPack(id: string) {
    const next = STARTER_PACKS.find((p) => p.id === id);
    if (!next) return;
    setPackId(id);
    setQuestions(packToDraft(next));
    if (!title.trim()) {
      setTitle(next.titleSuffix);
    }
  }

  function updateQuestion(index: number, patch: Partial<DraftQuestion>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    );
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = q.options.map((o, j) => (j === oIndex ? value : o));
        return { ...q, options };
      }),
    );
  }

  function publish() {
    setError(null);
    startTransition(async () => {
      const res = await createQuiz({
        creatorName,
        title: title || pack.titleSuffix,
        theme,
        questions,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      try {
        localStorage.setItem(
          `knowme:creator:${res.slug}`,
          JSON.stringify({ token: res.token, createdAt: Date.now() }),
        );
      } catch {
        /* ignore */
      }
      setResult({ slug: res.slug, token: res.token });
      setStep("done");
    });
  }

  async function copyText(kind: "link" | "dash", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* ignore */
    }
  }

  if (step === "done" && result) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}/q/${result.slug}`;
    const dashUrl = `${origin}/q/${result.slug}/dashboard?token=${result.token}`;
    const waText = encodeURIComponent(
      `Only real friends score above 80% on my KnowMe quiz 👀\n${shareUrl}`,
    );

    return (
      <div className="space-y-8 animate-rise">
        <div>
          <p className="eyebrow">You&apos;re live</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">Challenge your friends</h1>
          <p className="mt-3 max-w-xl text-[var(--ink-muted)]">
            Send the link. Watch the scores roll in. Keep your dashboard link private —
            it&apos;s the only way to see who played.
          </p>
        </div>

        <div className="share-panel">
          <label className="label">Friend link</label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input className="field flex-1" readOnly value={shareUrl} />
            <button
              type="button"
              className="btn-primary"
              onClick={() => copyText("link", shareUrl)}
            >
              {copied === "link" ? "Copied" : "Copy link"}
            </button>
          </div>
          <div className="btn-row mt-4">
            <a
              className="btn-secondary"
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Share on WhatsApp
            </a>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => router.push(`/q/${result.slug}`)}
            >
              Preview quiz
            </button>
          </div>
        </div>

        <div className="share-panel warn">
          <label className="label">Creator dashboard (private)</label>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Bookmark this. Anyone with it can see results.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input className="field flex-1 text-sm" readOnly value={dashUrl} />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => copyText("dash", dashUrl)}
            >
              {copied === "dash" ? "Copied" : "Copy dashboard"}
            </button>
          </div>
          <div className="btn-row mt-4">
            <button
              type="button"
              className="btn-primary"
              onClick={() => router.push(dashUrl)}
            >
              Open dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "pack") {
    return (
      <div className="space-y-8 animate-rise">
        <div>
          <p className="eyebrow">Step 1</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">Pick a starter pack</h1>
          <p className="mt-3 max-w-xl text-[var(--ink-muted)]">
            Templates get you live in under two minutes. You&apos;ll mark the right
            answers next.
          </p>
        </div>

        <div className="grid gap-4">
          {STARTER_PACKS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`pack-card ${packId === p.id ? "active" : ""}`}
              onClick={() => selectPack(p.id)}
            >
              <span className="pack-name">{p.name}</span>
              <span className="pack-desc">{p.description}</span>
              <span className="pack-meta">{p.questions.length} questions</span>
            </button>
          ))}
        </div>

        <div className="btn-row">
          <button type="button" className="btn-primary" onClick={() => setStep("edit")}>
            Continue with {pack.name}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-rise">
      <div>
        <p className="eyebrow">Step 2</p>
        <h1 className="display mt-2 text-4xl sm:text-5xl">Make it yours</h1>
        <p className="mt-3 max-w-xl text-[var(--ink-muted)]">
          Tap the correct answer for each question — that&apos;s what friends will be
          scored against.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="creatorName">
            Your name
          </label>
          <input
            id="creatorName"
            className="field mt-2"
            placeholder="Alex"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            maxLength={40}
          />
        </div>
        <div>
          <label className="label" htmlFor="title">
            Quiz title
          </label>
          <input
            id="title"
            className="field mt-2"
            placeholder={pack.titleSuffix}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
          />
        </div>
      </div>

      <div>
        <p className="label">Color vibe</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {(Object.keys(THEMES) as ThemeId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={`theme-chip ${theme === id ? "active" : ""}`}
              style={{ ["--chip" as string]: THEMES[id].accent }}
              onClick={() => setTheme(id)}
            >
              {THEMES[id].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={qi} className="question-editor">
            <div className="flex items-baseline justify-between gap-3">
              <label className="label">Question {qi + 1}</label>
              <span className="text-xs text-[var(--ink-muted)]">
                Tap the right answer
              </span>
            </div>
            <input
              className="field mt-2"
              value={q.prompt}
              onChange={(e) => updateQuestion(qi, { prompt: e.target.value })}
            />
            <div className="mt-3 grid gap-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  className={`option-row ${q.correctIndex === oi ? "correct" : ""}`}
                  onClick={() => updateQuestion(qi, { correctIndex: oi })}
                >
                  <span className="option-radio" aria-hidden />
                  <input
                    className="option-input"
                    value={opt}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="btn-row">
        <button type="button" className="btn-ghost" onClick={() => setStep("pack")}>
          Back
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={pending}
          onClick={publish}
        >
          {pending ? "Publishing…" : "Publish quiz"}
        </button>
      </div>
    </div>
  );
}
