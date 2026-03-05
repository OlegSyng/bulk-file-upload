import { useRef, useState } from "react";
import { CloudUpload } from "lucide-react";
import { cn } from "../utils/cn";

export interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export function FileDropzone({
  onFilesAdded,
  accept,
  multiple = true,
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    onFilesAdded(Array.from(fileList));
  }

  function handleClick() {
    inputRef.current?.click();
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    // Reset input so the same file can be re-added after removal
    e.target.value = "";
  }

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleInputChange}
        aria-hidden
        tabIndex={-1}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label="File upload area. Click or drag files here."
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-4",
          "w-full px-6 py-8 rounded-xl border-2 border-dashed",
          "cursor-pointer select-none transition-colors duration-150 outline-none",
          "focus-visible:ring-2 focus-visible:ring-primary-70 focus-visible:ring-offset-2",
          isDraggingOver
            ? "border-primary-70 bg-primary-99"
            : "border-neutral-80 bg-neutral-99 hover:border-neutral-70 hover:bg-neutral-97",
        )}
      >
        <CloudUpload
          size={40}
          strokeWidth={1.5}
          className={cn(isDraggingOver ? "text-primary-50" : "text-neutral-20")}
        />

        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-[1rem] font-semibold leading-5 text-neutral-20">
            File Upload
          </p>
          <p className="text-[0.875rem] font-normal leading-5 text-neutral-40">
            Drag &amp; drop your files here or click to browse
          </p>
        </div>
      </div>
    </div>
  );
}
