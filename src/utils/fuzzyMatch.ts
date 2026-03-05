import Fuse from "fuse.js";
import { students, type Student } from "../data/students";

type FuseKey = { name: keyof Student; weight: number };

/**
 * Confidence threshold for accepting a Fuse.js result.
 * Fuse scores range from 0 (perfect match) to 1 (no match).
 * Results at or above this value are discarded.
 */
const MATCH_THRESHOLD = 0.35;

/**
 * When two or more results fall within this score gap of the best result,
 * they are all considered "multiple potential matches" rather than a single
 * confident match.
 */
const AMBIGUITY_TOLERANCE = 0.08;

/**
 * The result of a fuzzy match against the student list.
 *
 * - `"none"`     — no result met the confidence threshold
 * - `"match"`    — exactly one confident result; `studentId` is set
 * - `"multiple"` — two or more results are close enough to be ambiguous;
 *                  `candidates` lists all of them so the UI can show a warning
 */
export type MatchResult =
  | { kind: "none" }
  | { kind: "match"; studentId: string }
  | { kind: "multiple"; candidates: string[] };

/**
 * Normalize a file name for fuzzy matching:
 * - Strip the file extension
 * - Replace underscores and hyphens with spaces
 * - Collapse multiple spaces
 * - Trim whitespace
 *
 * @example
 * normalizeFileName("100-001_james_wilson.pdf") // "100 001 james wilson"
 * normalizeFileName("54321.pdf")                // "54321"
 */
function normalizeFileName(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, "")  // strip extension
    .replace(/[_-]+/g, " ")    // underscores/hyphens → spaces
    .replace(/\s+/g, " ")      // collapse whitespace
    .trim();
}

/**
 * Build the Fuse key config for a given fieldKey, weighting the primary field
 * 3× so it dominates matches while still allowing secondary fields to help.
 *
 * Supported fieldKeys (per README):
 * - `"id"`        — Portal ID (system ID, e.g. "54321")
 * - `"name"`      — Student name (e.g. "James Wilson")
 * - `"studentID"` — School-assigned ID (e.g. "100-001")
 */
function buildKeys(fieldKey: string): FuseKey[] {
  const primary = fieldKey as keyof Student;
  const secondaries: (keyof Student)[] = (["id", "name", "studentID"] as const)
    .filter((k) => k !== primary);

  return [
    { name: primary, weight: 3 },
    ...secondaries.map((k) => ({ name: k, weight: 1 })),
  ];
}

/**
 * Fuse.js index keyed by `fieldKey`.
 * Built lazily and cached — construction cost paid only once per field type.
 */
const fuseCache = new Map<string, Fuse<Student>>();

function getFuse(fieldKey: string): Fuse<Student> {
  if (fuseCache.has(fieldKey)) return fuseCache.get(fieldKey)!;

  const fuse = new Fuse(students, {
    keys: buildKeys(fieldKey),
    threshold: MATCH_THRESHOLD,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  fuseCache.set(fieldKey, fuse);
  return fuse;
}

/**
 * Fuzzy-match a file name against the student list using Fuse.js.
 *
 * Returns a typed `MatchResult` describing one of three outcomes:
 * - `"none"`     — nothing met the confidence threshold
 * - `"match"`    — one confident result found
 * - `"multiple"` — two or more results are too close to call automatically
 *
 * @param fileName  Raw file name including extension (e.g. `"54321.pdf"`)
 * @param fieldKey  Which student field to weight (`"id"` | `"name"` | `"studentID"`)
 *
 * @example
 * fuzzyMatch("54321.pdf", "id")          // { kind: "match", studentId: "54321" }
 * fuzzyMatch("james_wilson.pdf", "name") // { kind: "match", studentId: "54321" }
 * fuzzyMatch("unknown.pdf", "id")        // { kind: "none" }
 */
export function fuzzyMatch(fileName: string, fieldKey: string): MatchResult {
  const query = normalizeFileName(fileName);
  if (!query) return { kind: "none" };

  // For identifier fields (id, studentID) try an exact match first.
  // These fields contain numeric/code strings that are too similar for fuzzy
  // scoring to disambiguate (e.g. "54321" vs "54322" score nearly the same).
  if (fieldKey === "id" || fieldKey === "studentID") {
    const key = fieldKey as "id" | "studentID";
    // Normalise the student field the same way we normalise the file name
    // (hyphens → spaces) so "100-001" matches "100 001".
    const exact = students.find(
      (s) => normalizeFileName(s[key]) === query,
    );
    if (exact) return { kind: "match", studentId: exact.id };
    return { kind: "none" };
  }

  // For name matching, use fuzzy search as before.
  const fuse = getFuse(fieldKey);
  const results = fuse.search(query);

  if (results.length === 0) return { kind: "none" };

  const best = results[0];
  const bestScore = best.score ?? 1;

  // Reject if the best result isn't confident enough
  if (bestScore >= MATCH_THRESHOLD) return { kind: "none" };

  // Collect all results that are within the ambiguity tolerance of the best
  const closeResults = results.filter(
    (r) => (r.score ?? 1) - bestScore <= AMBIGUITY_TOLERANCE,
  );

  if (closeResults.length > 1) {
    return {
      kind: "multiple",
      candidates: closeResults.map((r) => r.item.id),
    };
  }

  return { kind: "match", studentId: best.item.id };
}
