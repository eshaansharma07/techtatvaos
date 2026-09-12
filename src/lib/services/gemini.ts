type GeminiRequest = {
  system: string;
  prompt?: string;
  contents?: any[];
  fallback: string;
};

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
].filter(Boolean) as string[];

export async function generateWithGemini({ system, prompt, contents, fallback }: GeminiRequest) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "";
  if (!apiKey) {
    console.error("Gemini API Error: Neither GEMINI_API_KEY nor GOOGLE_GEMINI_API_KEY is configured in the environment variables.");
    return fallback;
  }

  // De-duplicate models to try
  const modelsToTry = Array.from(new Set(CANDIDATE_MODELS));

  for (const currentModel of modelsToTry) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: contents || [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            topP: 0.9,
            maxOutputTokens: 1200
          }
        })
      });
      
      if (!res.ok) {
        const errText = await res.text();
        console.warn(`Gemini API Warning (${currentModel}): HTTP ${res.status}:`, errText);
        continue;
      }
      
      const json = await res.json();
      const textResult = json?.candidates?.[0]?.content?.parts?.map((part: any) => part.text).filter(Boolean).join("\n").trim();
      if (textResult) {
        return textResult;
      }
    } catch (err) {
      console.warn(`Gemini API Warning (${currentModel}): Network exception:`, err);
    }
  }

  return fallback;
}

export function compactJson(value: unknown) {
  return JSON.stringify(value, null, 2).slice(0, 12000);
}
