import { useState, useEffect } from "react";
import type { PopupSection, EventDetails, CalendarEvent } from "../types";
import { captureScreenshot } from "../lib/extractor";
import { parseEventFromImage } from "../lib/gemini";
import { createEvent, checkAuthStatus } from "../lib/calendar";
import { SignInSection } from "./components/SignInSection";
import { ActionsSection } from "./components/ActionsSection";
import { StatusSection } from "./components/StatusSection";
import { PreviewSection } from "./components/PreviewSection";
import { EventForm } from "./components/EventForm";
import { SuccessSection } from "./components/SuccessSection";

export function App() {
  const [section, setSection] = useState<PopupSection>("signin");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [screenshotDataUrl, setScreenshotDataUrl] = useState("");
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [createdEvent, setCreatedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    let cancelled = false;

    checkAuthStatus().then((signedIn) => {
      if (!cancelled && signedIn) setSection("actions");
    });

    chrome.storage.local.get(["pendingSnap", "pendingScreenshot"], (result) => {
      if (cancelled || !result.pendingSnap) return;

      chrome.storage.local.remove(["pendingSnap", "pendingScreenshot"]);

      if (result.pendingScreenshot) {
        setScreenshotDataUrl(result.pendingScreenshot);
        setSection("status");
        setStatus("Analyzing page with AI…");
        setLoading(true);

        parseEventFromImage(result.pendingScreenshot).then(
          (details) => {
            if (cancelled) return;
            setEventDetails(details);
            setLoading(false);
            setSection("event");
          },
          (err) => {
            if (cancelled) return;
            setStatus("");
            setLoading(false);
            setError(err instanceof Error ? err.message : "Failed to analyze.");
            setSection("status");
          },
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSignedIn() {
    setSection("actions");
  }

  function showStatus(msg: string) {
    setStatus(msg);
    setLoading(true);
    setError(null);
    setSection("status");
  }

  function showError(msg: string) {
    setStatus("");
    setLoading(false);
    setError(msg);
    setSection("status");
  }

  async function handleScreenshot() {
    showStatus("Capturing screenshot…");
    try {
      const dataUrl = await captureScreenshot();
      setScreenshotDataUrl(dataUrl);
      setLoading(false);
      setSection("preview");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to capture screenshot.",
      );
    }
  }

  async function handleParse() {
    showStatus("Analyzing screenshot with AI…");
    try {
      const details = await parseEventFromImage(screenshotDataUrl);
      setEventDetails(details);
      setLoading(false);
      setSection("event");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to parse event details.",
      );
    }
  }

  async function handleCreateEvent(details: EventDetails) {
    showStatus("Creating calendar event…");
    try {
      const created = await createEvent(details);
      setCreatedEvent(created);
      setLoading(false);
      setSection("success");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to create event.",
      );
    }
  }

  function handleBack() {
    setError(null);
    setSection("actions");
  }

  return (
    <div className="app">
      <header className="header">
        <h1>SnapCal</h1>
        <button
          className="settings-btn"
          onClick={() => chrome.runtime.openOptionsPage()}
          title="Settings"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M19.14 12.94a7.07 7.07 0 0 0 .06-.94c0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.04 7.04 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
          </svg>
        </button>
      </header>

      {section === "signin" && (
        <SignInSection onSignedIn={handleSignedIn} />
      )}

      {section === "actions" && (
        <ActionsSection onScreenshot={handleScreenshot} />
      )}

      {section === "status" && (
        <StatusSection
          message={status}
          loading={loading}
          error={error}
          onBack={handleBack}
          onRetry={() => setSection("actions")}
        />
      )}

      {section === "preview" && (
        <PreviewSection
          imageUrl={screenshotDataUrl}
          onParse={handleParse}
          onBack={handleBack}
        />
      )}

      {section === "event" && eventDetails && (
        <EventForm
          initial={eventDetails}
          onSubmit={handleCreateEvent}
          onBack={handleBack}
        />
      )}

      {section === "success" && createdEvent && (
        <SuccessSection event={createdEvent} onDone={handleBack} />
      )}
    </div>
  );
}
