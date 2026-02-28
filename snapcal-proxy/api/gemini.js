const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = "gemini-2.5-flash";

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: "API key not configured on server" });
        return;
    }

    try {
        const { contents, generationConfig } = req.body;

        if (!contents) {
            res.status(400).json({ error: "Missing 'contents' in request body" });
            return;
        }

        const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents, generationConfig }),
        });

        const data = await response.json();

        if (!response.ok) {
            res.status(response.status).json(data);
            return;
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Proxy request failed" });
    }
}
