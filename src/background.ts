// Service worker — all listeners must be registered synchronously at the top level.

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.sync.set({
      defaultDuration: 60,
    });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "snap_analyze") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  let dataUrl: string | undefined;
  try {
    dataUrl = await chrome.tabs.captureVisibleTab({ format: "png" });
  } catch {
    return;
  }

  await chrome.storage.local.set({
    pendingSnap: true,
    pendingScreenshot: dataUrl,
  });

  try {
    await chrome.action.openPopup();
  } catch {
    // openPopup() may not be supported; user can click the icon manually
  }
});
