import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

export async function createServerClient() {
  const cookieStore = await cookies()
  return createSupabaseServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignore in Server Components
        }
      },
    },
  })
}
