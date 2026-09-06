export type Tier = {
  id: string;
  label: string;
  blurb: string;
  minPercent: number;
};

export const TIERS: Tier[] = [
  {
    id: "soulmate",
    label: "Soulmate Status",
    blurb: "You two share a brain. Slightly terrifying.",
    minPercent: 90,
  },
  {
    id: "bestie",
    label: "Certified Bestie",
    blurb: "Real ones only. You clearly pay attention.",
    minPercent: 70,
  },
  {
    id: "solid",
    label: "Solid Friend",
    blurb: "You know the highlights. Dig a little deeper.",
    minPercent: 50,
  },
  {
    id: "acquaintance",
    label: "Friendly Acquaintance",
    blurb: "Polite vibes. The lore is still locked.",
    minPercent: 30,
  },
  {
    id: "suspicious",
    label: "Suspicious Stranger",
    blurb: "Did you even meet, or was this a group chat accident?",
    minPercent: 0,
  },
];

export function getTier(percent: number): Tier {
  return TIERS.find((t) => percent >= t.minPercent) ?? TIERS[TIERS.length - 1];
}

export function scorePercent(score: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}
