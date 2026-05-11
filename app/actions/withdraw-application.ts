'use server'

import { revalidatePath } from 'next/cache'
import { removeApplicationDocumentsFromStorage } from '@/app/lib/application-document-storage'
import { resolvePortalApplicationRowForApplicant } from '@/app/lib/applicant-portal-lifecycle'
import { createServerClient } from '@/app/utils/supabase/server'

export async function withdrawApplication(applicationId?: string | null) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in.' as const }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user', user.id)
    .maybeSingle()

  if (roleRow?.role !== 'applicant') return { error: 'Not allowed.' as const }

  const explicitId = String(applicationId ?? '').trim() || null

  const portalRow = await resolvePortalApplicationRowForApplicant(
    supabase,
    user.id,
    user.email?.trim() ?? '',
    explicitId,
  )

  if (!portalRow) return { error: 'No application found.' as const }

  const row = portalRow as Record<string, unknown>
  const rowId = row.id
  if (rowId == null || rowId === '') {
    return { error: 'No application found.' as const }
  }

  const status =
    (row.completionStatus as string | undefined) ??
    (row.completion_status as string | undefined) ??
    null

  if (status === 'Withdrawn') {
    return { error: 'This application has already been withdrawn.' as const }
  }
  if (status === 'Overdue') {
    return { error: 'This application is overdue and can no longer be withdrawn.' as const }
  }

  await removeApplicationDocumentsFromStorage(supabase, user.id, row)

  const email = user.email?.trim() ?? null

  const { error: updateError } = await supabase
    .from('Applications')
    .update({
      firstName: null,
      lastName: null,
      phoneNumber: null,
      email,
      parentsEmail: null,
      school: null,
      major: null,
      grade: null,
      enrollmentDoc: null,
      officialTranscript: null,
      incomeTax: null,
      introVideo: null,
      evidenceFile: null,
      completionStatus: 'Withdrawn',
      acceptenceStatus: 'Pending',
      submissionDate: null,
    })
    .eq('id', rowId)

  if (updateError) {
    console.error('WITHDRAW UPDATE:', updateError)
    return { error: updateError.message }
  }

  revalidatePath('/applicant-portal')
  revalidatePath('/applicant-archive')
  return { success: true as const }
}
