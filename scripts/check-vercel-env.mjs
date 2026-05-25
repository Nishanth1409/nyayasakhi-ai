/** Fail Vercel builds early if the AI API key is missing. */
if (process.env.VERCEL !== "1") process.exit(0);

if (!process.env.LOVABLE_API_KEY?.trim()) {
  console.error("\n❌ Vercel build: missing LOVABLE_API_KEY\n");
  console.error("   Chat and document analysis will NOT work without it.\n");
  console.error("   1. Open Vercel → your project → Settings → Environment Variables");
  console.error("   2. Add LOVABLE_API_KEY = your Lovable / AI gateway API key");
  console.error("   3. Enable for Production AND Preview");
  console.error("   4. Redeploy\n");
  process.exit(1);
}

console.log("✓ Vercel env check passed (LOVABLE_API_KEY set)");
