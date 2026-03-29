// to registry lookup; Gemini fallback
import * as vscode from "vscode";
import { Dependency, DocResult, DocResolver } from "../../models";

export class GeminiResolver implements DocResolver {
  private static API_KEY_SECRET = "gemini-api-key";
  constructor(private context: vscode.ExtensionContext) {}
  async resolve(deps: Dependency[]): Promise<DocResult[]> {
    const apiKey = await this.context.secrets.get(GeminiResolver.API_KEY_SECRET);
    if (!apiKey) {
      throw new Error("No Gemini API key. Please set one in sidebar.");
    }
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

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

  static async setApiKey(context: vscode.ExtensionContext): Promise<void> {
    const apiKey = await vscode.window.showInputBox({
      prompt: "Enter your Gemini API Key",
      password: true,
      placeHolder: "GeminiKey"
    });
    if (apiKey) {
      await context.secrets.store(GeminiResolver.API_KEY_SECRET, apiKey);
      vscode.window.showInformationMessage("Gemini API Key saved!");
    }
  }
  static async hasApiKey(context: vscode.ExtensionContext): Promise<boolean> {
    const key = await context.secrets.get(GeminiResolver.API_KEY_SECRET);
    return !!key;
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