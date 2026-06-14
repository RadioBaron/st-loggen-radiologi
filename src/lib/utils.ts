import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Kort slumpmässigt id för lokala poster (kurser, placeringar, samtal). */
export function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Formaterar ett ISO-datum (YYYY-MM-DD) till svensk kort form. Tom sträng -> "". */
export function formatDate(d: string | undefined | null): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Tar bort kodprefixet ur en delmålsrubrik, t.ex. "c5 – Thorax" -> "Thorax". */
export function stripMilestonePrefix(title: string): string {
  return title.replace(/^[a-z0-9]+\s*–\s*/i, "");
}

/** Svensk talformatering (tunn wrapper för konsekvens i appen). */
export function nf(n: number): string {
  return n.toLocaleString("sv-SE");
}
