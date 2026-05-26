import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { AxiosError } from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<T>(cb: (...args: Array<T>) => void, delay = 300) {
  let timerId: any;
  return (...args: Array<T>) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      cb(...args);
    }, delay);
  };
}

export function getInterpolatedColor(value: number): string {
  const clamped = Math.max(0, Math.min(100, value));

  let hue: number;
  let saturation: number;
  let lightness: number;

  if (clamped <= 50) {
    // Red → Yellow
    const t = clamped / 50;
    hue = 0 + t * (45 - 0); // 0 → 45
    saturation = 100 - t * (100 - 90); // 100 → 90
    lightness = 45 + t * (50 - 45); // 45 → 50
  } else {
    // Yellow → Green
    const t = (clamped - 50) / 50;
    hue = 45 + t * (120 - 45); // 45 → 120
    saturation = 90 - t * (90 - 70); // 90 → 70
    lightness = 50 - t * (50 - 40); // 50 → 40
  }

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getAxiosErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const axiosError = error as AxiosError;
    if (axiosError.response && axiosError.response.data) {
      const data = axiosError.response.data as any;

      // Case: data is string directly
      if (typeof data === "string") return data;

      // Case: data has 'message' or 'error' string fields
      if (typeof data.message === "string") return data.message;
      if (typeof data.error === "string") return data.error;

      // Case: data has { error: true, data: string | object }
      if (data.error === true && data.data) {
        if (typeof data.data === "string") return data.data;
        if (typeof data.data === "object" && data.data !== null) {
          // Try common message fields inside nested data
          if (typeof data.data.message === "string") return data.data.message;
          if (typeof data.data.error === "string") return data.data.error;
          // fallback to JSON stringify
          return JSON.stringify(data.data);
        }
      }
    }

    // fallback to error.message
    if ("message" in axiosError && typeof axiosError.message === "string") {
      return axiosError.message;
    }
  }
  return "An unknown error occurred";
}
