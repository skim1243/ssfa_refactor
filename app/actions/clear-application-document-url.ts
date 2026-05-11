'use server'

import { revalidatePath } from 'next/cache'
import { resolvePortalApplicationRowForApplicant } from '@/app/lib/applicant-portal-lifecycle'
import { createServerClient } from '@/app/utils/supabase/server'
import type { ApplicationDocumentColumn } from '@/app/actions/save-application-document-url'

export async function clearApplicationDocumentUrl(
  column: ApplicationDocumentColumn,
  applicationId?: string | null,
) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

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

  const { error } = await supabase.from('Applications').update({ [column]: null }).eq('id', rowId)

  if (error) {
    console.error('CLEAR DOCUMENT URL:', error)
    return { error: error.message }
  }

  revalidatePath('/applicant-portal')
  revalidatePath('/applicant-archive')
  return { success: true as const }
}
