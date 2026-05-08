'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'
import { SubmittedStaticForm } from '@/app/components/SubmittedStaticForm'
import { withdrawApplication } from '@/app/actions/withdraw-application'

type Props = {
  application: Record<string, unknown> | null
}

function completionStatusOf(row: Record<string, unknown> | null): string | null {
  if (!row) return null
  return (
    (row.completionStatus as string | undefined) ??
    (row.completion_status as string | undefined) ??
    null
  )
}

export function ApplicantPortalMenu({ application }: Props) {
  const router = useRouter()
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [withdrawing, startWithdraw] = useTransition()

  const status = completionStatusOf(application)
  const canWithdraw = application != null && status !== 'Withdrawn'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
    router.refresh()
  }

  function closeDetailsMenu() {
    if (detailsRef.current) detailsRef.current.open = false
  }

  function openWithdrawModal() {
    closeDetailsMenu()
    setWithdrawError(null)
    setWithdrawOpen(true)
  }

  function closeWithdrawModal() {
    if (!withdrawing) setWithdrawOpen(false)
  }

  function confirmWithdraw() {
    setWithdrawError(null)
    startWithdraw(async () => {
      const result = await withdrawApplication()
      if ('error' in result && result.error) {
        setWithdrawError(result.error)
        return
      }
      setWithdrawOpen(false)
      router.refresh()
    })
  }

  return (
    <>
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
          {canWithdraw && (
            <button
              type="button"
              onClick={() => {
                openWithdrawModal()
              }}
              className="block w-full rounded px-3 py-2 text-left text-sm text-amber-900 hover:bg-amber-50"
            >
              Withdraw application
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              void handleLogout()
            }}
            className={`block w-full rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50${canWithdraw ? ' border-t border-gray-100' : ''}`}
          >
            Logout
          </button>
        </div>
      </details>

      {withdrawOpen && application && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeWithdrawModal()
          }}
        >
          <div
            className="flex max-h-[min(90vh,900px)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-dialog-title"
          >
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 id="withdraw-dialog-title" className="text-lg font-semibold text-gray-900">
                Withdraw application
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Below is a read-only copy of your application as it stands now. Withdrawing will
                delete your uploaded documents from storage, clear your answers, and set your
                completion status to Withdrawn. After that, your application cannot be edited
                again from this portal.
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <SubmittedStaticForm application={application} />
            </div>
            {withdrawError && (
              <p className="px-5 text-sm text-red-700" role="alert">
                {withdrawError}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={closeWithdrawModal}
                disabled={withdrawing}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmWithdraw}
                disabled={withdrawing}
                className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-800 disabled:opacity-60"
              >
                {withdrawing ? 'Withdrawing…' : 'Confirm withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
