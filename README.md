# ⚖️ NyayaSakhi AI

### Multilingual AI Legal Assistant for Rural Women in India

NyayaSakhi AI is a **Generative AI-powered legal assistant** that provides **simple, multilingual legal guidance** to rural women in India, focusing on **inheritance and property rights**.

---

## 🚀 Features

* 🌐 **Multilingual Support**
  Supports multiple Indian languages (Hindi, Tamil, Telugu, Marathi, etc.)

* 🤖 **AI-Powered Chatbot**
  Uses Gemini 2.5 Flash (via API) to generate legal guidance

* 🧠 **Prompt Engineering**
  Ensures:

  * Simple explanations
  * Cultural sensitivity
  * Legal relevance

* ⚡ **Real-Time Streaming Responses**
  Chat responses are streamed live

* 📄 **Document Upload & Explanation (NEW 🔥)**

  * Upload legal documents (PDF/Text)
  * AI extracts and explains them in simple language
  * Helps users understand complex legal papers

* 🔒 **Serverless Backend**
  Built using Supabase Edge Functions (Deno)

---

## 🧠 How It Works

1. User enters a query OR uploads a document
2. Request is sent to Supabase Edge Function
3. System prompt guides AI behavior
4. AI processes:

   * Chat query OR
   * Document text
5. Response is streamed back to frontend

---

## 📄 Document Upload Feature

### 💡 What it does

* Upload a legal document (PDF or text)
* Extracts content
* Explains in **simple, user-friendly language**

### 🧠 Example Use Case

> A user uploads a property document →
> AI explains ownership, rights, and important clauses in simple terms.

---

## 🏗️ Tech Stack

### Frontend

* React + Vite
* TypeScript
* Tailwind CSS

### Backend

* Supabase Edge Functions (Deno)

### AI Layer

* Gemini 2.5 Flash (via Lovable AI Gateway)
* Prompt Engineering
* Streaming responses

---

## 📁 Project Structure

```
nyayasakhi-ai/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── integrations/
│   ├── lib/
│
├── supabase/
│   ├── functions/nyaya-chat/
│
├── public/
├── .env
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/nyayasakhi-ai.git
cd nyayasakhi-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
```

In Supabase:

```
LOVABLE_API_KEY=your_api_key
```

---

### 4. Run the project

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 🌐 Deploy to Vercel (same behavior as local)

The frontend on Vercel talks to your **Supabase Edge Function** (not Vercel serverless). For every feature to work like `npm run dev`:

### 1. Vercel environment variables (required)

In **Vercel → Project → Settings → Environment Variables**, add for **Production** and **Preview**:

| Variable | Value |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://luuvuswwfmhtwhursrfx.supabase.co` (your project URL) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase **anon** public key |

Then **Redeploy**. Vite bakes these in at **build** time — changing them later requires a new deploy.

### 2. Supabase Edge Function (required for AI chat & document explain)

```bash
npx supabase login
npx supabase link --project-ref luuvuswwfmhtwhursrfx
npx supabase secrets set LOVABLE_API_KEY=your_lovable_api_key
npx supabase functions deploy nyaya-chat
```

`LOVABLE_API_KEY` must match what you use locally (Lovable workspace / AI gateway).

### 3. What works without extra setup

| Feature | Needs |
|---------|--------|
| Home, language picker, legal checklist, help directory | Frontend only ✓ |
| Voice input / text-to-speech | HTTPS + Chrome (works on Vercel) ✓ |
| AI chat, document upload + AI explain | Steps 1 + 2 above |

### 4. Verify after deploy

1. Open your Vercel URL — no red config banner at the top.
2. **Talk to NyayaSakhi** — send a message; reply should stream.
3. **Upload a document** — PDF or image; explanation should stream.
4. If chat fails: check browser Network tab for `nyaya-chat` (401 → keys; 500 → `LOVABLE_API_KEY` or function not deployed).

---

## 🔮 Future Improvements

* 🧠 Chat memory (persistent conversations)
* 📚 RAG (document-based knowledge retrieval)
* 🎤 Voice input/output
* 📍 Location-based legal help
* 📊 Admin analytics dashboard

---

## ⚠️ Disclaimer

This application provides **general legal guidance only** and is **not a substitute for professional legal advice**.

---

## ❤️ Acknowledgment

Built to empower women with accessible legal knowledge using AI.
