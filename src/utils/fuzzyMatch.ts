import Fuse from "fuse.js";
import { students } from "../data/students";

/**
 * The result of matching a file name against the student list.
 *
 * - `"none"`     — no match found
 * - `"match"`    — one confident match; `studentId` is the system ID
 * - `"multiple"` — two or more equally close matches; user must pick manually
 */
export type MatchResult =
  | { kind: "none" }
  | { kind: "match"; studentId: string }
  | { kind: "multiple"; candidates: string[] };

/** Strip extension, replace separators with spaces, collapse whitespace. */
function normalize(s: string): string {
  return s
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Fuse instance for name matching — built once, reused.
const nameFuse = new Fuse(students, {
  keys: [{ name: "name", weight: 1 }],
  threshold: 0.35,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

/**
 * Match a file name against the student list.
 *
 * - `"id"` / `"studentID"` — exact match after normalisation (hyphens → spaces)
 * - `"name"`               — fuzzy match via Fuse.js
 */
export function fuzzyMatch(fileName: string, fieldKey: string): MatchResult {
  const query = normalize(fileName);
  if (!query) return { kind: "none" };

  // ── Exact match for identifier fields ────────────────────────────────────
  if (fieldKey === "id" || fieldKey === "studentID") {
    const key = fieldKey as "id" | "studentID";
    const hit = students.find((s) => normalize(s[key]) === query);
    return hit ? { kind: "match", studentId: hit.id } : { kind: "none" };
  }

  // ── Fuzzy match for names ─────────────────────────────────────────────────
  const results = nameFuse.search(query);
  if (results.length === 0) return { kind: "none" };

  const best = results[0];
  const bestScore = best.score ?? 1;

  // Collect results within 0.08 of the best score to detect ambiguity
  const close = results.filter((r) => (r.score ?? 1) - bestScore <= 0.08);
  if (close.length > 1) {
    return { kind: "multiple", candidates: close.map((r) => r.item.id) };
  }

  return { kind: "match", studentId: best.item.id };
}
