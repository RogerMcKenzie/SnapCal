export async function extractPageText(): Promise<string> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab?.id) throw new Error("No active tab found.");

  const url = tab.url ?? "";
  if (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("about:")
  ) {
    throw new Error("Cannot extract text from browser internal pages.");
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // Runs in the web page context — must be fully self-contained.
      const selectors = [
        "article",
        "main",
        '[role="main"]',
        ".post-content",
        ".entry-content",
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && (el as HTMLElement).innerText.trim().length > 100) {
          return (el as HTMLElement).innerText.trim();
        }
      }
      return document.body.innerText.trim();
    },
  });

  const text = results?.[0]?.result;
  if (!text) throw new Error("No text could be extracted from the page.");
  return text;
}

export async function captureScreenshot(): Promise<string> {
  const dataUrl = await chrome.tabs.captureVisibleTab({ format: "png" });
  if (!dataUrl) {
    throw new Error("Screenshot capture returned no data.");
  }
  return dataUrl;
}
