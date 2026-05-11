'use server'

import { revalidatePath } from 'next/cache'
import {
  emptyApplicationInsertPayload,
  upsertEmptyApplicationForCycle,
} from '@/app/lib/applicant-application-payload'
import {
  applicationCycleIntervalsOverlap,
  applicationCycleKeyFromRow,
  parseCycleTimeMs,
  pickCycleField,
  rowCycleTimeBounds,
  type ApplicationCycleRow,
} from '@/app/lib/application-cycle-helpers'
import { createServerClient } from '@/app/utils/supabase/server'
import { createServiceRoleSupabaseClient } from '@/app/utils/supabase/service-role'

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
    const existingName = String(pickCycleField(row, 'name', 'name') ?? '').trim().toLowerCase()
    if (existingName && existingName === name.toLowerCase()) {
      return { error: 'An application cycle with this name already exists. Use a different name.' }
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

  const newCycleKey = name
  if (newCycleKey) {
    const service = createServiceRoleSupabaseClient()
    const { data: applicantRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user')
      .eq('role', 'applicant')

    if (rolesError) {
      console.error('CREATE APPLICATION CYCLE (applicant roles):', rolesError)
    } else {
      for (const roleRow of (applicantRoles ?? []) as { user: string }[]) {
        const applicantId = roleRow.user
        if (!applicantId) continue

        let email = ''
        const { data: anyApp } = await supabase
          .from('Applications')
          .select('email')
          .eq('user_id', applicantId)
          .limit(1)
          .maybeSingle()
        if (anyApp?.email && String(anyApp.email).trim()) {
          email = String(anyApp.email).trim()
        } else if (service) {
          const { data: authData, error: authErr } = await service.auth.admin.getUserById(applicantId)
          if (!authErr && authData.user?.email?.trim()) {
            email = authData.user.email.trim()
          }
        }
        if (!email) {
          email = `applicant-${applicantId}@pending.invalid`
        }

        const { error: appInsErr } = await upsertEmptyApplicationForCycle(
          supabase,
          emptyApplicationInsertPayload(applicantId, email, newCycleKey),
        )
        if (appInsErr) {
          console.error('CREATE APPLICATION CYCLE (provision app):', applicantId, appInsErr)
        }
      }
    }
  }

  revalidatePath('/admin/application-cycles')
  revalidatePath('/applicant-portal')
  revalidatePath('/applicant-archive')
  return { success: true }
}
