import type { HTMLAttributes } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BadgeColor =
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "neutral"
  | "primary";

export type BadgeVariant = "subtle" | "solid";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic colour — maps to your theme tokens */
  color?: BadgeColor;
  /** subtle = tinted background, solid = filled background */
  variant?: BadgeVariant;
  /** sm / md / lg */
  size?: BadgeSize;
  /** Show the status dot */
  dot?: boolean;
  /** Text content */
  label: string;
  /** Optional screen reader context e.g. "Payment status: Failed" */
  ariaLabel?: string;
}

// ─── Style maps ───────────────────────────────────────────────────────────────
// These use CSS custom properties from your theme files.
// Never raw hex — always token references.

const colorStyles: Record<BadgeColor, { subtle: string; solid: string; dot: string }> = {
  success: {
    subtle: "bg-(--color-success-50) text-(--color-success-700)",
    solid:  "bg-(--color-success-700) text-white",
    dot:    "bg-(--color-success-500)",
  },
  danger: {
    subtle: "bg-(--color-danger-50) text-(--color-danger-700)",
    solid:  "bg-(--color-danger-700) text-white",
    dot:    "bg-(--color-danger-500)",
  },
  warning: {
    subtle: "bg-(--color-warning-50) text-(--color-warning-700)",
    solid:  "bg-(--color-warning-700) text-white",
    dot:    "bg-(--color-warning-500)",
  },
  info: {
    subtle: "bg-(--color-info-50) text-(--color-info-700)",
    solid:  "bg-(--color-info-700) text-white",
    dot:    "bg-(--color-info-500)",
  },
  neutral: {
    subtle: "bg-(--color-neutral-100) text-(--color-neutral-600)",
    solid:  "bg-(--color-neutral-600) text-white",
    dot:    "bg-(--color-neutral-400)",
  },
  primary: {
    subtle: "bg-(--color-primary-subtle) text-(--color-primary-text)",
    solid:  "bg-(--color-primary-hover) text-white",
    dot:    "bg-(--color-primary)",
  },
};

const sizeStyles: Record<BadgeSize, { badge: string; dot: string }> = {
  sm: { badge: "px-1.5 py-0.5 text-[11px] gap-1",    dot: "w-1.5 h-1.5" },
  md: { badge: "px-2.5 py-1 text-xs gap-1.5",        dot: "w-1.5 h-1.5" },
  lg: { badge: "px-3 py-1 text-[13px] gap-2",        dot: "w-2 h-2"     },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Badge({
  color = "neutral",
  variant = "subtle",
  size = "md",
  dot = false,
  label,
  ariaLabel,
  className = "",
  ...props
}: BadgeProps) {
  const colors = colorStyles[color];
  const sizes  = sizeStyles[size];

  return (
    <span
      aria-label={ariaLabel}
      className={[
        // Base styles
        "inline-flex items-center font-medium rounded-full leading-none",
        // Size
        sizes.badge,
        // Colour + variant
        variant === "subtle" ? colors.subtle : colors.solid,
        className,
      ].join(" ")}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"  // dot is decorative — screen readers skip it
          className={[
            "rounded-full shrink-0",
            sizes.dot,
            // Solid variant needs white dot, subtle needs coloured dot
            variant === "solid" ? "bg-white/70" : colors.dot,
          ].join(" ")}
        />
      )}
      {label}
    </span>
  );
}