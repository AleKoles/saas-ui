import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable, StatusBadge } from "./DataTable";
import type { DataTableColumn } from "./DataTable";

// ─── Sample data ──────────────────────────────────────────────────────────────

interface User extends Record<string, unknown> {
  name: string;
  status: string;
  role: string;
  joined: string;
  actions: string;
}

const USERS: User[] = [
  { name: "Alice Müller", status: "Active",  role: "Admin",  joined: "15.01.2024", actions: "edit" },
  { name: "Ben Koch",     status: "Pending", role: "Editor", joined: "22.03.2024", actions: "edit" },
  { name: "Clara Bauer",  status: "Draft",   role: "Viewer", joined: "08.11.2023", actions: "edit" },
  { name: "David Park",   status: "Active",  role: "Editor", joined: "01.05.2024", actions: "edit" },
  { name: "Eva Sanz",     status: "Failed",  role: "Admin",  joined: "15.01.2024", actions: "edit" },
];

const statusColorMap: Record<string, "success" | "warning" | "neutral" | "danger"> = {
  Active:  "success",
  Pending: "warning",
  Draft:   "neutral",
  Failed:  "danger",
};

const COLUMNS: DataTableColumn<User>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    width: "200px",
    render: (v) => (
      <span className="text-(--color-on-surface) font-medium">{String(v)}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    width: "130px",
    render: (v) => (
      <StatusBadge
        label={String(v)}
        color={statusColorMap[String(v)] ?? "neutral"}
      />
    ),
  },
  {
    key: "role",
    label: "Role",
    sortable: true,
    width: "120px",
  },
  {
    key: "joined",
    label: "Joined",
    sortable: true,
    width: "120px",
  },
  {
    key: "actions",
    label: "Actions",
    width: "80px",
    render: () => (
      <button
        className="inline-flex items-center gap-1 text-xs text-(--color-on-surface-muted) hover:text-(--color-on-surface) transition-colors bg-transparent border-none cursor-pointer p-0"
        onClick={() => alert("Edit clicked")}
      >
        ✏️ Edit
      </button>
    ),
  },
];

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof DataTable> = {
  title: "Components/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A sortable data table with aria-sort, keyboard navigation, and three states: populated, loading skeleton, and empty. Accepts generic typed data and custom cell renderers. WCAG AA compliant in all three themes.",
      },
    },
  },
  argTypes: {
    status: {
      control: "radio",
      options: ["populated", "loading", "empty"],
    },
    emptyMessage:    { control: "text" },
    emptySubMessage: { control: "text" },
    skeletonRows:    { control: "number" },
    ariaLabel:       { control: "text" },
    columns:         { table: { disable: true } },
    data:            { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Playground: Story = {
  args: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: COLUMNS as any,
    data: USERS,
    status: "populated",
    ariaLabel: "Users table",
  },
};

export const Loading: Story = {
  args: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: COLUMNS as any,
    data: [],
    status: "loading",
    skeletonRows: 5,
    ariaLabel: "Users table",
  },
};

export const Empty: Story = {
  args: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: COLUMNS as any,
    data: [],
    status: "empty",
    emptyMessage: "No users found",
    emptySubMessage: "Try adjusting your filters",
    ariaLabel: "Users table",
  },
};