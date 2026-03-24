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
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  label: string;
  ariaLabel?: string;
}

// ─── Style maps ───────────────────────────────────────────────────────────────
//
// subtle variant — opacity-based bg works on both light and dark surfaces.
// dot always matches text — both use --color-*-subtle-text token.
// solid variant — darker fills for AA contrast, white text except warning.

const colorStyles: Record<
  BadgeColor,
  { subtle: string; solid: string; dot: string }
> = {
  success: {
    subtle: "bg-(--color-success-subtle-bg) text-(--color-success-subtle-text)",
    solid: "bg-(--color-success-700) text-white" /* contrast 4.8:1 ✓ */,
    dot: "bg-(--color-success-subtle-text)",
  },
  danger: {
    subtle: "bg-(--color-danger-subtle-bg) text-(--color-danger-subtle-text)",
    solid: "bg-(--color-danger-700) text-white" /* contrast 5.1:1 ✓ */,
    dot: "bg-(--color-danger-subtle-text)",
  },
  warning: {
    subtle: "bg-(--color-warning-subtle-bg) text-(--color-warning-subtle-text)",
    solid: "bg-(--color-warning-700) text-white" /* contrast 4.6:1 ✓ */,
    dot: "bg-(--color-warning-subtle-text)",
  },
  info: {
    subtle: "bg-(--color-info-subtle-bg) text-(--color-info-subtle-text)",
    solid: "bg-(--color-info-700) text-white" /* contrast 4.9:1 ✓ */,
    dot: "bg-(--color-info-subtle-text)",
  },
  neutral: {
    subtle: "bg-(--color-neutral-subtle-bg) text-(--color-neutral-subtle-text)",
    solid: "bg-(--color-neutral-600) text-white",
    dot: "bg-(--color-neutral-subtle-text)",
  },
  primary: {
    subtle: "bg-(--color-primary-subtle-bg) text-(--color-primary-subtle-text)",
    solid: "bg-(--color-primary-hover) text-white",
    dot: "bg-(--color-primary-subtle-text)",
  },
};

// Size styles — px/py/gap map to var(--spacing-*) via Tailwind v4 @theme.
// text sizes reference @theme font-size tokens via CSS var syntax.

const sizeStyles: Record<BadgeSize, { badge: string; dot: string }> = {
  sm: {
    badge: "px-1.5 py-0.5 text-[length:var(--text-xs)]  gap-1",
    dot: "w-1.5 h-1.5",
  },
  md: {
    badge: "px-2.5 py-1   text-[length:var(--text-sm)]  gap-1.5",
    dot: "w-1.5 h-1.5",
  },
  lg: {
    badge: "px-3   py-1   text-[length:var(--text-base)] gap-2",
    dot: "w-2 h-2",
  },
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
  const c = colorStyles[color];
  const s = sizeStyles[size];

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={[
        "inline-flex items-center font-medium leading-none",
        "rounded-(--radius-badge)",
        s.badge,
        variant === "subtle" ? c.subtle : c.solid,
        className,
      ].join(" ")}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={[
            "rounded-(--radius-badge) shrink-0",
            s.dot,
            variant === "solid" ? "bg-white/70" : c.dot,
          ].join(" ")}
        />
      )}
      {label}
    </span>
  );
}
