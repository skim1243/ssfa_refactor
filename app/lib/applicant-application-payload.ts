import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * PostgREST `on_conflict` target — must match the DB unique constraint columns exactly.
 * If your constraint uses `application_cycle`, change this to `user_id,application_cycle`.
 */
export const APPLICATIONS_USER_CYCLE_ON_CONFLICT = 'user_id,applicationCycle' as const

/** Insert payload for a fresh `Applications` row (Supabase column names). */
/** `applicationCycle` value is the cycle row’s `name` (no id column on `applicationCycle`). */
export function emptyApplicationInsertPayload(
  userId: string,
  email: string,
  applicationCycleName: string,
) {
  return {
    user_id: userId,
    applicationCycle: applicationCycleName,
    firstName: null,
    lastName: null,
    phoneNumber: null,
    email: email.trim(),
    parentsEmail: null,
    school: null,
    major: null,
    enrollmentDoc: null,
    officialTranscript: null,
    incomeTax: null,
    introVideo: null,
    evidenceFile: null,
    grade: null,
    completionStatus: 'Pending',
    acceptenceStatus: 'Pending',
    submissionDate: null,
  }
}

/** Idempotent create: `ON CONFLICT (user_id, applicationCycle) DO NOTHING` via PostgREST. */
export function upsertEmptyApplicationForCycle<T extends SupabaseClient>(
  supabase: T,
  payload: ReturnType<typeof emptyApplicationInsertPayload>,
) {
  return supabase.from('Applications').upsert(payload, {
    onConflict: APPLICATIONS_USER_CYCLE_ON_CONFLICT,
    ignoreDuplicates: true,
  })
}
