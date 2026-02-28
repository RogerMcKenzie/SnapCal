import type { EventDetails } from "../types";
import { sanitize, truncateForAPI } from "./utils";

// TODO: Replace with your actual Vercel deployment URL after deploying
const PROXY_URL = "https://snapcal-proxy.vercel.app/api/gemini";

function buildPrompt(extra: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `You are a calendar event parser. Today's date is ${today}.
${extra}
Return a JSON object with exactly these fields:
- "title": string (event name/title)
- "date": string (YYYY-MM-DD format)
- "startTime": string (HH:MM in 24-hour format, or null if all-day)
- "endTime": string (HH:MM in 24-hour format, or null if unknown)
- "location": string (or null if not found)
- "description": string (brief summary, or null)
- "isAllDay": boolean

If multiple events are found, return only the most prominent one.
If a field cannot be determined, use null.
Return ONLY valid JSON, no markdown fences, no explanation.`;
}

async function callGemini(
  contents: unknown[],
  retries = 2,
): Promise<EventDetails> {
  const body = JSON.stringify({
    contents: [{ parts: contents }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });

  let lastError: Error = new Error("Gemini request failed.");

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (response.status === 429) {
        lastError = mapApiError(429, "");
        const waitMs = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const msg =
          (errorBody as { error?: { message?: string } }).error?.message ?? "";
        throw mapApiError(response.status, msg);
      }

      const data = await response.json();
      const rawText = (
        data as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        }
      ).candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("Gemini returned no content.");

      return parseAndValidate(rawText);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries && isRetryable(lastError)) {
        const waitMs = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError;
}

function parseAndValidate(raw: string): EventDetails {
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Gemini returned invalid JSON.");
  }

  const title = typeof parsed.title === "string" ? sanitize(parsed.title) : "";
  const date =
    typeof parsed.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
      ? parsed.date
      : new Date().toISOString().split("T")[0];
  const startTime =
    typeof parsed.startTime === "string" &&
      /^\d{2}:\d{2}$/.test(parsed.startTime)
      ? parsed.startTime
      : null;
  const endTime =
    typeof parsed.endTime === "string" && /^\d{2}:\d{2}$/.test(parsed.endTime)
      ? parsed.endTime
      : null;

  return {
    title: title || "Untitled Event",
    date,
    startTime,
    endTime,
    location:
      typeof parsed.location === "string" ? sanitize(parsed.location) : null,
    description:
      typeof parsed.description === "string"
        ? sanitize(parsed.description)
        : null,
    isAllDay: typeof parsed.isAllDay === "boolean" ? parsed.isAllDay : !startTime,
  };
}

function mapApiError(status: number, msg: string): Error {
  switch (status) {
    case 400:
      return new Error(
        "Invalid request. The content may be too long or unsupported.",
      );
    case 401:
      return new Error(
        "Authentication error. Please contact support.",
      );
    case 403:
      return new Error(
        "API access denied. Please contact support.",
      );
    case 429:
      return new Error(
        "Rate limit exceeded. Please wait and try again.",
      );
    case 500:
    case 503:
      return new Error("Service temporarily unavailable. Try again later.");
    default:
      return new Error(`Gemini API error (${status}): ${msg}`);
  }
}

function isRetryable(err: Error): boolean {
  return (
    err.message.includes("rate limit") ||
    err.message.includes("temporarily unavailable") ||
    err.message.includes("Failed to fetch")
  );
}

export async function parseEventFromText(
  text: string,
): Promise<EventDetails> {
  const truncated = truncateForAPI(text);
  const prompt = buildPrompt(
    `Extract event details from the following text.\n\nText:\n${truncated}`,
  );
  return callGemini([{ text: prompt }]);
}

export async function parseEventFromImage(
  dataUrl: string,
): Promise<EventDetails> {
  const prompt = buildPrompt(
    "Look at this image and extract event details from it.",
  );
  const pureBase64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  return callGemini([
    { inlineData: { mimeType: "image/png", data: pureBase64 } },
    { text: prompt },
  ]);
}
