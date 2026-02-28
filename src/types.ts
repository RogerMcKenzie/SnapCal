export interface EventDetails {
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string | null; // HH:MM 24h or null
  endTime: string | null; // HH:MM 24h or null
  location: string | null;
  description: string | null;
  isAllDay: boolean;
}

export interface StorageSettings {
  defaultDuration: number; // minutes
  timezone: string;
}

export type PopupSection =
  | "signin"
  | "actions"
  | "status"
  | "preview"
  | "event"
  | "success";

export type ExtractionMode = "text" | "screenshot";

export interface CalendarEvent {
  id: string;
  htmlLink: string;
  summary: string;
  status: string;
}
