import type { SupabaseClient } from '@supabase/supabase-js'

export type ApplicationCycleRow = Record<string, unknown>

export type ApplicationCycleStatus = 'active' | 'inactive' | 'past'

export function pickCycleField(row: ApplicationCycleRow, camel: string, snake: string): unknown {
  return row[camel] ?? row[snake]
}

export function parseCycleTimeMs(value: unknown): number | null {
  if (value == null || value === '') return null
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return null
  return d.getTime()
}

/** Half-open overlap: [aStart, aEnd) vs [bStart, bEnd) — touching endpoints do not overlap. */
export function applicationCycleIntervalsOverlap(
  aStartMs: number,
  aEndMs: number,
  bStartMs: number,
  bEndMs: number,
): boolean {
  return aStartMs < bEndMs && bStartMs < aEndMs
}

export function desiredApplicationCycleStatus(nowMs: number, startMs: number, endMs: number): ApplicationCycleStatus {
  if (nowMs >= endMs) return 'past'
  if (nowMs >= startMs) return 'active'
  return 'inactive'
}

function normalizeDbStatus(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function rowCycleTimeBounds(row: ApplicationCycleRow): { startMs: number; endMs: number } | null {
  const startMs = parseCycleTimeMs(pickCycleField(row, 'startTime', 'start_time'))
  const endMs = parseCycleTimeMs(pickCycleField(row, 'endTime', 'end_time'))
  if (startMs == null || endMs == null) return null
  return { startMs, endMs }
}

/**
 * Natural key for linking `Applications.applicationCycle` to a row in `applicationCycle`.
 * The DB table has no `id` column — use a non-empty, trimmed **name** (keep cycle names unique).
 */
export function applicationCycleKeyFromRow(row: ApplicationCycleRow): string | null {
  const n = pickCycleField(row, 'name', 'name')
  if (n == null || n === '') return null
  const s = String(n).trim()
  return s.length > 0 ? s : null
}

/** First cycle whose window contains `now` (start <= now < end), by earliest start. */
export function findCurrentRunningCycle(rows: ApplicationCycleRow[], nowMs: number): ApplicationCycleRow | null {
  const withBounds = rows
    .map((row) => {
      const b = rowCycleTimeBounds(row)
      return b == null ? null : { row, ...b }
    })
    .filter((x): x is { row: ApplicationCycleRow; startMs: number; endMs: number } => x != null)
    .filter(({ startMs, endMs }) => nowMs >= startMs && nowMs < endMs)
    .sort((a, b) => a.startMs - b.startMs)

  return withBounds[0]?.row ?? null
}

export type SyncApplicationCycleStatusesResult = {
  /** Non-empty when at least one cycle transitioned into `active` (values are cycle names; only `.length` is used downstream). */
  activatedCycleIds: string[]
}

/**
 * Updates each row's `status` from start/end times vs current time.
 * Call from server contexts (admin page, applicant portal, etc.) so cycles flip inactive → active → past without a cron.
 */
export async function syncApplicationCycleStatuses<T extends SupabaseClient>(
  supabase: T,
): Promise<SyncApplicationCycleStatusesResult> {
  const activatedCycleIds: string[] = []
  const nowMs = Date.now()
  const { data: rows, error } = await supabase.from('applicationCycle').select('*')
  if (error || !rows?.length) return { activatedCycleIds }

  for (const row of rows as ApplicationCycleRow[]) {
    const bounds = rowCycleTimeBounds(row)
    if (bounds == null) continue
    const { startMs, endMs } = bounds
    const desired = desiredApplicationCycleStatus(nowMs, startMs, endMs)
    const current = normalizeDbStatus(pickCycleField(row, 'status', 'status'))
    if (current === desired) continue

    const nameVal = pickCycleField(row, 'name', 'name')
    const startVal = pickCycleField(row, 'startTime', 'start_time')
    const endVal = pickCycleField(row, 'endTime', 'end_time')
    if (nameVal == null || String(nameVal).trim() === '') continue
    if (startVal == null || endVal == null) continue

    if (desired === 'active' && current !== 'active') {
      const key = applicationCycleKeyFromRow(row)
      if (key) activatedCycleIds.push(key)
    }

    const { error: updateError } = await supabase
      .from('applicationCycle')
      .update({ status: desired })
      .eq('name', String(nameVal).trim())
      .eq('startTime', startVal)
      .eq('endTime', endVal)

    if (updateError) {
      console.error('syncApplicationCycleStatuses:', updateError)
    }
  }

  return { activatedCycleIds }
}
