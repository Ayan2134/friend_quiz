"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAttempt } from "@/lib/actions";

type PlayQuestion = {
  id: string;
  prompt: string;
  options: string[];
};

type Props = {
  slug: string;
  creatorName: string;
  title: string;
  questions: PlayQuestion[];
};

export function TakeQuizForm({ slug, creatorName, title, questions }: Props) {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() =>
    Array(questions.length).fill(-1),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const current = questions[index];
  const progress = ((index + (answers[index] >= 0 ? 1 : 0)) / questions.length) * 100;
  const selected = answers[index];

  function start() {
    if (!playerName.trim()) {
      setError("Enter your name to start.");
      return;
    }
    setError(null);
    setStarted(true);
  }

  function pick(optionIndex: number) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? optionIndex : a)));
  }

  function next() {
    if (selected < 0) {
      setError("Pick an answer to continue.");
      return;
    }
    setError(null);
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    finish();
  }

  function finish() {
    startTransition(async () => {
      const res = await submitAttempt({ slug, playerName, answers });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/q/${slug}/r/${res.attemptId}`);
    });
  }

  if (!started) {
    return (
      <div className="space-y-8 animate-rise">
        <div>
          <p className="eyebrow">Quiz by {creatorName}</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-xl text-[var(--ink-muted)]">
            {questions.length} questions. No account. Only real friends score above
            80%.
          </p>
        </div>
        <div>
          <label className="label" htmlFor="playerName">
            Your name
          </label>
          <input
            id="playerName"
            className="field mt-2"
            placeholder="Jordan"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={40}
            onKeyDown={(e) => {
              if (e.key === "Enter") start();
            }}
          />
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="btn-row">
          <button type="button" className="btn-primary" onClick={start}>
            Start quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-rise">
      <div>
        <div className="flex items-center justify-between gap-3 text-sm text-[var(--ink-muted)]">
          <span>
            Question {index + 1} / {questions.length}
          </span>
          <span>{creatorName}</span>
        </div>
        <div className="progress mt-3" aria-hidden>
          <div className="progress-bar" style={{ width: `${Math.max(progress, 8)}%` }} />
        </div>
        <h1 className="display mt-6 text-3xl sm:text-4xl">{current.prompt}</h1>
      </div>

      <div className="grid gap-3">
        {current.options.map((opt, oi) => (
          <button
            key={oi}
            type="button"
            className={`choice ${selected === oi ? "selected" : ""}`}
            onClick={() => pick(oi)}
          >
            {opt}
          </button>
        ))}
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="btn-row">
        {index > 0 ? (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setError(null);
              setIndex((i) => i - 1);
            }}
          >
            Back
          </button>
        ) : null}
        <button
          type="button"
          className="btn-primary"
          disabled={pending}
          onClick={next}
        >
          {pending
            ? "Scoring…"
            : index === questions.length - 1
              ? "See my score"
              : "Next"}
        </button>
      </div>
    </div>
  );
}
