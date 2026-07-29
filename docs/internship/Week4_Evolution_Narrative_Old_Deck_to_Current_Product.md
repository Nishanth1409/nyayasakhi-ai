# Week 4 — Professional narrative: older Week 3 deck vs current NyayaSakhi AI

Use this as **speaker notes** or a **report section** when presenting `Week4_Integration_Testing_and_Project_Evolution.pptx`.

---

## 1. What we compared

We extracted text from **`Week3_Development_Core_Implementation.pptx`**. That deck describes:

- A product titled **“Inheritance Dispute Resolver for Rural Women”**
- A **Python FastAPI** backend with REST APIs
- A **guided questionnaire** style flow (structured prompts rather than open chat as the headline)
- **Modular services** (explanation, retrieval, legal aid, feedback) and a **retrieval baseline** for grounded text
- **Localization** called out for English, Kannada, and Hindi

The **current repository** (`nyayasakhi-ai`) implements **NyayaSakhi AI** with:

- **React + Vite + TypeScript** SPA
- **Supabase Edge Function** `nyaya-chat` (Deno) as the AI backend — **not** a FastAPI service in this codebase
- **Streaming** chat completions (SSE) via a managed AI gateway to **Gemini 2.5 Flash**
- **Open conversational** legal guidance plus **LegalGuidance** / checklist wizard and **HelpDirectory**
- A **fifth major journey**: **Document upload** — PDF text extraction (`pdfjs-dist`) and image OCR (`tesseract.js`), then the same Edge Function for a plain-language explanation
- **Stricter language control** in the document flow (user prompt instructs the model to reply *only* in the selected language) and a **voice on/off** control for read-aloud after answers
- **Branding updates** (logo in header, favicon) for a coherent product identity

---

## 2. How to explain this to an examiner (without sounding contradictory)

**Single sentence:**  
*“Our Week 3 slides reflected an earlier architectural plan (FastAPI + REST + modular retrieval services). During implementation we aligned with the NyayaSakhi AI platform stack—Supabase Edge Functions and streaming LLM calls—which better matched hosting, API keys, and rapid iteration, while preserving the same social and functional goals from the SRS.”*

**Deeper points:**

1. **Backend shape (“backend changes”)**  
   The “backend” is still *server-side logic*, but it is **serverless** and **co-located with Supabase** instead of a separate FastAPI process. The Edge Function centralizes: CORS, JSON parsing, system-prompt construction, gateway authentication, and streaming pass-through. That is a **deployment and security** improvement (secrets not in the browser bundle).

2. **Why streaming matters for integration Week 4**  
   Integration testing must cover **partial responses**, stream interruption, and error codes (**402**, **429**) mapped to user-visible toasts — different from a single JSON response from classic REST.

3. **Document upload as post–Week-3 scope expansion**  
   The Week 3 deck did not mention client-side PDF/OCR pipelines. This is **additive value**: rural users often have **paper scans or PDF notices**; extracting text and asking the same governed AI reduces friction. Week 4 work includes **wiring** that module to the same `nyaya-chat` endpoint and validating **latency** and **language quality**.

4. **Multilingual strategy**  
   The old deck listed three languages explicitly. The product now supports a **wider set** of Indian languages in the UI and model routing; Week 4 highlights **enforcement** in prompts where we saw **code-mixing** or English defaults in document explanations.

---

## 3. What belongs in “testing & debugging” (Week 4)

- **Cross-module:** language change resets greetings; upload + chat both respect `lang`  
- **Resilience:** network failures, empty OCR, oversized files  
- **Accessibility:** voice toggle, `tel:181` behavior on mobile  
- **Automation:** Vitest baseline; room to grow unit tests for language helpers

---

## 4. Regenerating the PowerPoint

From the `presentations` folder:

```bash
python generate_week4_nyayasakhi.py
```

Requires `python-pptx` (`python -m pip install python-pptx`).
