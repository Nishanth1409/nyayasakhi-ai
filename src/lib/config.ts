/** Supabase client (optional for future features). */
export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? "";
export const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ?? "";

/**
 * Chat API URL:
 * - Production (Vercel): same-origin /api/nyaya-chat (uses LOVABLE_API_KEY on server)
 * - Local dev: Supabase edge function when .env is configured
 */
export function getNyayaChatUrl(): string {
  const override = (import.meta.env.VITE_NYAYA_CHAT_URL as string | undefined)?.trim();
  if (override) return override;

  if (import.meta.env.PROD) {
    return "/api/nyaya-chat";
  }

  if (supabaseUrl) {
    return `${supabaseUrl.replace(/\/$/, "")}/functions/v1/nyaya-chat`;
  }

  return "/api/nyaya-chat";
}

export const nyayaChatUrl = getNyayaChatUrl();

/** True when the client can call the chat API (prod always uses /api). */
export const isBackendConfigured =
  import.meta.env.PROD || Boolean(supabaseUrl && supabaseAnonKey);

export const usesVercelChatApi = import.meta.env.PROD;

export const configError =
  import.meta.env.PROD
    ? null
    : !supabaseUrl && !supabaseAnonKey
      ? "Missing VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env for local dev."
      : !supabaseUrl
        ? "Missing VITE_SUPABASE_URL."
        : !supabaseAnonKey
          ? "Missing VITE_SUPABASE_PUBLISHABLE_KEY."
          : null;
