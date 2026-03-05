import { File, Download, MoreVertical, X } from "lucide-react";
import { cn } from "../utils/cn";

export interface AttachmentRowProps {
  fileName: string;
  fileSize: string;
  onRemove?: () => void;
  onDownload?: () => void;
  showMenu?: boolean;
  className?: string;
}

export function AttachmentRow({
  fileName,
  fileSize,
  onRemove,
  onDownload,
  showMenu = false,
  className,
}: AttachmentRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg bg-neutral-100",
        className,
      )}
    >
      {/* File icon avatar */}
      <div className="shrink-0 w-10 h-10 rounded-md bg-secondary-90 flex items-center justify-center">
        <File size={20} strokeWidth={1.5} className="text-secondary-40" />
      </div>

      {/* Name + size */}
      <div className="flex-1 min-w-0">
        <p className="text-[1rem] font-semibold leading-5 text-neutral-0 truncate">
          {fileName}
        </p>
        <p className="text-[0.875rem] font-normal leading-5 text-neutral-40">
          {fileSize}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-0.5 shrink-0">
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            aria-label="Download file"
            className="p-2 rounded-md text-neutral-40 hover:bg-neutral-93 active:bg-neutral-90 transition-colors duration-100 cursor-pointer"
          >
            <Download size={18} strokeWidth={1.5} />
          </button>
        )}
        {showMenu && (
          <button
            type="button"
            aria-label="More options"
            className="p-2 rounded-md text-neutral-40 hover:bg-neutral-93 active:bg-neutral-90 transition-colors duration-100 cursor-pointer"
          >
            <MoreVertical size={18} strokeWidth={1.5} />
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove file"
            className="p-2 rounded-md text-neutral-40 hover:bg-neutral-93 hover:text-red-50 active:bg-neutral-90 transition-colors duration-100 cursor-pointer"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}
