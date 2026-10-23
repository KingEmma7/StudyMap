import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** True when a Supabase/PostgREST error means the table doesn't exist, i.e. a migration was never run. */
export function isMissingTableError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "PGRST205"
  );
}

/** Letters that `normalize("NFD")` does not split into a base letter and a mark. */
const UNDECOMPOSED_LETTERS: Record<string, string> = { ł: "l", ø: "o", đ: "d", ı: "i" };

/**
 * Lower-cases `text` and strips accents, so `Esenboğa`, `Kraków` and `Française`
 * compare equal to `esenboga`, `krakow` and `francaise` in search.
 */
export function foldText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[łøđı]/g, (letter) => UNDECOMPOSED_LETTERS[letter]);
}
