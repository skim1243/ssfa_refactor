'use server'

import { revalidatePath } from 'next/cache'
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
  url: string
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const trimmed = url.trim()
  if (!trimmed) return { error: 'No file URL to save.' }

  // Use user_id for existence check — table may not have a column named `id`.
  const { data: existingRow, error: readError } = await supabase
    .from('Applications')
    .select('user_id, completionStatus')
    .eq('user_id', user.id)
    .maybeSingle()

  if (readError) {
    console.error('SAVE DOCUMENT URL READ:', readError)
    return { error: readError.message }
  }
  if (!existingRow) {
    return { error: 'No application row found for this user.' }
  }

  const st = (existingRow.completionStatus as string | undefined) ?? null
  if (st === 'Withdrawn') {
    return { error: 'This application was withdrawn and can no longer be edited.' }
  }

  const { error } = await supabase
    .from('Applications')
    .update({ [column]: trimmed })
    .eq('user_id', user.id)

  if (error) {
    console.error('SAVE DOCUMENT URL:', error)
    return { error: error.message }
  }

  const { data: verifyRow, error: verifyError } = await supabase
    .from('Applications')
    .select(column)
    .eq('user_id', user.id)
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
  return { success: true as const }
}
