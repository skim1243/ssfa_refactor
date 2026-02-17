import { createBrowserClient } from '@supabase/ssr'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Set it in your environment (and in .env.local for local development).`
    )
  }
  return value
}

const supabaseUrl = requiredEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = requiredEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY')

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey)
}
