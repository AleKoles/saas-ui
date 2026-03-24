import { useState } from "react";
import { Badge } from "../Badge";
import type { BadgeColor } from "../Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc" | "none";

export interface DataTableColumn<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  data: T[];
  status?: "populated" | "loading" | "empty";
  emptyMessage?: string;
  emptySubMessage?: string;
  skeletonRows?: number;
  ariaLabel?: string;
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ direction, active }: { direction: SortDirection; active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="text-xs ml-1"
      style={{
        color: active ? "var(--color-on-surface)" : "var(--color-on-surface-muted)",
        opacity: active ? 1 : 0.5,
      }}
    >
      {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}
    </span>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow({ columns }: { columns: DataTableColumn<Record<string, unknown>>[] }) {
  return (
    <tr aria-hidden="true">
      {columns.map((col) => (
        <td key={String(col.key)} className="px-4 py-3">
          <div
            className="skeleton-shimmer rounded-(--radius-button)"
            style={{ width: "70%", height: "14px" }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  status = "populated",
  emptyMessage = "No results found",
  emptySubMessage = "Try adjusting your filters",
  skeletonRows = 5,
  ariaLabel = "Data table",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>("name" as keyof T);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : d === "desc" ? "none" : "asc");
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || sortDir === "none") return 0;
    const av = a[sortKey], bv = b[sortKey];
    if (av === bv) return 0;
    const result = av < bv ? -1 : 1;
    return sortDir === "asc" ? result : -result;
  });

  const isLoading = status === "loading";
  const isEmpty   = status === "empty" || (!isLoading && data.length === 0);

  return (
    <div
      className="rounded-(--radius-surface) overflow-hidden border border-(--color-surface-border)"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-sm"
          aria-label={ariaLabel}
          aria-busy={isLoading}
          aria-rowcount={isLoading ? undefined : data.length}
        >
          {/* ── Head ── */}
          <thead>
            <tr style={{ background: "var(--color-surface-raised)" }}>
              {columns.map((col) => {
                const dir: SortDirection = sortKey === col.key ? sortDir : "none";
                return (
                  <th
                    key={String(col.key)}
                    scope="col"
                    style={{ width: col.width }}
                    className="px-4 py-3 text-left"
                    aria-sort={
                      col.sortable
                        ? dir === "asc" ? "ascending"
                        : dir === "desc" ? "descending"
                        : "none"
                        : undefined
                    }
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className={[
                          "inline-flex items-center gap-1",
                          "text-xs font-medium uppercase tracking-wider",
                          "text-(--color-on-surface-muted)",
                          "hover:text-(--color-on-surface)",
                          "transition-colors cursor-pointer",
                          "bg-transparent border-none p-0",
                        ].join(" ")}
                      >
                        {col.label}
                        <SortIcon direction={dir} active={sortKey === col.key} />
                      </button>
                    ) : (
                      <span className="text-xs font-medium uppercase tracking-wider text-(--color-on-surface-muted)">
                        {col.label}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {isLoading && Array.from({ length: skeletonRows }).map((_, i) => (
              <SkeletonRow
                key={i}
                columns={columns as DataTableColumn<Record<string, unknown>>[]}
              />
            ))}

            {isEmpty && !isLoading && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">📭</span>
                    <span className="text-sm font-medium text-(--color-on-surface)">
                      {emptyMessage}
                    </span>
                    <span className="text-xs text-(--color-on-surface-muted)">
                      {emptySubMessage}
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !isEmpty && sortedData.map((row, i) => (
              <tr
                key={i}
                className="border-t border-(--color-surface-border) hover:bg-(--color-surface-raised) transition-colors"
                aria-rowindex={i + 2}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="px-4 py-3 text-(--color-on-surface-muted)"
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      {!isLoading && !isEmpty && (
        <div
          className="px-4 py-2 text-xs text-(--color-on-surface-muted) border-t border-(--color-surface-border)"
          style={{ background: "var(--color-surface-raised)" }}
        >
          {data.length} {data.length === 1 ? "result" : "results"}
        </div>
      )}
    </div>
  );
}

// ─── Badge cell helper ────────────────────────────────────────────────────────

export function StatusBadge({ label, color }: { label: string; color: BadgeColor }) {
  return <Badge label={label} color={color} variant="solid" size="sm" dot />;
}