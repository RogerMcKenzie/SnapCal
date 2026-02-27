import { useState, useEffect } from "react";

interface Props {
  onScreenshot: () => void;
}

export function ActionsSection({ onScreenshot }: Props) {
  const [shortcut, setShortcut] = useState<string | null>(null);

  useEffect(() => {
    chrome.commands.getAll((commands) => {
      const snap = commands.find((c) => c.name === "snap_analyze");
      setShortcut(snap?.shortcut || "");
    });
  }, []);

  return (
    <section className="section">
      <p className="section-desc">
        Capture the current page and extract event details to add to Google
        Calendar.
      </p>

      {shortcut !== null && (
        <p className="shortcut-hint">
          {shortcut ? (
            <>
              Tip: Press{" "}
              {shortcut.split("+").map((key, i) => (
                <span key={i}>
                  {i > 0 && " + "}
                  <kbd>{key}</kbd>
                </span>
              ))}{" "}
              to snap &amp; analyze instantly
            </>
          ) : (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
              }}
            >
              Set a keyboard shortcut for quick access
            </a>
          )}
        </p>
      )}

      <button className="btn btn-primary" onClick={onScreenshot}>
        Capture Screenshot
      </button>
    </section>
  );
}
