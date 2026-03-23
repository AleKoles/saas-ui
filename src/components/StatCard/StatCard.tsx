import { useEffect, useRef } from "react";
import { Badge } from "../Badge";
import type { BadgeColor } from "../Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatCardStatus = "active" | "loading" | "empty";

export interface StatCardProps {
  label: string;
  value?: string;
  trend?: string;
  trendDirection?: "positive" | "negative" | "neutral";
  status?: StatCardStatus;
  badgeLabel?: string;
  badgeColor?: BadgeColor;
  className?: string;
}

// ─── Skeleton bar ─────────────────────────────────────────────────────────────

function SkeletonBar({
  width = "100%",
  height = "12px",
}: {
  width?: string;
  height?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{ width, height }}
      className="rounded-(--radius-sm) skeleton-shimmer"
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  trend,
  trendDirection = "neutral",
  status = "active",
  badgeLabel,
  badgeColor = "success",
  className = "",
}: StatCardProps) {
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveRef.current && value) {
      liveRef.current.textContent = `${label}: ${value}`;
    }
  }, [value, label]);

  const isLoading = status === "loading";
  const isEmpty = status === "empty";

  const trendColor = isEmpty
    ? "text-(--color-on-surface-muted)"
    : trendDirection === "positive"
      ? "text-(--color-success-on-surface)"
      : trendDirection === "negative"
        ? "text-(--color-danger-on-surface)"
        : "text-(--color-on-surface-muted)";

  return (
    <div
      role="article"
      aria-busy={isLoading}
      aria-label={`${label} stat card`}
      className={[
        // Spacing tokens via Tailwind utilities
        // p-5  → var(--spacing-5)  = 20px
        // gap-3 → var(--spacing-3) = 12px
        "p-5 flex flex-col gap-3",
        // Radius token
        "rounded-(--radius-xl)",
        // Colour tokens
        "bg-(--color-surface) border border-(--color-surface-border)",
        className,
      ].join(" ")}
    >
      {/* Hidden live region */}
      <div
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* ── Header row ── */}
      <div className="flex items-center justify-between gap-2">
        {isLoading ? (
          <SkeletonBar width="55%" height="14px" />
        ) : (
          <span className="text-[length:var(--text-sm)] font-normal text-(--color-on-surface-muted)">
            {label}
          </span>
        )}
        {badgeLabel && !isLoading && !isEmpty && (
          <Badge
            label={badgeLabel}
            color={badgeColor}
            variant="solid"
            size="md"
            ariaLabel={`Status: ${badgeLabel}`}
          />
        )}
      </div>

      {/* ── Value ── */}
      {isLoading ? (
        <SkeletonBar width="70%" height="32px" />
      ) : isEmpty ? (
        <span className="text-[length:var(--text-2xl)] font-semibold text-(--color-on-surface-muted)">
          —
        </span>
      ) : (
        <span className="text-[length:var(--text-2xl)] font-semibold leading-none text-(--color-on-surface)">
          {value}
        </span>
      )}

      {/* ── Trend ── */}
      {isLoading ? (
        <SkeletonBar width="50%" height="12px" />
      ) : (
        <span
          className={`text-[length:var(--text-xs)] font-normal ${trendColor}`}
        >
          {isEmpty ? "No data yet" : trend}
        </span>
      )}
    </div>
  );
}
