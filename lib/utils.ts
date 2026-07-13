import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(value: number) {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("bg-BG", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}
