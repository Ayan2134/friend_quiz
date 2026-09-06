export const THEMES = {
  coral: {
    id: "coral",
    label: "Coral Pop",
    accent: "#FF5A36",
    accentSoft: "#FFD4C8",
    ink: "#1A1410",
    paper: "#FFF6F1",
    glow: "#FF8F6B",
  },
  teal: {
    id: "teal",
    label: "Teal Wave",
    accent: "#0F8A7A",
    accentSoft: "#C8F0E8",
    ink: "#0C1F1C",
    paper: "#F2FBFA",
    glow: "#2BB8A6",
  },
  mango: {
    id: "mango",
    label: "Mango Night",
    accent: "#F5A524",
    accentSoft: "#FFE6B0",
    ink: "#1C1408",
    paper: "#FFF9EE",
    glow: "#FFC857",
  },
} as const;

export type ThemeId = keyof typeof THEMES;

export function getTheme(id: string) {
  return THEMES[id as ThemeId] ?? THEMES.coral;
}
