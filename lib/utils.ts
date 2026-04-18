import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const categoryMap: Record<string, { label: string; color: string }> = {
  tech: { label: "技术", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  life: { label: "生活", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  thinking: { label: "思考", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
};
