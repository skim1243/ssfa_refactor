import type { SupabaseClient } from '@supabase/supabase-js'
import {
  applicationCycleKeyFromRow,
  findCurrentRunningCycle,
  rowCycleTimeBounds,
  syncApplicationCycleStatuses,
  type ApplicationCycleRow,
} from '@/app/lib/application-cycle-helpers'
import {
  emptyApplicationInsertPayload,
  upsertEmptyApplicationForCycle,
} from '@/app/lib/applicant-application-payload'
import { removeApplicationDocumentsFromStorage } from '@/app/lib/application-document-storage'

export type ApplicationRow = Record<string, unknown>

const TERMINAL_COMPLETION = new Set(['Submitted', 'Withdrawn', 'Overdue'])

function applicationCycleIdFromApplicationRow(row: ApplicationRow): string | null {
  const v = row.applicationCycle ?? row.application_cycle
  if (v == null || v === '') return null
  const s = String(v).trim()
  return s.length > 0 ? s : null
}

function completionStatusOf(row: ApplicationRow): string | null {
  const st =
    (row.completionStatus as string | undefined) ?? (row.completion_status as string | undefined) ?? null
  return st
}

/**
 * Portal shows the application for the current active cycle if present; otherwise the
 * application for the most recently ended cycle (latest `endTime`) that has a row.
 */
export function pickPortalApplication(
  applications: ApplicationRow[],
  cycles: ApplicationCycleRow[],
  nowMs: number,
): ApplicationRow | null {
  const activeCycle = findCurrentRunningCycle(cycles, nowMs)
  if (activeCycle) {
    const activeKey = applicationCycleKeyFromRow(activeCycle)
    if (activeKey) {
      const forActive = applications.find((a) => applicationCycleIdFromApplicationRow(a) === activeKey)
      if (forActive) return forActive
    }
  }

  const pastCycles = cycles
    .map((row) => {
      const b = rowCycleTimeBounds(row)
      if (b == null) return null
      return { row, ...b }
    })
    .filter((x): x is { row: ApplicationCycleRow; startMs: number; endMs: number } => x != null)
    .filter(({ endMs }) => nowMs >= endMs)
    .sort((a, b) => b.endMs - a.endMs)

  for (const { row } of pastCycles) {
    const cid = applicationCycleKeyFromRow(row)
    if (!cid) continue
    const app = applications.find((a) => applicationCycleIdFromApplicationRow(a) === cid)
    if (app) return app
  }

  const legacy = applications.filter((a) => applicationCycleIdFromApplicationRow(a) == null)
  return legacy[0] ?? null
}

async function markApplicationsOverdueAfterDeadline<T extends SupabaseClient>(supabase: T): Promise<void> {
  const nowMs = Date.now()
  const { data: cycles, error: cErr } = await supabase.from('applicationCycle').select('*')
  if (cErr || !cycles?.length) return

  const cycleEndByKey = new Map<string, number>()
  for (const c of cycles as ApplicationCycleRow[]) {
    const key = applicationCycleKeyFromRow(c)
    const b = rowCycleTimeBounds(c)
    if (key && b) cycleEndByKey.set(key, b.endMs)
  }

  const { data: apps, error: aErr } = await supabase.from('Applications').select('*')
  if (aErr || !apps?.length) return

  for (const raw of apps as ApplicationRow[]) {
    const status = completionStatusOf(raw)
    if (status && TERMINAL_COMPLETION.has(status)) continue

    const cycleId = applicationCycleIdFromApplicationRow(raw)
    if (!cycleId) continue

    const endMs = cycleEndByKey.get(cycleId)
    if (endMs == null || nowMs < endMs) continue

    const pk = raw.id
    const userId = (raw.user_id as string | undefined) ?? (raw.userId as string | undefined)
    if (pk == null || pk === '' || !userId) continue

    await removeApplicationDocumentsFromStorage(supabase, userId, raw)

    const existingEmail = raw.email
    const emailPatch =
      typeof existingEmail === 'string' && existingEmail.trim().length > 0 ? existingEmail.trim() : null

    const cleared: Record<string, unknown> = {
      firstName: null,
      lastName: null,
      phoneNumber: null,
      parentsEmail: null,
      school: null,
      major: null,
      grade: null,
      enrollmentDoc: null,
      officialTranscript: null,
      incomeTax: null,
      introVideo: null,
      evidenceFile: null,
      completionStatus: 'Overdue',
      acceptenceStatus: 'Pending',
      submissionDate: null,
    }
    if (emailPatch != null) cleared.email = emailPatch

    const { error: updErr } = await supabase.from('Applications').update(cleared).eq('id', pk)

    if (updErr) {
      console.error('markApplicationsOverdueAfterDeadline:', updErr)
    }
  }
}

async function ensureApplicationForActiveCycle<T extends SupabaseClient>(
  supabase: T,
  userId: string,
  emailForRow: string,
): Promise<void> {
  const { data: cycles, error: cErr } = await supabase.from('applicationCycle').select('*')
  if (cErr || !cycles?.length) return

  const active = findCurrentRunningCycle(cycles as ApplicationCycleRow[], Date.now())
  if (!active) return

  const cycleKey = applicationCycleKeyFromRow(active as ApplicationCycleRow)
  if (!cycleKey) return

  const { error: insErr } = await upsertEmptyApplicationForCycle(
    supabase,
    emptyApplicationInsertPayload(userId, emailForRow, cycleKey),
  )

  if (insErr) {
    console.error('ensureApplicationForActiveCycle (upsert):', insErr)
  }
}

/**
 * Syncs cycle rows, marks non-submitted applications overdue after their cycle end, and when at
 * least one cycle newly becomes `active`, deletes every `Applications` row with completion Overdue.
 */
export async function runGlobalApplicationCycleSync<T extends SupabaseClient>(supabase: T): Promise<void> {
  const { activatedCycleIds } = await syncApplicationCycleStatuses(supabase)
  await markApplicationsOverdueAfterDeadline(supabase)

  if (activatedCycleIds.length > 0) {
    const { error: delErr } = await supabase.from('Applications').delete().eq('completionStatus', 'Overdue')
    if (delErr) {
      console.error('runGlobalApplicationCycleSync (delete overdue):', delErr)
    }
  }
}

/**
 * Global cycle effects plus an `Applications` row for this user when a cycle is active.
 */
export async function runApplicantPortalLifecycle<T extends SupabaseClient>(
  supabase: T,
  userId: string,
  emailForNewRow: string,
): Promise<void> {
  await runGlobalApplicationCycleSync(supabase)
  await ensureApplicationForActiveCycle(supabase, userId, emailForNewRow)
}

export async function loadApplicantPortalContext<T extends SupabaseClient>(
  supabase: T,
  userId: string,
  emailForNewRow: string,
  explicitApplicationId?: string | null,
): Promise<{
  portalApplication: ApplicationRow | null
  applications: ApplicationRow[]
  cycles: ApplicationCycleRow[]
}> {
  await runApplicantPortalLifecycle(supabase, userId, emailForNewRow)

  const [{ data: applications, error: aErr }, { data: cycles, error: cErr }] = await Promise.all([
    supabase.from('Applications').select('*').eq('user_id', userId),
    supabase.from('applicationCycle').select('*'),
  ])

  if (aErr) console.error('loadApplicantPortalContext applications:', aErr)
  if (cErr) console.error('loadApplicantPortalContext cycles:', cErr)

  const appRows = (applications ?? []) as ApplicationRow[]
  const cycleRows = (cycles ?? []) as ApplicationCycleRow[]

  const explicit = String(explicitApplicationId ?? '').trim()
  let portalApplication: ApplicationRow | null = null
  if (explicit) {
    portalApplication = appRows.find((r) => String(r.id ?? '') === explicit) ?? null
  } else {
    portalApplication = pickPortalApplication(appRows, cycleRows, Date.now())
  }

  return { portalApplication, applications: appRows, cycles: cycleRows }
}

export async function resolvePortalApplicationRowForApplicant<T extends SupabaseClient>(
  supabase: T,
  userId: string,
  emailForNewRow: string,
  explicitApplicationId?: string | null,
): Promise<ApplicationRow | null> {
  const { portalApplication } = await loadApplicantPortalContext(
    supabase,
    userId,
    emailForNewRow,
    explicitApplicationId,
  )
  return portalApplication
}
