'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'

export function ApplicantArchiveMenu() {
  const router = useRouter()
  const detailsRef = useRef<HTMLDetailsElement>(null)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
    router.refresh()
  }

  function closeDetailsMenu() {
    if (detailsRef.current) detailsRef.current.open = false
  }

  return (
    <details ref={detailsRef} className="relative">
      <summary
        className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md border border-white/40 bg-white/10 text-white hover:bg-white/20"
        aria-label="Open account menu"
      >
        <span className="inline-flex flex-col gap-1">
          <span className="block h-0.5 w-4 bg-current" />
          <span className="block h-0.5 w-4 bg-current" />
          <span className="block h-0.5 w-4 bg-current" />
        </span>
      </summary>

      <div className="absolute right-0 z-20 mt-2 min-w-[10rem] rounded-md border border-gray-200 bg-white p-1 shadow-lg">
        <button
          type="button"
          onClick={() => {
            closeDetailsMenu()
            void handleLogout()
          }}
          className="block w-full rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </details>
  )
}
