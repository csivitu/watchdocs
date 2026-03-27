// to registry lookup; Gemini fallback
import "dotenv/config";
import { Dependency, DocResult, DocResolver } from "../../models.js";

export class GeminiResolver implements DocResolver {
  async resolve(deps: Dependency[]): Promise<DocResult[]> {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
      You are a documentation link resolver.
      Given this list of dependencies, return ONLY a JSON array with no extra text, no markdown, no backticks.
      For each dependency, find the official documentation URL.
      If you are unsure, set docUrl to null.

      Dependencies:
      ${JSON.stringify(deps)}

      Return format:
      [{ "name": "", "version": "", "docUrl": "", "source": "llm" }]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new Error("No response text from Gemini");
    }

    let parsed: DocResult[];

    try {
      const clean = text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      throw new Error(`Failed to parse Gemini response as JSON: ${text}`);
    }

    return parsed.map((item) => ({
      name: item.name,
      version: item.version ?? null,
      docUrl: isValidUrl(item.docUrl) ? item.docUrl : null,
      source: "llm" as const,
    }));
  }
}

function isValidUrl(url: string | null | undefined): boolean {
  if (!url) { return false; }
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}