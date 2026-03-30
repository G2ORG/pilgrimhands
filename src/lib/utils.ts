import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TaskCategory, TaskStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  pilgrimage: "Паломничество",
  delivery: "Доставка",
  photography: "Фото / Видео",
  documents: "Документы",
  tech: "Тех. помощь",
  research: "Исследование",
  representation: "Представительство",
  other: "Другое",
};

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  pilgrimage: "✈️",
  delivery: "📦",
  photography: "📸",
  documents: "📄",
  tech: "🔧",
  research: "🔬",
  representation: "🤝",
  other: "🌐",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  draft: "Черновик",
  open: "Открыта",
  assigned: "Назначена",
  in_progress: "В работе",
  completed: "Завершена",
  cancelled: "Отменена",
  disputed: "Спор",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  open: "bg-blue-100 text-blue-700",
  assigned: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  disputed: "bg-red-100 text-red-700",
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
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function generateApiKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "ph_" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}
