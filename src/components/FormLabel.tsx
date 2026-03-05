import React from "react";
import { cn } from "../utils/cn";

export interface FormLabelProps {
  htmlFor?: string;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormLabel({
  htmlFor,
  optional = false,
  children,
  className = "",
}: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "inline-flex items-center gap-1.5",
        "text-[1rem] font-semibold leading-5 text-neutral-20",
        className,
      )}
    >
      {children}
      {optional && (
        <span className="text-[0.875rem] font-normal text-neutral-40">
          (Optional)
        </span>
      )}
    </label>
  );
}
