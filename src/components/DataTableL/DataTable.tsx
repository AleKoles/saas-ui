import {
    useState, useRef, useCallback, useId,
    type ReactNode, type KeyboardEvent, type DragEvent,
  } from "react";
  import { Badge } from "../Badge";
  import type { BadgeColor } from "../Badge";
  
  // ─── Types ────────────────────────────────────────────────────────────────────
  
  export type SortDirection = "asc" | "desc" | "none";
  
  export type FilterTab<T> = {
    /** Tab label e.g. "All (43)" */
    label: string;
    /** Filter predicate — return true to include the row */
    filter: (row: T) => boolean;
  };
  
  export interface DataTableColumn<T> {
    key:       keyof T & string;
    label:     string;
    sortable?: boolean;
    /** Allow inline editing on this column */
    editable?: boolean;
    /** Custom cell renderer */
    render?:   (value: T[keyof T], row: T) => ReactNode;
    width?:    string;
    /** Truncate long text with ellipsis + click-to-expand */
    truncate?: boolean;
  }
  
  export interface DataTableProps<T extends Record<string, unknown>> {
    columns:         DataTableColumn<T>[];
    data:            T[];
    status?:         "populated" | "loading" | "empty";
    /** Filter tabs above the table e.g. All / In Transit */
    tabs?:           FilterTab<T>[];
    /** Controlled search query */
    searchQuery?:    string;
    /** Placeholder for the built-in search input */
    searchPlaceholder?: string;
    /** Primary action button label + handler */
    primaryAction?:  { label: string; onClick: () => void };
    emptyMessage?:   string;
    emptySubMessage?: string;
    skeletonRows?:   number;
    /** Page sizes available in the footer selector */
    pageSizes?:      number[];
    /** Allow drag-and-drop row reordering */
    draggable?:      boolean;
    /** Row selection — passes selected row indices up */
    onSelectionChange?: (selectedIndices: number[]) => void;
    /** Inline cell edit callback */
    onCellEdit?: (rowIndex: number, key: keyof T, value: string) => void;
    ariaLabel?:  string;
  }
  
  // ─── Sort icon ────────────────────────────────────────────────────────────────
  
  function SortIcon({ dir, active }: { dir: SortDirection; active: boolean }) {
    return (
      <svg
        aria-hidden="true"
        width="10" height="12"
        viewBox="0 0 10 12"
        style={{
          marginLeft: 4,
          opacity: active ? 1 : 0.4,
          color: active ? "var(--color-on-surface)" : "var(--color-on-surface-muted)",
          flexShrink: 0,
        }}
      >
        <path
          d="M5 1L2 4h6L5 1z"
          fill={dir === "asc" && active ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth="1.2"
        />
        <path
          d="M5 11L2 8h6L5 11z"
          fill={dir === "desc" && active ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth="1.2"
        />
      </svg>
    );
  }
  
  // ─── Skeleton row ─────────────────────────────────────────────────────────────
  
  function SkeletonRow({ colCount }: { colCount: number }) {
    return (
      <tr aria-hidden="true">
        {/* checkbox placeholder */}
        <td className="px-4 py-3 w-10">
          <div className="skeleton-shimmer rounded-(--radius-button)" style={{ width: 14, height: 14 }} />
        </td>
        {Array.from({ length: colCount }).map((_, i) => (
          <td key={i} className="px-4 py-3">
            <div
              className="skeleton-shimmer rounded-(--radius-button)"
              style={{ width: `${55 + (i % 3) * 15}%`, height: 14 }}
            />
          </td>
        ))}
        {/* actions placeholder */}
        <td className="px-4 py-3 w-12">
          <div className="skeleton-shimmer rounded-(--radius-button)" style={{ width: 20, height: 14 }} />
        </td>
      </tr>
    );
  }
  
  // ─── Editable cell ────────────────────────────────────────────────────────────
  
  function EditableCell({
    value, onCommit,
  }: { value: string; onCommit: (v: string) => void }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft]     = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
  
    const open = () => {
      setDraft(value);
      setEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    };
  
    const commit = () => {
      setEditing(false);
      if (draft !== value) onCommit(draft);
    };
  
    const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") commit();
      if (e.key === "Escape") { setEditing(false); setDraft(value); }
    };
  
    if (editing) {
      return (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onKey}
          className="w-full px-1 py-0.5 text-sm rounded-(--radius-button)"
          style={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border-focus)",
            color: "var(--color-on-surface)",
            outline: "none",
          }}
        />
      );
    }
  
    return (
      <button
        onClick={open}
        title="Click to edit"
        className="text-left w-full group"
        style={{ background: "none", border: "none", padding: 0, cursor: "text", color: "inherit" }}
      >
        <span style={{ borderBottom: "1px dashed var(--color-surface-border)" }}>
          {value}
        </span>
      </button>
    );
  }
  
  // ─── Truncated cell ───────────────────────────────────────────────────────────
  
  function TruncatedCell({ value }: { value: string }) {
    const [expanded, setExpanded] = useState(false);
    return (
      <button
        onClick={() => setExpanded(e => !e)}
        title={expanded ? "Collapse" : "Click to expand"}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", textAlign: "left", width: "100%" }}
      >
        <span style={expanded ? {} : {
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: 200,
        }}>
          {value}
        </span>
      </button>
    );
  }
  
  // ─── Main component ───────────────────────────────────────────────────────────
  
  export function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    status          = "populated",
    tabs,
    searchQuery:    externalSearch,
    searchPlaceholder = "Search…",
    primaryAction,
    emptyMessage    = "No results found",
    emptySubMessage = "Try adjusting your filters",
    skeletonRows    = 8,
    pageSizes       = [10, 25, 50, 100],
    draggable       = false,
    onSelectionChange,
    onCellEdit,
    ariaLabel       = "Data table",
  }: DataTableProps<T>) {
    const uid = useId();
  
    // ── State ──
    const [activeTab,    setActiveTab]    = useState(0);
    const [internalSearch, setSearch]     = useState("");
    const [sortKey,      setSortKey]      = useState<keyof T | null>(null);
    const [sortDir,      setSortDir]      = useState<SortDirection>("none");
    const [pageSize,     setPageSize]     = useState(pageSizes[0]);
    const [page,         setPage]         = useState(1);
    const [selected,     setSelected]     = useState<Set<number>>(new Set());
    const [rows,         setRows]         = useState<T[]>(data);
    const [filterOpen,   setFilterOpen]   = useState(false);
  
    // drag state
    const dragSrc = useRef<number | null>(null);
  
    const search = externalSearch ?? internalSearch;
  
    // ── Filter pipeline ──
    const tabFiltered = tabs?.length
      ? rows.filter(tabs[activeTab].filter)
      : rows;
  
    const searched = search.trim()
      ? tabFiltered.filter(row =>
          Object.values(row).some(v =>
            String(v ?? "").toLowerCase().includes(search.toLowerCase())
          )
        )
      : tabFiltered;
  
    const sorted = [...searched].sort((a, b) => {
      if (!sortKey || sortDir === "none") return 0;
      const av = a[sortKey], bv = b[sortKey];
      if (av === bv) return 0;
      return (av < bv ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
    });
  
    const totalPages  = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage    = Math.min(page, totalPages);
    const paged       = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  
    // ── Sort handler ──
    const handleSort = (key: keyof T) => {
      if (sortKey === key) {
        const next: SortDirection = sortDir === "none" ? "asc" : sortDir === "asc" ? "desc" : "none";
        setSortDir(next);
        if (next === "none") setSortKey(null);
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
      setPage(1);
    };
  
    // ── Selection ──
    const toggleRow = useCallback((idx: number) => {
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(idx)) { next.delete(idx); } else { next.add(idx); }
        onSelectionChange?.([...next]);
        return next;
      });
    }, [onSelectionChange]);
  
    const toggleAll = useCallback(() => {
      const allIdxs = paged.map((_, i) => (safePage - 1) * pageSize + i);
      const allSelected = allIdxs.every(i => selected.has(i));
      const next = new Set(selected);
      allIdxs.forEach(i => allSelected ? next.delete(i) : next.add(i));
      setSelected(next);
      onSelectionChange?.([...next]);
    }, [paged, safePage, pageSize, selected, onSelectionChange]);
  
    // ── Drag & drop ──
    const onDragStart = (e: DragEvent, i: number) => {
      dragSrc.current = i;
      e.dataTransfer.effectAllowed = "move";
    };
    const onDragOver = (e: DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
    const onDrop = (e: DragEvent, target: number) => {
      e.preventDefault();
      if (dragSrc.current === null || dragSrc.current === target) return;
      const next = [...rows];
      const [removed] = next.splice(dragSrc.current, 1);
      next.splice(target, 0, removed);
      setRows(next);
      dragSrc.current = null;
    };
  
    // ── Edit ──
    const handleEdit = (rowIdx: number, key: keyof T, value: string) => {
      const absIdx = (safePage - 1) * pageSize + rowIdx;
      const next = [...rows];
      next[absIdx] = { ...next[absIdx], [key]: value };
      setRows(next);
      onCellEdit?.(absIdx, key, value);
    };
  
    const isLoading = status === "loading";
    const isEmpty   = status === "empty" || (!isLoading && data.length === 0);
  
    const allPageSelected = paged.length > 0 &&
      paged.every((_, i) => selected.has((safePage - 1) * pageSize + i));
  
    // ── Render ──
    return (
      <div
        className="rounded-(--radius-surface) overflow-hidden border border-(--color-surface-border) flex flex-col"
        style={{ background: "var(--color-surface)" }}
      >
        {/* ── Toolbar ── */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-(--color-surface-border) flex-wrap"
          style={{ background: "var(--color-surface-raised)" }}
        >
          {/* Tabs */}
          {tabs && tabs.length > 0 && (
            <div className="flex items-center gap-1 mr-2">
              {tabs.map((t, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveTab(i); setPage(1); }}
                  className="px-3 py-1 text-xs font-medium rounded-(--radius-full) transition-colors"
                  style={{
                    background: activeTab === i ? "var(--color-primary)" : "transparent",
                    color: activeTab === i ? "var(--color-primary-text-on-primary, white)" : "var(--color-on-surface-muted)",
                    border: activeTab === i ? "none" : "1px solid var(--color-surface-border)",
                    cursor: "pointer",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
  
          {/* Spacer */}
          <div style={{ flex: 1 }} />
  
          {/* Search */}
          {externalSearch === undefined && (
            <div style={{ position: "relative" }}>
              <svg
                aria-hidden="true"
                width="14" height="14"
                viewBox="0 0 16 16"
                style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--color-on-surface-muted)", pointerEvents: "none" }}
              >
                <circle cx="6.5" cy="6.5" r="5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                id={`${uid}-search`}
                type="search"
                value={internalSearch}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder={searchPlaceholder}
                className="text-sm rounded-(--radius-button)"
                style={{
                  paddingLeft: 28, paddingRight: 8, paddingTop: 6, paddingBottom: 6,
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-surface-border)",
                  color: "var(--color-on-surface)",
                  outline: "none",
                  width: 200,
                }}
              />
            </div>
          )}
  
          {/* Filter toggle */}
          <button
            onClick={() => setFilterOpen(o => !o)}
            title="Filter"
            aria-pressed={filterOpen}
            className="p-1.5 rounded-(--radius-button) transition-colors"
            style={{
              background: filterOpen ? "var(--color-primary-subtle)" : "transparent",
              border: "1px solid var(--color-surface-border)",
              color: filterOpen ? "var(--color-primary)" : "var(--color-on-surface-muted)",
              cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round"/>
            </svg>
          </button>
  
          {/* Column sort order indicator */}
          {sortKey && (
            <button
              onClick={() => { setSortKey(null); setSortDir("none"); }}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-(--radius-button)"
              style={{
                background: "var(--color-primary-subtle)",
                color: "var(--color-primary-text)",
                border: "none",
                cursor: "pointer",
              }}
              title="Clear sort"
            >
              {String(sortKey)} {sortDir === "asc" ? "↑" : "↓"} ✕
            </button>
          )}
  
          {/* Primary action */}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="px-3 py-1.5 text-sm font-medium rounded-(--radius-button) transition-colors"
              style={{
                background: "var(--color-primary)",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              {primaryAction.label}
            </button>
          )}
        </div>
  
        {/* ── Scroll container — sticky scrollbars via height constraint ── */}
        <div style={{ position: "relative", flex: 1 }}>
          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: "60vh",           /* vertical scroll stays in viewport */
              scrollbarGutter: "stable",
            }}
          >
            <table
              className="w-full border-collapse text-sm"
              aria-label={ariaLabel}
              aria-busy={isLoading}
              aria-rowcount={isLoading ? undefined : sorted.length}
              style={{ minWidth: 640 }}
            >
              {/* ── Head ── */}
              <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                <tr style={{ background: "var(--color-surface-raised)" }}>
                  {/* Checkbox — sticky left */}
                  <th
                    scope="col"
                    style={{
                      width: 40, minWidth: 40,
                      position: "sticky", left: 0, zIndex: 3,
                      background: "var(--color-surface-raised)",
                      borderRight: "1px solid var(--color-surface-border)",
                    }}
                    className="px-4 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleAll}
                      aria-label="Select all rows on this page"
                      style={{ cursor: "pointer", accentColor: "var(--color-primary)" }}
                    />
                  </th>
  
                  {/* Data columns */}
                  {columns.map(col => {
                    const dir: SortDirection = sortKey === col.key ? sortDir : "none";
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        style={{ width: col.width, minWidth: 100 }}
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
                            className="inline-flex items-center"
                            style={{
                              background: "none", border: "none", padding: 0,
                              cursor: "pointer",
                              fontSize: 11, fontWeight: 500,
                              textTransform: "uppercase", letterSpacing: "0.05em",
                              color: "var(--color-on-surface-muted)",
                            }}
                          >
                            {col.label}
                            <SortIcon dir={dir} active={sortKey === col.key} />
                          </button>
                        ) : (
                          <span style={{
                            fontSize: 11, fontWeight: 500,
                            textTransform: "uppercase", letterSpacing: "0.05em",
                            color: "var(--color-on-surface-muted)",
                          }}>
                            {col.label}
                          </span>
                        )}
                      </th>
                    );
                  })}
  
                  {/* Actions — sticky right */}
                  <th
                    scope="col"
                    style={{
                      width: 48, minWidth: 48,
                      position: "sticky", right: 0, zIndex: 3,
                      background: "var(--color-surface-raised)",
                      borderLeft: "1px solid var(--color-surface-border)",
                      textAlign: "center",
                    }}
                    className="px-4 py-3"
                  >
                    <span style={{
                      fontSize: 11, fontWeight: 500,
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      color: "var(--color-on-surface-muted)",
                    }}>
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
  
              {/* ── Body ── */}
              <tbody>
                {isLoading && Array.from({ length: skeletonRows }).map((_, i) => (
                  <SkeletonRow key={i} colCount={columns.length} />
                ))}
  
                {isEmpty && !isLoading && (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: "var(--color-on-surface-muted)", opacity: 0.4 }}>
                          <rect x="4" y="8" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M4 13h24" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M10 19h4M10 22h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span className="text-sm font-medium text-(--color-on-surface)">{emptyMessage}</span>
                        <span className="text-xs text-(--color-on-surface-muted)">{emptySubMessage}</span>
                      </div>
                    </td>
                  </tr>
                )}
  
                {!isLoading && !isEmpty && paged.map((row, rowIdx) => {
                  const absIdx = (safePage - 1) * pageSize + rowIdx;
                  const isSelected = selected.has(absIdx);
                  return (
                    <tr
                      key={absIdx}
                      aria-rowindex={absIdx + 2}
                      aria-selected={isSelected}
                      draggable={draggable}
                      onDragStart={draggable ? e => onDragStart(e, absIdx) : undefined}
                      onDragOver={draggable ? onDragOver : undefined}
                      onDrop={draggable ? e => onDrop(e, absIdx) : undefined}
                      style={{
                        background: isSelected
                          ? "color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))"
                          : undefined,
                        cursor: draggable ? "grab" : undefined,
                        transition: "background 120ms",
                      }}
                      className="border-t border-(--color-surface-border) hover:bg-(--color-surface-raised)"
                    >
                      {/* Checkbox — sticky left */}
                      <td
                        style={{
                          position: "sticky", left: 0, zIndex: 1,
                          background: isSelected
                            ? "color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))"
                            : "var(--color-surface)",
                          borderRight: "1px solid var(--color-surface-border)",
                          width: 40,
                        }}
                        className="px-4 py-3"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(absIdx)}
                          aria-label={`Select row ${absIdx + 1}`}
                          style={{ cursor: "pointer", accentColor: "var(--color-primary)" }}
                        />
                      </td>
  
                      {/* Data cells */}
                      {columns.map(col => {
                        const raw = row[col.key];
                        const strVal = String(raw ?? "");
                        return (
                          <td
                            key={col.key}
                            className="px-4 py-3 text-(--color-on-surface-muted)"
                            style={{ maxWidth: col.truncate ? 220 : undefined }}
                          >
                            {col.render
                              ? col.render(raw, row)
                              : col.editable
                              ? <EditableCell
                                  value={strVal}
                                  onCommit={v => handleEdit(rowIdx, col.key, v)}
                                />
                              : col.truncate
                              ? <TruncatedCell value={strVal} />
                              : strVal
                            }
                          </td>
                        );
                      })}
  
                      {/* Actions — sticky right */}
                      <td
                        style={{
                          position: "sticky", right: 0, zIndex: 1,
                          background: isSelected
                            ? "color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))"
                            : "var(--color-surface)",
                          borderLeft: "1px solid var(--color-surface-border)",
                          textAlign: "center",
                          width: 48,
                        }}
                        className="px-4 py-3"
                      >
                        <button
                          aria-label={`Actions for row ${absIdx + 1}`}
                          style={{
                            background: "none", border: "none",
                            cursor: "pointer", padding: "0 4px",
                            color: "var(--color-on-surface-muted)",
                            fontSize: 16, lineHeight: 1,
                            borderRadius: "var(--radius-button)",
                          }}
                        >
                          ···
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
  
        {/* ── Footer ── */}
        {!isLoading && !isEmpty && (
          <div
            className="flex items-center justify-between px-4 py-2 border-t border-(--color-surface-border) gap-3 flex-wrap"
            style={{
              background: "var(--color-surface-raised)",
              position: "sticky", bottom: 0, zIndex: 2,  /* always in viewport */
            }}
          >
            {/* Selection count */}
            <span className="text-xs text-(--color-on-surface-muted)" style={{ minWidth: 80 }}>
              {selected.size > 0
                ? `${selected.size} selected`
                : `${sorted.length} ${sorted.length === 1 ? "result" : "results"}`
              }
            </span>
  
            {/* Pagination */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
                className="px-2 py-1 text-xs rounded-(--radius-button) transition-colors"
                style={{
                  background: "none",
                  border: "1px solid var(--color-surface-border)",
                  color: safePage === 1 ? "var(--color-on-surface-muted)" : "var(--color-on-surface)",
                  cursor: safePage === 1 ? "default" : "pointer",
                  opacity: safePage === 1 ? 0.4 : 1,
                }}
              >
                ‹
              </button>
              <span className="text-xs text-(--color-on-surface-muted) px-2">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label="Next page"
                className="px-2 py-1 text-xs rounded-(--radius-button) transition-colors"
                style={{
                  background: "none",
                  border: "1px solid var(--color-surface-border)",
                  color: safePage === totalPages ? "var(--color-on-surface-muted)" : "var(--color-on-surface)",
                  cursor: safePage === totalPages ? "default" : "pointer",
                  opacity: safePage === totalPages ? 0.4 : 1,
                }}
              >
                ›
              </button>
            </div>
  
            {/* Page size */}
            <div className="flex items-center gap-2">
              <label
                htmlFor={`${uid}-pagesize`}
                className="text-xs text-(--color-on-surface-muted)"
              >
                Rows
              </label>
              <select
                id={`${uid}-pagesize`}
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="text-xs rounded-(--radius-button) px-1.5 py-1"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-surface-border)",
                  color: "var(--color-on-surface)",
                  cursor: "pointer",
                }}
              >
                {pageSizes.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // ─── StatusBadge helper ───────────────────────────────────────────────────────
  
  export function StatusBadge({ label, color }: { label: string; color: BadgeColor }) {
    return <Badge label={label} color={color} variant="subtle" size="sm" dot />;
  }