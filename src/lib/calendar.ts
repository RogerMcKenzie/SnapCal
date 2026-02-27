import type { EventDetails, CalendarEvent } from "../types";
import { getSettings } from "./storage";

const CALENDAR_BASE = "https://www.googleapis.com/calendar/v3";

function getAuthToken(interactive = true): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!token) {
        reject(new Error("No auth token received. Please sign in."));
      } else {
        resolve(token);
      }
    });
  });
}

export async function checkAuthStatus(): Promise<boolean> {
  try {
    await getAuthToken(false);
    return true;
  } catch {
    return false;
  }
}

export async function getAuthTokenInteractive(): Promise<string> {
  return getAuthToken(true);
}

function revokeToken(token: string): Promise<void> {
  return new Promise<void>((resolve) => {
    chrome.identity.removeCachedAuthToken({ token }, () => {
      resolve();
    });
  }).then(() => {
    // Also revoke on Google's side (best effort)
    return fetch(
      `https://accounts.google.com/o/oauth2/revoke?token=${token}`,
    ).then(() => undefined, () => undefined);
  });
}

function nextDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split("T")[0];
}

async function buildEventBody(
  details: EventDetails,
): Promise<Record<string, unknown>> {
  const { timezone, defaultDuration } = await getSettings();
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const body: Record<string, unknown> = {
    summary: details.title,
  };

  if (details.location) body.location = details.location;
  if (details.description) body.description = details.description;

  if (details.isAllDay) {
    body.start = { date: details.date };
    body.end = { date: nextDay(details.date) };
  } else {
    const startDT = `${details.date}T${details.startTime}:00`;

    let endDT: string;
    if (details.endTime) {
      endDT = `${details.date}T${details.endTime}:00`;
    } else {
      const dur = defaultDuration || 60;
      const [startH, startM] = details.startTime!.split(":").map(Number);
      const totalMinutes = startH * 60 + startM + dur;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      const endDate =
        totalMinutes >= 24 * 60 ? nextDay(details.date) : details.date;
      const hh = String(endH).padStart(2, "0");
      const mm = String(endM).padStart(2, "0");
      endDT = `${endDate}T${hh}:${mm}:00`;
    }

    body.start = { dateTime: startDT, timeZone: tz };
    body.end = { dateTime: endDT, timeZone: tz };
  }

  return body;
}

async function postEvent(
  token: string,
  eventBody: Record<string, unknown>,
): Promise<Response> {
  return fetch(`${CALENDAR_BASE}/calendars/primary/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventBody),
  });
}

export async function createEvent(
  details: EventDetails,
): Promise<CalendarEvent> {
  const eventBody = await buildEventBody(details);
  let token = await getAuthToken();
  let response = await postEvent(token, eventBody);

  // If token is stale, revoke and retry once
  if (response.status === 401) {
    await revokeToken(token);
    token = await getAuthToken();
    response = await postEvent(token, eventBody);
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg =
      (err as { error?: { message?: string } }).error?.message ??
      `Status ${response.status}`;
    throw new Error(`Calendar API error: ${msg}`);
  }

  return (await response.json()) as CalendarEvent;
}
