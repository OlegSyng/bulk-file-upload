import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { students } from "../data/students";
import { AttachmentRow } from "../components/AttachmentRow";
import { Select } from "../components/Select";
import { fuzzyMatch } from "../utils/fuzzyMatch";
import { formatBytes } from "../utils/formatBytes";

export interface MappingStepProps {
  files: File[];
  fieldKey: string;
  mappings: Record<string, string>;
  onMappingsChange: (mappings: Record<string, string>) => void;
}

/**
 * Build the student option list based on which field the user chose to match
 * against. The label shown in the dropdown reflects the chosen field so the
 * user can visually confirm the match.
 */
function buildStudentOptions(fieldKey: string) {
  return students.map((s) => ({
    value: s.id,
    label: fieldKey === "studentID" ? `${s.studentID} — ${s.name}` : s.name,
  }));
}

interface MappingRowProps {
  file: File;
  studentId: string;
  fieldKey: string;
  onChange: (studentId: string) => void;
}

function MappingRow({ file, studentId, fieldKey, onChange }: MappingRowProps) {
  const options = buildStudentOptions(fieldKey);
  const hasError = studentId === "";

  return (
    <div className="flex items-center gap-3">
      {/* File info */}
      <div className="flex-1 min-w-0">
        <AttachmentRow fileName={file.name} fileSize={formatBytes(file.size)} />
      </div>

      {/* Directional arrow */}
      <ArrowRight
        size={18}
        strokeWidth={1.5}
        className="shrink-0 text-neutral-40"
      />

      {/* Student select */}
      <div className="flex-1 min-w-0">
        <Select
          value={studentId}
          onChange={onChange}
          options={options}
          placeholder="No Match Found"
          error={hasError}
        />
      </div>
    </div>
  );
}

export function MappingStep({
  files,
  fieldKey,
  mappings,
  onMappingsChange,
}: MappingStepProps) {
  /**
   * Run fuzzy auto-match whenever files or fieldKey change.
   * - New files (not yet in mappings) always get matched.
   * - When fieldKey changes, all files are re-matched from scratch so the
   *   new field's weighting is applied.
   */
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const file of files) {
      // Always re-run fuzzy match — this covers both new files and fieldKey
      // changes. Manual overrides made by the user are intentionally discarded
      // when the field changes because the old match may no longer be valid
      // under the new field's weighting.
      next[file.name] = fuzzyMatch(file.name, fieldKey);
    }
    onMappingsChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, fieldKey]);

  function handleChange(fileName: string, studentId: string) {
    onMappingsChange({ ...mappings, [fileName]: studentId });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Column headers */}
      <div className="flex items-center gap-3 px-1">
        <p className="flex-1 text-[0.875rem] font-semibold text-neutral-50">
          File Name
        </p>
        {/* Spacer matching the ArrowRight icon width */}
        <div className="w-4.5 shrink-0" aria-hidden />
        <p className="flex-1 text-[0.875rem] font-semibold text-neutral-50">
          Mapped to
        </p>
      </div>

      {/* Scrollable rows */}
      <ul className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
        {files.map((file) => (
          <li key={file.name}>
            <MappingRow
              file={file}
              studentId={mappings[file.name] ?? ""}
              fieldKey={fieldKey}
              onChange={(id) => handleChange(file.name, id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
