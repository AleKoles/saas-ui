import { type ButtonHTMLAttributes, type ComponentType } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = "solid" | "outline" | "ghost";
export type ButtonSize    = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  /** Lucide icon component — renders trailing (right of text) */
  icon?:     ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>;
  /** Replace content with a spinner — use while async action is in progress */
  loading?:  boolean;
  /** Full width */
  block?:    boolean;
}

// ─── Size styles ──────────────────────────────────────────────────────────────

const sizeStyles: Record<ButtonSize, { button: string; iconSize: number }> = {
  sm: { button: "px-3 py-1.5 text-[length:var(--text-xs)] gap-1.5",  iconSize: 13 },
  md: { button: "px-4 py-2   text-[length:var(--text-base)] gap-2",  iconSize: 15 },
  lg: { button: "px-6 py-3   text-[length:var(--text-base)] gap-2",  iconSize: 15 },
};

// ─── Variant styles ───────────────────────────────────────────────────────────
// All use CSS custom properties so they update automatically per theme.

const variantStyles: Record<ButtonVariant, string> = {
  solid: [
    "bg-(--color-primary) text-(--color-primary-text-on-primary)",
    "border border-(--color-primary)",
    "hover:bg-(--color-primary-hover) hover:border-(--color-primary-hover)",
    "disabled:bg-(--color-neutral-200) disabled:text-(--color-neutral-400) disabled:border-(--color-neutral-200)",
  ].join(" "),

  outline: [
    "bg-transparent text-(--color-primary-outline-text)",
    "border border-(--color-primary-outline-text)",
    "hover:bg-(--color-primary-subtle)",
    "disabled:border-(--color-neutral-200) disabled:text-(--color-neutral-400)",
  ].join(" "),

  ghost: [
    "bg-transparent text-(--color-text-secondary)",
    "border border-transparent",
    "hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary)",
    "disabled:text-(--color-neutral-400)",
  ].join(" "),
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ size }: { size: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}
    >
      <circle
        cx="8" cy="8" r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  variant  = "solid",
  size     = "md",
  icon:    Icon,
  loading  = false,
  block    = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={[
        // Base
        "inline-flex items-center justify-center font-medium leading-none",
        "rounded-(--radius-button)",
        "transition-colors select-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-border-focus)",
        "disabled:cursor-not-allowed disabled:opacity-60",
        // Size
        s.button,
        // Variant
        variantStyles[variant],
        // Block
        block ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
      {loading
        ? <Spinner size={s.iconSize} />
        : Icon
        ? <Icon size={s.iconSize} strokeWidth={1.75} aria-hidden />
        : null
      }
    </button>
  );
}