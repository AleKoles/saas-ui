import { useEffect, useRef } from "react";
import { Badge } from "../Badge";
import type { BadgeColor } from "../Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatCardStatus = "active" | "loading" | "empty";

export interface StatCardProps {
  /** Card label e.g. "Monthly Revenue" */
  label: string;
  /** Main metric value e.g. "€24,300" */
  value?: string;
  /** Trend text e.g. "+12% vs last month" */
  trend?: string;
  /** Positive or negative trend */
  trendDirection?: "positive" | "negative" | "neutral";
  /** Card state */
  status?: StatCardStatus;
  /** Badge label e.g. "Active" */
  badgeLabel?: string;
  /** Badge colour */
  badgeColor?: BadgeColor;
  /** Additional class names */
  className?: string;
}

// ─── Skeleton bar ─────────────────────────────────────────────────────────────

function SkeletonBar({ width = "100%", height = "12px" }: { width?: string; height?: string }) {
  return (
    <div
      aria-hidden="true"
      style={{ width, height }}
      className="rounded skeleton-shimmer"
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

  // Announce live value changes to screen readers
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveRef.current && value) {
      liveRef.current.textContent = `${label}: ${value}`;
    }
  }, [value, label]);

  const isLoading = status === "loading";
  const isEmpty   = status === "empty";

  const trendColor =
    isEmpty ? "text-(--color-on-surface-muted)"
    : trendDirection === "positive" ? "text-(--color-success-on-surface)"
    : trendDirection === "negative" ? "text-(--color-danger-on-surface)"
    : "text-(--color-on-surface-muted)";

  return (
    <div
      className={[
        "rounded-xl p-5 flex flex-col gap-3",
        "bg-(--color-surface) border border-(--color-surface-border)",
        className,
      ].join(" ")}
      // Tell screen readers this region updates live
      role="article"
      aria-busy={isLoading}
      aria-label={`${label} stat card`}
    >
      {/* Hidden live region — announces value changes to screen readers */}
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
          <span className="text-sm font-normal text-(--color-on-surface-muted)">
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
        <span className="text-2xl font-semibold text-(--color-on-surface-muted)">
          —
        </span>
      ) : (
        <span className="text-[28px] font-semibold leading-none text-(--color-on-surface)">
          {value}
        </span>
      )}

      {/* ── Trend ── */}
      {isLoading ? (
        <SkeletonBar width="50%" height="12px" />
      ) : (
        <span className={`text-xs font-normal ${trendColor}`}>
          {isEmpty ? "No data yet" : trend}
        </span>
      )}
    </div>
  );
}