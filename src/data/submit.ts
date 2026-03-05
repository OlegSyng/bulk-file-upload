/** A single file-to-student mapping entry. */
export type MappingEntry = {
  /** Original file name as selected by the user. */
  fileName: string;
  /** System `id` of the matched student from `students.ts`. */
  studentId: string;
};

/**
 * Payload sent to the upload API.
 *
 * @example
 * {
 *   fieldKey: "studentID",
 *   mappings: [
 *     { fileName: "100-001.pdf", studentId: "54321" },
 *     { fileName: "100-002.pdf", studentId: "54322" },
 *   ]
 * }
 */
export type SubmitPayload = {
  /** The student field used to match file names (e.g. `"studentID"`, `"name"`). */
  fieldKey: string;
  /** One entry per uploaded file. */
  mappings: MappingEntry[];
};

/**
 * Submits the bulk upload payload to the API.
 *
 * This is a stub that simulates ~1.2 s of network latency and logs the
 * payload. Replace the body with a real `fetch` / `axios` call.
 */
export async function submitUpload(payload: SubmitPayload): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 1200));
  console.log("[submitUpload]", payload);
}
