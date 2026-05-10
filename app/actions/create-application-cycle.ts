'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/app/utils/supabase/server'
import {
  applicationCycleIntervalsOverlap,
  parseCycleTimeMs,
  rowCycleTimeBounds,
  type ApplicationCycleRow,
} from '@/app/lib/application-cycle-helpers'

export type CreateApplicationCycleState = { error: string } | { success: true } | null

export async function createApplicationCycle(
  _prev: CreateApplicationCycleState,
  formData: FormData,
): Promise<CreateApplicationCycleState> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in.' }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user', user.id)
    .maybeSingle()

  if (roleRow?.role !== 'admin') return { error: 'Not allowed.' }

  const name = String(formData.get('name') ?? '').trim()
  const startRaw = String(formData.get('startTime') ?? '').trim()
  const endRaw = String(formData.get('endTime') ?? '').trim()

  if (!name) return { error: 'Name is required.' }
  if (!startRaw || !endRaw) return { error: 'Start time and end time are required.' }

  const startMs = parseCycleTimeMs(startRaw)
  const endMs = parseCycleTimeMs(endRaw)
  if (startMs == null || endMs == null) return { error: 'Invalid start or end time.' }

  const nowMs = Date.now()

  if (startMs <= nowMs) {
    return { error: 'Start time must be after the current date and time.' }
  }
  if (endMs <= nowMs) {
    return { error: 'End time must be after the current date and time.' }
  }
  if (endMs <= startMs) {
    return { error: 'End time must be after the start time.' }
  }
  if (nowMs >= startMs && nowMs < endMs) {
    return { error: 'The current time cannot fall between the new cycle start and end.' }
  }

  const { data: existing, error: loadError } = await supabase.from('applicationCycle').select('*')
  if (loadError) {
    console.error('CREATE APPLICATION CYCLE (load):', loadError)
    return { error: loadError.message }
  }

  for (const row of (existing ?? []) as ApplicationCycleRow[]) {
    const b = rowCycleTimeBounds(row)
    if (b == null) continue
    if (applicationCycleIntervalsOverlap(startMs, endMs, b.startMs, b.endMs)) {
      return { error: 'This time range overlaps an existing application cycle.' }
    }
  }

  const { error: insertError } = await supabase.from('applicationCycle').insert({
    name,
    startTime: new Date(startMs).toISOString(),
    endTime: new Date(endMs).toISOString(),
    status: 'inactive',
  })

  if (insertError) {
    console.error('CREATE APPLICATION CYCLE:', insertError)
    return { error: insertError.message }
  }

  revalidatePath('/admin/application-cycles')
  revalidatePath('/applicant-portal')
  return { success: true }
}
