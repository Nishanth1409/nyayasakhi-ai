import { AlertTriangle } from "lucide-react";
import { configError, isBackendConfigured } from "@/lib/config";

/** Shown when VITE_* env vars were not set at build time (common Vercel misconfiguration). */
export const ConfigBanner = () => {
  if (isBackendConfigured) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 border-b border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <div className="container mx-auto flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">AI features are not configured for this deployment</p>
          <p className="mt-1 opacity-90">
            {configError} In Vercel → Project → Settings → Environment Variables, add both variables for
            Production and Preview, then redeploy. On Supabase, set secret <code className="text-xs">LOVABLE_API_KEY</code> and
            deploy the <code className="text-xs">nyaya-chat</code> function.
          </p>
        </div>
      </div>
    </div>
  );
};
