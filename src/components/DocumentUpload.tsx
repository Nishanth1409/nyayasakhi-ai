import { useRef, useState } from "react";
import { Upload, FileText, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LangCode, getLang, t } from "@/lib/languages";
import { speak, stopSpeaking } from "@/hooks/useVoice";
import { NyayaChatError, streamNyayaChat } from "@/lib/nyayaChat";
import { toast } from "sonner";

interface Props { lang: LangCode; }
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_CHARS = 8000;

async function extractFromPdf(file: File): Promise<string> {
  // @ts-ignore - pdfjs-dist ESM build
  const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs");
  try {
    // @ts-ignore — bundled worker URL (Vite / Vercel)
    const worker = await import("pdfjs-dist/build/pdf.worker.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  } catch {
    // CDN fallback if worker chunk path fails in production
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  let text = "";
  const maxPages = Math.min(pdf.numPages, 15);
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => it.str).join(" ") + "\n";
    if (text.length > MAX_CHARS) break;
  }
  return text.trim();
}

async function extractFromImage(file: File, bcp47: string): Promise<string> {
  const Tesseract = (await import("tesseract.js")).default;
  // Map our bcp47 to tesseract codes (fallback to eng+hin)
  const base = bcp47.split("-")[0];
  const tessLangMap: Record<string, string> = {
    en: "eng", hi: "hin", bn: "ben", ta: "tam", te: "tel", mr: "mar",
    gu: "guj", kn: "kan", ml: "mal", pa: "pan", or: "ori", as: "asm",
  };
  const tessLang = `${tessLangMap[base] ?? "eng"}+eng`;
  const { data } = await Tesseract.recognize(file, tessLang);
  return (data.text || "").trim();
}

export const DocumentUpload = ({ lang }: Props) => {
  const language = getLang(lang);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<"idle" | "extracting" | "asking" | "done">("idle");
  const [extracted, setExtracted] = useState("");
  const [explanation, setExplanation] = useState("");
  const [voiceOn, setVoiceOn] = useState(true);

  const reset = () => {
    stopSpeaking();
    setFile(null); setExtracted(""); setExplanation(""); setStage("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  const onPick = () => inputRef.current?.click();

  const handleFile = async (f: File) => {
    if (f.size > MAX_BYTES) {
      toast.error(t(lang, "docUpTooBig") || "File too large (max 10 MB).");
      return;
    }
    const isPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
    const isImg = f.type.startsWith("image/");
    if (!isPdf && !isImg) {
      toast.error(t(lang, "docUpUnsupported") || "Please upload a PDF or image.");
      return;
    }

    setFile(f); setExplanation(""); setExtracted("");
    setStage("extracting");
    try {
      const text = isPdf ? await extractFromPdf(f) : await extractFromImage(f, language.bcp47);
      if (!text || text.length < 10) {
        toast.error(t(lang, "docUpNoText") || "Could not read any text from this file.");
        setStage("idle"); return;
      }
      const trimmed = text.slice(0, MAX_CHARS);
      setExtracted(trimmed);
      await askAI(trimmed);
    } catch (e) {
      console.error(e);
      toast.error(t(lang, "docUpExtractFail") || "Could not read this document.");
      setStage("idle");
    }
  };

  const askAI = async (text: string) => {
    setStage("asking");
    setExplanation("");
    try {
      const userMsg = `IMPORTANT: You MUST reply ONLY in ${language.name} (${language.bcp47}), using the native script of ${language.name}. Do NOT use English or any other language.\n\nI am sharing a document. Please explain it to me in very simple ${language.name}, in 4-6 short sentences. Tell me: (1) what kind of document this is, (2) the most important points, (3) what I should do next. Avoid legal jargon. Remember: entire reply must be in ${language.name} only.\n\nDOCUMENT TEXT:\n"""${text}"""`;

      const acc = await streamNyayaChat(
        [{ role: "user", content: userMsg }],
        lang,
        (chunk) => setExplanation((prev) => prev + chunk),
      );
      setStage("done");
      if (voiceOn && acc) speak(acc, language.bcp47);
      else stopSpeaking();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof NyayaChatError ? e.message : "Connection problem.");
      setStage("idle");
    }
  };

  return (
    <div className="rounded-3xl border bg-card shadow-card p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-2xl warm-bg grid place-items-center shadow-warm">
          <FileText className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="display text-xl font-bold">{t(lang, "docUpTitle") || "Understand a document"}</h3>
          <p className="text-sm text-muted-foreground">
            {t(lang, "docUpSub") || "Upload a PDF or photo. We'll explain it in simple words."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const next = !voiceOn;
            setVoiceOn(next);
            if (!next) stopSpeaking();
            else if (explanation) speak(explanation, language.bcp47);
          }}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            voiceOn ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted text-muted-foreground"
          }`}
          aria-pressed={voiceOn}
          aria-label={voiceOn ? "Turn voice off" : "Turn voice on"}
          title={voiceOn ? (t(lang, "docUpVoiceOn" as any) || "Voice: On") : (t(lang, "docUpVoiceOff" as any) || "Voice: Off")}
        >
          {voiceOn ? "🔊" : "🔇"}
          <span>{voiceOn ? (t(lang, "docUpVoiceOn" as any) || "Voice On") : (t(lang, "docUpVoiceOff" as any) || "Voice Off")}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {!file && (
        <button
          onClick={onPick}
          className="w-full rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors p-8 grid place-items-center text-center gap-2"
        >
          <Upload className="h-8 w-8 text-primary" />
          <div className="font-semibold">{t(lang, "docUpChoose") || "Choose a file"}</div>
          <div className="text-xs text-muted-foreground">PDF · JPG · PNG · {t(lang, "docUpMax") || "max 10 MB"}</div>
        </button>
      )}

      {file && (
        <div className="rounded-2xl border bg-muted/30 p-4 flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate text-sm">{file.name}</div>
            <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</div>
          </div>
          <Button size="icon" variant="ghost" onClick={reset} className="rounded-full" aria-label="Remove">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {stage === "extracting" && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          {t(lang, "docUpReading") || "Reading the document…"}
        </div>
      )}
      {stage === "asking" && !explanation && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          {t(lang, "docUpThinking") || "NyayaSakhi is thinking…"}
        </div>
      )}

      {explanation && (
        <div className="rounded-2xl border bg-gradient-to-br from-accent/10 to-primary/5 p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            {t(lang, "docUpExplanation") || "Simple explanation"}
          </div>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{explanation}</p>
          {stage === "done" && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => { stopSpeaking(); speak(explanation, language.bcp47); }}>
                🔊 {t(lang, "docUpListen") || "Listen again"}
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full" onClick={reset}>
                {t(lang, "docUpAnother") || "Upload another"}
              </Button>
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground text-center">{t(lang, "disclaimer")}</p>
    </div>
  );
};
