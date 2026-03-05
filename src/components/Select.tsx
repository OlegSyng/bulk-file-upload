import { useId, useMemo } from "react";
import ReactSelect, { type StylesConfig, type SingleValue } from "react-select";
import { FormLabel } from "./FormLabel";
import { cn } from "../utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** Label rendered above the select. Omit or pass an empty string to hide. */
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

function buildStyles(error: boolean): StylesConfig<SelectOption, false> {
  const borderNormal = "var(--colors-tones-neutral-n-90)";
  const borderError = "var(--colors-tones-red-r-60)";
  const borderFocus = error
    ? "var(--colors-tones-red-r-60)"
    : "var(--colors-tones-primary-p-70)";

  return {
    control: (base, state) => ({
      ...base,
      minHeight: "3rem",
      height: "3rem",
      backgroundColor: "var(--colors-tones-neutral-n-100)",
      borderWidth: 2,
      borderStyle: "solid",
      borderColor: error
        ? borderError
        : state.isFocused
          ? borderFocus
          : borderNormal,
      borderRadius: 8,
      boxShadow: "none",
      outline: "none",
      transition: "border-color 100ms",
      cursor: "pointer",
      "&:hover": {
        borderColor: error
          ? borderError
          : state.isFocused
            ? borderFocus
            : borderNormal,
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 0.5rem 0 0.75rem",
    }),
    singleValue: (base) => ({
      ...base,
      color: "var(--colors-tones-neutral-n-0)",
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: "1.5",
      margin: 0,
    }),
    placeholder: (base) => ({
      ...base,
      color: "var(--colors-tones-neutral-n-50)",
      fontSize: "1rem",
      fontWeight: 400,
      margin: 0,
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: error
        ? "var(--colors-tones-red-r-60)"
        : "var(--colors-tones-neutral-n-40)",
      padding: "0 0.625rem",
      transition: "transform 200ms, color 100ms",
      transform: state.selectProps.menuIsOpen
        ? "rotate(180deg)"
        : "rotate(0deg)",
      "&:hover": {
        color: error
          ? "var(--colors-tones-red-r-60)"
          : "var(--colors-tones-neutral-n-40)",
      },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--colors-tones-neutral-n-100)",
      borderRadius: 8,
      boxShadow:
        "0px 1px 3px rgba(26,28,107,0.14), 0px 6px 12px rgba(26,28,107,0.12)",
      zIndex: 9999,
      overflow: "hidden",
      marginTop: 4,
    }),
    menuList: (base) => ({
      ...base,
      padding: "4px 0",
      maxHeight: 240,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "var(--colors-tones-primary-p-95)"
        : state.isFocused
          ? "var(--colors-tones-neutral-n-97)"
          : "transparent",
      color: state.isSelected
        ? "var(--colors-tones-primary-p-40)"
        : "var(--colors-tones-neutral-n-0)",
      fontSize: "1rem",
      fontWeight: state.isSelected ? 600 : 400,
      padding: "0.5rem 0.75rem",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "var(--colors-tones-neutral-n-95)",
      },
    }),
    input: (base) => ({
      ...base,
      color: "var(--colors-tones-neutral-n-0)",
      fontSize: "1rem",
      margin: 0,
      padding: 0,
    }),
  };
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
  const inputId = externalId ?? generatedId;

  const selected = options.find((o) => o.value === value) ?? null;
  const styles = useMemo(() => buildStyles(error), [error]);

  function handleChange(opt: SingleValue<SelectOption>) {
    onChange(opt?.value ?? "");
  }

  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      {label && <FormLabel htmlFor={inputId}>{label}</FormLabel>}

      <ReactSelect<SelectOption, false>
        inputId={inputId}
        value={selected}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        isDisabled={disabled}
        styles={styles}
        isSearchable
        menuPortalTarget={document.body}
        menuPosition="fixed"
      />
    </div>
  );
}
