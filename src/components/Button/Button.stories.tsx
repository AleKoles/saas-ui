import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ShoppingCart, RefreshCw, Plus, Download, Upload,
  Trash2, Pencil, Send, Package, FileText, Filter,
  Settings, LogOut, Save, Search, ArrowRight,
  CheckCircle, AlertCircle, Bell, Tag, type LucideIcon,
} from "lucide-react";
import { Button } from "./Button";

// ─── Icon map for Controls panel ─────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon | undefined> = {
  None:          undefined,
  Plus:          Plus,
  ShoppingCart:  ShoppingCart,
  RefreshCw:     RefreshCw,
  Download:      Download,
  Upload:        Upload,
  Trash2:        Trash2,
  Pencil:        Pencil,
  Send:          Send,
  Package:       Package,
  FileText:      FileText,
  Filter:        Filter,
  Settings:      Settings,
  LogOut:        LogOut,
  Save:          Save,
  Search:        Search,
  ArrowRight:    ArrowRight,
  CheckCircle:   CheckCircle,
  AlertCircle:   AlertCircle,
  Bell:          Bell,
  Tag:           Tag,
};

// ─── Surface decorator ────────────────────────────────────────────────────────

const withSurface = (Story: () => React.ReactNode) => (
  <div
    style={{ background: "var(--color-bg-page)" }}
    className="p-6 flex flex-wrap gap-3 items-center"
  >
    <Story />
  </div>
);

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Button> = {
  title:      "Components/Button",
  component:  Button,
  tags:       ["autodocs"],
  decorators: [withSurface],
  parameters: {
    docs: {
      description: {
        component:
          "A general-purpose button with 3 variants, 3 sizes, optional trailing Lucide icon, loading state, and disabled state. WCAG AA compliant across all themes.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["solid", "outline", "ghost"],
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
    },
    loading:  { control: "boolean" },
    disabled: { control: "boolean" },
    block:    { control: "boolean" },
    icon: {
      control: "select",
      options: Object.keys(ICON_MAP),
      mapping: ICON_MAP,
      description: "Trailing Lucide icon",
    },
  },
  args: {
    children: "Button",
    variant:  "solid",
    size:     "md",
    loading:  false,
    disabled: false,
    block:    false,
    icon:     undefined,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {};

// ─── Variants ─────────────────────────────────────────────────────────────────

export const Variants: Story = {
  render: () => (
    <>
      <Button variant="solid"   icon={Plus}>New Order</Button>
      <Button variant="outline" icon={Download}>Export</Button>
      <Button variant="ghost"   icon={Filter}>Filter</Button>
    </>
  ),
};

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <>
      <Button size="sm" icon={Plus}>Small</Button>
      <Button size="md" icon={Plus}>Medium</Button>
      <Button size="lg" icon={Plus}>Large</Button>
    </>
  ),
};

// ─── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
  render: () => (
    <>
      <Button icon={Save}>Default</Button>
      <Button icon={Save} loading>Saving…</Button>
      <Button icon={Save} disabled>Disabled</Button>
    </>
  ),
};

// ─── Commerce & business icons ────────────────────────────────────────────────

export const CommerceIcons: Story = {
  name: "Commerce & Business",
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-(--color-text-secondary) w-20">Commerce</span>
        <Button variant="solid"   icon={ShoppingCart}>Add to Cart</Button>
        <Button variant="outline" icon={Tag}>Apply Coupon</Button>
        <Button variant="outline" icon={Package}>Track Order</Button>
        <Button variant="ghost"   icon={RefreshCw}>Reorder</Button>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-(--color-text-secondary) w-20">Data</span>
        <Button variant="solid"   icon={Plus}>New Record</Button>
        <Button variant="outline" icon={Download}>Export CSV</Button>
        <Button variant="outline" icon={Upload}>Import</Button>
        <Button variant="ghost"   icon={Search}>Search</Button>
        <Button variant="ghost"   icon={Filter}>Filter</Button>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-(--color-text-secondary) w-20">Actions</span>
        <Button variant="solid"   icon={Send}>Send</Button>
        <Button variant="outline" icon={Pencil}>Edit</Button>
        <Button variant="outline" icon={FileText}>View Report</Button>
        <Button variant="ghost"   icon={Save}>Save Draft</Button>
        <Button variant="ghost"   icon={Trash2}>Delete</Button>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-(--color-text-secondary) w-20">System</span>
        <Button variant="solid"   icon={CheckCircle}>Confirm</Button>
        <Button variant="outline" icon={AlertCircle}>Review</Button>
        <Button variant="outline" icon={Bell}>Notify</Button>
        <Button variant="outline" icon={Settings}>Settings</Button>
        <Button variant="ghost"   icon={ArrowRight}>Continue</Button>
        <Button variant="ghost"   icon={LogOut}>Sign Out</Button>
      </div>
    </div>
  ),
};