import type { Tone } from "@/scenarios/types";

export function toneText(tone?: Tone): string {
  if (tone === "ok") return "text-[var(--ok)]";
  if (tone === "bad") return "text-[var(--bad)]";
  if (tone === "accent") return "text-[var(--accent)]";
  if (tone === "warn") return "text-[var(--warn)]";
  return "text-[var(--ink)]";
}

export function toneBg(tone?: Tone): string {
  if (tone === "ok") return "bg-[var(--ok-soft)] text-[var(--ok)]";
  if (tone === "bad") return "bg-[var(--bad-soft)] text-[var(--bad)]";
  if (tone === "accent") return "bg-[var(--accent-soft)] text-[var(--accent)]";
  if (tone === "warn") return "bg-[var(--warn-soft)] text-[var(--warn)]";
  return "bg-[var(--surface-2)] text-[var(--ink-2)]";
}
