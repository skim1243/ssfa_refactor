'use server'

import { revalidatePath } from 'next/cache'
import { resolvePortalApplicationRowForApplicant } from '@/app/lib/applicant-portal-lifecycle'
import { createServerClient } from '@/app/utils/supabase/server'

export type ApplicationDocumentColumn =
  | 'enrollmentDoc'
  | 'officialTranscript'
  | 'incomeTax'
  | 'introVideo'
  | 'evidenceFile'

/** Persists the public URL (or storage path) for a document field on the user’s Applications row. */
export async function saveApplicationDocumentUrl(
  column: ApplicationDocumentColumn,
  url: string,
  applicationId?: string | null,
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const trimmed = url.trim()
  if (!trimmed) return { error: 'No file URL to save.' }

  const explicitId = String(applicationId ?? '').trim() || null

  const portalRow = await resolvePortalApplicationRowForApplicant(
    supabase,
    user.id,
    user.email?.trim() ?? '',
    explicitId,
  )
  const rowId = portalRow?.id
  if (portalRow == null || rowId == null || rowId === '') {
    return { error: 'No application row found for this user.' }
  }

  const st =
    (portalRow.completionStatus as string | undefined) ??
    (portalRow.completion_status as string | undefined) ??
    null
  if (st === 'Withdrawn') {
    return { error: 'This application was withdrawn and can no longer be edited.' }
  }
  if (st === 'Overdue') {
    return { error: 'This application is overdue and can no longer be edited.' }
  }

  const { error } = await supabase
    .from('Applications')
    .update({ [column]: trimmed })
    .eq('id', rowId)

  if (error) {
    console.error('SAVE DOCUMENT URL:', error)
    return { error: error.message }
  }

  const { data: verifyRow, error: verifyError } = await supabase
    .from('Applications')
    .select(column)
    .eq('id', rowId)
    .maybeSingle()

  if (verifyError) {
    console.error('SAVE DOCUMENT URL VERIFY:', verifyError)
    return { error: verifyError.message }
  }

  const verifyRecord = (verifyRow ?? null) as Record<string, unknown> | null
  const persisted = (verifyRecord?.[column] as string | undefined) ?? ''
  if (persisted !== trimmed) {
    return { error: 'Document URL was not saved to the application row.' }
  }

  revalidatePath('/applicant-portal')
  revalidatePath('/applicant-archive')
  return { success: true as const }
}
