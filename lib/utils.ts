import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPoints(value: number) {
  return `${value} ${value === 1 ? "Punkt" : "Punkte"}`;
}

export function formatGameLabel(gameNumber: number) {
  return `Spiel ${gameNumber}`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function createId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
