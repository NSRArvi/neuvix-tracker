/**
 * Production environment variable validator
 * Fails fast with clear instructions if any critical keys are missing.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(
      `[CONFIG ERROR] Missing required environment variable: "${key}". Please check your .env.local file.`
    );
  }
  return value.trim();
}

export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get RESEND_API_KEY() {
    return process.env.RESEND_API_KEY?.trim() || "";
  },
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
};
