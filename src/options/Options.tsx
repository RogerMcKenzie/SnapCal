import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../lib/storage";

export function Options() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [duration, setDuration] = useState(60);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setApiKey(s.geminiApiKey);
      setModel(s.geminiModel);
      setDuration(s.defaultDuration);
      setTimezone(s.timezone);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await saveSettings({
      geminiApiKey: apiKey.trim(),
      geminiModel: model,
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
          Gemini API Key
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
          />
        </label>

        <label>
          Gemini Model
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          </select>
        </label>

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
