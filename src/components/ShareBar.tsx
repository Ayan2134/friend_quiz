"use client";

import { useEffect, useState } from "react";

type Props = {
  slug: string;
  title: string;
  creatorName: string;
};

export function ShareBar({ slug, title, creatorName }: Props) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/q/${slug}`);
  }, [slug]);

  const text = `Only real friends score above 80% on ${creatorName}'s quiz: ${title}\n${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url || text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="btn-row">
      <button type="button" className="btn-secondary" onClick={copy}>
        {copied ? "Copied" : "Copy link"}
      </button>
      <a
        className="btn-primary"
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Share on WhatsApp
      </a>
    </div>
  );
}
