import { useState } from "react";
import { ArrowRight, CheckCircle, X } from "lucide-react";
import { Button } from "../components/Button";
import { UploadStep } from "./UploadStep";
import { MappingStep } from "./MappingStep";
import { submitUpload } from "../data/submit";
import { fuzzyMatch, type MatchResult } from "../utils/fuzzyMatch";
import { cn } from "../utils/cn";

type Step = 1 | 2 | 3;

export interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
}

const HEADER: Record<
  Step,
  { title: string; subtitle: string; description?: string }
> = {
  1: {
    title: "Upload Files",
    subtitle: "Advanced Bulk Upload",
    description:
      "Description and instructions lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut",
  },
  2: { title: "File Name Mapping", subtitle: "Advanced Bulk Upload" },
  3: { title: "Upload Complete", subtitle: "Advanced Bulk Upload" },
};

export function BulkUploadModal({ open, onClose }: BulkUploadModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [fieldKey, setFieldKey] = useState("");
  const [mappings, setMappings] = useState<Record<string, MatchResult>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAdvance = fieldKey !== "" && files.length > 0;

  // Upload is only enabled when every file has a confirmed single student ID —
  // "none" and "multiple" both require user action before proceeding.
  const allMapped =
    files.length > 0 && files.every((f) => mappings[f.name]?.kind === "match");

  function handleClose() {
    onClose();
    setTimeout(reset, 300);
  }

  function reset() {
    setStep(1);
    setFiles([]);
    setFieldKey("");
    setMappings({});
    setIsSubmitting(false);
  }

  function handleNext() {
    if (!canAdvance) return;
    // Pre-compute all fuzzy matches before transitioning so step 2 renders
    // with mappings already in place — no flash of unmatched rows.
    const precomputed: Record<string, MatchResult> = {};
    for (const file of files) {
      precomputed[file.name] = fuzzyMatch(file.name, fieldKey);
    }
    setMappings(precomputed);
    setStep(2);
  }

  function handleBack() {
    // Clear mappings so they're re-computed fresh if the user changes fieldKey.
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
          // allMapped guarantees kind === "match" here
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

  if (!open) return null;

  const { title, subtitle, description } = HEADER[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative flex flex-col w-full max-w-175 max-h-[90vh]",
          "bg-neutral-100 rounded-[20px] shadow-modal overflow-hidden",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0">
          <div className="flex flex-col gap-0.5">
            <h2
              id="modal-title"
              className="text-[21px] font-semibold text-neutral-0 font-[Nunito_Sans,sans-serif]"
            >
              {title}
            </h2>
            <p className="text-sm font-normal text-neutral-50">{subtitle}</p>
            {description && (
              <p className="text-sm font-normal text-neutral-20">
                {description}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="p-1.5 rounded-md text-neutral-40 hover:bg-neutral-93 active:bg-neutral-90 transition-colors duration-100 cursor-pointer -mt-0.5 -mr-0.5"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="h-px bg-neutral-90 shrink-0" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 1 && (
            <UploadStep
              files={files}
              onFilesChange={setFiles}
              fieldKey={fieldKey}
              onFieldKeyChange={setFieldKey}
            />
          )}
          {step === 2 && (
            <MappingStep
              files={files}
              fieldKey={fieldKey}
              mappings={mappings}
              onMappingsChange={setMappings}
            />
          )}
          {step === 3 && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <CheckCircle
                size={56}
                strokeWidth={1.5}
                className="text-green-50"
              />
              <div className="flex flex-col gap-1">
                <p className="text-[1.125rem] font-semibold text-neutral-0">
                  {files.length} file{files.length !== 1 ? "s" : ""}{" "}
                  successfully uploaded
                </p>
                <p className="text-[0.875rem] text-neutral-50">
                  All files have been matched and submitted.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-neutral-90 shrink-0" />

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <div>
            {step === 1 && (
              <Button
                semantic="neutral"
                hierarchy="tertiary"
                onClick={handleClose}
              >
                Cancel
              </Button>
            )}
            {step === 2 && (
              <Button
                semantic="neutral"
                hierarchy="secondary"
                onClick={handleBack}
              >
                Back
              </Button>
            )}
          </div>

          <div>
            {step === 1 && (
              <Button
                disabled={!canAdvance}
                trailingIcon={<ArrowRight size={16} />}
                onClick={handleNext}
              >
                Next
              </Button>
            )}
            {step === 2 && (
              <Button
                disabled={!allMapped || isSubmitting}
                onClick={handleUpload}
              >
                {isSubmitting ? "Uploading…" : "Upload"}
              </Button>
            )}
            {step === 3 && <Button onClick={handleClose}>Done</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
