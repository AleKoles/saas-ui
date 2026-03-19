import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatCard } from "./StatCard";

const meta: Meta<typeof StatCard> = {
  title: "Components/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A dashboard metric card with live region support for screen readers. Handles four states: default, negative trend, loading skeleton, and empty. WCAG AA compliant in all three themes.",
      },
    },
  },
  argTypes: {
    status: {
      control: "radio",
      options: ["active", "loading", "empty"],
    },
    trendDirection: {
      control: "radio",
      options: ["positive", "negative", "neutral"],
    },
    badgeColor: {
      control: "select",
      options: ["success", "danger", "warning", "info", "neutral", "primary"],
    },
    label:      { control: "text" },
    value:      { control: "text" },
    trend:      { control: "text" },
    badgeLabel: { control: "text" },
    className:  { table: { disable: true } },
  },
  args: {
    label:          "Monthly Revenue",
    value:          "€24,300",
    trend:          "+12% vs last month",
    trendDirection: "positive",
    status:         "active",
    badgeLabel:     "Active",
    badgeColor:     "success",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Playground: Story = {};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: 640 }}>
      <StatCard
        label="Monthly Revenue"
        value="€24,300"
        trend="+12% vs last month"
        trendDirection="positive"
        status="active"
        badgeLabel="Active"
        badgeColor="success"
      />
      <StatCard
        label="Churn Rate"
        value="8.4%"
        trend="-3% vs last month"
        trendDirection="negative"
        status="active"
        badgeLabel="Failed"
        badgeColor="danger"
      />
      <StatCard
        label="Active Users"
        status="loading"
      />
      <StatCard
        label="Conversion Rate"
        status="empty"
        badgeLabel="Draft"
        badgeColor="neutral"
      />
    </div>
  ),
};