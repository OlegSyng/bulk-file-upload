/**
 * Formats a byte count into a human-readable string.
 *
 * @example
 * formatBytes(512)        // "512 B"
 * formatBytes(2400)       // "2.3 KB"
 * formatBytes(2500000)    // "2.4 MB"
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
