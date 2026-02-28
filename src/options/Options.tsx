import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../lib/storage";

export function Options() {
  const [duration, setDuration] = useState(60);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setDuration(s.defaultDuration);
      setTimezone(s.timezone);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await saveSettings({
      defaultDuration: duration,
      timezone,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="options-page">
      <h1>SnapCal Settings</h1>

      <form className="options-form" onSubmit={handleSave}>
        <label>
          Default Event Duration (minutes)
          <input
            type="number"
            min={15}
            max={480}
            step={15}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </label>

        <label>
          Timezone
          <input
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          />
        </label>

        <button type="submit" className="btn-save">
          Save Settings
        </button>

        {saved && <p className="saved-msg">Settings saved.</p>}
      </form>
    </div>
  );
}
