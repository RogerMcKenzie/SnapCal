import type { EventDetails } from "../types";

export function validateEvent(details: EventDetails): string[] {
  const errors: string[] = [];

  if (!details.title.trim()) {
    errors.push("Title is required.");
  }

  if (!details.date || !/^\d{4}-\d{2}-\d{2}$/.test(details.date)) {
    errors.push("A valid date (YYYY-MM-DD) is required.");
  }

  if (!details.isAllDay) {
    if (!details.startTime || !/^\d{2}:\d{2}$/.test(details.startTime)) {
      errors.push("Start time is required for timed events.");
    }
    if (details.endTime && !/^\d{2}:\d{2}$/.test(details.endTime)) {
      errors.push("End time must be in HH:MM format.");
    }
    if (
      details.startTime &&
      details.endTime &&
      details.startTime >= details.endTime
    ) {
      errors.push(
        "End time must be after start time (overnight events are not supported).",
      );
    }
  }

  return errors;
}

export function sanitize(str: string, maxLen = 1000): string {
  if (!str) return "";
  // Strip control characters except newlines and tabs
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .substring(0, maxLen)
    .trim();
}

export function truncateForAPI(text: string, maxChars = 15_000): string {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + "\n[...text truncated...]";
}
