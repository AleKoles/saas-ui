import {
  useState, useRef, useCallback, useId,
  type ReactNode, type KeyboardEvent, type DragEvent,
} from "react";
import { Inbox, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { Button } from "../Button";
import { Badge } from "../Badge";
import type { BadgeColor } from "../Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc" | "none";

export type FilterTab<T> = {
  label:  string;
  filter: (row: T) => boolean;
};

export interface DataTableColumn<T> {
  key:       keyof T & string;
  label:     string;
  sortable?: boolean;
  editable?: boolean;
  render?:   (value: T[keyof T], row: T) => ReactNode;
  width?:    string;
  truncate?: boolean;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns:            DataTableColumn<T>[];
  data:               T[];
  status?:            "populated" | "loading" | "empty";
  tabs?:              FilterTab<T>[];
  searchQuery?:       string;
  searchPlaceholder?: string;
  primaryAction?:     { label: string; onClick: () => void };
  emptyMessage?:      string;
  emptySubMessage?:   string;
  skeletonRows?:      number;
  pageSizes?:         number[];
  draggable?:         boolean;
  selectable?:        boolean;
  onSelectionChange?: (selectedIndices: number[]) => void;
  onCellEdit?:        (rowIndex: number, key: keyof T, value: string) => void;
  ariaLabel?:         string;
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ dir, active }: { dir: SortDirection; active: boolean }) {
  if (active && dir === "asc")  return <ArrowUp   aria-hidden size={11} style={{ marginLeft: 4, color: "var(--color-on-surface)", flexShrink: 0 }} />;
  if (active && dir === "desc") return <ArrowDown aria-hidden size={11} style={{ marginLeft: 4, color: "var(--color-on-surface)", flexShrink: 0 }} />;
  return <ArrowUpDown aria-hidden size={11} style={{ marginLeft: 4, opacity: 0.4, color: "var(--color-on-surface-muted)", flexShrink: 0 }} />;
}

// ─── Drag handle icon ─────────────────────────────────────────────────────────

function GripIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--color-on-surface-muted)", opacity: 0.5 }}>
      <circle cx="4"  cy="3.5"  r="1" fill="currentColor"/>
      <circle cx="4"  cy="7"    r="1" fill="currentColor"/>
      <circle cx="4"  cy="10.5" r="1" fill="currentColor"/>
      <circle cx="10" cy="3.5"  r="1" fill="currentColor"/>
      <circle cx="10" cy="7"    r="1" fill="currentColor"/>
      <circle cx="10" cy="10.5" r="1" fill="currentColor"/>
    </svg>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow({ colCount, draggable, selectable }: { colCount: number; draggable: boolean; selectable: boolean }) {
  return (
    <tr aria-hidden="true">
      {draggable  && <td className="px-2 py-3 w-8"><div className="skeleton-shimmer rounded-(--radius-button)" style={{ width: 14, height: 14 }} /></td>}
      {selectable && <td className="px-4 py-3 w-10"><div className="skeleton-shimmer rounded-(--radius-button)" style={{ width: 14, height: 14 }} /></td>}
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton-shimmer rounded-(--radius-button)" style={{ width: `${55 + (i % 3) * 15}%`, height: 14 }} />
        </td>
      ))}
      <td className="px-4 py-3 w-12">
        <div className="skeleton-shimmer rounded-(--radius-button)" style={{ width: 20, height: 14 }} />
      </td>
    </tr>
  );
}

// ─── Editable cell ────────────────────────────────────────────────────────────

function EditableCell({ value, onCommit }: { value: string; onCommit: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);
  const inputRef              = useRef<HTMLInputElement>(null);

  const open   = () => { setDraft(value); setEditing(true); setTimeout(() => inputRef.current?.focus(), 0); };
  const commit = () => { setEditing(false); if (draft !== value) onCommit(draft); };
  const onKey  = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter")  commit();
    if (e.key === "Escape") { setEditing(false); setDraft(value); }
  };

  if (editing) {
    return (
      <input ref={inputRef} value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit} onKeyDown={onKey}
        className="w-full px-1 py-0.5 text-sm rounded-(--radius-button)"
        style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border-focus)", color: "var(--color-on-surface)", outline: "none" }}
      />
    );
  }
  return (
    <button onClick={open} title="Click to edit"
      style={{ background: "none", border: "none", padding: 0, cursor: "text", color: "inherit", textAlign: "left", width: "100%" }}>
      <span style={{ borderBottom: "1px dashed var(--color-surface-border)" }}>{value}</span>
    </button>
  );
}

// ─── Editable truncated cell ─────────────────────────────────────────────────
// Used for columns with both editable + truncate flags.
// Shows truncated text with expand (ChevronDown) and edit (Pencil) icons.
// Clicking edit opens a textarea showing the full value.

const TRUNCATE_LENGTH = 50;

function EditableTruncatedCell({ value, onCommit }: { value: string; onCommit: (v: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [draft,    setDraft]    = useState(value);
  const textareaRef             = useRef<HTMLTextAreaElement>(null);

  const needsTruncation = value.length > TRUNCATE_LENGTH;
  const displayValue    = expanded ? value : value.slice(0, TRUNCATE_LENGTH) + (needsTruncation ? "…" : "");

  const openEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft(value);
    setEditing(true);
    setTimeout(() => { textareaRef.current?.focus(); textareaRef.current?.select(); }, 0);
  };

  const commit = () => {
    setEditing(false);
    setExpanded(false);
    if (draft !== value) onCommit(draft);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") { setEditing(false); setDraft(value); }
    if (e.key === "Enter" && e.metaKey) commit();
  };

  if (editing) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKey}
          rows={4}
          style={{
            width: "100%", minWidth: 220,
            padding: "6px 8px",
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border-focus)",
            borderRadius: "var(--radius-button)",
            color: "var(--color-on-surface)",
            outline: "none",
            fontSize: 13,
            lineHeight: 1.5,
            resize: "vertical",
          }}
        />
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={commit}
            style={{ fontSize: 11, padding: "2px 8px", cursor: "pointer", background: "var(--color-primary)", color: "var(--color-primary-text-on-primary, white)", border: "none", borderRadius: "var(--radius-button)" }}>
            Save
          </button>
          <button onClick={() => { setEditing(false); setDraft(value); }}
            style={{ fontSize: 11, padding: "2px 8px", cursor: "pointer", background: "transparent", color: "var(--color-on-surface-muted)", border: "1px solid var(--color-surface-border)", borderRadius: "var(--radius-button)" }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 4, minWidth: 180 }}>
      <span style={{ flex: 1, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.4, fontSize: 13, color: "var(--color-on-surface-muted)" }}>
        {displayValue}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
        {needsTruncation && (
          <button onClick={() => setExpanded(e => !e)}
            title={expanded ? "Collapse" : "Read more"}
            aria-label={expanded ? "Collapse note" : "Read full note"}
            style={{ background: "none", border: "none", padding: 2, cursor: "pointer", color: "var(--color-on-surface-muted)", borderRadius: "var(--radius-button)", display: "flex" }}>
            {expanded ? <ChevronUp size={12} aria-hidden /> : <ChevronDown size={12} aria-hidden />}
          </button>
        )}
        <button onClick={openEdit}
          title="Edit note"
          aria-label="Edit note"
          style={{ background: "none", border: "none", padding: 2, cursor: "pointer", color: "var(--color-on-surface-muted)", borderRadius: "var(--radius-button)", display: "flex" }}>
          <Pencil size={12} aria-hidden />
        </button>
      </div>
    </div>
  );
}

// ─── Truncated cell (read-only) ───────────────────────────────────────────────

function TruncatedCell({ value }: { value: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = value.length > TRUNCATE_LENGTH;
  const displayValue    = expanded || !needsTruncation ? value : value.slice(0, TRUNCATE_LENGTH) + "…";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 4, minWidth: 180 }}>
      <span style={{ flex: 1, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.4, fontSize: 13 }}>
        {displayValue}
      </span>
      {needsTruncation && (
        <button onClick={() => setExpanded(e => !e)} title={expanded ? "Collapse" : "Read more"} aria-label={expanded ? "Collapse" : "Read full note"}
          style={{ background: "none", border: "none", padding: 2, cursor: "pointer", color: "var(--color-on-surface-muted)", borderRadius: "var(--radius-button)", display: "flex", flexShrink: 0 }}>
          {expanded ? <ChevronUp size={12} aria-hidden /> : <ChevronDown size={12} aria-hidden />}
        </button>
      )}
    </div>
  );
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  status            = "populated",
  tabs,
  searchQuery:      externalSearch,
  searchPlaceholder = "Search…",
  primaryAction,
  emptyMessage      = "No results found",
  emptySubMessage   = "Try adjusting your filters",
  skeletonRows      = 8,
  pageSizes         = [10, 25, 50, 100],
  draggable         = false,
  selectable        = false,
  onSelectionChange,
  onCellEdit,
  ariaLabel         = "Data table",
}: DataTableProps<T>) {
  const uid = useId();

  const [activeTab,      setActiveTab]      = useState(0);
  const [internalSearch, setSearch]         = useState("");
  const [sortKey,        setSortKey]        = useState<keyof T | null>(null);
  const [sortDir,        setSortDir]        = useState<SortDirection>("none");
  const [pageSize,       setPageSize]       = useState(pageSizes[0]);
  const [page,           setPage]           = useState(1);
  const [selected,       setSelected]       = useState<Set<number>>(new Set());
  const [reorderedRows,  setReorderedRows]  = useState<T[] | null>(null);
  const [filterOpen,     setFilterOpen]     = useState(false);
  const dragSrc = useRef<number | null>(null);

  // Use reordered rows if drag has happened, otherwise fall back to data prop
  // (no useEffect needed — reorderedRows resets to null when data prop identity changes
  //  because the component remounts or parent controls it)
  const rows = reorderedRows ?? data;

  const search      = externalSearch ?? internalSearch;
  const tabFiltered = tabs?.length ? rows.filter(tabs[activeTab].filter) : rows;
  const searched    = search.trim()
    ? tabFiltered.filter(row => Object.values(row).some(v => String(v ?? "").toLowerCase().includes(search.toLowerCase())))
    : tabFiltered;
  const sorted = [...searched].sort((a, b) => {
    if (!sortKey || sortDir === "none") return 0;
    const av = a[sortKey], bv = b[sortKey];
    if (av === bv) return 0;
    return (av < bv ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paged      = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      const next: SortDirection = sortDir === "none" ? "asc" : sortDir === "asc" ? "desc" : "none";
      setSortDir(next);
      if (next === "none") setSortKey(null);
    } else {
      setSortKey(key); setSortDir("asc");
    }
    setPage(1);
  };

  const toggleRow = useCallback((idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) { next.delete(idx); } else { next.add(idx); }
      onSelectionChange?.([...next]);
      return next;
    });
  }, [onSelectionChange]);

  const toggleAll = useCallback(() => {
    const allIdxs     = paged.map((_, i) => (safePage - 1) * pageSize + i);
    const allSelected = allIdxs.every(i => selected.has(i));
    const next        = new Set(selected);
    allIdxs.forEach(i => allSelected ? next.delete(i) : next.add(i));
    setSelected(next);
    onSelectionChange?.([...next]);
  }, [paged, safePage, pageSize, selected, onSelectionChange]);

  const onDragStart = (e: DragEvent, i: number) => { dragSrc.current = i; e.dataTransfer.effectAllowed = "move"; };
  const onDragOver  = (e: DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const onDrop      = (e: DragEvent, target: number) => {
    e.preventDefault();
    if (dragSrc.current === null || dragSrc.current === target) return;
    const next = [...rows];
    const [removed] = next.splice(dragSrc.current, 1);
    next.splice(target, 0, removed);
    setReorderedRows(next);
    dragSrc.current = null;
  };

  const handleEdit = (rowIdx: number, key: keyof T, value: string) => {
    const absIdx = (safePage - 1) * pageSize + rowIdx;
    const next   = [...rows];
    next[absIdx] = { ...next[absIdx], [key]: value };
    setReorderedRows(next);
    onCellEdit?.(absIdx, key, value);
  };

  const isLoading       = status === "loading";
  const isEmpty         = status === "empty" || (!isLoading && data.length === 0);
  const allPageSelected = selectable && paged.length > 0 && paged.every((_, i) => selected.has((safePage - 1) * pageSize + i));
  const surfaceBg       = "var(--color-surface)";
  const raisedBg        = "var(--color-surface-raised)";
  const totalCols       = (draggable ? 1 : 0) + (selectable ? 1 : 0) + columns.length + 1;
  const firstColLeft    = (draggable ? 32 : 0) + (selectable ? 40 : 0);

  const firstColHeadStyle = (bg: string): React.CSSProperties => ({
    position: "sticky", left: firstColLeft, zIndex: 3,
    background: bg, borderRight: "1px solid var(--color-surface-border)",
  });
  const firstColCellStyle = (bg: string): React.CSSProperties => ({
    position: "sticky", left: firstColLeft, zIndex: 1,
    background: bg, borderRight: "1px solid var(--color-surface-border)",
  });

  return (
    <div className="rounded-(--radius-surface) overflow-hidden border border-(--color-surface-border) flex flex-col" style={{ background: surfaceBg }}>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-(--color-surface-border) flex-wrap" style={{ background: raisedBg }}>
        {tabs && tabs.length > 0 && (
          <div className="flex items-center gap-1 mr-2">
            {tabs.map((t, i) => (
              <Button
                key={i}
                size="sm"
                variant={activeTab === i ? "solid" : "outline"}
                onClick={() => { setActiveTab(i); setPage(1); }}
                style={activeTab !== i ? {
                  color: "var(--color-on-surface-muted)",
                  borderColor: "var(--color-surface-border)",
                } : undefined}
              >
                {t.label}
              </Button>
            ))}
          </div>
        )}
        <div style={{ flex: 1 }} />
        {externalSearch === undefined && (
          <div style={{ position: "relative" }}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16"
              style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--color-on-surface-muted)", pointerEvents: "none" }}>
              <circle cx="6.5" cy="6.5" r="5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              id={`${uid}-search`} type="search" value={internalSearch}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={searchPlaceholder}
              className="text-sm rounded-(--radius-button)"
              style={{ paddingLeft: 28, paddingRight: 8, paddingTop: 6, paddingBottom: 6, background: surfaceBg, border: "1px solid var(--color-surface-border)", color: "var(--color-on-surface)", outline: "none", width: 200 }}
            />
          </div>
        )}
        <Button size="sm" variant={filterOpen ? "solid" : "outline"} onClick={() => setFilterOpen((o: boolean) => !o)} aria-pressed={filterOpen} title="Filter"
          style={!filterOpen ? { color: "var(--color-on-surface-muted)", borderColor: "var(--color-surface-border)" } : undefined}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round"/>
          </svg>
        </Button>
        {sortKey && (
          <Button size="sm" variant="outline" onClick={() => { setSortKey(null); setSortDir("none"); }} title="Clear sort"
            style={{ color: "var(--color-on-surface-muted)", borderColor: "var(--color-surface-border)" }}>
            {String(sortKey)} {sortDir === "asc" ? "↑" : "↓"} ✕
          </Button>
        )}
        {primaryAction && (
          <Button size="md" variant="solid" onClick={primaryAction.onClick}>
            {primaryAction.label}
          </Button>
        )}
      </div>

      {/* ── Scroll container ── */}
      <div style={{ position: "relative", flex: 1 }}>
        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "60vh", scrollbarGutter: "stable" }}>
          <table className="w-full border-collapse text-sm" aria-label={ariaLabel} aria-busy={isLoading}
            aria-rowcount={isLoading ? undefined : sorted.length} style={{ minWidth: 640 }}>

            {/* ── Head ── */}
            <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
              <tr style={{ background: raisedBg }}>
                {draggable && (
                  <th scope="col" style={{ width: 32, minWidth: 32, position: "sticky", left: 0, zIndex: 3, background: raisedBg }} className="px-2 py-3" />
                )}
                {selectable && (
                  <th scope="col"
                    style={{ width: 40, minWidth: 40, position: "sticky", left: draggable ? 32 : 0, zIndex: 3, background: raisedBg, borderRight: "1px solid var(--color-surface-border)" }}
                    className="px-4 py-3"
                  >
                    <input type="checkbox" checked={!!allPageSelected} onChange={toggleAll}
                      aria-label="Select all rows on this page"
                      style={{ cursor: "pointer", accentColor: "var(--color-primary)" }} />
                  </th>
                )}
                {columns.map((col, colIdx) => {
                  const dir     = (sortKey === col.key ? sortDir : "none") as SortDirection;
                  const isFirst = colIdx === 0;
                  return (
                    <th key={col.key} scope="col"
                      style={{ width: col.width, minWidth: 100, ...(isFirst ? firstColHeadStyle(raisedBg) : {}) }}
                      className="px-4 py-3 text-left"
                      aria-sort={col.sortable ? dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none" : undefined}
                    >
                      {col.sortable ? (
                        <button onClick={() => handleSort(col.key)} className="inline-flex items-center"
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-on-surface-muted)" }}>
                          {col.label}<SortIcon dir={dir} active={sortKey === col.key} />
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-on-surface-muted)" }}>
                          {col.label}
                        </span>
                      )}
                    </th>
                  );
                })}
                <th scope="col" className="px-4 py-3 text-center" style={{ width: 48, minWidth: 48 }}>
                  <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-on-surface-muted)" }}>Actions</span>
                </th>
              </tr>
            </thead>

            {/* ── Body ── */}
            <tbody>
              {isLoading && Array.from({ length: skeletonRows }).map((_, i) => (
                <SkeletonRow key={i} colCount={columns.length} draggable={draggable} selectable={selectable} />
              ))}

              {isEmpty && !isLoading && (
                <tr>
                  <td colSpan={totalCols} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Inbox aria-hidden size={32} strokeWidth={1.25} style={{ color: "var(--color-on-surface-muted)", opacity: 0.4 }} />
                      <span className="text-sm font-medium text-(--color-on-surface)">{emptyMessage}</span>
                      <span className="text-xs text-(--color-on-surface-muted)">{emptySubMessage}</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !isEmpty && paged.map((row, rowIdx) => {
                const absIdx     = (safePage - 1) * pageSize + rowIdx;
                const isSelected = selectable && selected.has(absIdx);
                const rowBg      = isSelected ? "color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))" : surfaceBg;

                return (
                  <tr key={absIdx} aria-rowindex={absIdx + 2} aria-selected={selectable ? isSelected : undefined}
                    onDragOver={draggable ? onDragOver : undefined}
                    onDrop={draggable ? e => onDrop(e, absIdx) : undefined}
                    style={{ background: isSelected ? rowBg : undefined, transition: "background 120ms" }}
                    className="border-t border-(--color-surface-border) hover:bg-(--color-surface-raised)"
                  >
                    {draggable && (
                      <td draggable onDragStart={e => onDragStart(e, absIdx)}
                        style={{ position: "sticky", left: 0, zIndex: 1, background: rowBg, width: 32, cursor: "grab", userSelect: "none" }}
                        className="px-2 py-3">
                        <GripIcon />
                      </td>
                    )}
                    {selectable && (
                      <td style={{ background: rowBg, borderRight: "1px solid var(--color-surface-border)", width: 40, position: "sticky", left: draggable ? 32 : 0, zIndex: 1 }}
                        className="px-4 py-3">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleRow(absIdx)}
                          aria-label={`Select row ${absIdx + 1}`}
                          style={{ cursor: "pointer", accentColor: "var(--color-primary)" }} />
                      </td>
                    )}
                    {columns.map((col, colIdx) => {
                      const raw     = row[col.key];
                      const strVal  = String(raw ?? "");
                      const isFirst = colIdx === 0;
                      return (
                        <td key={col.key} className="px-4 py-3 text-(--color-on-surface-muted)"
                          style={{
                            whiteSpace: col.truncate ? "normal" : "nowrap",
                            ...(isFirst ? firstColCellStyle(rowBg) : {}),
                          }}>
                          {col.render
                            ? col.render(raw, row)
                            : col.editable && col.truncate
                            ? <EditableTruncatedCell value={strVal} onCommit={v => handleEdit(rowIdx, col.key, v)} />
                            : col.editable
                            ? <EditableCell value={strVal} onCommit={v => handleEdit(rowIdx, col.key, v)} />
                            : col.truncate
                            ? <TruncatedCell value={strVal} />
                            : strVal}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center" style={{ width: 48 }}>
                      <button aria-label={`Actions for row ${absIdx + 1}`}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "0 4px", color: "var(--color-on-surface-muted)", fontSize: 16, lineHeight: 1, borderRadius: "var(--radius-button)" }}>
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
        <div className="flex items-center justify-between px-4 py-2 border-t border-(--color-surface-border) gap-3 flex-wrap"
          style={{ background: raisedBg, position: "sticky", bottom: 0, zIndex: 2 }}>
          <span className="text-xs text-(--color-on-surface-muted)" style={{ minWidth: 80 }}>
            {selectable && selected.size > 0 ? `${selected.size} selected` : `${sorted.length} ${sorted.length === 1 ? "result" : "results"}`}
          </span>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} aria-label="Previous page"
              style={{ color: "var(--color-on-surface-muted)", borderColor: "var(--color-surface-border)" }}>‹</Button>
            <span className="text-xs text-(--color-on-surface-muted) px-2">{safePage} / {totalPages}</span>
            <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} aria-label="Next page"
              style={{ color: "var(--color-on-surface-muted)", borderColor: "var(--color-surface-border)" }}>›</Button>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor={`${uid}-pagesize`} className="text-xs text-(--color-on-surface-muted)">Rows</label>
            <select id={`${uid}-pagesize`} value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="text-xs rounded-(--radius-button) px-1.5 py-1"
              style={{ background: surfaceBg, border: "1px solid var(--color-surface-border)", color: "var(--color-on-surface)", cursor: "pointer" }}>
              {pageSizes.map(n => <option key={n} value={n}>{n}</option>)}
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