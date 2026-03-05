import { createContext, useContext, useState, type ReactNode } from "react";
import { fuzzyMatch, type MatchResult } from "../utils/fuzzyMatch";
import { submitUpload } from "../data/submit";

type Step = 1 | 2 | 3;

interface BulkUploadContextValue {
  // State
  step: Step;
  files: File[];
  fieldKey: string;
  mappings: Record<string, MatchResult>;
  isSubmitting: boolean;

  // Derived
  canAdvance: boolean;
  allMapped: boolean;

  // Actions
  setFiles: (files: File[]) => void;
  setFieldKey: (key: string) => void;
  setMappings: (mappings: Record<string, MatchResult>) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleUpload: () => Promise<void>;
  handleClose: () => void;
}

const BulkUploadContext = createContext<BulkUploadContextValue | null>(null);

export function useBulkUpload(): BulkUploadContextValue {
  const ctx = useContext(BulkUploadContext);
  if (!ctx) throw new Error("useBulkUpload must be used within BulkUploadProvider");
  return ctx;
}

interface BulkUploadProviderProps {
  onClose: () => void;
  children: ReactNode;
}

export function BulkUploadProvider({ onClose, children }: BulkUploadProviderProps) {
  const [step, setStep] = useState<Step>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [fieldKey, setFieldKey] = useState("");
  const [mappings, setMappings] = useState<Record<string, MatchResult>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAdvance = fieldKey !== "" && files.length > 0;
  const allMapped = files.length > 0 && files.every((f) => mappings[f.name]?.kind === "match");

  function reset() {
    setStep(1);
    setFiles([]);
    setFieldKey("");
    setMappings({});
    setIsSubmitting(false);
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 300);
  }

  function handleNext() {
    if (!canAdvance) return;
    const precomputed: Record<string, MatchResult> = {};
    for (const file of files) {
      precomputed[file.name] = fuzzyMatch(file.name, fieldKey);
    }
    setMappings(precomputed);
    setStep(2);
  }

  function handleBack() {
    setMappings({});
    setStep(1);
  }

  async function handleUpload() {
    if (!allMapped || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitUpload({
        fieldKey,
        mappings: files.map((f) => {
          const m = mappings[f.name];
          return {
            fileName: f.name,
            studentId: m.kind === "match" ? m.studentId : "",
          };
        }),
      });
      setStep(3);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <BulkUploadContext.Provider
      value={{
        step,
        files,
        fieldKey,
        mappings,
        isSubmitting,
        canAdvance,
        allMapped,
        setFiles,
        setFieldKey,
        setMappings,
        handleNext,
        handleBack,
        handleUpload,
        handleClose,
      }}
    >
      {children}
    </BulkUploadContext.Provider>
  );
}
