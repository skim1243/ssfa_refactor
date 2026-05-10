'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  pickCycleField,
  parseCycleTimeMs,
  type ApplicationCycleRow,
} from '@/app/lib/application-cycle-helpers'

type Props = {
  cycle: ApplicationCycleRow | null
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '0s'
  const totalSec = Math.floor(ms / 1000)
  const d = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const parts: string[] = []
  if (d) parts.push(`${d}d`)
  if (h || d) parts.push(`${h}h`)
  parts.push(`${m}m`)
  parts.push(`${s}s`)
  return parts.join(' ')
}

function formatDateTime(value: unknown): string {
  const ms = parseCycleTimeMs(value)
  if (ms == null) return '—'
  return new Date(ms).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function CurrentApplicationCycleBanner({ cycle }: Props) {
  const router = useRouter()
  const refreshAfterEndRef = useRef(false)
  const endMs = useMemo(
    () => (cycle == null ? null : parseCycleTimeMs(pickCycleField(cycle, 'endTime', 'end_time'))),
    [cycle],
  )
  const [remainingMs, setRemainingMs] = useState<number | null>(() =>
    endMs == null ? null : endMs - Date.now(),
  )

  useEffect(() => {
    refreshAfterEndRef.current = false
  }, [endMs])

  useEffect(() => {
    if (endMs == null) {
      setRemainingMs(null)
      return
    }
    const tick = () => {
      const r = endMs - Date.now()
      setRemainingMs(r)
      if (r <= 0 && !refreshAfterEndRef.current) {
        refreshAfterEndRef.current = true
        router.refresh()
      }
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [endMs, router])

  if (cycle == null) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
        No application cycle is currently in progress.
      </div>
    )
  }

  const name = String(pickCycleField(cycle, 'name', 'name') ?? '').trim() || '—'
  const startDisplay = formatDateTime(pickCycleField(cycle, 'startTime', 'start_time'))
  const endDisplay = formatDateTime(pickCycleField(cycle, 'endTime', 'end_time'))

  return (
    <div className="mx-auto w-full max-w-xl rounded-lg border border-blue-200 bg-blue-50 px-6 py-6 text-center shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-blue-800">Current application cycle</p>
      <p className="mt-2 text-xl font-semibold text-gray-900">{name}</p>
      <p className="mt-3 text-xs text-gray-600">
        {startDisplay} — {endDisplay}
      </p>
      <p className="mt-4 text-sm text-gray-700">
        Time remaining:{' '}
        <span className="font-mono text-base font-semibold text-blue-900 tabular-nums">
          {remainingMs == null ? '—' : formatDuration(remainingMs)}
        </span>
      </p>
    </div>
  )
}
