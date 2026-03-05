import Fuse from "fuse.js";
import { students, type Student } from "../data/students";

type FuseKey = { name: keyof Student; weight: number };

/**
 * Confidence threshold for accepting a Fuse.js match.
 * Fuse scores range from 0 (perfect) to 1 (no match).
 * We only accept results below this value.
 */
const MATCH_THRESHOLD = 0.35;

/**
 * Normalize a file name for fuzzy matching:
 * - Strip the file extension
 * - Replace underscores and hyphens with spaces
 * - Collapse multiple spaces
 * - Trim whitespace
 *
 * @example
 * normalizeFileName("100-001_james_wilson.pdf") // "100 001 james wilson"
 */
function normalizeFileName(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, "") // strip extension
    .replace(/[_\-]+/g, " ") // underscores/hyphens → spaces
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();
}

/**
 * Fuse.js index keyed by `fieldKey`.
 * Built lazily and cached so we only pay the construction cost once per field.
 */
const fuseCache = new Map<string, Fuse<Student>>();

function getFuse(fieldKey: string): Fuse<Student> {
  if (fuseCache.has(fieldKey)) return fuseCache.get(fieldKey)!;

  // Weight the chosen field higher so it's preferred over incidental matches
  // on other fields.
  const keys: FuseKey[] =
    fieldKey === "studentID"
      ? [
          { name: "studentID", weight: 3 },
          { name: "name", weight: 1 },
        ]
      : [
          { name: "name", weight: 3 },
          { name: "studentID", weight: 1 },
        ];

  const fuse = new Fuse(students, {
    keys,
    threshold: MATCH_THRESHOLD,
    includeScore: true,
    // Ignore location so the match can appear anywhere in the string
    ignoreLocation: true,
    // Minimum number of characters that must match
    minMatchCharLength: 2,
  });

  fuseCache.set(fieldKey, fuse);
  return fuse;
}

/**
 * Fuzzy-match a file name against the student list using Fuse.js.
 *
 * Returns the system `id` of the best-matching student, or `""` if no
 * confident match was found.
 *
 * @param fileName  - Raw file name including extension (e.g. `"100-001.pdf"`)
 * @param fieldKey  - Which student field to weight higher (`"studentID"` | `"name"` | `"grade"`)
 *
 * @example
 * fuzzyMatch("100-001.pdf", "studentID")   // "54321"  (James Wilson, 100-001)
 * fuzzyMatch("james_wilson.pdf", "name")   // "54321"
 * fuzzyMatch("unknown.pdf", "studentID")   // ""
 */
export function fuzzyMatch(fileName: string, fieldKey: string): string {
  const query = normalizeFileName(fileName);
  if (!query) return "";

  const fuse = getFuse(fieldKey);
  const results = fuse.search(query);

  if (results.length === 0) return "";

  const best = results[0];
  // score closer to 0 = better match; reject if not confident enough
  if ((best.score ?? 1) >= MATCH_THRESHOLD) return "";

  return best.item.id;
}
