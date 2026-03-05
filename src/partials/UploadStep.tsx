import { useState } from "react";
import { Search } from "lucide-react";
import { Select } from "../components/Select";
import { FileDropzone } from "../components/FileDropzone";
import { AttachmentRow } from "../components/AttachmentRow";
import { cn } from "../utils/cn";
import { formatBytes } from "../utils/formatBytes";

/** Fields from the student record that a file name can be mapped to. */
const FIELD_OPTIONS = [
  { value: "studentID", label: "Student ID" },
  { value: "name", label: "Student Name" },
  { value: "grade", label: "Grade" },
];

export interface UploadStepProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  fieldKey: string;
  onFieldKeyChange: (key: string) => void;
}

export function UploadStep({
  files,
  onFilesChange,
  fieldKey,
  onFieldKeyChange,
}: UploadStepProps) {
  const [searchQuery, setSearchQuery] = useState("");

  function handleFilesAdded(incoming: File[]) {
    const existingNames = new Set(files.map((f) => f.name));
    const deduplicated = incoming.filter((f) => !existingNames.has(f.name));
    onFilesChange([...files, ...deduplicated]);
  }

  function handleRemove(fileName: string) {
    onFilesChange(files.filter((f) => f.name !== fileName));
  }

  const filteredFiles = searchQuery.trim()
    ? files.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : files;

  return (
    <div className="flex flex-col gap-6">
      {/* Field mapping select */}
      <Select
        label="Map File Name to Field"
        value={fieldKey}
        onChange={onFieldKeyChange}
        options={FIELD_OPTIONS}
        placeholder="Select"
      />

      {/* Dropzone */}
      <FileDropzone onFilesAdded={handleFilesAdded} />

      {/* File list */}
      <div className="flex flex-col gap-3">
        {/* Header row: label + search */}
        <div className="space-y-2">
          <p className="text-[1rem] font-semibold leading-5 text-neutral-20 shrink-0">
            Files ({files.length})
          </p>

          {/* Search input */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-50 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className={cn(
                "w-full h-10 pl-9 pr-3 rounded-lg border-2 border-neutral-90 bg-neutral-100",
                "text-[0.875rem] text-neutral-0 placeholder:text-neutral-50",
                "outline-none focus:border-primary-70 transition-colors duration-100",
              )}
            />
          </div>
        </div>

        {/* Scrollable file list */}
        {files.length > 0 && (
          <ul className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1">
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file) => (
                <li key={file.name}>
                  <AttachmentRow
                    fileName={file.name}
                    fileSize={formatBytes(file.size)}
                    onRemove={() => handleRemove(file.name)}
                  />
                </li>
              ))
            ) : (
              <li className="py-4 text-center text-[0.875rem] text-neutral-50">
                No files match "{searchQuery}"
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
