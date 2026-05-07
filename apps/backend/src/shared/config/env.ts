import { z } from "zod";

const emptyToUndefined = (value: unknown) => value === "" ? undefined : value;
const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const optionalPrefixed = (prefix: string) =>
  z.preprocess(emptyToUndefined, z.string().startsWith(prefix).optional());

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.preprocess(emptyToUndefined, z.coerce.number().default(4000)),
  API_URL: z.preprocess(emptyToUndefined, z.string().url().default("http://localhost:4000")),
  WEB_URL: z.preprocess(emptyToUndefined, z.string().url().default("http://localhost:3000")),

  // Database
  DATABASE_URL: optionalString,

  // Redis
  REDIS_URL: optionalString,

  // Auth
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  // Stripe
  STRIPE_SECRET_KEY: optionalPrefixed("sk_"),
  STRIPE_WEBHOOK_SECRET: optionalPrefixed("whsec_"),
  STRIPE_MONTHLY_PRICE_ID: optionalPrefixed("price_"),
  STRIPE_ANNUAL_PRICE_ID: optionalPrefixed("price_"),
  STRIPE_LIFETIME_PRICE_ID: optionalPrefixed("price_"),

  // Mux
  MUX_TOKEN_ID: optionalString,
  MUX_TOKEN_SECRET: optionalString,
  MUX_SIGNING_KEY_ID: optionalString,
  MUX_SIGNING_PRIVATE_KEY: optionalString,
  MUX_WEBHOOK_SECRET: optionalString,

  // Cloudflare R2
  R2_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET_NAME: optionalString,
  R2_PUBLIC_URL: optionalUrl,

  // Email (Resend)
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: z.preprocess(emptyToUndefined, z.string().email().default("noreply@rudiment.pro")),

  // Sentry
  SENTRY_DSN: optionalUrl,
});

function loadEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
export type Env = z.infer<typeof envSchema>;
