# SnapCal

A Chrome extension that captures a screenshot of any web page, uses Google Gemini AI to extract event details, and creates a Google Calendar event — all in a couple of clicks.

## Features

- **Screenshot-to-event** — capture the visible tab and let Gemini parse the title, date, time, location, and description automatically.
- **Review before adding** — extracted details are shown in an editable form so you can tweak anything before it hits your calendar.
- **Keyboard shortcut** — press `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac) to snap and analyze instantly without opening the popup first.
- **Configurable AI model** — choose between Gemini 2.5 Flash (fast) and Gemini 2.5 Pro (more capable) in the options page.
- **Timezone & duration defaults** — set your preferred timezone and default event duration so new events are created with sensible values.

## Prerequisites

- **Node.js** (v18 or later recommended)
- **Google Chrome** (or any Chromium-based browser that supports Manifest V3)
- **Gemini API key** — get one for free at [Google AI Studio](https://aistudio.google.com/apikey)

## Installation

### 1. Clone and build

```bash
git clone https://github.com/RogerMcKenzie/SnapCal.git
cd SnapCal
npm install
npm run build
```

This produces a `dist/` folder containing the built extension.

### 2. Load the extension in Chrome

1. Open `chrome://extensions` in your browser.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** and select the `dist/` folder.
4. The SnapCal icon will appear in your toolbar.

### 3. Add your Gemini API key

1. Right-click the SnapCal icon and choose **Options** (or click the gear icon inside the popup).
2. Paste your Gemini API key and choose your preferred model.
3. Optionally adjust the default event duration and timezone.
4. Click **Save Settings**.

### 4. Sign in with Google

Open the SnapCal popup and click **Sign in with Google**. This authorizes the extension to create events on your primary Google Calendar.

## Usage

1. Navigate to a page that contains event information (a concert listing, meetup page, email, flyer, etc.).
2. Click the SnapCal toolbar icon (or use the keyboard shortcut).
3. Click **Capture Screenshot** — the extension takes a screenshot of the visible area.
4. Review the screenshot preview, then click **Analyze with AI**.
5. Gemini extracts the event details and populates an editable form.
6. Adjust any fields if needed, then click **Add to Calendar**.
7. Done — a link to the new Google Calendar event is displayed.

## Development

Run a local dev server with hot-reload:

```bash
npm run dev
```

Then load the extension from the generated `dist/` directory the same way as described above. Vite + CRXJS will hot-reload changes as you edit source files.

### Project structure

```
src/
├── background.ts          # Service worker (keyboard shortcut handler)
├── types.ts               # Shared TypeScript interfaces
├── lib/
│   ├── calendar.ts        # Google Calendar API client
│   ├── extractor.ts       # Page text extraction & screenshot capture
│   ├── gemini.ts          # Gemini API client & event parsing
│   ├── storage.ts         # Extension settings (chrome.storage)
│   └── utils.ts           # Sanitization & validation helpers
├── popup/                 # Browser-action popup (React)
│   ├── App.tsx
│   ├── components/
│   └── ...
└── options/               # Options page (React)
    ├── Options.tsx
    └── ...
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run typecheck` | Run TypeScript type checking only |

## Permissions

SnapCal requests the following Chrome permissions:

| Permission | Why |
|------------|-----|
| `activeTab` | Capture a screenshot of the current tab |
| `scripting` | Extract page text when needed |
| `storage` | Persist your API key and preferences |
| `identity` | Sign in with Google and manage Calendar tokens |

## Troubleshooting

- **"Gemini API key not configured"** — open the extension options and paste a valid API key.
- **"Invalid Gemini API key"** — double-check the key at [Google AI Studio](https://aistudio.google.com/apikey).
- **"Rate limit exceeded"** — wait a moment and try again; the extension retries automatically with exponential backoff.
- **Calendar sign-in fails** — make sure third-party cookies are not blocking `accounts.google.com`, or try signing in through Chrome's profile.

## License

[MIT](LICENSE) — Copyright (c) 2026 RogerMcKenzie
