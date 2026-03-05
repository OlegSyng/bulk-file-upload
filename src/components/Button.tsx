import React from "react";
import { tv, type VariantProps } from "tailwind-variants";

/**
 * Button variant configuration using `tailwind-variants`.
 *
 * ## Compound variants (semantic × hierarchy)
 * The final color classes are resolved by the combination of both props,
 * matching the design-system token matrix in `theme.css`:
 *
 * | semantic  | hierarchy   | bg (default)   | text            | used for         |
 * |-----------|-------------|----------------|-----------------|------------------|
 * | primary   | primary     | `primary-50`   | `neutral-100`   | Next, Upload     |
 * | neutral   | secondary   | `neutral-95`   | `neutral-20`    | Back             |
 * | neutral   | tertiary    | transparent    | `neutral-20`    | Cancel           |
 *
 * Disabled states are handled via `disabled:` modifiers; hover/active states
 * use `hover:enabled:` / `active:enabled:` so they don't fire when disabled.
 */
const button = tv({
  base: [
    "inline-flex items-center gap-2 rounded-[6px]",
    "px-4 py-[7px] text-[1rem] font-semibold leading-5",
    "transition-colors duration-100 cursor-pointer disabled:cursor-not-allowed",
  ],
  variants: {
    semantic: {
      primary: "",
      neutral: "",
    },
    hierarchy: {
      primary: "",
      secondary: "",
      tertiary: "bg-transparent",
    },
  },
  compoundVariants: [
    // Next, Upload — filled blue
    {
      semantic: "primary",
      hierarchy: "primary",
      class: [
        "bg-primary-50 text-neutral-100",
        "hover:enabled:bg-primary-60",
        "active:enabled:bg-primary-40",
        "disabled:bg-primary-70 disabled:text-neutral-100/80",
      ],
    },
    // Back — tinted neutral
    {
      semantic: "neutral",
      hierarchy: "secondary",
      class: [
        "bg-neutral-95 text-neutral-20",
        "hover:enabled:bg-neutral-90",
        "active:enabled:bg-neutral-80",
        "disabled:bg-neutral-95 disabled:text-neutral-60",
      ],
    },
    // Cancel — ghost
    {
      semantic: "neutral",
      hierarchy: "tertiary",
      class: [
        "text-neutral-20",
        "hover:enabled:bg-neutral-93",
        "active:enabled:bg-neutral-90",
        "disabled:text-neutral-60",
      ],
    },
  ],
  defaultVariants: {
    semantic: "primary",
    hierarchy: "primary",
  },
});

/** Inferred variant prop types derived directly from the `tv()` definition. */
export type ButtonVariants = VariantProps<typeof button>;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  /** Icon rendered to the left of the label. Sized to match the button text. */
  leadingIcon?: React.ReactNode;
  /** Icon rendered to the right of the label. Sized to match the button text. */
  trailingIcon?: React.ReactNode;
}

/**
 * General-purpose button component.
 *
 * @example
 * // Primary action — Next, Upload (filled blue, default)
 * <Button>Upload</Button>
 *
 * @example
 * // With trailing icon
 * <Button trailingIcon={<ArrowRight size={16} />}>Next</Button>
 *
 * @example
 * // Disabled state
 * <Button disabled>Next</Button>
 *
 * @example
 * // Cancel — neutral ghost
 * <Button semantic="neutral" hierarchy="tertiary">Cancel</Button>
 *
 * @example
 * // Back — neutral tinted
 * <Button semantic="neutral" hierarchy="secondary">Back</Button>
 */
export function Button({
  semantic,
  hierarchy,
  leadingIcon,
  trailingIcon,
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={button({ semantic, hierarchy, class: className })}
      {...rest}
    >
      {leadingIcon && (
        <span className="flex items-center">{leadingIcon}</span>
      )}
      {children}
      {trailingIcon && (
        <span className="flex items-center">{trailingIcon}</span>
      )}
    </button>
  );
}
