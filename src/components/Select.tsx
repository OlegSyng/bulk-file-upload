import { useId } from "react";
import { ChevronsUpDown } from "lucide-react";
import { FormLabel } from "./FormLabel";
import { cn } from "../utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** Label rendered above the select. Omit or pass an empty string to hide the label entirely. */
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  error = false,
  disabled = false,
  id: externalId,
  className = "",
}: SelectProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  const borderClass = error
    ? "border-red-60 focus:border-red-60"
    : "border-neutral-90 focus:border-primary-70";

  const textClass = value === "" ? "text-neutral-50" : "text-neutral-0";

  const chevronColor = error ? "text-red-60" : "text-neutral-40";

  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      {label && <FormLabel htmlFor={id}>{label}</FormLabel>}

      <div className="relative w-full">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full h-12 pl-3 pr-10 appearance-none rounded-lg border-2 bg-neutral-100 outline-none transition-colors duration-100",
            "text-[1rem] font-normal leading-6",
            "disabled:bg-neutral-99 disabled:text-neutral-50 disabled:cursor-not-allowed",
            borderClass,
            textClass,
          )}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2",
            chevronColor,
          )}
          aria-hidden
        >
          <ChevronsUpDown size={20} strokeWidth={2} />
        </span>
      </div>

      {error && (
        <p className="text-[0.875rem] text-red-60 leading-5">
          No match found
        </p>
      )}
    </div>
  );
}
