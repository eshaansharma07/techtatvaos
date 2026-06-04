type GeminiRequest = {
  system: string;
  prompt: string;
  fallback: string;
};

const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

export async function generateWithGemini({ system, prompt, fallback }: GeminiRequest) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "";
  if (!apiKey) return fallback;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.35,
          topP: 0.9,
          maxOutputTokens: 1200
        }
      })
    });
    if (!res.ok) return fallback;
    const json = await res.json();
    return json?.candidates?.[0]?.content?.parts?.map((part: any) => part.text).filter(Boolean).join("\n").trim() || fallback;
  } catch {
    return fallback;
  }
}

export function compactJson(value: unknown) {
  return JSON.stringify(value, null, 2).slice(0, 12000);
}
