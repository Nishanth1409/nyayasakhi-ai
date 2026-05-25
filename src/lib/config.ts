/** Supabase + Nyaya chat — required for AI chat and document upload. */
export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? "";
export const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ?? "";

export const nyayaChatUrl = supabaseUrl ? `${supabaseUrl}/functions/v1/nyaya-chat` : "";

export const isBackendConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const configError =
  !supabaseUrl && !supabaseAnonKey
    ? "Missing VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."
    : !supabaseUrl
      ? "Missing VITE_SUPABASE_URL."
      : !supabaseAnonKey
        ? "Missing VITE_SUPABASE_PUBLISHABLE_KEY."
        : null;
