import type { StorageSettings } from "../types";

const DEFAULTS: StorageSettings = {
  defaultDuration: 60,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export async function getSettings(): Promise<StorageSettings> {
  const items = await chrome.storage.sync.get(DEFAULTS);
  return items as StorageSettings;
}

export async function saveSettings(
  partial: Partial<StorageSettings>,
): Promise<void> {
  await chrome.storage.sync.set(partial);
}
