'use client'

import { startTransition, useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  createApplicationCycle,
  type CreateApplicationCycleState,
} from '@/app/actions/create-application-cycle'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelClass = 'mb-1 block text-xs font-medium text-gray-600'

function localDateTimeInputMin(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function AdminCreateApplicationCycleForm() {
  const router = useRouter()
  const [state, dispatch, isPending] = useActionState(createApplicationCycle, null as CreateApplicationCycleState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state && 'success' in state && state.success) {
      formRef.current?.reset()
      router.refresh()
    }
  }, [state, router])

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Create application cycle</h2>
      <form
        ref={formRef}
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          const fd = new FormData(form)
          const startLocal = String(fd.get('startTime') ?? '')
          const endLocal = String(fd.get('endTime') ?? '')
          if (startLocal) {
            const iso = new Date(startLocal).toISOString()
            fd.set('startTime', iso)
          }
          if (endLocal) {
            const iso = new Date(endLocal).toISOString()
            fd.set('endTime', iso)
          }
          startTransition(() => {
            dispatch(fd)
          })
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="cycle-name">
              Name
            </label>
            <input
              id="cycle-name"
              name="name"
              type="text"
              required
              autoComplete="off"
              className={inputClass}
              placeholder="e.g. Fall 2026"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="cycle-start">
              Start time
            </label>
            <input
              id="cycle-start"
              name="startTime"
              type="datetime-local"
              required
              min={localDateTimeInputMin()}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="cycle-end">
              End time
            </label>
            <input
              id="cycle-end"
              name="endTime"
              type="datetime-local"
              required
              min={localDateTimeInputMin()}
              className={inputClass}
            />
          </div>
        </div>
        {state && 'error' in state ? (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        ) : null}
        {state && 'success' in state && state.success ? (
          <p className="text-sm text-green-700" role="status">
            Application cycle created (inactive until the start time).
          </p>
        ) : null}
        <div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? 'Creating…' : 'Create cycle'}
          </button>
        </div>
      </form>
    </div>
  )
}
