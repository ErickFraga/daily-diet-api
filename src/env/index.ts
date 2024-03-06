import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  console.log('loading test env')
  config({ path: '.env.test' })
} else {
  config()
}
const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z
    .string()
    .default('3333')
    .transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error(
    `Invalid environment variables: ${JSON.stringify(_env.error.format())}`,
  )
  throw new Error('Invalid environment variables')
}

export const env = _env.data
