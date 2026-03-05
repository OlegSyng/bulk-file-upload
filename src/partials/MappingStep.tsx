import { ArrowRight, AlertTriangle } from "lucide-react";
import { students } from "../data/students";
import { AttachmentRow } from "../components/AttachmentRow";
import { Select } from "../components/Select";
import { formatBytes } from "../utils/formatBytes";
import { type MatchResult } from "../utils/fuzzyMatch";

export interface MappingStepProps {
  files: File[];
  fieldKey: string;
  mappings: Record<string, MatchResult>;
  onMappingsChange: (mappings: Record<string, MatchResult>) => void;
}

/**
 * Build the student option list whose labels reflect the chosen field, so the
 * user can visually confirm the match against what was in the file name.
 */
function buildStudentOptions(fieldKey: string) {
  return students.map((s) => {
    const fieldValue =
      fieldKey === "id"
        ? s.id
        : fieldKey === "studentID"
          ? s.studentID
          : s.name;
    return {
      value: s.id,
      label: `${fieldValue} — ${s.name}`,
    };
  });
}

interface MappingRowProps {
  file: File;
  match: MatchResult;
  fieldKey: string;
  onChange: (studentId: string) => void;
}

function MappingRow({ file, match, fieldKey, onChange }: MappingRowProps) {
  const options = buildStudentOptions(fieldKey);

  // The currently selected value in the <select>
  const selectedValue = match.kind === "match" ? match.studentId : "";

  const isError = match.kind === "none";
  const isMultiple = match.kind === "multiple";

  // When user picks from the select, it always becomes a confirmed single match
  function handleSelect(studentId: string) {
    onChange(studentId);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        {/* File info */}
        <div className="flex-1 min-w-0">
          <AttachmentRow
            fileName={file.name}
            fileSize={formatBytes(file.size)}
          />
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
            value={selectedValue}
            onChange={handleSelect}
            options={options}
            placeholder={isMultiple ? "Multiple Matches" : "No Match Found"}
            error={isError || isMultiple}
          />
        </div>
      </div>

      {/* Multiple matches warning */}
      {isMultiple && (
        <div className="flex items-center gap-1.5 pl-[calc(50%+1.5rem)] text-[0.8125rem] text-(--colors-tones-tertiary-t-40)">
          <AlertTriangle size={14} strokeWidth={1.5} className="shrink-0" />
          <span>
            {match.candidates.length} potential matches — please select manually
          </span>
        </div>
      )}
    </div>
  );
}

export function MappingStep({
  files,
  fieldKey,
  mappings,
  onMappingsChange,
}: MappingStepProps) {
  function handleChange(fileName: string, studentId: string) {
    onMappingsChange({
      ...mappings,
      [fileName]: { kind: "match", studentId },
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Column headers */}
      <div className="flex items-center gap-3 px-1">
        <p className="flex-1 text-[0.875rem] font-semibold text-neutral-50">
          File Name
        </p>
        {/* Spacer matching ArrowRight icon width */}
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
              match={mappings[file.name] ?? { kind: "none" }}
              fieldKey={fieldKey}
              onChange={(id) => handleChange(file.name, id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
