import { AlertTriangle } from "lucide-react";
import { configError } from "@/lib/config";

/** Shown in local dev when .env is missing (production uses /api/nyaya-chat on Vercel). */
export const ConfigBanner = () => {
  if (!configError) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 border-b border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <div className="container mx-auto flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">AI features are not configured</p>
          <p className="mt-1 opacity-90">{configError} Copy values from .env.example into a `.env` file, then restart `npm run dev`.</p>
        </div>
      </div>
    </div>
  );
};
