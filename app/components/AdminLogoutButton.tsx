'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'

export function AdminLogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={() => {
        void handleLogout()
      }}
      className="w-full rounded-md px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
    >
      Logout
    </button>
  )
}
