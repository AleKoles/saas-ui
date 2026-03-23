import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

// ─── Surface decorator ────────────────────────────────────────────────────────
// Wraps every story in the current theme's card surface colour so subtle badges
// are previewed on the same background they'll actually appear on in production.
// var(--color-surface) resolves automatically when you switch themes in the toolbar.

const withSurface = (Story: () => React.ReactNode) => (
  <div
    style={{ background: "var(--color-surface)" }}
    className="p-6 rounded-(--radius-lg) inline-block"
  >
    <Story />
  </div>
);

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  decorators: [withSurface],
  parameters: {
    docs: {
      description: {
        component:
          "A compact label for status, category, or state. Supports 6 semantic colours, 2 variants, 3 sizes, and an optional dot indicator. WCAG AA compliant in all three themes.",
      },
    },
  },
  argTypes: {
    color: {
      control: "select",
      options: ["success", "danger", "warning", "info", "neutral", "primary"],
    },
    variant: {
      control: "radio",
      options: ["subtle", "solid"],
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
    },
    dot: {
      control: "boolean",
    },
    label: {
      control: "text",
    },
    className: {
      table: { disable: true },
    },
  },
  args: {
    label: "Active",
    color: "success",
    variant: "subtle",
    size: "md",
    dot: true,
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// ─── Single interactive story ─────────────────────────────────────────────────

export const Playground: Story = {};

// ─── Reference rows ───────────────────────────────────────────────────────────

export const AllColours: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Badge label="Active" color="success" variant="subtle" dot />
        <Badge label="Review" color="info" variant="subtle" dot />
        <Badge label="Pending" color="warning" variant="subtle" dot />
        <Badge label="Failed" color="danger" variant="subtle" dot />
        <Badge label="Draft" color="neutral" variant="subtle" dot />
        <Badge label="New" color="primary" variant="subtle" dot />
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge label="Active" color="success" variant="solid" dot />
        <Badge label="Review" color="info" variant="solid" dot />
        <Badge label="Pending" color="warning" variant="solid" dot />
        <Badge label="Failed" color="danger" variant="solid" dot />
        <Badge label="Draft" color="neutral" variant="solid" dot />
        <Badge label="New" color="primary" variant="solid" dot />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge label="Small" color="success" variant="solid" size="sm" dot />
      <Badge label="Medium" color="success" variant="solid" size="md" dot />
      <Badge label="Large" color="success" variant="solid" size="lg" dot />
    </div>
  ),
};
