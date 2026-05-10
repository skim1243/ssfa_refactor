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

/**
 * Updates each row's `status` from start/end times vs current time.
 * Call from server contexts (admin page, applicant portal, etc.) so cycles flip inactive → active → past without a cron.
 */
export async function syncApplicationCycleStatuses<T extends SupabaseClient>(supabase: T): Promise<void> {
  const nowMs = Date.now()
  const { data: rows, error } = await supabase.from('applicationCycle').select('*')
  if (error || !rows?.length) return

  for (const row of rows as ApplicationCycleRow[]) {
    const bounds = rowCycleTimeBounds(row)
    if (bounds == null) continue
    const { startMs, endMs } = bounds
    const desired = desiredApplicationCycleStatus(nowMs, startMs, endMs)
    const current = normalizeDbStatus(pickCycleField(row, 'status', 'status'))
    if (current === desired) continue

    const id = pickCycleField(row, 'id', 'id')
    if (id == null || id === '') continue

    const { error: updateError } = await supabase
      .from('applicationCycle')
      .update({ status: desired })
      .eq('id', id)

    if (updateError) {
      console.error('syncApplicationCycleStatuses:', updateError)
    }
  }
}
