/** Fail Vercel builds early if required Vite env vars are missing. */
if (process.env.VERCEL !== "1") process.exit(0);

const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
const missing = required.filter((k) => !process.env[k]?.trim());

if (missing.length) {
  console.error("\n❌ Vercel build: missing environment variables:\n");
  for (const k of missing) console.error(`   - ${k}`);
  console.error("\nAdd them in Vercel → Project → Settings → Environment Variables");
  console.error("(enable for Production AND Preview), then redeploy.\n");
  process.exit(1);
}

console.log("✓ Vercel env check passed");
