import { LangCode } from "@/lib/languages";
import { isBackendConfigured, nyayaChatUrl, supabaseAnonKey } from "@/lib/config";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export class NyayaChatError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "NyayaChatError";
  }
}

async function readErrorMessage(resp: Response): Promise<string> {
  const ct = resp.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      const body = await resp.json();
      if (typeof body?.error === "string") return body.error;
    } catch {
      /* fall through */
    }
  }
  if (resp.status === 429) return "Too many requests. Please wait a moment.";
  if (resp.status === 402) return "AI credits exhausted.";
  if (resp.status === 401 || resp.status === 403) return "Authentication failed. Check Supabase keys.";
  if (resp.status >= 500) return "AI service is temporarily unavailable.";
  return "Could not reach NyayaSakhi. Please try again.";
}

/** Stream assistant tokens; calls onChunk for each content delta. */
export async function streamNyayaChat(
  messages: ChatMessage[],
  language: LangCode,
  onChunk: (text: string) => void,
): Promise<string> {
  if (!isBackendConfigured) {
    throw new NyayaChatError(
      "Server not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel → Settings → Environment Variables, then redeploy.",
    );
  }

  const resp = await fetch(nyayaChatUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({ messages, language }),
  });

  if (!resp.ok) {
    throw new NyayaChatError(await readErrorMessage(resp), resp.status);
  }
  if (!resp.body) throw new NyayaChatError("Empty response from server.");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let acc = "";
  let done = false;

  while (!done) {
    const { done: streamDone, value } = await reader.read();
    if (streamDone) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") {
        done = true;
        break;
      }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content;
        if (c) {
          acc += c;
          onChunk(c);
        }
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }

  return acc;
}
