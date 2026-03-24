import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable, StatusBadge } from "./DataTable";
import type { DataTableColumn, FilterTab } from "./DataTable";

// ─── Surface decorator ────────────────────────────────────────────────────────

const withSurface = (Story: () => React.ReactNode) => (
  <div style={{ background: "var(--color-bg-page)", padding: 24 }}>
    <Story />
  </div>
);

// ─── Sample data — Medusa-style purchase orders ───────────────────────────────

type PurchaseOrder = {
  id:            string;
  status:        string;
  vendor:        string;
  location:      string;
  contactPerson: string;
  createdBy:     string;
  createdDate:   string;
  updatedBy:     string;
  updatedAt:     string;
  notes:         string;
};

const STATUSES = ["PENDING", "SENT TO VENDOR", "DELIVERED", "CANCELLED", "DELAYED", "DRAFT"] as const;

const VENDORS = [
  "Meridian Supply Co.",
  "Apex Industrial Ltd.",
  "Nordex Trading GmbH",
  "Blackwell & Partners",
  "Crestline Materials Inc.",
  "Dunmore Logistics AG",
];

const PEOPLE = [
  "James Whitfield",
  "Priya Nambiar",
  "Carlos Reyes",
  "Ingrid Solberg",
  "ops@meridian-supply.io",
  "Tobias Brandt",
];

const LOCATIONS = ["Warehouse A", "Warehouse B", "Central Depot", "East Hub"];

const NOTES = [
  "Standard delivery terms apply",
  "Urgent — expedite if possible. Contact vendor directly for ETA confirmation before closing the order.",
  "Awaiting customs clearance documentation",
  "Check quantities with warehouse manager before confirming",
  "Partial shipment approved by operations team",
  "Requires cold chain logistics — coordinate with carrier",
  "",
];

function pad(n: number) { return String(n).padStart(8, "0"); }
function dateStr(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
}
function pick<T>(arr: readonly T[], i: number) { return arr[i % arr.length]; }

const SAMPLE_DATA: PurchaseOrder[] = Array.from({ length: 43 }, (_, i) => ({
  id:            `PO${pad(2240 - i * 7)}`,
  status:        pick(STATUSES, i * 3 + 1),
  vendor:        pick(VENDORS, i),
  location:      pick(LOCATIONS, i),
  contactPerson: pick(PEOPLE, i + 1),
  createdBy:     pick(PEOPLE, i),
  createdDate:   dateStr(i * 2 + 1),
  updatedBy:     pick(PEOPLE, i + 2),
  updatedAt:     dateStr(i),
  notes:         pick(NOTES, i),
}));

// ─── Status colour map ────────────────────────────────────────────────────────

const statusColor: Record<string, "success" | "info" | "danger" | "warning" | "neutral"> = {
  "DELIVERED":      "success",
  "SENT TO VENDOR": "info",
  "PENDING":        "info",
  "DELAYED":        "warning",
  "CANCELLED":      "danger",
  "DRAFT":          "neutral",
};

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMNS: DataTableColumn<PurchaseOrder>[] = [
  {
    key:      "id",
    label:    "PO Code",
    sortable: true,
    width:    "130px",
  },
  {
    key:    "status",
    label:  "Status",
    width:  "160px",
    render: (v) => (
      <StatusBadge
        label={String(v)}
        color={statusColor[String(v)] ?? "neutral"}
      />
    ),
  },
  {
    key:      "vendor",
    label:    "Vendor",
    sortable: true,
    width:    "220px",
  },
  {
    key:   "location",
    label: "Location",
    width: "100px",
  },
  {
    key:      "contactPerson",
    label:    "Contact Person",
    sortable: true,
    width:    "160px",
  },
  {
    key:      "createdBy",
    label:    "Created By",
    sortable: true,
    width:    "160px",
  },
  {
    key:      "createdDate",
    label:    "Created Date",
    sortable: true,
    width:    "120px",
  },
  {
    key:      "updatedBy",
    label:    "Updated By",
    width:    "160px",
  },
  {
    key:      "updatedAt",
    label:    "Updated At",
    sortable: true,
    width:    "120px",
  },
  {
    key:      "notes",
    label:    "Notes",
    editable: true,
    truncate: true,
    width:    "200px",
  },
];

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const TABS: FilterTab<PurchaseOrder>[] = [
  {
    label:  `All (${SAMPLE_DATA.length})`,
    filter: () => true,
  },
  {
    label:  "In Transit",
    filter: row => row.status === "SENT TO VENDOR",
  },
  {
    label:  "Pending",
    filter: row => row.status === "PENDING",
  },
  {
    label:  "Delayed",
    filter: row => row.status === "DELAYED",
  },
];

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof DataTable<PurchaseOrder>> = {
  title:      "Components/DataGrid",
  component:  DataTable,
  tags:       ["autodocs"],
  decorators: [withSurface],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A full-featured data table for SaaS dashboards. Supports sticky header/footer, pinned columns, sorting, search, filter tabs, pagination, row selection, inline editing, text truncation with expand, and optional drag-and-drop reordering. WCAG AA compliant.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable<PurchaseOrder>>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {
  args: {
    columns:      COLUMNS,
    data:         SAMPLE_DATA,
    status:       "populated",
    tabs:         TABS,
    draggable:    false,
    skeletonRows: 8,
    pageSizes:    [10, 25, 50],
    ariaLabel:    "Purchase orders",
    primaryAction: {
      label:   "New Purchase Order",
      onClick: () => alert("New Purchase Order clicked"),
    },
    searchPlaceholder: "Search…",
  },
  argTypes: {
    status: {
      control: "radio",
      options: ["populated", "loading", "empty"],
    },
    draggable: {
      control: "boolean",
    },
    skeletonRows: {
      control: { type: "number", min: 1, max: 20 },
    },
    // hide props that need object editors
    columns:       { table: { disable: true } },
    data:          { table: { disable: true } },
    tabs:          { table: { disable: true } },
    pageSizes:     { table: { disable: true } },
    primaryAction: { table: { disable: true } },
    onSelectionChange: { table: { disable: true } },
    onCellEdit:        { table: { disable: true } },
  },
};

// ─── Loading state ────────────────────────────────────────────────────────────

export const Loading: Story = {
  args: {
    ...Playground.args,
    status: "loading",
  },
};

// ─── Empty state ──────────────────────────────────────────────────────────────

export const Empty: Story = {
  args: {
    ...Playground.args,
    status:         "empty",
    emptyMessage:   "No purchase orders found",
    emptySubMessage:"Try adjusting your filters or create a new order",
  },
};