import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  GOOGLE_API_KEY: z.string().optional(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("❌ Invalid environment variables:", env.error.format());
  // Don't exit yet, might be running in a mode that doesn't need them immediately
}

export const config = {
  googleApiKey: env.data?.GOOGLE_API_KEY,
};
