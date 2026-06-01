import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  SUPABASE_URL: z.string().url('Invalid SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Missing SUPABASE_SERVICE_ROLE_KEY'),
  BASE_URL: z.string().url('Invalid BASE_URL'),
  PORT: z.string().default('4000').transform(Number),
  IP_HASH_SECRET: z.string().min(32, 'IP_HASH_SECRET must be at least 32 characters'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Environment validation failed:');
    error.errors.forEach(err => {
      console.error(`  ${err.path.join('.')}: ${err.message}`);
    });
  }
  process.exit(1);
}

export default env;
