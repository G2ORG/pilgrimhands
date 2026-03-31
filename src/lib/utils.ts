import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TaskCategory, TaskStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  pilgrimage:     "Pilgrimage",
  delivery:       "Delivery",
  photography:    "Photography",
  documents:      "Documents",
  tech:           "Tech Support",
  research:       "Research",
  representation: "Representation",
  other:          "Other",
};

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  pilgrimage:     "✈️",
  delivery:       "📦",
  photography:    "📸",
  documents:      "📄",
  tech:           "🔧",
  research:       "🔬",
  representation: "🤝",
  other:          "🌐",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  draft:       "Draft",
  open:        "Open",
  assigned:    "Assigned",
  in_progress: "In Progress",
  completed:   "Completed",
  cancelled:   "Cancelled",
  disputed:    "Disputed",
};

export const STATUS_CSS: Record<TaskStatus, string> = {
  draft:       "status-draft",
  open:        "status-open",
  assigned:    "status-assigned",
  in_progress: "status-in_progress",
  completed:   "status-completed",
  cancelled:   "status-cancelled",
  disputed:    "status-disputed",
};

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
